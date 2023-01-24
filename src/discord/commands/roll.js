const Command = require("./command");
const { die } = require("../../coc/game");

class RollCommand extends Command {
  async processCommand() {
    const result = die(
      this.expr.dice.sides,
      this.expr.dice.number,
      this.expr.dice.sign,
      this.expr.dice.add,
      this.expr.dice.multiply
    );
    return `${result.display} = ${result.total}`;
  }
}

module.exports = RollCommand;
