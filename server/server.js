const express = require("express");
const app = express();
const PORT = 9696;

const YoutubeMp3Downloader = require("youtube-mp3-downloader");

let currProgress = 0;

const shell = require("shelljs");
const ffmpegPath = shell.which("ffmpeg").stdout;

const fetch = require("node-fetch");
const volumioIp = "http://10.249.20.140";
const nasName = "Artur";

let YD = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegPath,
  outputPath: "./Music",
  youtubeVideoQuality: "highest",
  queueParallelism: 5, // How many parallel downloads/encodes should be started?
  progressTimeout: 1000,
});

app.get("/download", (req, res) => {
  if (!req.query.url) return res.sendStatus(400);
  let id = getVideoId(req.query.url);
  if (!id) return res.sendStatus(400);
  res.sendStatus(200);
  console.log("Started");
  startDownloading(id);
});

function startDownloading(id) {
  YD.download(id);
  console.log("downloaded?");
  YD.on("progress", (percent) => {
    console.log(percent);
    progress = Math.floor(percent.progress.percentage);
    io.sockets.emit("progress", progress);
  });

  YD.on("finished", async (err, data) => {
    if (err) {
      setTimeout(() => {
        io.sockets.emit("error");
      }, 1500);
      return;
    }

    io.sockets.emit("finished");
    await play(data.videoTitle);
  });

  YD.on("error", (error) => {
    console.log(error);
    //Load component in the app first, then send the error
    setTimeout(() => {
      io.sockets.emit("error");
    }, 1500);
  });
}

async function play(title) {
  //DEV
  //Get the current playing track uri, because it'll add to the queue after the track
  //Stop the playback
  await fetch(`${volumioIp}/api/v1/commands/?cmd=stop`);
  //Clear the queue
  await fetch(`${volumioIp}/api/v1/commands/?cmd=clearQueue`);
  //Add the following track to queue
  //DEV
  //socket here
  //Play
  await fetch(`${volumioIp}/api/v1/commands/?cmd=play`);
  //DEV
  //Add the previous track to the queue
}

function getVideoId(url) {
  let index = url.indexOf("watch?v=");
  return url.slice(index + 8, url.length);
}

const server = app.listen(PORT, () => {
  console.log(`App has started on port ${PORT}`);
});

const io = require("socket.io")(server);
io.on("connection", (socket) => {});
