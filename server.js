const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const WebSocket = require('ws');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(__dirname));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket connection
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('WebSocket message received:', message);
    });
});

// Function to sanitize and shorten filename
const sanitizeFilename = (filename) => {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
    const maxLength = 100;
    return safeFilename.substring(0, maxLength);
};

// Function to extract video ID from URL
const getVideoId = (url) => {
    try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        return params.get('v') || sanitizeFilename(urlObj.pathname.split('/').pop()) || 'unknown';
    } catch (err) {
        return 'unknown';
    }
};

// Function to get video title
const getVideoTitle = async (url) => {
    try {
        const { stdout } = await execPromise(`yt-dlp --get-title "${url}"`);
        return sanitizeFilename(stdout.trim()) || `video_${Date.now()}`;
    } catch (err) {
        console.error('Error getting video title:', err.message);
        return `video_${Date.now()}`;
    }
};

// Function to execute a download task
const executeDownload = (command, args, videoDir, filename, type, wss) => {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let outputFilename = filename;

        if (['description', 'title', 'tags'].includes(type)) {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ progress: 50 }));
                }
            });
        }

        process.stdout.on('data', async (data) => {
            const output = data.toString();
            const progressMatch = output.match(/\[download\]\s+(\d+\.\d)%/);
            if (progressMatch) {
                const progress = parseFloat(progressMatch[1]);
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ progress }));
                    }
                });
            }
            const filenameMatch = output.match(/Merging formats into "(.+?)"/) || 
                                 output.match(/Destination: (.+?)(\n|$)/) || 
                                 output.match(/Writing thumbnail to: (.+?)(\n|$)/);
            if (filenameMatch) {
                outputFilename = path.basename(filenameMatch[1]);
            }
            if (['description', 'title', 'tags'].includes(type) && output.trim()) {
                try {
                    await fs.writeFile(path.join(videoDir, outputFilename), output);
                } catch (err) {
                    if (err.code === 'ENAMETOOLONG') {
                        outputFilename = `shortened_${type}_${Date.now()}.txt`;
                        await fs.writeFile(path.join(videoDir, outputFilename), output);
                    }
                }
            }
        });

        process.stderr.on('data', (data) => {
            console.error('yt-dlp stderr:', data.toString());
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve({ filename: outputFilename, downloadUrl: `/downloads/${path.basename(videoDir)}/${outputFilename}` });
            } else {
                reject(new Error(`Process failed with code ${code}`));
            }
        });
    });
};

app.post('/download', async (req, res) => {
    const { url, type } = req.body;
    if (!url || !type) {
        return res.json({ success: false, error: 'URL or type not provided' });
    }

    try {
        const videoId = getVideoId(url);
        const videoTitle = await getVideoTitle(url);
        const videoDir = path.join(__dirname, 'downloads', videoId);
        await fs.mkdir(videoDir, { recursive: true });

        const downloadTasks = {
            full: { command: 'yt-dlp', args: ['-f', 'bestvideo+bestaudio', '-o', path.join(videoDir, `${videoTitle}_video.%(ext)s`), '--progress', url], filename: `${videoTitle}_video.%(ext)s` },
            video: { command: 'yt-dlp', args: ['-f', 'bestvideo', '-o', path.join(videoDir, `${videoTitle}_video.%(ext)s`), '--progress', url], filename: `${videoTitle}_video.%(ext)s` },
            audio: { command: 'yt-dlp', args: ['-x', '--audio-format', 'mp3', '-o', path.join(videoDir, `${videoTitle}_audio.mp3`), '--progress', url], filename: `${videoTitle}_audio.mp3` },
            description: { command: 'yt-dlp', args: ['--get-description', '--skip-download', url], filename: `${videoTitle}_description.txt` },
            title: { command: 'yt-dlp', args: ['--get-title', '--skip-download', url], filename: `${videoTitle}_title.txt` },
            thumbnail: { command: 'yt-dlp', args: ['--write-thumbnail', '--skip-download', '-o', path.join(videoDir, `${videoTitle}_thumbnail.%(ext)s`), '--progress', url], filename: `${videoTitle}_thumbnail.%(ext)s` },
            tags: { command: 'yt-dlp', args: ['--print', 'tags', '--skip-download', url], filename: `${videoTitle}_tags.txt` }
        };

        if (type === 'all') {
            const types = ['full', 'description', 'title', 'tags', 'thumbnail'];
            const results = [];
            let totalProgress = 0;
            const progressPerTask = 100 / types.length;

            for (const t of types) {
                const task = downloadTasks[t];
                try {
                    const result = await executeDownload(task.command, task.args, videoDir, task.filename, t, wss);
                    results.push(result);
                    totalProgress += progressPerTask;
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ progress: Math.min(totalProgress, 100) }));
                        }
                    });
                } catch (err) {
                    console.error(`Error downloading ${t}:`, err.message);
                }
            }

            res.json({ success: true, filenames: results });
        } else if (downloadTasks[type]) {
            const task = downloadTasks[type];
            const result = await executeDownload(task.command, task.args, videoDir, task.filename, type, wss);
            res.json({ success: true, filename: result.filename, downloadUrl: result.downloadUrl });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ progress: 100 }));
                }
            });
        } else {
            res.json({ success: false, error: 'Invalid download type' });
        }
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});