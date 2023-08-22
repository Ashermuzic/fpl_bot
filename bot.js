require("dotenv").config();
const Telegraf = require("telegraf");
const axios = require("axios");

// import { startFunction, helpFunction } from "./routes/main.js";

const userIDs = {};
const logger = [];
const botToken = process.env.TELEGRAM_BOT_TOKEN;
// Create a new instance of the Telegraf bot
const bot = new Telegraf(botToken);

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
  ctx.answerCbQuery();
  ctx.reply("Please enter your FPL user ID:");
});

bot.action("locate", (ctx) => {
  ctx.answerCbQuery();
  bot.telegram.sendMessage(ctx.chat.id, `you can find your id at ...`, {
    reply_markup: {
      inline_keyboard: [[{ text: "Input id", callback_data: "setid" }]],
    },
  });
});

bot.hears(/^\d+$/, async (ctx) => {
  const userId = ctx.message.text;

  try {
    const response = await axios.get(
      `https://fantasy.premierleague.com/api/entry/${userId}/`
    );

    const playerName = `${response.data.player_first_name} ${response.data.player_last_name}`;

    userIDs[ctx.from.id] = userId;

    //logger
    logger.push({
      userId: ctx.from.id,
      telegramUsername: ctx.from.username,
      fplUserId: userId,
      playerName: playerName, // Store player's first name in logger
      timestamp: new Date().toISOString(),
    });

    bot.telegram.sendMessage(
      ctx.chat.id,
      `${playerName} : \nYour FPL user ID (${userId}) has been saved.`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "Proceed", callback_data: "main_menu" }]],
        },
      }
    );

    console.log(logger);
  } catch (error) {
    console.error(error);
    ctx.reply("An error occurred while fetching data.");
  }
});

// Main Menu

bot.action("main_menu", (ctx) => {
  ctx.answerCbQuery();
  bot.telegram.sendMessage(
    ctx.chat.id,
    `Feel free to choose from the options below to explore cool statistics for your account`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Points", callback_data: "points" },
            { text: "Leagues", callback_data: "leagues" },
          ],
          [
            { text: "Ranks", callback_data: "ranks" },
            { text: "History", callback_data: "history" },
          ],
          [
            { text: "Profile", callback_data: "profile" },
            { text: "Help", callback_data: "main_help" },
          ],
          [{ text: "About Developers", callback_data: "credentials" }],
        ],
      },
    }
  );
});

/* ============== POINTS ============== */

bot.action("points", (ctx) => {
  ctx.answerCbQuery();
  bot.telegram.sendMessage(ctx.chat.id, `View your points`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Overall", callback_data: "overall_point" },
          { text: "Current GW", callback_data: "current_gw_point" },
        ],
      ],
    },
  });
});

/* ============== LEAGUES ============== */

bot.action("leagues", async (ctx) => {
  ctx.answerCbQuery();
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      const leagueButtons = response.data.leagues.classic.map((league) => ({
        text: league.name,
        callback_data: `league_${league.id}`, // Use a unique identifier for each league
      }));

      // Organize the league buttons into rows
      const inlineKeyboard = leagueButtons.map((button) => [button]);
      // Add a "Back to Top" button at the end of the inline keyboard
      inlineKeyboard.push([
        { text: "Back To Top", callback_data: "main_menu" },
      ]);

      bot.telegram.sendMessage(ctx.chat.id, `Select a league:`, {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
    } catch (error) {
      console.error(error);
      ctx.reply("An error occurred while fetching data.");
    }
  } else {
    ctx.reply(
      "Please provide your FPL user ID first by going back to the /start command."
    );
  }
});

