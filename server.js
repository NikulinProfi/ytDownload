const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const WebSocket = require('ws');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(__dirname));
app.use('/downloads', express.static(path.join(__dirname, 'downloads'))); // Serve files from local downloads folder

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket connection
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('WebSocket message received:', message);
    });
});

app.post('/download', async (req, res) => {
    const { url, type } = req.body;
    if (!url || !type) {
        return res.json({ success: false, error: 'URL or type not provided' });
    }

    const outputDir = path.join(__dirname, 'downloads');
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, '%(title)s.%(ext)s');
    let command, args;

    switch (type) {
        case 'full':
            command = 'yt-dlp';
            args = ['-f', 'bestvideo+bestaudio', '-o', outputPath, '--progress', url];
            break;
        case 'video':
            command = 'yt-dlp';
            args = ['-f', 'bestvideo', '-o', outputPath, '--progress', url];
            break;
        case 'audio':
            command = 'yt-dlp';
            args = ['-x', '--audio-format', 'mp3', '-o', outputPath, '--progress', url];
            break;
        default:
            return res.json({ success: false, error: 'Invalid download type' });
    }

    try {
        const process = spawn(command, args);

        let filename = '';
        process.stdout.on('data', (data) => {
            const output = data.toString();
            // Parse progress from yt-dlp output
            const progressMatch = output.match(/\[download\]\s+(\d+\.\d)%/);
            if (progressMatch) {
                const progress = parseFloat(progressMatch[1]);
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ progress }));
                    }
                });
            }
            // Capture filename from output
            const filenameMatch = output.match(/Merging formats into "(.+?)"/) || output.match(/Destination: (.+?)(\n|$)/);
            if (filenameMatch) {
                filename = path.basename(filenameMatch[1]);
            }
        });

        process.stderr.on('data', (data) => {
            console.error('yt-dlp stderr:', data.toString());
        });

        process.on('close', (code) => {
            if (code === 0) {
                const downloadUrl = `/downloads/${filename}`;
                res.json({ success: true, filename, downloadUrl });
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ progress: 100 }));
                    }
                });
            } else {
                res.json({ success: false, error: `Process exited with code ${code}` });
            }
        });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});