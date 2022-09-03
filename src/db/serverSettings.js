const DB = require("./util");

function mapServerSettings(serverSettings) {
  const data = JSON.parse(serverSettings.Data);
  return { ...serverSettings, Data: { ...data, Mark: data.Mark ?? "Auto" } };
}

async function getServerSettings(serverId) {
  let result = await DB.get(
    `SELECT * FROM ServerSettings WHERE ServerId = ?`,
    serverId
  );
  if (!result) {
    await DB.run(
      `INSERT INTO ServerSettings (ServerId, Data) VALUES (?, ?)`,
      serverId,
      JSON.stringify({})
    );
    result = await DB.get(
      `SELECT * FROM ServerSettings WHERE ServerId = ?`,
      serverId
    );
  }
  return mapServerSettings(result);
}

async function updateServerSettings(serverId, data) {
  const result = await DB.run(
    `UPDATE ServerSettings SET Data = ? WHERE ServerId = ?`,
    JSON.stringify(data),
    serverId
  );
  return result;
}

module.exports = {
  getServerSettings,
  updateServerSettings,
};