bot.action(/^league_\d+$/, async (ctx) => {
  ctx.answerCbQuery();
  const userId = userIDs[ctx.from.id];

  // Extract the league ID from the callback data
  const leagueId = ctx.callbackQuery.data.split("_")[1];

  // Perform actions related to the specific league
  try {
    // Fetch league details using the league ID
    const leagueDetails = await axios.get(
      `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`
    );

    const userResponse = await axios.get(
      `https://fantasy.premierleague.com/api/entry/${userId}/`
    );

    // You can do whatever you want with the leagueDetails
    // For example, you can send a message with the league standings
    const leagueStandings = leagueDetails.data.standings.results;
    const leagueStandingsMessage = leagueStandings
      .map((team) => `${team.rank}. ${team.entry_name} - ${team.total}`)
      .join("\n");

    bot.telegram.sendMessage(
      ctx.chat.id,
      `
League Standings:\n${leagueStandingsMessage}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Back to Main Menu", callback_data: "main_menu" }],
          ],
        },
      }
    );
  } catch (error) {
    console.error(error);
    ctx.reply("An error occurred while fetching league details.");
  }
});

// ...

//Overall_point

bot.action("overall_point", async (ctx) => {
  ctx.answerCbQuery();
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
      "Please provide your FPL user ID first by going back to the /start command."
    );
  }
});

//Current GW point
bot.action("current_gw_point", async (ctx) => {
  ctx.answerCbQuery();
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
      "Please provide your FPL user ID first by going back to the /start command."
    );
  }
});

/* ============== RANKS ============== */

bot.action("ranks", (ctx) => {
  ctx.answerCbQuery();
  bot.telegram.sendMessage(ctx.chat.id, `View your ranks`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "League", callback_data: "league_rank" },
          { text: "Overall", callback_data: "overall_rank" },
        ],
      ],
    },
  });
});

//Overall_rank

bot.action("overall_rank", async (ctx) => {
  ctx.answerCbQuery();
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

//League rank
bot.action("league_rank", async (ctx) => {
  ctx.answerCbQuery();
  // Check if user ID is already provided
  const userId = userIDs[ctx.from.id];

  if (userId) {
    try {
      const response = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${userId}/`
      );
      bot.telegram.sendMessage(
        ctx.chat.id,
        `   
League       >>       Rank 
${response.data.leagues.classic
  .map(
    (league) => `
  . ${league.name}    >>    Rank: ${league.entry_rank.toLocaleString()}`
  )
  .join("\n\n")}`,
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
      "Please provide your FPL user ID first by going back to the /start command."
    );
  }
});

/* ============== PROFILE ============== */

bot.action("profile", async (ctx) => {
  ctx.answerCbQuery();
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
      "Please provide your FPL user ID first by going back to the /start command."
    );
  }
});

/* ============== HISTORY ============== */

bot.action("history", (ctx) => {
  ctx.answerCbQuery();
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
  ctx.answerCbQuery();
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
      "Please provide your FPL user ID first by going back to the /start command."
    );
  }
});

//current

bot.action("current_history", async (ctx) => {
  ctx.answerCbQuery();
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
      "Please provide your FPL user ID first by going back to the /start command."
    );
  }
});

/* ============== CREDENTIALS ============== */

bot.action("credentials", (ctx) => {
  ctx.answerCbQuery();
  bot.telegram.sendMessage(
    ctx.chat.id,
    `This bot is made by Asher
For more information contact me at 
Phone: +251900269094
Email: ashersam116@gmail.com
Telegram: https://t.me/ashermuzic`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back To Top", callback_data: "main_menu" }],
        ],
      },
    }
  );
});

/* ============== CREDENTIALS ============== */

bot.action("main_help", (ctx) => {
  ctx.answerCbQuery();
  bot.telegram.sendMessage(
    ctx.chat.id,
    `Welcome to this bot powered by the official API provided by FPL (Fantasy Premier League).

In case you encounter any issues with the bot's functionality, there's no need to worry. Simply restart the bot by typing /start and follow the provided procedures to get back on track.

If you have any inquiries or need to reach out to the administrator, please refer to the credentials page for contact information.

Thank you for using our FPL API-powered bot, and enjoy your Fantasy Premier League experience!`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back To Top", callback_data: "main_menu" }],
        ],
      },
    }
  );
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
