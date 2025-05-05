const fs = require('fs');
const path = require('path');

// Path to the cookies.txt file
const COOKIES_FILE_PATH = path.join(__dirname, 'cookies.txt');

// Command configuration
module.exports = {
  config: {
    name: "setcookies",
    aliases: ["editcookies"],
    version: "1.0",
    author: "Rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Set cookies in cookies.txt",
    longDescription: "Recreates cookies.txt and writes the cookies you provide in Netscape format",
    category: "system",
    guide: "{pn} [cookies_in_netscape_format]"
  },

  langs: {
    en: {
      missingArgs: "Please provide the cookies in Netscape format.",
      success: "✅ Cookies have been saved successfully.",
      error: "❌ Error: %1"
    }
  },

  onStart: async function ({ message, args, event, commandName, api }) {
    const cookies = args.join(" ").trim();

    if (!cookies) {
      return message.reply(this.langs.en.missingArgs);
    }

    try {
      // Delete the existing cookies.txt file if it exists
      if (fs.existsSync(COOKIES_FILE_PATH)) {
        fs.unlinkSync(COOKIES_FILE_PATH);
      }

      // Create and write the provided cookies into the cookies.txt file
      fs.writeFileSync(COOKIES_FILE_PATH, cookies);

      // Reply with a success message
      message.reply(this.langs.en.success);
    } catch (err) {
      // Handle error if something goes wrong
      message.reply(this.langs.en.error.replace('%1', err.message));
    }
  }
};
