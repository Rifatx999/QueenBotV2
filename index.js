/**
 * @author NTKhang
 * ! The source code is written by NTKhang, please don't change the author's name everywhere.
 * ! Official source code: https://github.com/ntkhang03/Goat-Bot-V2
 * ! If you do not download the source code from the above address, you are using an unknown version and at risk of having your account hacked.
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code === 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

// Start the bot
startProject();

// Create a dummy web server to prevent Render from shutting it down
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
	res.send("Goat Bot V2 is running!");
});

app.listen(PORT, () => console.log(`Web service running on port ${PORT}`));
