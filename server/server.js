const express = require("express");
const app = express();
const PORT = 9696;

const YoutubeMp3Downloader = require("youtube-mp3-downloader");

let currProgress = 0;

const shell = require("shelljs");
const ffmpegPath = shell.which("ffmpeg").stdout;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const fetch = require("node-fetch");
const volumioIp = "http://10.249.20.140";
const nasName = "Artur";

const socketioClient = require("socket.io-client");
const volumioSocket = socketioClient(`${volumioIp}`);

const path = require("path");
const fs = require("fs");

app.use(express.static("./"));
const multiparty = require("multiparty");

let YD = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegPath,
  outputPath: "./Music",
  youtubeVideoQuality: "highest",
  queueParallelism: 5, // How many parallel downloads/encodes should be started?
  progressTimeout: 1000,
});

let recordingsCount = 0; //Added this to avoid spamming with recordings
const dailyRecordingsLimit = 100;

app.get("/download", (req, res) => {
  if (!req.query.url) return res.sendStatus(400);
  let id = getVideoId(req.query.url);
  if (!id) return res.sendStatus(400);
  res.sendStatus(200);
  console.log("Started downloading a track with url " + req.query.url);
  startDownloading(id);
});

app.get("/getVolume", async (req, res) => {
  let stateReq = await fetch(`${volumioIp}/api/v1/getState`);
  let currVolume = await (await stateReq.json()).volume;
  res.send({ volume: currVolume });
  console.log(`Current volume: ${currVolume}`);
});

app.get("/setVolume", async (req, res) => {
  let volume = req.query.volume;
  if (!volume || volume > 100 || volume < 0) return res.sendStatus(400);
  res.sendStatus(200);
  await fetch(`${volumioIp}/api/v1/commands/?cmd=volume&volume=${volume}`);
  console.log(`Changed current volume to ${volume}`);
});

app.post("/recording", async (req, res) => {
  recordingsCount++;
  //Avoid spamming
  if (recordingsCount > dailyRecordingsLimit) return res.sendStatus(503);
  let form = new multiparty.Form({ uploadDir: "./Music" });
  let filePath = "";
  await new Promise((resolve, reject) => {
    form.parse(req, function (err, fields, files) {
      filePath = files.recording[0].path;
      resolve();
    });
  });
  if (!filePath) return;
  res.sendStatus(200);
  let date = parseDate(new Date());
  let newPath = path.join("Music", `${date}.m4a`);

  fs.renameSync(filePath, newPath);

  let outputOptions = [
    "-metadata",
    "title=Nagranie głosowe",
    "-metadata",
    `artist=${parseDate(new Date(), true, {
      hour12: false,
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`,
  ];

  ffmpeg(newPath)
    .audioFilter("volume=2.5")
    .outputOptions(...outputOptions)
    .save(path.join("Music", `${date}.mp3`));

  let title = newPath.split("\\").pop().split("/").pop().replace(".m4a", "");
  setTimeout(async () => {
    await play(title);
    fs.unlinkSync(newPath);
  }, 3000);
});

function parseDate(date, toLocal, options) {
  if (toLocal) {
    return date.toLocaleDateString("pl-PL", options);
  } else {
    return date.toISOString().replace(/[T:-]/g, "").replace(/\..+/, "");
  }
}

function startDownloading(id) {
  YD.download(id);
  YD.on("progress", (percent) => {
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
    console.log("Finished downloading the track");
    io.sockets.emit("finished");
    await play(data.videoTitle);
  });

  YD.on("error", (error) => {
    console.log("ERROR: " + error);
    //Load component in the app first, then send the error
    setTimeout(() => {
      io.sockets.emit("error");
    }, 1500);
  });
}

async function play(title) {
  /* currently disabled DEV
  //Get the current playing track uri, because it'll add to the queue after the track
  let stateReq = await fetch(`${volumioIp}/api/v1/getState`);
  let currUri = await (await stateReq.json()).uri;
  */
  //Rescan the library to find out the new track
  await volumioSocket.emit("rescanDb"); //undocumentated
  setTimeout(async () => {
    //Stop the playback
    await fetch(`${volumioIp}/api/v1/commands/?cmd=stop`);
    setTimeout(async () => {
      //Clear the queue
      await fetch(`${volumioIp}/api/v1/commands/?cmd=clearQueue`);
    }, 500);

    setTimeout(() => {
      //Add the following track to queue
      volumioSocket.emit("addToQueue", {
        uri: `music-library/NAS/${nasName}/${title}.mp3`,
      });
    }, 1000);

    //Play the track
    setTimeout(async () => {
      await fetch(`${volumioIp}/api/v1/commands/?cmd=play`);
    }, 2000);
    /* currently disabled DEV
    //Add the previous track to the queue
    setTimeout(async () => {
      volumioSocket.emit("addToQueue", {
        uri: currUri,
      });
    }, 2000);
    */
    console.log("Played the track");
  }, 6500);
}

function getVideoId(url) {
  /*
  let index = url.indexOf("watch?v=");
  return url.slice(index + 8, url.length);
  */
  let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  let match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
}

function renewTheLimit() {
  recordingsCount = 0;
  console.log("Renewed the daily recordings limit");
}

setInterval(renewTheLimit, 1000 * 60 * 60 * 24);

const server = app.listen(PORT, () => {
  console.log(`App has started on port ${PORT}`);
});

const io = require("socket.io")(server);
io.on("connection", (socket) => {});
