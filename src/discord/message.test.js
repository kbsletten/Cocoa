const Discord = require("discord.js");
const DB = require("../db");
const MockMessage = require("../mocks/mockMessage");
const { v4: uuid } = require("uuid");
const { choiceCallback } = require("./choice");

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
jest.mock("../db", () => {
  return {
    getServerSettings: jest.fn(() => {
      return { ServerId: "1337", Data: { Mark: "Auto" } };
    }),
    updateServerSettings: jest.fn(),
    createCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    getCharacter: jest.fn(),
    listCharacters: jest.fn(),
    updateCharacterData: jest.fn(),
    updateCharacterName: jest.fn(),
  };
});

require("./cocoaClient");
require("./message");

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

test("cocoa doesn't talk to strangers", async () => {
  const consoleLogFn = jest.spyOn(global.console, "log");

  const message = new MockMessage("Hi, Cocoa!", true);
  await eventHandlers["messageCreate"](message);
  expect(message.reply).not.toHaveBeenCalled();
});

test("cocoa ignores the haters", async () => {
  const message = new MockMessage("Hi, Cocoa!");
  await eventHandlers["messageCreate"](message);
  expect(message.reply).not.toHaveBeenCalled();
});

test("'new character' creates a character", async () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.9);

  const message = new MockMessage("new character");
  await eventHandlers["messageCreate"](message);
  expect(DB.createCharacter).toHaveBeenCalled();
  expect(message.reply.mock.lastCall[0].embeds).toEqual([
    new Discord.MessageEmbed({
      title: "Rolled stats for New Character!",
      fields: [
        {
          inline: true,
          name: "STR",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "CON",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "SIZ",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "DEX",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "APP",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "INT",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "POW",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "EDU",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "Luck",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
      ],
    }),
  ]);
});

test("'new character John Doe' creates a character", async () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.9);

  const message = new MockMessage("new character John Doe");
  await eventHandlers["messageCreate"](message);
  expect(DB.createCharacter).toHaveBeenCalled();
  expect(message.reply.mock.lastCall[0].embeds).toEqual([
    new Discord.MessageEmbed({
      title: "Rolled stats for John Doe!",
      fields: [
        {
          inline: true,
          name: "STR",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "CON",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "SIZ",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "DEX",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "APP",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "INT",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "POW",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "EDU",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "Luck",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
      ],
    }),
  ]);
});

test("'edit character' creates an interactive modal", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("edit character");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalled();
});

test("'delete character Real Character' doesn't delete the character", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("delete character Real Character");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.deleteCharacter).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalled();
});

test("'delete character Dummy Character' deletes the character", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("delete character Dummy Character");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.deleteCharacter).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalled();
});

test("'list server characters' lists the characters on the server", async () => {
  DB.listCharacters.mockImplementationOnce(async () => [dummyCharacter]);

  const message = new MockMessage("list server characters");
  await eventHandlers["messageCreate"](message);
  expect(DB.listCharacters).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Here are all the characters on the server:

**Dummy Character**
HP: 10/10, Luck: 75/99, MP: 10/10, Sanity: 50/99
STR: 50, CON: 50, DEX: 50, INT: 50, SIZ: 50, POW: 50, APP: 50, EDU: 50
Skills: Not set`);
});

test("'list characters' lists your characters on the server", async () => {
  DB.listCharacters.mockImplementationOnce(async () => [dummyCharacter]);

  const message = new MockMessage("list characters");
  await eventHandlers["messageCreate"](message);
  expect(DB.listCharacters).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Here are your characters: Dummy Character`
  );
});

test("'skill Listen 70' sets a character's listen to 70", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("skill Listen 70");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills.Listen).toBe(70);
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalled();
});

test("'check 70 Listen penalty' succeeds on 69", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.9)
    .mockImplementationOnce(() => 0.6)
    .mockImplementationOnce(() => 0.3);

  const message = new MockMessage("check 70 Listen penalty");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%, Penalty: 1)!
