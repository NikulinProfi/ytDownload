const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/download', async (req, res) => {
    const { url, type } = req.body;
    if (!url || !type) {
        return res.json({ success: false, error: 'URL or type not provided' });
    }

    const outputPath = path.join(process.env.HOME, 'Downloads', '%(title)s.%(ext)s');
    let command;

    switch (type) {
        case 'full':
            command = `yt-dlp -f bestvideo+bestaudio -o "${outputPath}" "${url}"`;
            break;
        case 'video':
            command = `yt-dlp -f bestvideo -o "${outputPath}" "${url}"`;
            break;
        case 'audio':
            command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;
            break;
        default:
            return res.json({ success: false, error: 'Invalid download type' });
    }

    try {
        const { stdout, stderr } = await execPromise(command);
        const filenameMatch = stdout.match(/Merging formats into "(.+?)"/) || stderr.match(/Merging formats into "(.+?)"/) || stdout.match(/Destination: (.+?)(\n|$)/);
        const filename = filenameMatch ? path.basename(filenameMatch[1]) : 'unknown';
        res.json({ success: true, filename });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});