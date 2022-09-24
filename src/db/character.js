const DB = require("./util");
const { v4: uuid } = require("uuid");
const { mapCharacter } = require("./mapCharacter");

async function createCharacter(serverId, userId, name, data) {
  const id = uuid();
  await DB.run(
    `INSERT INTO Characters (CharacterId, Name, Data) VALUES (?, ?, ?)`,
    id,
    name,
    data
  );
  await DB.run(
    `UPDATE ServerCharacters SET IsPrimary = FALSE WHERE ServerId = ? AND UserId = ?`,
    serverId,
    userId
  );
  await DB.run(
    `INSERT INTO ServerCharacters (CharacterId, ServerId, UserId, IsPrimary) VALUES (?, ?, ?, TRUE)`,
    id,
    serverId,
    userId
  );
  return id;
}

async function deleteCharacter(characterId) {
  await DB.run(
    `DELETE FROM ServerCharacters WHERE CharacterId = ?`,
    characterId
  );
  await DB.run(`DELETE FROM Characters WHERE CharacterId = ?`, characterId);
}

async function getCharacterById(characterId) {
  const result = await DB.get(
    `SELECT * FROM Characters WHERE CharacterId = ?`,
    characterId
  );
  return mapCharacter(result);
}

async function getCharacter(serverId, userId) {
  const result = await DB.get(
    `SELECT Characters.* FROM Characters JOIN ServerCharacters ON Characters.CharacterId = ServerCharacters.CharacterId WHERE ServerId = ? AND UserId = ? AND NOT IsNpc ORDER BY IsPrimary DESC`,
    serverId,
    userId
  );
  return await mapCharacter(result);
}

async function updateCharacterData(characterId, data) {
  const result = await DB.run(
    `UPDATE Characters SET Data = ? WHERE CharacterId = ?`,
    JSON.stringify(data),
    characterId
  );
  return result;
}

async function updateCharacterName(characterId, name) {
  const result = await DB.run(
    `UPDATE Characters SET Name = ? WHERE CharacterId = ?`,
    name,
    characterId
  );
  return result;
}

async function updateCharacterIsNpc(characterId, isNpc) {
  const result = await DB.run(
    `UPDATE Characters SET IsNpc = ? WHERE CharacterId = ?`,
    isNpc,
    characterId
  );
  return result;
}

async function listCharacters(serverId, userId) {
  const results = await DB.all(
    userId
      ? `SELECT Characters.* FROM Characters JOIN ServerCharacters ON Characters.CharacterId = ServerCharacters.CharacterId WHERE ServerId = ? AND UserId = ? AND NOT IsNpc`
      : `SELECT Characters.* FROM Characters JOIN ServerCharacters ON Characters.CharacterId = ServerCharacters.CharacterId WHERE ServerId = ? AND NOT IsNpc`,
    serverId,
    userId
  );
  return results.map(mapCharacter);
}

async function listNpcs(serverId) {
  const results = await DB.all(
    `SELECT Characters.* FROM Characters JOIN ServerCharacters ON Characters.CharacterId = ServerCharacters.CharacterId WHERE ServerId = ? AND IsNpc`,
    serverId
  );
  return results.map(mapCharacter);
}

module.exports = {
  createCharacter,
  deleteCharacter,
  getCharacter,
  getCharacterById,
  listCharacters,
  listNpcs,
  updateCharacterData,
  updateCharacterIsNpc,
  updateCharacterName,
};