2d% (60, 30) + 1d10 (9) = 69; **Success!**`);
});

test("'check 70 Listen bonus' fails on 70", async () => {
  DB.getCharacter.mockImplementationOnce(async () => null);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.0)
    .mockImplementationOnce(() => 0.6)
    .mockImplementationOnce(() => 0.9);

  const message = new MockMessage("check 70 Listen bonus");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Test Nickname attempts Listen (70%, Bonus: 1)!
2d% (70, 100) + 1d10 (0) = 70; **Success!**`);
});

test("'check 70 Listen' fails on 71", async () => {
  DB.getCharacter.mockImplementationOnce(async () => null);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.1)
    .mockImplementationOnce(() => 0.7);

  const message = new MockMessage("check 70 Listen");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Test Nickname attempts Listen (70%)!
1d% (70) + 1d10 (1) = 71; **Failure!**`);
});

test("'check 70 Unknown Skill' fails on 71", async () => {
  DB.getCharacter.mockImplementationOnce(async () => null);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.1)
    .mockImplementationOnce(() => 0.7);

  const message = new MockMessage("check 70 Unknown Skill");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Test Nickname attempts Unknown Skill (70%)!
1d% (70) + 1d10 (1) = 71; **Failure!**`);
});

test("'check 70' fails on 71", async () => {
  DB.getCharacter.mockImplementationOnce(async () => null);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.1)
    .mockImplementationOnce(() => 0.7);

  const message = new MockMessage("check 70");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Test Nickname attempts an Unknown Skill (70%)!
1d% (70) + 1d10 (1) = 71; **Failure!**`);
});

test("'skill Listen' succeeds on 69", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.9)
    .mockImplementationOnce(() => 0.6);

  const message = new MockMessage("skill Listen");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Improvements).toContain("Listen");
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%)!
1d% (60) + 1d10 (9) = 69; **Success!**
Marked for improvement!`);
});

test("'skill Listen bonus' succeeds on 70", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.0)
    .mockImplementationOnce(() => 0.6)
    .mockImplementationOnce(() => 0.8);

  const message = new MockMessage("skill Listen bonus");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%, Bonus: 1)!
2d% (70, 90) + 1d10 (0) = 70; **Success!**`);
});

test("'skill Listen penalty' fails on 71", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.1)
    .mockImplementationOnce(() => 0.7)
    .mockImplementationOnce(() => 0.3);

  const message = new MockMessage("skill Listen penalty");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%, Penalty: 1)!
2d% (70, 30) + 1d10 (1) = 71; **Failure!**`);
});

test("'skill Firearm' asks for clarification", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const message = new MockMessage("skill Firearm");
  const dontWait = eventHandlers["messageCreate"](message);
  await new Promise((resolve) => {
    message.reply.mockImplementationOnce(() => resolve());
  });
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply.mock.lastCall[0].content).toBe(
    "I'm sorry, I can't tell if you mean Firearms (Flamethrower), Firearms (Handgun), Firearms (Heavy Weapons), Firearms (Machine Gun), Firearms (Rifle/Shotgun), or Firearms (Submachine Gun)."
  );
  const interaction = { update: jest.fn() };
  await choiceCallback(
    message.reply.mock.lastCall[0].components[0].components[0].customId.split(
      ":",
      4
    )[1],
    interaction
  );
  expect(interaction.update).toHaveBeenCalled();
  await dontWait;
  expect(message.reply).toHaveBeenCalledTimes(2);
  expect(message.reply.mock.lastCall[0])
    .toBe(`Dummy Character attempts Firearms (Flamethrower) (10%)!
1d% (10) + 1d10 (1) = 11; **Failure!**`);
});

test("'r 3d6 * 5' rolls three d6s", async () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const message = new MockMessage("r 3d6 * 5");
  await eventHandlers["messageCreate"](message);
  expect(message.reply).toHaveBeenCalledWith(`3d6 (1, 1, 1) * 5 = 15`);
});

test("'hp -5' reduces the HP by 5", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("hp -5");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(`Dummy Character's HP: 5/10 (-5)`);
});

test("'hp +2' increases the HP by 2", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("hp +2");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(`Dummy Character's HP: 7/10 (+2)`);
});

test("'hp 11' sets the HP to 10", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("hp 11");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's HP: 10/10 (+4 => +3)`
  );
});

