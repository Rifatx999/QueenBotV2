module.exports = {
	config: {
		name: "useronly",
		aliases: ["onlyuser", "usermode"],
		version: "1.1",
		author: "Rifat",
		countDown: 5,
		role: 1,
		description: {
			vi: "Bật/tắt chế độ chỉ người dùng có thể sử dụng bot",
			en: "Turn on/off only users can use bot"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [on | off]: Bật/tắt chế độ chỉ người dùng có thể sử dụng bot"
				+ "\n   {pn} noti [on | off]: Bật/tắt thông báo khi người không phải người dùng sử dụng bot",
			en: "   {pn} [on | off]: Turn on/off user-only mode"
				+ "\n   {pn} noti [on | off]: Turn on/off notification when a non-user tries to use bot"
		}
	},

	langs: {
		vi: {
			turnedOn: "Đã bật chế độ chỉ người dùng có thể sử dụng bot",
			turnedOff: "Đã tắt chế độ chỉ người dùng có thể sử dụng bot",
			turnedOnNoti: "Đã bật thông báo khi người không phải người dùng sử dụng bot",
			turnedOffNoti: "Đã tắt thông báo khi người không phải người dùng sử dụng bot",
			syntaxError: "Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off"
		},
		en: {
			turnedOn: "Turned on user-only mode (Only users can use the bot)",
			turnedOff: "Turned off user-only mode (Anyone can use the bot)",
			turnedOnNoti: "Turned on notification for non-users trying to use the bot",
			turnedOffNoti: "Turned off notification for non-users trying to use the bot",
			syntaxError: "Syntax error, only use {pn} on or {pn} off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyUsers";
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyUsers";
		}

		if (args[indexGetVal] == "on") value = true;
		else if (args[indexGetVal] == "off") value = false;
		else return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		if (isSetNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
		else
			return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	}
};
