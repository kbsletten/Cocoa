const Discord = require("discord.js");
const { CHARACTERISTICS, getDefaults } = require("../coc/data");
const { listSkills } = require("../coc/game");
const Button = require("./button");

function page(arr, pageSize, page) {
  return arr.slice(pageSize * page, pageSize * page + pageSize);
}

function skillPageButton(game, page, currentPage, characterId) {
  const SKILL_NAMES = [
    ...Object.keys(game.skills),
    ...Object.keys(game.uncommon),
  ].sort();
  const SKILL_PAGE_SIZE = 25;
  const SKILL_PAGES = Math.ceil(SKILL_NAMES.length / SKILL_PAGE_SIZE);

  if (page < 0 || page >= SKILL_PAGES || page === currentPage) return null;
  const diff = page - currentPage;
  const prefix = diff === -1 ? "< " : diff < -1 ? "<< " : "";
  const postfix = diff === 1 ? " >" : diff > 1 ? " >>" : "";
  return Button.Navigation(
    `${prefix}${page + 1}${postfix}`,
    `editCharacter:${characterId}:skillPage:${page}`
  );
}

function getEditMessage(
  game,
  character,
  characteristic = null,
  skillPage = 0,
  skill = null
) {
  const SKILL_NAMES = [
    ...Object.keys(game.skills),
    ...Object.keys(game.uncommon),
  ].sort();
  const SKILL_PAGE_SIZE = 25;
  const SKILL_PAGES = Math.ceil(SKILL_NAMES.length / SKILL_PAGE_SIZE);

  const components = [];
  if (characteristic) {
    const navigationComponents = [];
    const charIndex = CHARACTERISTICS.indexOf(characteristic);
    if (charIndex > 0) {
      navigationComponents.push(
        Button.Navigation(
          `<< ${CHARACTERISTICS[charIndex - 1]}`,
          `editCharacter:${character.CharacterId}:characteristic:${
            CHARACTERISTICS[charIndex - 1]
          }`
        )
      );
    }
    navigationComponents.push(
      Button.Navigation(
        "Done",
        `editCharacter:${character.CharacterId}:characteristic`
      )
    );
    if (charIndex >= 0 && charIndex < CHARACTERISTICS.length - 1) {
      navigationComponents.push(
        Button.Navigation(
          `${CHARACTERISTICS[charIndex + 1]} >>`,
          `editCharacter:${character.CharacterId}:characteristic:${
            CHARACTERISTICS[charIndex + 1]
          }`
        )
      );
    }
    components.push(
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            customId: `editCharacter:${character.CharacterId}:${characteristic}`,
            placeholder: `Set value`,
            options: [
              40,
              50,
              60,
              70,
              80,
              character.Data.Characteristics[characteristic],
            ]
              .sort()
              .filter(function unique(value, index, self) {
                return value && self.indexOf(value) === index;
              })
              .map((value) => {
                return {
                  label: `${characteristic} - ${value}`,
                  value: value.toString(),
                  default:
                    value === character.Data.Characteristics[characteristic],
                };
              }),
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          Button.Update(
            "-5",
            `editCharacter:${character.CharacterId}:${characteristic}:minusFive`
          ),
          Button.Update(
            "-1",
            `editCharacter:${character.CharacterId}:${characteristic}:minusOne`
          ),
          Button.Update(
            "+1",
            `editCharacter:${character.CharacterId}:${characteristic}:plusOne`
          ),
          Button.Update(
            "+5",
            `editCharacter:${character.CharacterId}:${characteristic}:plusFive`
          ),
          Button.Complete(
            "+d10",
            `editCharacter:${character.CharacterId}:${characteristic}:improve`
          ),
        ],
      }),
      new Discord.MessageActionRow({
        components: navigationComponents,
      })
    );
  } else if (skill) {
    const skills = {
      ...getDefaults(game, character),
      ...character.Data.Skills,
    };
    const skillIndex = Math.floor(SKILL_NAMES.indexOf(skill) / SKILL_PAGE_SIZE);
    components.push(
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            customId: `editCharacter:${character.CharacterId}:${skill}`,
            placeholder: `Set value`,
            options: [40, 50, 60, 70, skills[skill]]
              .sort()
              .filter(function unique(value, index, self) {
                return value && self.indexOf(value) === index;
              })
              .map((value) => {
                return {
                  label: `${skill} - ${value}`,
                  value: value.toString(),
                  default: value === skills[skill],
                };
              }),
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          Button.Update(
            "-5",
            `editCharacter:${character.CharacterId}:${skill}:minusFive`
          ),
          Button.Update(
            "-1",
            `editCharacter:${character.CharacterId}:${skill}:minusOne`
          ),
          Button.Update(
            "+1",
            `editCharacter:${character.CharacterId}:${skill}:plusOne`
          ),
          Button.Update(
            "+5",
            `editCharacter:${character.CharacterId}:${skill}:plusFive`
          ),
          Button.Complete(
            "+d10",
            `editCharacter:${character.CharacterId}:${skill}:improve`
          ),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          Button.Navigation(
            "Done",
            `editCharacter:${character.CharacterId}:skillPage:${skillIndex}`
          ),
        ],
      })
    );
  } else {
    components.push(
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            customId: `editCharacter:${character.CharacterId}:characteristic`,
            placeholder: `Edit characteristic...`,
            options: CHARACTERISTICS.map((char) => {
              return { label: char, value: char };
            }),
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            customId: `editCharacter:${character.CharacterId}:skill`,
            placeholder: `Edit skill (${skillPage + 1}/${SKILL_PAGES})...`,
            options: page(SKILL_NAMES, SKILL_PAGE_SIZE, skillPage).map(
              (skill) => {
                return { label: skill, value: skill };
              }
            ),
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          skillPageButton(game, 0, skillPage, character.CharacterId),
          skillPageButton(
            game,
            skillPage - 1,
            skillPage,
            character.CharacterId
          ),
          skillPageButton(
            game,
            skillPage + 1,
            skillPage,
            character.CharacterId
          ),
          skillPageButton(
            game,
            SKILL_PAGES - 1,
            skillPage,
            character.CharacterId
          ),
        ].filter(
          (it, index, arr) =>
            it &&
            index === arr.findIndex((x) => x && x.customId === it.customId)
        ),
      })
    );
  }
  return {
    embeds: [
      new Discord.MessageEmbed({
        title: `Editing ${character.Name}${
          characteristic || skill ? `'s ${characteristic ?? skill}` : ""
        }...`,
        fields: [
          ...CHARACTERISTICS.map((char) => {
            return {
              name: char,
              value:
                character.Data.Characteristics[char]?.toString() ?? "Not set",
              inline: true,
            };
          }),
          {
            name: "Skills",
            value: listSkills(game, character) || "Not set",
          },
        ],
      }),
    ],
    components,
  };
}
exports.getEditMessage = getEditMessage;
