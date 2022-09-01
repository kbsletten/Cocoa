const CharacterCommand = require("./characterCommand");
const { listSkills } = require("../../coc/game");

class ResetSkillCommand extends CharacterCommand {
  async processCharacterCommand() {
    const { skill, error } = await this.getSkillClarify(false, false);
    if (error) {
      return error;
    }
    delete this.character.Data.Skills[skill];
    return listSkills(this.game, this.character);
  }
}

module.exports = ResetSkillCommand;
