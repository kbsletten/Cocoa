const CharacterCommand = require("./characterCommand");
const { modify } = require("../../coc/game");
const { STATS } = require("../../coc/data");

class StatCommand extends CharacterCommand {
  async processCharacterCommand() {
    const stat = STATS[this.expr.stat];
    const maxValue = stat.max(this.character);
    const oldValue =
      this.character.Data.Stats[this.expr.stat] ?? stat.default(this.character);
    const { value: newValue, display } = modify(
      oldValue,
      maxValue,
      this.expr.add,
      this.expr.set,
      this.expr.dice
    );
    this.character.Data.Stats[this.expr.stat] = newValue;
    return `${this.character.Name}'s ${this.expr.stat}: ${display}`;
  }
}

module.exports = StatCommand;
