const CharacterCommand = require("./characterCommand");
const { check } = require("../../coc/game");

class SkillRollCommand extends CharacterCommand {
  async processCharacterCommand() {
    const bonus = this.expr.bonus - this.expr.penalty;
    const modifiers =
      bonus > 0 ? `, Bonus: ${bonus}` : bonus < 0 ? `, Penalty: ${-bonus}` : "";
    const { error, value, skill } = await this.getSkillClarify(this.expr.skill);
    if (error) {
      return error;
    }
    let message, result, success;
    do {
      ({ message, result, success } = check(value, bonus));
    } while (await this.checkKarma(success));
    let mark = "";
    if (
      success > 0 &&
      (this.serverSettings.Data.Mark === "Always" ||
        (this.serverSettings.Data.Mark === "Auto" && bonus === 0))
    ) {
      if (!this.character.Data.Improvements.includes(skill)) {
        this.character.Data.Improvements = [
          ...this.character.Data.Improvements,
          skill,
        ];
      }
      mark = `
Marked for improvement!`;
    }
    return `${this.character.Name} attempts ${skill} (${value}%${modifiers})!
${message}; **${result}!**${mark}`;
  }
}

module.exports = SkillRollCommand;
