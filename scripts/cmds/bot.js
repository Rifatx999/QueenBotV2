const axios = require('axios');

let isEnabled = true;
let currentLanguage = 'bangla';
let dialoguesCache = {
  bangla: null,
  english: null
};

const PASTEBIN_URLS = {
  bangla: 'https://pastebin.com/raw/azzCGb6p',
  english: 'https://pastebin.com/raw/zq8YjTwg'
};

async function loadDialogues(language) {
  if (dialoguesCache[language]) return dialoguesCache[language];

  try {
    const response = await axios.get(PASTEBIN_URLS[language]);
    dialoguesCache[language] = response.data.dialogues;
    return dialoguesCache[language];
  } catch (error) {
    console.error(`Failed to load ${language} dialogues:`, error);
    return null;
  }
}

module.exports = {
  config: {
    name: "bot",
    version: "1.0.1",
    author: "Md Rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Random Rifat dialogues",
    longDescription: "Sends random Md Rifat dialogues in Bangla or English",
    category: "fun",
  },

  onStart: async function({ api, event, args }) {
    const command = args[0]?.toLowerCase();

    if (command === "off") {
      isEnabled = false;
      return api.sendMessage("Rifat bot বন্ধ করা হয়েছে।", event.threadID);
    }

    if (command === "on") {
      isEnabled = true;
      return api.sendMessage("Rifat bot চালু করা হয়েছে।", event.threadID);
    }

    if (command === "bangla") {
      currentLanguage = 'bangla';
      return api.sendMessage("ভাষা সেট করা হয়েছে: বাংলা", event.threadID);
    }

    if (command === "english") {
      currentLanguage = 'english';
      return api.sendMessage("Language set to English", event.threadID);
    }

    if (command === "status") {
      return api.sendMessage(
        `Bot status: ${isEnabled ? "enabled" : "disabled"}\nCurrent language: ${currentLanguage}`,
        event.threadID
      );
    }
  },

  onChat: async function({ api, event }) {
    if (!isEnabled) return;

    const message = event.body?.toLowerCase();
    if (message !== "bot") return;

    const dialogues = await loadDialogues(currentLanguage);
    if (!dialogues) {
      return api.sendMessage(`Failed to load ${currentLanguage} dialogues`, event.threadID);
    }

    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    return api.sendMessage(randomDialogue, event.threadID);
  }
};
