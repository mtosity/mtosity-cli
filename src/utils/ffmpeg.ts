import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const youtubedlPkg = require("youtube-dl-exec");

export const youtubedl = youtubedlPkg.create(
  process.env.YTDLP_PATH || "yt-dlp"
);

export { ffmpeg, ffmpegPath };
