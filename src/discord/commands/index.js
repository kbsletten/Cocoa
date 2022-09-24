const NewCharacterCommand = require("./newCharacter");
const EditCharacterCommand = require("./editCharacter");
const RenameCharacterCommand = require("./renameCharacter");
const DeleteCharacterCommand = require("./deleteCharacter");
const ListServerCharactersCommand = require("./listServerCharacters");
const ListCharactersCommand = require("./listCharacters");
const SkillRollCommand = require("./skillRoll");
const CheckCommand = require("./check");
const RollCommand = require("./roll");
const StatCommand = require("./stat");
const MarkCommand = require("./mark");
const ResetMarkCommand = require("./resetMark");
const ImproveCommand = require("./improve");
const StatsCommand = require("./stats");
const SetSkillCommand = require("./setSkill");
const ResetSkillCommand = require("./resetSkill");
const SheetCommand = require("./sheet");
const InitiativeCommand = require("./initiative");
const NpcCommand = require("./npc");
const ListNpcsCommand = require("./listNpcs");

module.exports = {
  check: CheckCommand,
  "delete character": DeleteCharacterCommand,
  "edit character": EditCharacterCommand,
  improve: ImproveCommand,
  initiative: InitiativeCommand,
  "list characters": ListCharactersCommand,
  "list server characters": ListServerCharactersCommand,
  "list npcs": ListNpcsCommand,
  mark: MarkCommand,
  "new character": NewCharacterCommand,
  "rename character": RenameCharacterCommand,
  "reset mark": ResetMarkCommand,
  "reset skill": ResetSkillCommand,
  roll: RollCommand,
  "set npc": NpcCommand,
  "set skill": SetSkillCommand,
  sheet: SheetCommand,
  "skill roll": SkillRollCommand,
  stat: StatCommand,
  stats: StatsCommand,
};
