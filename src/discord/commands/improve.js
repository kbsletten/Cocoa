const CharacterCommand = require("./characterCommand");
const { findSkill, check, improve } = require("../../coc/game");

class ImproveCommand extends CharacterCommand {
  async processCharacterCommand() {
    let improvements = this.character.Data.Improvements;
    if (this.expr.skill) {
      const { skill, error } = await this.getSkillClarify(false);
      if (error) {
        return error;
      }
      improvements = [skill];
    }
    const results = [];
    for (const skill_name of improvements.filter(
      (it, index) => index === improvements.indexOf(it)
    )) {
      const { skill, value, error } = findSkill(
        this.game,
        this.character,
        skill_name,
        false
      );
      if (error) {
        continue;
      }
      const { success, message } = check(value);
      let display = "No improvement.";
      if (success < 1) {
        display = `Improvement: ${improve(this.game, this.character, skill).display}`;
      }
      results.push(`**${skill} (${value}%)**: ${message}
${display}`);
    }
    this.character.Data.Improvements = this.character.Data.Improvements.filter(
      (it) => !improvements.includes(it)
    );
    return results.join("\n\n") || `No skills marked for improvement.`;
  }
}

module.exports = ImproveCommand;
