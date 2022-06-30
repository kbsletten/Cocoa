const Discord = require("discord.js");
const DB = require("../db/character");
const { v4: uuid } = require("uuid");
const MockInteraction = require("../mocks/mockInteraction");

const eventHandlers = {};
jest.mock("../discord/cocoaClient", () => {
  return {
    cocoaClient: {
      on: function (name, callback) {
        eventHandlers[name] = callback;
      },
    },
  };
});
jest.mock("../db/character", () => {
  return {
    createCharacter: jest.fn(),
    getCharacter: jest.fn(),
    getCharacterById: jest.fn(),
    deleteCharacter: jest.fn(),
    listCharacters: jest.fn(),
    updateCharacterData: jest.fn(),
  };
});
jest;

require("./cocoaClient");
require("./interaction");

const dummyCharacter = {
  CharacterId: uuid(),
  Name: "Dummy Character",
  Data: {
    Characteristics: {
      STR: 50,
      CON: 50,
      DEX: 50,
      INT: 50,
      SIZ: 50,
      POW: 50,
      APP: 50,
      EDU: 50,
    },
    Improvements: [],
    Skills: {},
    Stats: {
      Luck: 75,
    },
  },
};

test("'editCharacter:characteristic' brings up a menu", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:characteristic`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(interaction.update).toHaveBeenCalled();
  expect(interaction.update.mock.lastCall[0].components).toHaveLength(3);
  expect(
    interaction.update.mock.lastCall[0].components[0].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:characteristic`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skill`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skillPage:1`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[1].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skillPage:4`);
});

test("'editCharacter:characteristic:POW' brings up a menu", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:characteristic`,
    ["POW"]
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(interaction.update).toHaveBeenCalled();
  expect(interaction.update.mock.lastCall[0].components).toHaveLength(3);
  expect(
    interaction.update.mock.lastCall[0].components[0].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:POW`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:POW:minusFive`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[1].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:POW:minusOne`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[2].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:POW:plusOne`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[3].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:POW:plusFive`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[4].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:POW:improve`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:characteristic:SIZ`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[1].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:characteristic`);
});

test("'editCharacter:skillPage:1' brings up a menu", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:skillPage:1`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(interaction.update).toHaveBeenCalled();
  expect(interaction.update.mock.lastCall[0].components).toHaveLength(3);
  expect(
    interaction.update.mock.lastCall[0].components[0].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:characteristic`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skill`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skillPage:0`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[1].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skillPage:2`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[2].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skillPage:4`);
});

test("'editCharacter:skill' brings up a menu", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:skill`,
    ["Listen"]
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(interaction.update).toHaveBeenCalled();
  expect(interaction.update.mock.lastCall[0].components).toHaveLength(3);
  expect(
    interaction.update.mock.lastCall[0].components[0].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:Listen`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:Listen:minusFive`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[1].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:Listen:minusOne`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[2].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:Listen:plusOne`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[3].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:Listen:plusFive`);
  expect(
    interaction.update.mock.lastCall[0].components[1].components[4].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:Listen:improve`);
  expect(
    interaction.update.mock.lastCall[0].components[2].components[0].customId
  ).toEqual(`editCharacter:${dummyCharacter.CharacterId}:skillPage:2`);
});

test("'editCharacter:POW:improve' increases your POW", async () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.3);
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:POW:improve`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(DB.updateCharacterData).toHaveBeenCalledWith(
    dummyCharacter.CharacterId,
    dummyCharacter.Data
  );
  expect(dummyCharacter.Data.Characteristics.POW).toBe(54);
  expect(interaction.update).toHaveBeenCalled();
  expect(interaction.update.mock.lastCall[0].embeds).toEqual([
    new Discord.MessageEmbed({
      title: "Improved Dummy Character's POW!",
      fields: [{ name: "POW", value: "50 + 1d10 (4) = 54" }],
    }),
  ]);
});

test("'editCharacter:Listen:improve' increases your Listen", async () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.3);
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:Listen:improve`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(DB.updateCharacterData).toHaveBeenCalledWith(
    dummyCharacter.CharacterId,
    dummyCharacter.Data
  );
  expect(dummyCharacter.Data.Skills.Listen).toBe(24);
  expect(interaction.update).toHaveBeenCalled();
  expect(interaction.update.mock.lastCall[0].embeds).toEqual([
    new Discord.MessageEmbed({
      title: "Improved Dummy Character's Listen!",
      fields: [{ name: "Listen", value: "20 + 1d10 (4) = 24" }],
    }),
  ]);
});

test("'editCharacter:POW:minusFive' decreases your POW by 5", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:POW:minusFive`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(DB.updateCharacterData).toHaveBeenCalledWith(
    dummyCharacter.CharacterId,
    dummyCharacter.Data
  );
  expect(dummyCharacter.Data.Characteristics.POW).toBe(49);
  expect(interaction.update).toHaveBeenCalled();
});

test("'editCharacter:Listen:minusOne' decreases your Listen by 1", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:Listen:minusOne`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(DB.updateCharacterData).toHaveBeenCalledWith(
    dummyCharacter.CharacterId,
    dummyCharacter.Data
  );
  expect(dummyCharacter.Data.Skills.Listen).toBe(23);
  expect(interaction.update).toHaveBeenCalled();
});

test("'editCharacter:POW:plusFive' increases your POW by 5", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:POW:plusFive`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(DB.updateCharacterData).toHaveBeenCalledWith(
    dummyCharacter.CharacterId,
    dummyCharacter.Data
  );
  expect(dummyCharacter.Data.Characteristics.POW).toBe(54);
  expect(interaction.update).toHaveBeenCalled();
});

test("'editCharacter:Listen:plusOne' increases your Listen by 1", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:Listen:plusOne`
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(DB.updateCharacterData).toHaveBeenCalledWith(
    dummyCharacter.CharacterId,
    dummyCharacter.Data
  );
  expect(dummyCharacter.Data.Skills.Listen).toBe(24);
  expect(interaction.update).toHaveBeenCalled();
});

test("'editCharacter:Spot Hidden:60' sets your Listen to 60", async () => {
  DB.getCharacterById.mockImplementationOnce(async () => dummyCharacter);

  const interaction = new MockInteraction(
    `editCharacter:${dummyCharacter.CharacterId}:Spot Hidden`,
    [60]
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getCharacterById).toHaveBeenCalledWith(dummyCharacter.CharacterId);
  expect(DB.updateCharacterData).toHaveBeenCalledWith(
    dummyCharacter.CharacterId,
    dummyCharacter.Data
  );
  expect(dummyCharacter.Data.Skills["Spot Hidden"]).toBe(60);
  expect(interaction.update).toHaveBeenCalled();
});
