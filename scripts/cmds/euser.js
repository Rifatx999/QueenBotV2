module.exports = {
  config: {
    name: "euser",
    version: "1.0",
    hasPermssion: 1,
    credits: "rifat",
    description: "List all users in the group with their UID and group TID",
    commandCategory: "info",
    usages: "",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    try {
      const threadID = event.threadID;
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName || "Unnamed Group";
      const participantIDs = threadInfo.participantIDs;

      let userList = `👥 গ্রুপ: ${groupName}\n🆔 TID: ${threadID}\n\n👤 সদস্য তালিকা:\n`;

      for (const id of participantIDs) {
        const userInfo = await api.getUserInfo(id);
        const name = userInfo[id].name || "Unknown";
        userList += `• ${name} | UID: ${id}\n`;
      }

      api.sendMessage(userList, threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ সদস্য তালিকা আনতে সমস্যা হয়েছে।", event.threadID);
    }
  }
};
