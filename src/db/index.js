const Character = require("./character");
const ServerSettings = require("./serverSettings");

module.exports = {
  ...Character,
  ...ServerSettings,
};
