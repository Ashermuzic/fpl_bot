import Telegraf from "telegraf";
import axios from "axios";
// import { startFunction, helpFunction } from "./routes/main.js";

const userIDs = {};

// Create a new instance of the Telegraf bot
const bot = new Telegraf("6544201173:AAFg_NMPmWkTST4RSXQfztME6uM25xISoB8");

// Set up a command handler for the /start command
// bot.start(startFunction);
bot.command("start", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    `Welcome! I'm the FPL account manager bot ready to help you navigate the fantasy football world.
    
To get started, please provide me with your FPL user Id. Don't worry, your ID is already public, so i'm not asking for any private information.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Input Id", callback_data: "setid" },
            { text: "help", callback_data: "locate" },
          ],
        ],
      },
    }
  );
});

bot.action("setid", (ctx) => {
  ctx.reply("Please enter your FPL user ID:");
});

bot.action("locate", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, `you can find your id at ...`, {
    reply_markup: {
      inline_keyboard: [[{ text: "Input id", callback_data: "setid" }]],
    },
  });
});

bot.hears(/^\d+$/, (ctx) => {
  const userId = ctx.message.text;
  userIDs[ctx.from.id] = userId;
  bot.telegram.sendMessage(
    ctx.chat.id,
    `Your FPL user ID (${userId}) has been saved.`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Proceed", callback_data: "main_menu" }]],
      },
    }
  );
});

// Main Menu

bot.action("main_menu", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    `Feel free to choose from the options below to explore cool statistics for your account`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Points", callback_data: "points" },
            { text: "Ranks", callback_data: "ranks" },
          ],
          [
            { text: "Profile", callback_data: "profile" },
            { text: "History", callback_data: "history" },
          ],
          [{ text: "Help", callback_data: "main_help" }],
          [{ text: "Credentials", callback_data: "credentials" }],
        ],
      },
    }
  );
});

/* ============== POINTS ============== */

bot.action("points", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, `View your points`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Overall", callback_data: "overall_point" },
          { text: "Current Game week", callback_data: "current_gw_point" },
        ],
      ],
    },
  });
});

//Overall_point

bot.action("overall_point", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Your Overall point is ${response.data.summary_overall_points.toLocaleString()}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Current GW", callback_data: "current_gw_point" },
                { text: "Back To Top", callback_data: "main_menu" },
              ],
            ],
          },
        }
      );
      //   ctx.reply(
      //     `Your overall point is ${response.data.summary_overall_points}`
      //   );
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

//Current GW point
bot.action("current_gw_point", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Your Current Game week point is ${response.data.summary_event_points.toLocaleString()}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Overall", callback_data: "overall_point" },
                { text: "Back To Top", callback_data: "main_menu" },
              ],
            ],
          },
        }
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

/* ============== RANKS ============== */

bot.action("ranks", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, `View your ranks`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Overall", callback_data: "overall_rank" },
          { text: "Current Game week", callback_data: "current_gw_rank" },
        ],
      ],
    },
  });
});

//Overall_rank

bot.action("overall_rank", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Your Overall rank is ${response.data.summary_overall_rank.toLocaleString()}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Current GW", callback_data: "current_gw_rank" },
                { text: "Back To Top", callback_data: "main_menu" },
              ],
            ],
          },
        }
      );
      //   ctx.reply(
      //     `Your overall point is ${response.data.summary_overall_points}`
      //   );
    } catch (error) {
      console.error(error);
      ctx.reply("An error occurred while fetching data.");
    }
  } else {
    ctx.reply(
      "Please provide your FPL user ID first using the /start command."
    );
  }
});

//Current GW rank
bot.action("current_gw_rank", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Your Current Game week rank is ${response.data.summary_event_rank.toLocaleString()}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Overall", callback_data: "overall_rank" },
                { text: "Back To Top", callback_data: "main_menu" },
              ],
            ],
          },
        }
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

/* ============== PROFILE ============== */

bot.action("profile", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Name: ${response.data.player_first_name} ${
          response.data.player_last_name
        }

Team Name: ${response.data.name}
        
Region: ${response.data.player_region_name}
        
List of Leagues => 
${response.data.leagues.classic
  .map((league) => `. ${league.name}`)
  .join("\n")}`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Back To Top", callback_data: "main_menu" }],
            ],
          },
        }
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

/* ============== HISTORY ============== */

bot.action("history", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, `View your history`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Past", callback_data: "past_history" },
          { text: "Current", callback_data: "current_history" },
        ],
      ],
    },
  });
});

//Past

bot.action("past_history", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/history`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `${response.data.past
          .map(
            (year) =>
              `Year: ${year.season_name}   Total points: ${year.total_points}   Rank: ${year.rank}`
          )
          .join("\n")}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Current", callback_data: "current_history" },
                { text: "Back To Top", callback_data: "main_menu" },
              ],
            ],
          },
        }
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

//current

bot.action("current_history", async (ctx) => {
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/history`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `${response.data.current
          .map(
            (year) =>
              `GW: ${year.event}   Points: ${
                year.points
              }   Rank: ${year.overall_rank.toLocaleString()}   Transfers: ${
                year.event_transfers
              }`
          )
          .join("\n")}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Past", callback_data: "past_history" },
                { text: "Back To Top", callback_data: "main_menu" },
              ],
            ],
          },
        }
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
