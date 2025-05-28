Video Downloader (ytDownload)
This is a web-based application for downloading videos and audio from YouTube (and other supported sites) using yt-dlp. The interface allows users to download full videos (with audio), video-only files, or audio-only files (in MP3 format) with a real-time progress bar to track the download process.
Features

Download full videos (video + audio) in the best available quality.
Download video-only files (without audio).
Download audio-only files in MP3 format.
Real-time progress bar showing download percentage.
Simple web interface for easy URL input and download initiation.

Prerequisites
Before cloning and running the application, ensure you have the following installed:

Node.js (version 18 or higher)
Python (version 3.8 or higher)
Homebrew (for macOS users, optional but recommended for installing dependencies)
Git (for cloning the repository)

Installation
1. Clone the Repository
Clone the repository to your local machine using Git:
git clone https://github.com/NikulinProfi/ytDownload.git
cd ytDownload

2. Install Node.js Dependencies
Install the required Node.js packages (express and ws for WebSocket support):
npm install

3. Install Python Dependencies
Install yt-dlp, the tool used for downloading videos:
pip3 install -U yt-dlp

4. Install FFmpeg
FFmpeg is required for merging video and audio streams or converting to MP3. Install it using Homebrew (on macOS) or your package manager:
# On macOS
brew install ffmpeg

# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# On Windows (using Chocolatey)
choco install ffmpeg

Verify installations:
node --version
python3 --version
yt-dlp --version
ffmpeg --version

5. Create Downloads Folder
Create a downloads folder in the project root to store downloaded files:
mkdir downloads

Running the Application

Start the server:
node server.js

The server will run on http://localhost:3000.

Open your browser and navigate to http://localhost:3000.

Use the web interface:

Enter a YouTube URL (e.g., https://www.youtube.com/watch?v=hEksVS3Jx90).
Click one of the buttons: "Download Full Video", "Download Video Only", or "Download Audio Only".
Watch the progress bar to track the download process.
Once complete, a download link will appear. Click it to save the file to your computer.



Downloaded files are saved in the downloads folder in the project directory.
Troubleshooting

WebSocket errors: Ensure the WebSocket connection (ws://localhost:3000) is not blocked by your firewall or browser.
yt-dlp errors: Update yt-dlp with pip3 install -U yt-dlp if you encounter issues with specific URLs.
FFmpeg not found: Verify FFmpeg is installed and accessible in your PATH (ffmpeg -version).
Files not downloading: Check if the downloads folder has write permissions (chmod -R 777 downloads).

Project Structure

index.html: The front-end web interface with input field, buttons, and progress bar.
server.js: The back-end Node.js server handling download requests and WebSocket for progress updates.
package.json: Node.js dependencies and scripts.
requirements.txt: Python dependencies (yt-dlp).
downloads/: Folder where downloaded videos/audio are saved.

Contributing
Feel free to submit issues or pull requests to the GitHub repository.
License
This project is licensed under the MIT License.
