/cmd install slowmode.js const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");
const SLOWMODE_FILE = path.join(cacheDir, "slowmode.json");

// Create "cache" directory if it doesn't exist
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// Create slowmode.json if it doesn't exist
if (!fs.existsSync(SLOWMODE_FILE)) {
  fs.writeFileSync(SLOWMODE_FILE, JSON.stringify({ enabled: false }, null, 2));
}

module.exports = {
  config: {
    name: "slowmode",
    aliases: [],
    version: "1.0",
    author: "rifat",
    role: 2,
    shortDescription: "Toggle global slowmode",
    longDescription: "Enable or disable slowmode to delay bot's response",
    category: "system",
    guide: "{pn} on / off"
  },

  onStart: async function ({ api, event, args }) {
    const mode = args[0];
    if (!["on", "off"].includes(mode))
      return api.sendMessage("Usage: slowmode on / off", event.threadID, event.messageID);

    fs.writeFileSync(SLOWMODE_FILE, JSON.stringify({ enabled: mode === "on" }, null, 2));
    return api.sendMessage(`✅ Slowmode has been turned ${mode.toUpperCase()}`, event.threadID, event.messageID);
  }
};
