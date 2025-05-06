module.exports = {
  config: {
    name: "quote",
    version: "1.0",
    hasPermssion: 0,
    credits: "rifat",
    description: "Send a random motivational or fun quote",
    commandCategory: "fun",
    usages: "",
    cooldowns: 3,
  },

  onStart: async function ({ message }) {
    const quotes = [
      "“Believe you can and you're halfway there.” – Theodore Roosevelt",
      "“The only limit to our realization of tomorrow is our doubts of today.” – F.D. Roosevelt",
      "“Don’t watch the clock; do what it does. Keep going.” – Sam Levenson",
      "“Dream big and dare to fail.” – Norman Vaughan",
      "“Life is what happens when you’re busy making other plans.” – John Lennon",
      "“Simplicity is the ultimate sophistication.” – Leonardo da Vinci",
      "“Stay hungry, stay foolish.” – Steve Jobs"
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return message.reply(randomQuote);
  }
};
