const Discord = require("discord.js");
const { CORE, CHARACTERISTICS, getDefaults } = require("../coc/data");
const { listSkills } = require("../coc/game");

const SKILL_NAMES = [
  ...Object.keys(CORE.skills),
  ...Object.keys(CORE.uncommon),
  ...Object.keys(CORE.modern),
].sort();
const SKILL_PAGE_SIZE = 25;
const SKILL_PAGES = Math.ceil(SKILL_NAMES.length / SKILL_PAGE_SIZE);

function page(arr, pageSize, page) {
  return arr.slice(pageSize * page, pageSize * page + pageSize);
}

function skillPageButton(page, currentPage, characterId) {
  if (page < 0 || page >= SKILL_PAGES || page === currentPage) return null;
  const diff = page - currentPage;
  const prefix = diff === -1 ? "< " : diff < -1 ? "<< " : "";
  const postfix = diff === 1 ? " >" : diff > 1 ? " >>" : "";
  return new Discord.MessageButton({
    style: "PRIMARY",
    label: `${prefix}${page + 1}${postfix}`,
    customId: `editCharacter:${characterId}:skillPage:${page}`,
  });
}

function getEditMessage(
  character,
  characteristic = null,
  skillPage = 0,
  skill = null
) {
  const components = [];
  if (characteristic) {
    const navigationComponents = [];
    const charIndex = CHARACTERISTICS.indexOf(characteristic);
    if (charIndex > 0) {
      navigationComponents.push(
        new Discord.MessageButton({
          style: "PRIMARY",
          label: `<< ${CHARACTERISTICS[charIndex - 1]}`,
          customId: `editCharacter:${character.CharacterId}:characteristic:${
            CHARACTERISTICS[charIndex - 1]
          }`,
        })
      );
    }
    navigationComponents.push(
      new Discord.MessageButton({
        style: "PRIMARY",
        label: "Done",
        customId: `editCharacter:${character.CharacterId}:characteristic`,
      })
    );
    if (charIndex >= 0 && charIndex < CHARACTERISTICS.length - 1) {
      navigationComponents.push(
        new Discord.MessageButton({
          style: "PRIMARY",
          label: `${CHARACTERISTICS[charIndex + 1]} >>`,
          customId: `editCharacter:${character.CharacterId}:characteristic:${
            CHARACTERISTICS[charIndex + 1]
          }`,
        })
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
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "-5",
            customId: `editCharacter:${character.CharacterId}:${characteristic}:minusFive`,
          }),
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "-1",
            customId: `editCharacter:${character.CharacterId}:${characteristic}:minusOne`,
          }),
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "+1",
            customId: `editCharacter:${character.CharacterId}:${characteristic}:plusOne`,
          }),
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "+5",
            customId: `editCharacter:${character.CharacterId}:${characteristic}:plusFive`,
          }),
          new Discord.MessageButton({
            style: "DANGER",
            label: "+d10",
            customId: `editCharacter:${character.CharacterId}:${characteristic}:improve`,
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: navigationComponents,
      })
    );
  } else if (skill) {
    const skills = {
      ...getDefaults(character),
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
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "-5",
            customId: `editCharacter:${character.CharacterId}:${skill}:minusFive`,
          }),
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "-1",
            customId: `editCharacter:${character.CharacterId}:${skill}:minusOne`,
          }),
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "+1",
            customId: `editCharacter:${character.CharacterId}:${skill}:plusOne`,
          }),
          new Discord.MessageButton({
            style: "SECONDARY",
            label: "+5",
            customId: `editCharacter:${character.CharacterId}:${skill}:plusFive`,
          }),
          new Discord.MessageButton({
            style: "DANGER",
            label: "+d10",
            customId: `editCharacter:${character.CharacterId}:${skill}:improve`,
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageButton({
            style: "PRIMARY",
            label: "Done",
            customId: `editCharacter:${character.CharacterId}:skillPage:${skillIndex}`,
          }),
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
          skillPageButton(0, skillPage, character.CharacterId),
          skillPageButton(skillPage - 1, skillPage, character.CharacterId),
          skillPageButton(skillPage + 1, skillPage, character.CharacterId),
          skillPageButton(SKILL_PAGES - 1, skillPage, character.CharacterId),
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
            value: listSkills(character) || "Not set",
          },
        ],
      }),
    ],
    components,
  };
}
exports.getEditMessage = getEditMessage;
