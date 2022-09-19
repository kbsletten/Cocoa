const dotenv = require("dotenv");
dotenv.config();
const { cocoaClient } = require("./discord/cocoaClient");

require("./discord/admin.message");
require("./discord/admin.interaction");
require("./discord/message");
require("./discord/interaction");

(async function () {
  await cocoaClient.login(process.env.COCOA_TOKEN);

  while (!cocoaClient.isReady()) {
    console.log(`Pausing...`)
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  require("./discord/deployCommands");
})().catch(console.error);
