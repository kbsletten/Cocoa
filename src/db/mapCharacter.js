const { v4: uuid } = require("uuid");

function mapCharacter(character) {
  if (!character) {
    return null;
  }
  const data = JSON.parse(character.Data);
  return {
    ...character,
    Data: {
      ...data,
      Characteristics: data.Characteristics ?? {},
      Improvements: data.Improvements ?? [],
      Skills: data.Skills ?? {},
      Stats: data.Stats ?? {},
      Meta: data.Meta ?? {
        Karma: data.Meta?.Karma ?? 0,
      },
    },
  };
}
exports.mapCharacter = mapCharacter;
