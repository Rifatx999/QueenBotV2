const fs = require("fs");
const path = require("path");
const ytdlp = require("yt-dlp-exec");
const axios = require("axios");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "ytb",
    version: "2.1",
    author: "Rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Download YouTube video/audio",
      vi: "Tải video/audio từ YouTube"
    },
    longDescription: {
      en: "Search or provide YouTube link to download video or audio",
      vi: "Tìm kiếm hoặc cung cấp liên kết YouTube để tải video hoặc audio"
    },
    category: "media",
    guide: {
      en: "{pn} [name or link]",
      vi: "{pn} [tên hoặc liên kết]"
    }
  },

  onStart: async function ({ args, message, event, commandName }) {
    // Ensure yt-dlp is installed
    try {
      execSync("yt-dlp --version", { stdio: "ignore" });
    } catch (err) {
      message.reply("Installing yt-dlp globally using pip...");
      try {
        execSync("pip install yt-dlp", { stdio: "inherit" });
        message.reply("✅ yt-dlp installed successfully.");
      } catch (installErr) {
        return message.reply("❌ Failed to install yt-dlp. Please install it manually: `pip install yt-dlp`");
      }
    }

    if (!args[0]) return message.reply("Please enter a YouTube link or search term.");

    const query = args.join(" ");
    const ytLinkRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+/;
    const link = query.match(ytLinkRegex)?.[0];

    if (link) {
      return await downloadYT(link, message, event);
    }

    // Search mode
    const apiKey = "AIzaSyDYFu-jPat_hxdssXEK4y2QmCOkefEGnso";
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        q: query,
        key: apiKey,
        maxResults: 6,
        part: "snippet",
        type: "video"
      }
    });

    const results = res.data.items;
    if (results.length === 0) return message.reply("No results found.");

    let text = "Choose a video to download:\n\n";
    results.forEach((v, i) => {
      text += `${i + 1}. ${v.snippet.title}\n`;
    });

    message.reply(text + "\nReply with a number (1-6).", (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        results
      });
    });
  },

  onReply: async function ({ message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length)
      return message.reply("Invalid number!");

    const videoId = Reply.results[choice - 1].id.videoId;
    const link = `https://www.youtube.com/watch?v=${videoId}`;
    await downloadYT(link, message, event);
  }
};

async function downloadYT(link, message, event) {
  const id = `${Date.now()}_${event.threadID}`;
  const filePath = path.join(__dirname, "..", "tmp", `${id}.mp4`);

  message.reply("⏳ Downloading video...");

  try {
    await ytdlp(link, {
      format: "mp4",
      output: filePath,
      cookies: "cookies.txt"
    });

    if (!fs.existsSync(filePath)) return message.reply("❌ Video not found after download.");

    await message.reply({
      body: "✅ Here's your video:",
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("yt-dlp error:", err);
    return message.reply("❌ Failed to download the video.");
  }
}
