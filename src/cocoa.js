const dotenv = require("dotenv");
dotenv.config();
const { cocoaClient } = require('./discord/cocoaClient');

require('./discord/admin.message');
require('./discord/admin.interaction');
require('./discord/message');
require('./discord/interaction');

cocoaClient.login(process.env.COCOA_TOKEN);
