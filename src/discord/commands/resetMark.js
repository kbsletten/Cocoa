const CharacterCommand = require("./characterCommand");

class ResetMarkCommand extends CharacterCommand {
  async processCharacterCommand() {
    const { skill, value, error } = await this.getSkillClarify(false);
    if (skill && this.character.Data.Improvements.includes(skill)) {
      this.character.Data.Improvements =
        this.character.Data.Improvements.filter((it) => it !== skill);
    }
    return (
      error ??
      `${this.character.Name}'s skill, ${skill} (${value}%) is not marked for improvement!`
    );
  }
}

module.exports = ResetMarkCommand;