test("'hp -3d6' sets the HP to 0", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.9);

  const message = new MockMessage("hp -3d6");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's HP: 0/10 (-3d6 (6, 6, 6) = -18 => -10)`
  );
})

test("'sanity 10' sets the sanity to 10", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("sanity 10");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Sanity: 10/99 (-40)`
  );
});

test("'sanity +d10+5' sets the sanity to 16", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.0);

  const message = new MockMessage("sanity +d10+5");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Sanity: 16/99 (+1d10 (1) + 5 = +6)`
  );
});

test("'luck 10' sets the luck to 10", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("luck 10");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Luck: 10/99 (-65)`
  );
});

test("'luck -2d6' sets the luck to 8", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const message = new MockMessage("luck -2d6");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Luck: 8/99 (-2d6 (1, 1) = -2)`
  );
});

test("'luck +3d6 - 3' sets the luck to 8", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const message = new MockMessage("luck +3d6 - 3");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Luck: 8/99 (+3d6 (1, 1, 1) - 3 = +0)`
  );
});

test("'luck -3d6 + 3' sets the luck to 8", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const message = new MockMessage("luck -3d6 + 3");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Luck: 8/99 (-3d6 (1, 1, 1) + 3 = +0)`
  );
});

test("'luck -3d6 + 3' sets the luck to 8", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const message = new MockMessage("luck -3d6 + 3");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Luck: 8/99 (-3d6 (1, 1, 1) + 3 = +0)`
  );
});

test("'luck -(3d6 - 3) * 2' sets the luck to 8", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const message = new MockMessage("luck -(3d6 - 3) * 2");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  //expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's Luck: 8/99 ((-3d6 (1, 1, 1) + 3) * 2 = +0)`
  );
});

test("'magic 5' sets the magic points to 5", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("magic 5");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(`Dummy Character's MP: 5/10 (-5)`);
});

test("'mark Spot Hidden' marks the Spot Hidden skill for improvement", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("mark Spot Hidden");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Improvements).toContain("Spot Hidden");
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's skill, Spot Hidden (25%) is marked for improvement!`
  );
});

test("'mark Spot Hidden' is idempotent", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("mark Spot Hidden");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Improvements).toContain("Spot Hidden");
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's skill, Spot Hidden (25%) is marked for improvement!`
  );
});

test("'mark Not a Skill' returns an error", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("mark Not a Skill");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `I'm sorry, I haven't heard of "Not a Skill".`
  );
});

test("'reset mark Spot Hidden' removes the mark from the Spot Hidden skill", async () => {
  expect(dummyCharacter.Data.Improvements).toContain("Spot Hidden");

  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("reset mark Spot Hidden");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Improvements).not.toContain("Spot Hidden");
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's skill, Spot Hidden (25%) is not marked for improvement!`
  );
});

test("'reset mark Spot Hidden' is idempotent", async () => {
  expect(dummyCharacter.Data.Improvements).not.toContain("Spot Hidden");

  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("reset mark Spot Hidden");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Improvements).not.toContain("Spot Hidden");
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `Dummy Character's skill, Spot Hidden (25%) is not marked for improvement!`
  );
});

test("'reset mark Not a Skill' returns an error", async () => {
  expect(dummyCharacter.Data.Improvements).not.toContain("Spot Hidden");

  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("reset mark Not a Skill");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Improvements).not.toContain("Spot Hidden");
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `I'm sorry, I haven't heard of "Not a Skill".`
  );
});

test("'improve Spot Hidden' doesn't improve Spot Hidden skill on 25", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.5)
    .mockImplementationOnce(() => 0.2);

  const message = new MockMessage("improve Spot Hidden");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills["Spot Hidden"]).toBe(undefined);
  expect(dummyCharacter.Data.Improvements).not.toContain("Spot Hidden");
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `**Spot Hidden (25%)**: 1d% (20) + 1d10 (5) = 25
No improvement.`
  );
});

test("'improve Spot Hidden' improves the Spot Hidden skill on 26", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.6)
    .mockImplementationOnce(() => 0.2)
    .mockImplementationOnce(() => 0.3);

  const message = new MockMessage("improve Spot Hidden");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills["Spot Hidden"]).toBe(29);
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `**Spot Hidden (25%)**: 1d% (20) + 1d10 (6) = 26
Improvement: 25 + 1d10 (4) = 29`
  );
});

