const CharacterCommand = require("./characterCommand");
const { listSkills, listStats, move, build, damageBonus } = require("../../coc/game");

class SheetCommand extends CharacterCommand {
  async processCharacterCommand() {
    return `**${this.character.Name}**
Stats: ${listStats(this.character)}
Move: ${move(this.character)}, Build: ${build(this.character)}, Damage Bonus: ${damageBonus(this.character)}
Skills: ${listSkills(this.game, this.character)}`;
  }
}

module.exports = SheetCommand;
