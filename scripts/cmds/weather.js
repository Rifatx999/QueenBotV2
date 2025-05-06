const axios = require("axios");

module.exports = {
  config: {
    name: "weather",
    version: "2.0",
    hasPermssion: 0,
    credits: "rifat",
    description: "Detailed weather with forecast",
    commandCategory: "utility",
    usages: "[location]",
    cooldowns: 5,
  },

  onStart: async function ({ message, args }) {
    const location = args.join(" ") || "Dhaka";

    try {
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
      const data = res.data;

      const current = data.current_condition[0];
      const today = data.weather[0];
      const tomorrow = data.weather[1];
      const nextDay = data.weather[2];

      const msg = `
📍 Weather for: ${data.nearest_area[0].areaName[0].value}, ${data.nearest_area[0].country[0].value}

🌤 Current: ${current.temp_C}°C (Feels like ${current.FeelsLikeC}°C)
☁️ Condition: ${current.weatherDesc[0].value}
💧 Humidity: ${current.humidity}%
🌬 Wind: ${current.windspeedKmph} km/h

📅 Forecast:
• Today: ${today.avgtempC}°C - ${today.hourly[4].weatherDesc[0].value}
• Tomorrow: ${tomorrow.avgtempC}°C - ${tomorrow.hourly[4].weatherDesc[0].value}
• Next Day: ${nextDay.avgtempC}°C - ${nextDay.hourly[4].weatherDesc[0].value}
      `.trim();

      return message.reply(msg);
    } catch (e) {
      console.log(e);
      return message.reply("Couldn't fetch weather data. Try again later.");
    }
  },
};
