const Command = require("./command");
const { getSkill, findSkill } = require("../../coc/game");
const { choice } = require("../choice");

class CharacterCommand extends Command {
  async processCommand() {
    this.character = await this.DB.getCharacter(
      this.msg.guild.id,
      this.msg.author.id
    );
    this.originalCharacter = JSON.parse(JSON.stringify(this.character));
    if (!this.character) {
      return `Whoops! You don't have any characters yet. Try "new character".`;
    }
    const reply = await this.processCharacterCommand();
    if (this.shouldUpdateCharacterData()) {
      await this.DB.updateCharacterData(
        this.character.CharacterId,
        this.character.Data
      );
    }
    return reply;
  }

  shouldUpdateCharacterData() {
    const characterData = JSON.stringify(this.character.Data);
    const originalData = JSON.stringify(this.originalCharacter.Data);
    return characterData !== originalData;
  }

  async processCharacterCommand() {
    throw new Error("Not implemented.");
  }

  async getSkillClarify(skillName, ...params) {
    const { error, skillOptions, ...results } = findSkill(
      this.game,
      this.character,
      skillName,
      ...params
    );
    return await new Promise(async (resolve) => {
      if (skillOptions) {
        const skill = await choice(
          this.msg,
          error,
          skillOptions.map((skill) => {
            return { label: skill, value: skill };
          })
        );
        return resolve(getSkill(this.game, this.character, skill, ...params));
      }
      if (error) {
        return resolve({ error });
      }
      return resolve(results);
    });
  }

  async checkKarma(success) {
    if (this.serverSettings.Data.Karma !== "On") {
      return false;
    }
    if (
      success <= 0 &&
      Math.random() * 100 < (this.character.Data.Meta?.Karma ?? 0)
    ) {
      await this.notifyAdmin(
        `${this.character.Name} got a karmic reroll (Karma: ${this.character.Data.Meta.Karma})`
      );
      return true;
    }
    if (success > 0) {
      this.character.Data.Meta.Karma = 0;
    } else {
      this.character.Data.Meta.Karma =
        (this.character.Data.Meta.Karma ?? 0) + (success < 0 ? 15 : 5);
    }
    await this.notifyAdmin(
      `${this.character.Name}'s Karma updated: ${this.character.Data.Meta.Karma}`
    );
    return false;
  }
}

module.exports = CharacterCommand;
