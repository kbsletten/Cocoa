const CharacterCommand = require("./characterCommand");

class NpcCommand extends CharacterCommand {
    async processCharacterCommand() {
        this.character.IsNpc = this.expr.value;
        await this.DB.updateCharacterIsNpc(
            this.character.CharacterId,
            this.character.IsNpc
        );
        return `${this.character.Name} is now ${this.character.IsNpc ? "" : "not "}an NPC!`;
    }
}

module.exports = NpcCommand;
