import Telegraf from "telegraf";
const bot = new Telegraf("6544201173:AAFg_NMPmWkTST4RSXQfztME6uM25xISoB8");

export const startFunction = (ctx) => {
  logger(ctx);
  ctx.reply(
    `Welcome ${ctx.from.first_name}! I'm the FPL account manager bot ready to help you navigate the fantasy football world.`
  );
  ctx.reply(
    `To get started, please provide me with your FPL user Id. Don't worry, your ID is already public, so i'm not asking for any private information.`
  );
};

export const helpFunction = (ctx) => {
  ctx.reply("You have entered the help command!");
};

export const userTracker = [];

function logger(ctx) {
  const myUsers = ctx.from.username;
  const logEntry = `${myUsers} used your bot`;
  userTracker.push(myUsers); // Push the log entry to the userTracker array
  console.log(logEntry);
  console.log(userTracker);
}
