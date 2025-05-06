const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cron = require("node-cron");

const configPath = path.join(__dirname, "cache", "prayer_config.json");

if (!fs.existsSync(configPath)) {
  fs.writeJsonSync(configPath, { active: false });
}

let sentTimes = [];

module.exports = {
  config: {
    name: "prayer",
    version: "1.0",
    hasPermssion: 1,
    credits: "rifat",
    description: "Auto prayer reminder for BD",
    commandCategory: "utility",
    usages: "[on/off/status]",
    cooldowns: 5,
  },

  onStart: async function ({ message, args }) {
    const arg = args[0]?.toLowerCase();
    const config = fs.readJsonSync(configPath);

    if (!arg || !["on", "off", "status"].includes(arg)) {
      return message.reply("Usage:\n• prayer on\n• prayer off\n• prayer status");
    }

    if (arg === "on") {
      if (config.active) return message.reply("Already ON.");
      config.active = true;
      fs.writeJsonSync(configPath, config);
      return message.reply("✅ Prayer notification is ON.");
    }

    if (arg === "off") {
      if (!config.active) return message.reply("Already OFF.");
      config.active = false;
      fs.writeJsonSync(configPath, config);
      return message.reply("❌ Prayer notification is OFF.");
    }

    if (arg === "status") {
      return message.reply(`Prayer notifications: ${config.active ? "✅ ON" : "❌ OFF"}`);
    }
  },

  onLoad: async function ({ api }) {
    cron.schedule("* * * * *", async () => {
      const config = fs.readJsonSync(configPath);
      if (!config.active) return;

      try {
        const { data } = await axios.get("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=3");
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const currentTime = `${hours}:${minutes}`;

        const prayerTimes = data.data.timings;
        const names = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        const banglaNames = {
          Fajr: "ফজর",
          Dhuhr: "জোহর",
          Asr: "আসর",
          Maghrib: "মাগরিব",
          Isha: "এশা"
        };

        for (const prayer of names) {
          const time = prayerTimes[prayer].substring(0, 5);
          if (time === currentTime && !sentTimes.includes(time + prayer)) {
            const groups = await api.getThreadList(20, null, ["INBOX"]);
            for (const group of groups) {
              if (group.isGroup) {
                api.sendMessage(`নামাজের নাম (${banglaNames[prayer]}) সময় হয়েছে সবাই নামাজ আদায় করুন।`, group.threadID);
              }
            }
            sentTimes.push(time + prayer);
            if (sentTimes.length > 20) sentTimes.shift();
          }
        }
      } catch (e) {
        console.log("[PRAYER] Error fetching prayer time:", e.message);
      }
    });
  }
};
