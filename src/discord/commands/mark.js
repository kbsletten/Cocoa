const CharacterCommand = require("./characterCommand");

class MarkCommand extends CharacterCommand {
  async processCharacterCommand() {
    const { skill, value, error } = await this.getSkillClarify(false);
    if (skill && !this.character.Data.Improvements.includes(skill)) {
      this.character.Data.Improvements = [
        ...this.character.Data.Improvements,
        skill,
      ];
    }
    return (
      error ??
      `${this.character.Name}'s skill, ${skill} (${value}%) is marked for improvement!`
    );
  }
}

module.exports = MarkCommand;
