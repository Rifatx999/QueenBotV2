const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "groupfaces",
    version: "5.0",
    hasPermssion: 1,
    credits: "rifat",
    description: "Combine all group members' faces into one image",
    commandCategory: "group",
    usages: "",
    cooldowns: 20,
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);
    const userIDs = threadInfo.participantIDs;

    message.reply(`Preparing ${userIDs.length} profile pictures... Please wait...`);

    const avatars = [];

    for (const uid of userIDs) {
      const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;
      let retries = 0;
      while (retries < 3) {
        try {
          const res = await axios.get(url, { responseType: "arraybuffer" });
          avatars.push(res.data);
          break;
        } catch {
          retries++;
          await new Promise(r => setTimeout(r, 1000 * retries));
        }
      }
      await new Promise(r => setTimeout(r, 300)); // Short delay to avoid 429
    }

    const cols = 6;
    const size = 100;
    const spacing = 10;
    const rows = Math.ceil(avatars.length / cols);

    const canvas = createCanvas(cols * (size + spacing), rows * (size + spacing));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = 0, y = 0;
    for (const buffer of avatars) {
      try {
        const img = await loadImage(buffer);
        ctx.drawImage(img, x, y, size, size);
        x += size + spacing;
        if (x >= canvas.width) {
          x = 0;
          y += size + spacing;
        }
      } catch {}
    }

    const outPath = path.join(__dirname, "cache", `groupfaces_${threadID}.png`);
    const out = fs.createWriteStream(outPath);
    canvas.createPNGStream().pipe(out);

    out.on("finish", () => {
      message.reply({
        body: "Here's everyone's faces!",
        attachment: fs.createReadStream(outPath),
      }, () => {
        fs.unlinkSync(outPath); // Delete after sending
      });
    });
  }
};
