const CharacterCommand = require("./characterCommand");
const { listSkills } = require("../../coc/game");

class SetSkillCommand extends CharacterCommand {
  async processCharacterCommand() {
    const { skill, error } = this.expr.custom
      ? { skill: this.expr.skill }
      : await this.getSkillClarify();
    if (error) {
      return error;
    }
    this.character.Data.Skills[skill] = Math.min(99, Math.max(0, this.expr.value));
    return listSkills(this.game, this.character);
  }
}

module.exports = SetSkillCommand;
