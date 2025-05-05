/**
 * Updated Goat Bot V2 entry point
 * Compatible with any command
 * Author integrity respected per original author NTKhang
 */

process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const { execSync } = require('child_process');
const log = require('./logger/log.js');
const utils = require("./utils.js");

global.utils = utils;
const { colors } = utils;

const validJSON = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) throw new Error(`File "${filePath}" not found`);
    execSync(`npx jsonlint "${filePath}"`, { stdio: 'pipe' });
    return true;
  } catch (err) {
    const msg = err.message.split("\n").slice(1).join("\n").split("    at")[0];
    throw new Error(msg);
  }
};

const NODE_ENV = process.env.NODE_ENV;
const dirConfig = path.join(__dirname, `config${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`);
const dirConfigCommands = path.join(__dirname, `configCommands${['production', 'development'].includes(NODE_ENV) ? '.dev.json' : '.json'}`);
const dirAccount = path.join(__dirname, `account${['production', 'development'].includes(NODE_ENV) ? '.dev.txt' : '.txt'}`);

for (const pathDir of [dirConfig, dirConfigCommands]) {
  try {
    validJSON(pathDir);
  } catch (err) {
    log.error("CONFIG", `Invalid JSON file "${pathDir.replace(__dirname, "")}":\n${err.message}\nPlease fix it and restart bot`);
    process.exit(0);
  }
}

const config = require(dirConfig);
const configCommands = require(dirConfigCommands);
if (config.whiteListMode?.whiteListIds && Array.isArray(config.whiteListMode.whiteListIds))
  config.whiteListMode.whiteListIds = config.whiteListMode.whiteListIds.map(id => id.toString());

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
  config,
  configCommands,
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

global.db = {
  allThreadData: [],
  allUserData: [],
  allDashBoardData: [],
  allGlobalData: [],
  threadModel: null,
  userModel: null,
  dashboardModel: null,
  globalModel: null,
  threadsData: null,
  usersData: null,
  dashBoardData: null,
  globalData: null,
  receivedTheFirstMessage: {}
};

global.client = {
  dirConfig,
  dirConfigCommands,
  dirAccount,
  countDown: {},
  cache: {},
  database: {
    creatingThreadData: [],
    creatingUserData: [],
    creatingDashBoardData: [],
    creatingGlobalData: []
  },
  commandBanned: configCommands.commandBanned
};

global.temp = {
  createThreadData: [],
  createUserData: [],
  createThreadDataError: [],
  filesOfGoogleDrive: {
    arraybuffer: {},
    stream: {},
    fileNames: {}
  },
  contentScripts: {
    cmds: {},
    events: {}
  }
};

const watchAndReloadConfig = (dir, type, prop, logName) => {
  let lastModified = fs.statSync(dir).mtimeMs;
  let isFirst = true;

  fs.watch(dir, (eventType) => {
    if (eventType === type) {
      const oldConfig = global.GoatBot[prop];
      setTimeout(() => {
        try {
          if (isFirst) {
            isFirst = false;
            return;
          }
          if (lastModified === fs.statSync(dir).mtimeMs) return;
          global.GoatBot[prop] = JSON.parse(fs.readFileSync(dir, 'utf-8'));
          log.success(logName, `Reloaded ${dir.replace(process.cwd(), "")}`);
        } catch (err) {
          log.warn(logName, `Can't reload ${dir.replace(process.cwd(), "")}`);
          global.GoatBot[prop] = oldConfig;
        } finally {
          lastModified = fs.statSync(dir).mtimeMs;
        }
      }, 200);
    }
  });
};

watchAndReloadConfig(dirConfigCommands, 'change', 'configCommands', 'CONFIG COMMANDS');
watchAndReloadConfig(dirConfig, 'change', 'config', 'CONFIG');

global.GoatBot.envGlobal = configCommands.envGlobal;
global.GoatBot.envCommands = configCommands.envCommands;
global.GoatBot.envEvents = configCommands.envEvents;

if (config.autoRestart) {
  const time = config.autoRestart.time;
  if (!isNaN(time) && time > 0) {
    utils.log.info("AUTO RESTART", `Scheduled after ${utils.convertTime(time, true)}`);
    setTimeout(() => {
      utils.log.info("AUTO RESTART", "Restarting...");
      process.exit(2);
    }, time);
  } else if (typeof time === "string" && time.match(/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/gmi)) {
    const cron = require("node-cron");
    cron.schedule(time, () => {
      utils.log.info("AUTO RESTART", "Restarting...");
      process.exit(2);
    });
  }
}

(async () => {
  const currentVersion = require("./package.json").version;
  try {
    const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
    if (compareVersion(version, currentVersion) === 1) {
      utils.log.master("NEW VERSION", `New version detected: ${version}. Please run 'node update'.`);
    }
  } catch (err) {
    log.warn("VERSION CHECK", "Failed to check latest version");
  }

  require(`./bot/login/login${NODE_ENV === 'development' ? '.dev.js' : '.js'}`);
})();

function compareVersion(v1, v2) {
  const a = v1.split(".").map(n => parseInt(n));
  const b = v2.split(".").map(n => parseInt(n));
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}
