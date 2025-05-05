const axios = require("axios");
const fs = require("fs-extra");
const ytdl = require("@distube/ytdl-core");
const { exec } = require("child_process");
const path = require("path");

module.exports = {
  config: {
    name: "ytb",
    aliases: ["yt"],
    version: "1.1",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Download YouTube video/audio",
      vi: "Tải video/âm thanh YouTube",
      bn: "ইউটিউব ভিডিও/অডিও ডাউনলোড করুন"
    },
    longDescription: {
      en: "Search and download YouTube videos as audio or video",
      vi: "Tìm kiếm và tải video từ YouTube",
      bn: "ইউটিউব থেকে ভিডিও অথবা অডিও খুঁজে এবং ডাউনলোড করুন"
    },
    category: "media",
    guide: {
      en: "{pn} -v <video name or link>\n{pn} -a <video name or link>",
      vi: "{pn} -v <tên hoặc liên kết video>\n{pn} -a <tên hoặc liên kết video>",
      bn: "{pn} -v <ভিডিও নাম বা লিংক>\n{pn} -a <ভিডিও নাম বা লিংক>"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const mode = args[0];
    if (!["-v", "-a", "video", "audio"].includes(mode))
      return message.reply(getLang("guide"));

    const type = ["-v", "video"].includes(mode) ? "video" : "audio";
    const query = args.slice(1).join(" ");
    if (!query) return message.reply(getLang("guide"));

    let videoId, title;

    const match = query.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) {
      videoId = match[1];
      const info = await ytdl.getInfo(videoId);
      title = info.videoDetails.title;
    } else {
      const API_KEY = "AIzaSyDYFu-jPat_hxdssXEK4y2QmCOkefEGnso";
      const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: API_KEY,
          q: query,
          part: "snippet",
          maxResults: 6,
          type: "video"
        }
      });

      const results = res.data.items;
      if (!results.length) return message.reply(getLang("noResults"));

      let replyText = getLang("chooseVideo") + "\n\n";
      results.forEach((item, i) => {
        replyText += `${i + 1}. ${item.snippet.title} (${item.snippet.channelTitle})\n`;
      });

      return message.reply(replyText.trim(), (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "ytb",
          messageID: info.messageID,
          author: event.senderID,
          type,
          results
        });
      });
    }

    return download({ videoId, title, type, message, getLang });
  },

  onReply: async ({ event, message, Reply, getLang }) => {
    if (event.senderID !== Reply.author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length)
      return message.reply(getLang("invalidChoice"));

    const selected = Reply.results[choice - 1];
    const videoId = selected.id.videoId;
    const title = selected.snippet.title;

    await download({ videoId, title, type: Reply.type, message, getLang });
  }
};

async function download({ videoId, title, type, message, getLang }) {
  const maxSize = type === "video" ? 83 * 1024 * 1024 : 26 * 1024 * 1024;
  const ext = type === "video" ? "mp4" : "mp3";
  const filePath = path.join(__dirname, "cache", `${videoId}_${Date.now()}.${ext}`);

  const loadingMsg = await message.reply(getLang("downloading"));

  const command = `yt-dlp -f "${type === "video" ? 'mp4' : 'bestaudio'}" --cookies cookies.txt -o "${filePath}" "https://www.youtube.com/watch?v=${videoId}"`;

  const animation = ["▘", "▝", "▗", "▖"];
  let index = 0;
  const interval = setInterval(() => {
    message.edit(loadingMsg.messageID, `${getLang("downloading")} ${animation[index++ % animation.length]}`);
  }, 400);

  exec(command, async (err) => {
    clearInterval(interval);

    if (err || !fs.existsSync(filePath)) {
      return message.reply(getLang("downloadFailed"));
    }

    const stats = await fs.stat(filePath);
    if (stats.size > maxSize) {
      await fs.unlink(filePath);
      return message.reply(getLang("tooLarge", (stats.size / 1024 / 1024).toFixed(2)));
    }

    await message.reply({
      body: title,
      attachment: fs.createReadStream(filePath)
    });

    await fs.unlink(filePath);
  });
}
