import Telegraf from "telegraf";
import axios from "axios";
import { startFunction, helpFunction, front } from "./routes/main.js";

const userIDs = {};

// Create a new instance of the Telegraf bot
const bot = new Telegraf("6544201173:AAFg_NMPmWkTST4RSXQfztME6uM25xISoB8");

// Set up a command handler for the /start command
bot.start(startFunction);

bot.help(helpFunction);

/* ============== POINTS ============== */

bot.command("overall", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      ctx.reply(
        `Your overall point is ${response.data.summary_overall_points}`
      );
    } catch (error) {
      console.error(error);
      ctx.reply("An error occurred while fetching data.");
    }
  } else {
    ctx.reply(
      "Please provide your FPL user ID first using the /setid command."
    );
  }
});

bot.command("setid", (ctx) => {
  ctx.reply("Please enter your FPL user ID:");
});

bot.hears(/^\d+$/, (ctx) => {
  const userId = ctx.message.text;
  userIDs[ctx.from.id] = userId;
  ctx.reply(`Your FPL user ID (${userId}) has been saved.`);
});

// if random text inserted
bot.on("text", (ctx) => [
  ctx.reply("Please choose from the provided choices "),
]);

// Launch the bot
bot
  .launch()
  .then(() => {
    console.log("Bot is now running");
  })
  .catch((err) => {
    console.error("Error starting bot:", err);
  });