test("'improve marked' improves multiple skills", async () => {
  dummyCharacter.Data.Improvements = ["Spot Hidden", "Climb"];
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.9)
    .mockImplementationOnce(() => 0.2)
    .mockImplementationOnce(() => 0.5)
    .mockImplementationOnce(() => 0.5)
    .mockImplementationOnce(() => 0.3);

  try {
    const message = new MockMessage("improve marked");
    await eventHandlers["messageCreate"](message);
    expect(DB.getCharacter).toHaveBeenCalled();
    expect(dummyCharacter.Data.Skills["Spot Hidden"]).toBe(29);
    expect(dummyCharacter.Data.Skills.Climb).toBe(24);
    expect(DB.updateCharacterData).toHaveBeenCalled();
    expect(message.reply).toHaveBeenCalledWith(
      `**Spot Hidden (29%)**: 1d% (20) + 1d10 (9) = 29
No improvement.

**Climb (20%)**: 1d% (50) + 1d10 (5) = 55
Improvement: 20 + 1d10 (4) = 24`
    );
  } finally {
    delete dummyCharacter.Data.Skills.Climb;
  }
});

test("'stats' displays your stats", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  const message = new MockMessage("stats");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `**Dummy Character** HP: 0/10, Luck: 8/99, MP: 5/10, Sanity: 16/99`
  );
});

test("'reset skill Listen' resets your Listen skill to the default value", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  const message = new MockMessage("reset skill Listen");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills.Listen).toBe(undefined);
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(`Spot Hidden (29%)`);
});

test("'sheet' displays your character sheet", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  const message = new MockMessage("sheet");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `**Dummy Character**
Stats: HP: 0/10, Luck: 8/99, MP: 5/10, Sanity: 16/99
Move: 8, Build: 0, Damage Bonus: None
Skills: Spot Hidden (29%)`
  );
});

// Do this last because it screws up the dummy data
test("'rename character New Name' renames the character", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("rename character New Name");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Name).toBe("New Name");
  expect(DB.updateCharacterName).toHaveBeenCalled();
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalled();
});

for (const command of [
  "delete character Dummy Character",
  "edit character",
  "hp +5",
  "improve Listen",
  "improve marked",
  "list characters",
  "list server characters",
  "luck 5",
  "magic 5",
  "mark Listen",
  "rename character New Name",
  "reset mark Listen",
  "reset skill Listen",
  "sanity -5",
  "sheet",
  "skill Listen 70",
  "skill Listen bonus",
  "stats",
]) {
  test(`'${command}' fails when you have no character`, async () => {
    DB.getCharacter.mockImplementationOnce(async () => null);
    DB.listCharacters.mockImplementationOnce(async () => []);
    const message = new MockMessage(command);
    await eventHandlers["messageCreate"](message);
    expect(message.reply).toHaveBeenCalledWith(
      `Whoops! You don't have any characters yet. Try \"new character\".`
    );
  });
}

for (const command of [
  "character",
  "check",
  "delete character",
  "edit character",
  "hp",
  "improve marked",
  "improve",
  "list characters",
  "list server characters",
  "luck",
  "magic",
  "mark",
  "new character",
  "rename character",
  "reset mark",
  "reset skill",
  "roll",
  "sanity",
  "set custom skill",
  "set skill",
  "sheet",
  "skill",
  "stats",
]) {
  test(`'help ${command}' returns the help text`, async () => {
    const message = new MockMessage(`help ${command}`);
    await eventHandlers["messageCreate"](message);
    expect(message.reply).toHaveBeenCalled();
    expect(message.reply.mock.lastCall[0].length).toBeGreaterThan(100);
  });
}

test(`'help' returns the help text`, async () => {
  const message = new MockMessage(`help`);
  await eventHandlers["messageCreate"](message);
  expect(message.reply).toHaveBeenCalled();
  expect(message.reply.mock.lastCall[0].length).toBeGreaterThan(100);
});
