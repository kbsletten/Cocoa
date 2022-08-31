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
    return `${this.character.Name} attempts ${skill} (${value}%${modifiers})!
${message}; **${result}!**`;
  }
}

module.exports = SkillRollCommand;
