const DB = require("./db");
const { v4: uuid } = require("uuid");

function mapCharacter(character) {
  if (!character) {
    return null;
  }
  const data = JSON.parse(character.Data);
  if (data.Characteristics?.Luck) {
    delete data.Characteristics.Luck;
  }
  return {
    ...character,
    Data: {
      ...data,
      Characteristics: data.Characteristics ?? {},
      Improvements: data.Improvements ?? [],
      Skills: data.Skills ?? {},
      Stats: data.Stats ?? {},
    },
  };
}

async function createCharacter(serverId, userId, name, data) {
  const id = uuid();
  await DB.run(
    `INSERT INTO Characters (CharacterId, UserId, Name, Data) VALUES (?, ?, ?, ?)`,
    id,
    userId,
    name,
    data
  );
  await DB.run(
    `INSERT INTO ServerCharacters (CharacterId, ServerId) VALUES (?, ?)`,
    id,
    serverId
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
    `SELECT Characters.* FROM Characters JOIN ServerCharacters ON Characters.CharacterId = ServerCharacters.CharacterId WHERE ServerId = ? AND UserId = ?`,
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

async function listCharacters(serverId, userId) {
  const results = await DB.all(
    userId
      ? `SELECT Characters.* FROM Characters JOIN ServerCharacters ON Characters.CharacterId = ServerCharacters.CharacterId WHERE ServerId = ? AND UserId = ?`
      : `SELECT Characters.* FROM Characters JOIN ServerCharacters ON Characters.CharacterId = ServerCharacters.CharacterId WHERE ServerId = ?`,
    serverId,
    userId
  );
  return results.map(mapCharacter);
}

module.exports = {
  createCharacter,
  deleteCharacter,
  getCharacter,
  getCharacterById,
  listCharacters,
  updateCharacterData,
  updateCharacterName,
};
