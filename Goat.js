const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");
const log = require("./logger/log.js");

global.GoatBot = {
  startTime: Date.now() - process.uptime() * 1000,
  commands: new Map(),
  eventCommands: new Map(),
  commandFilesPath: [],
  eventCommandsFilesPath: [],
  aliases: new Map(),
  onFirstChat: [],
  onChat: [],
  onEvent: [],
  onReply: new Map(),
  onReaction: new Map(),
  onAnyEvent: [],
  config: {},
  configCommands: {},
  envCommands: {},
  envEvents: {},
  envGlobal: {},
  reLoginBot: function () {},
  Listening: null,
  oldListening: [],
  callbackListenTime: {},
  storage5Message: [],
  fcaApi: null,
  botID: null
};

const utils = require("./utils.js");
global.utils = utils;
const { colors } = utils;

async function main() {
  try {
    const configPath = path.join(__dirname, "config.json");
    if (!fs.existsSync(configPath)) {
      log.error("Config file not found");
      process.exit(1);
    }

    const config = await fs.readJson(configPath);
    global.GoatBot.config = config;

    const language = require("./languages/index.js")(config.language || "en");
    global.GoatBot.language = language;

    await require("./loader.js")(config);

    const bot = require("./listen.js");
    bot(config);

    log.info(colors.green("GoatBot is now running!"));
  } catch (err) {
    log.error("Failed to start GoatBot:", err);
    process.exit(1);
  }
}

main();
