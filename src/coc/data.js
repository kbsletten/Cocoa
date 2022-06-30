const CHARACTERISTICS = [
  "STR",
  "CON",
  "DEX",
  "INT",
  "SIZ",
  "POW",
  "APP",
  "EDU",
];

const CORE = {
  skills: {
    Accounting: 5,
    Anthropology: 1,
    Appraise: 5,
    Archaeology: 1,
    "Art and Craft (Acting)": 5,
    "Art and Craft (Barber)": 5,
    "Art and Craft (Calligraphy)": 5,
    "Art and Craft (Carpenter)": 5,
    "Art and Craft (Cook)": 5,
    "Art and Craft (Dancer)": 5,
    "Art and Craft (Fine Art)": 5,
    "Art and Craft (Forgery)": 5,
    "Art and Craft (Morris Dancer)": 5,
    "Art and Craft (Opera Singer)": 5,
    "Art and Craft (Other)": 5,
    "Art and Craft (Painter and Decorator)": 5,
    "Art and Craft (Photographer)": 5,
    "Art and Craft (Potter)": 5,
    "Art and Craft (Sculptor)": 5,
    "Art and Craft (Vacuum-Tube Blower)": 5,
    "Art and Craft (Writer)": 5,
    Charm: 15,
    Climb: 20,
    "Credit Rating": 0,
    "Cthuhlu Mythos": 0,
    Disguise: 5,
    Dodge: 0,
    "Drive Auto": 20,
    "Electrical Repair": 10,
    "Fast Talk": 5,
    "Fighting (Axe)": 15,
    "Fighting (Bow)": 15,
    "Fighting (Brawl)": 25,
    "Fighting (Chainsaw)": 10,
    "Fighting (Flail)": 10,
    "Fighting (Garrote)": 15,
    "Fighting (Spear)": 20,
    "Fighting (Sword)": 20,
    "Fighting (Whip)": 5,
    "Firearms (Flamethrower)": 10,
    "Firearms (Handgun)": 20,
    "Firearms (Heavy Weapons)": 10,
    "Firearms (Machine Gun)": 10,
    "Firearms (Rifle/Shotgun)": 25,
    "Firearms (Submachine Gun)": 15,
    "First Aid": 30,
    History: 5,
    Intimidate: 15,
    Jump: 20,
    "Language (Other)": 1,
    "Language (Own)": 0,
    Law: 5,
    "Library Use": 20,
    Listen: 20,
    Locksmith: 1,
    "Mechanical Repair": 10,
    Medicine: 1,
    "Natural World": 10,
    Navigate: 10,
    Occult: 5,
    "Operate Heavy Machinery": 1,
    Persuade: 10,
    "Pilot (Aircraft)": 1,
    "Pilot (Boat)": 1,
    "Pilot (Dirigible)": 1,
    "Pilot (Other)": 1,
    Psychoanalysis: 1,
    Psychology: 10,
    Ride: 5,
    Science: 1,
    "Science (Astronomy)": 1,
    "Science (Biology)": 1,
    "Science (Botany)": 1,
    "Science (Chemistry)": 1,
    "Science (Cryptography)": 1,
    "Science (Engineering)": 1,
    "Science (Forensics)": 1,
    "Science (Geology)": 1,
    "Science (Mathematics)": 10,
    "Science (Meteorology)": 1,
    "Science (Other)": 1,
    "Science (Pharmacy)": 1,
    "Science (Physics)": 1,
    "Science (Zoology)": 1,
    "Sleight of Hand": 10,
    "Spot Hidden": 25,
    Stealth: 20,
    "Survival (Arctic)": 10,
    "Survival (Desert)": 10,
    "Survival (Other)": 10,
    "Survival (Sea)": 10,
    Swim: 20,
    Throw: 20,
    Track: 10,
  },
  uncommon: {
    "Animal Handling": 5,
    Artillery: 1,
    Demolitions: 1,
    Diving: 1,
    Hypnosis: 1,
    "Lore (Dream)": 1,
    "Lore (Necronomicon)": 1,
    "Lore (Other)": 1,
    "Lore (UFO)": 1,
    "Lore (Vampire)": 1,
    "Lore (Werewolf)": 1,
    "Lore (Yaddithian)": 1,
    "Read Lips": 1,
  },
  modern: {
    "Computer Use": 5,
    Electronics: 1,
  },
};

function getDefaults(character, includeCharacteristics = true) {
  return {
    ...CORE.skills,
    ...CORE.uncommon,
    ...CORE.modern,
    ...(includeCharacteristics
      ? {
          ...character.Data.Characteristics,
          Know: character.Data.Characteristics.EDU,
          Idea: character.Data.Characteristics.INT,
          Sanity: character.Data.Stats.Sanity,
          Luck: character.Data.Stats.Luck,
        }
      : {}),
    ...{
      Dodge: character.Data.Characteristics.DEX / 2,
      "Language (Own)": character.Data.Characteristics.EDU,
    },
  };
}

function rollLuck() {
  return (
    (Math.floor(Math.random() * 6) +
      Math.floor(Math.random() * 6) +
      Math.floor(Math.random() * 6)) *
    5
  );
}

const STATS = {
  HP: {
    default: (character) => STATS.HP.max(character),
    max: (character) =>
      Math.floor(
        ((character.Data.Characteristics.SIZ ?? 40) +
          (character.Data.Characteristics.CON ?? 40)) /
          10
      ),
  },
  Sanity: {
    default: (character) => character.Data.Characteristics.POW ?? 40,
    max: (character) => 99 - (character.Data.Skills["Cthuhlu Mythos"] ?? 0),
  },
  Luck: { default: rollLuck, max: () => 99 },
};

module.exports = {
  CHARACTERISTICS,
  CORE,
  STATS,
  getDefaults,
};
