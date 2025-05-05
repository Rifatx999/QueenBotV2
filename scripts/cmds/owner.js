const moment = require("moment");
moment.durationFormatSetup?.();

module.exports = {
  config: {
    name: "owner",
    aliases: ["botowner", "creator"],
    version: "1.1",
    author: "Rifat",
    countDown: 5,
    role: 0,
    description: "Show bot owner and bot info",
    category: "info",
    guide: {
      en: "{pn} : Show bot and owner info"
    }
  },

  langs: {
    en: {
      reply: `👑 Bot Owner Information 👑
• Name: Rifat
• Gender: Male
• Pronoun: He/Him
• Relationship: Single
• Facebook: https://www.facebook.com/rifat.gmer.69

🤖 Bot Information 🤖
• Name: %1
• Prefix: %2
• Uptime: %3`
    }
  },

  onStart: async function ({ message, getLang }) {
    const botName = global.GoatBot.config.botName || "Noob Bot";
    const prefix = global.GoatBot.config.prefix || ".";
    const uptime = process.uptime();
    const duration = moment.duration(uptime, "seconds").format("D[d] H[h] m[m] s[s]");
    return message.reply(getLang("reply", botName, prefix, duration));
  },

  onChat: async function ({ event, message, getLang }) {
    const text = event.body?.toLowerCase()?.trim();
    if (["owner", "botowner", "creator"].includes(text)) {
      const botName = global.GoatBot.config.botName || "Noob Bot";
      const prefix = global.GoatBot.config.prefix || ".";
      const uptime = process.uptime();
      const duration = moment.duration(uptime, "seconds").format("D[d] H[h] m[m] s[s]");
      return message.reply(getLang("reply", botName, prefix, duration));
    }
  }
};
