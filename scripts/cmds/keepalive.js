const fs = require("fs-extra");
const path = require("path");

const configPath = path.join(__dirname, "cache", "keepalive.json");

// Ensure cache folder exists
fs.ensureDirSync(path.join(__dirname, "cache"));

if (!fs.existsSync(configPath)) {
	fs.writeJsonSync(configPath, { active: false });
}

let interval;

function startPing(api) {
	if (interval) return;
	interval = setInterval(() => {
		api.getCurrentUserID(); // Keeps the bot alive by making a request
		console.log("[KEEPALIVE] Ping sent to keep bot active.");
	}, 1000 * 60 * 4); // Every 4 minutes
}

function stopPing() {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
}

module.exports = {
	config: {
		name: "keepalive",
		version: "1.0",
		hasPermssion: 2,
		credits: "rifat",
		description: "Keep bot always active",
		commandCategory: "system",
		usages: "[on/off/status]",
		cooldowns: 5,
	},

	onStart: async function ({ message, args, api }) {
		const arg = args[0]?.toLowerCase();

		if (!arg || !["on", "off", "status"].includes(arg)) {
			return message.reply("Usage:\n• keepalive on\n• keepalive off\n• keepalive status");
		}

		const config = fs.readJsonSync(configPath);

		if (arg === "on") {
			if (config.active) return message.reply("KeepAlive is already ON.");
			config.active = true;
			fs.writeJsonSync(configPath, config);
			startPing(api);
			return message.reply("✅ KeepAlive is now ON. Your bot will stay active.");
		}

		if (arg === "off") {
			if (!config.active) return message.reply("KeepAlive is already OFF.");
			config.active = false;
			fs.writeJsonSync(configPath, config);
			stopPing();
			return message.reply("❌ KeepAlive is now OFF. Your bot may go to sleep.");
		}

		if (arg === "status") {
			return message.reply(`KeepAlive is currently: ${config.active ? "✅ ON" : "❌ OFF"}`);
		}
	},

	onLoad: async ({ api }) => {
		const config = fs.readJsonSync(configPath);
		if (config.active) {
			startPing(api);
			console.log("[KEEPALIVE] Auto-started.");
		}
	}
};
