const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const { formatNumber } = global.utils;

const YT_API_KEY = 'AIzaSyDYFu-jPat_hxdssXEK4y2QmCOkefEGnso';
const TEMP_DIR = path.join(__dirname, 'temp');
const COOKIES_PATH = path.join(__dirname, 'cookies.txt');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

module.exports = {
  config: {
    name: "ytb",
    aliases: ["yt", "youtube"],
    version: "1.0",
    author: "Rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Download YouTube video/audio",
    longDescription: "Search or download YouTube video/audio using yt-dlp with cookies",
    category: "media",
    guide: "{pn} [video|audio] [name or YouTube link]"
  },

  langs: {
    en: {
      missingArgs: "Please use: ytb [video|audio] [query or link]",
      downloading: "Downloading %1...",
      success: "✅ Sent: %1",
      tooLarge: "❌ File too large to send (max: %1MB)",
      error: "❌ Error: %1",
      noResult: "❌ No results found.",
      invalid: "❌ Invalid YouTube link or query."
    }
  },

  onStart: async function ({ message, args, event, commandName, api }) {
    const type = args[0];
    const query = args.slice(1).join(" ").trim();

    if (!type || !query || !['video', 'audio'].includes(type))
      return message.reply(this.langs.en.missingArgs);

    try {
      const isLink = query.includes("youtube.com") || query.includes("youtu.be");
      let videoUrl = query;

      if (!isLink) {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=1&type=video&key=${YT_API_KEY}`;
        const res = await axios.get(searchUrl);
        if (!res.data.items.length) return message.reply(this.langs.en.noResult);
        const videoId = res.data.items[0].id.videoId;
        videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }

      const outputName = `ytb_${Date.now()}.${type === "audio" ? "mp3" : "mp4"}`;
      const outputPath = path.join(TEMP_DIR, outputName);

      const cmd = `yt-dlp "${videoUrl}" --cookies "${COOKIES_PATH}" -o "${outputPath}" --no-playlist`;
      await message.reply(this.langs.en.downloading.replace('%1', type));
      
      await execPromise(cmd);

      if (!fs.existsSync(outputPath)) return message.reply(this.langs.en.error.replace('%1', "File not found"));

      const stats = fs.statSync(outputPath);
      const maxSize = type === "audio" ? 26 * 1024 * 1024 : 83 * 1024 * 1024;

      if (stats.size > maxSize) {
        fs.unlinkSync(outputPath);
        return message.reply(this.langs.en.tooLarge.replace('%1', type === "audio" ? "26" : "83"));
      }

      await message.reply({
        body: this.langs.en.success.replace('%1', outputName),
        attachment: fs.createReadStream(outputPath)
      });

      fs.unlinkSync(outputPath);
    } catch (err) {
      return message.reply(this.langs.en.error.replace('%1', err.message));
    }
  }
};

// Helper to promisify exec
function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
