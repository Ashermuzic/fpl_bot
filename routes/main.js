export const userTracker = [];

function logger(ctx) {
  const myUsers = ctx.from.username;
  const logEntry = `${myUsers} used your bot`;
  userTracker.push(myUsers); // Push the log entry to the userTracker array
  console.log(logEntry);
  console.log(userTracker);
}
