Command
    =   WS c:Command WS? { return c; }
    /   CHECK WS n:NUMBER WS s:Skill { return { 'command': 'check', 'value': n, ...s }; }
    /   CHECK WS n:NUMBER { return { 'command': 'check', 'value': n, 'bonus': 0, 'penalty': 0 }; }
    /   CUSTOM WS SKILL WS s:WORDS WS n:NUMBER { return { 'command': 'set skill', 'skill': s, 'value': n, 'custom': true }; }
    /   CREATE WS CHARACTER WS n:NAME { return { 'command': 'new character', 'name': n }; }
    /   CREATE WS CHARACTER { return { 'command': 'new character' }; }
    /   DELETE WS CHARACTER WS n:NAME { return { 'command': 'delete character', 'name': n }; }
    /   EDIT WS CHARACTER { return { 'command': 'edit character' }; }
    /   HELP WS h:Help { return { 'command': 'help', 'help': h }; }
    /   HELP { return { 'command': 'help', 'help': 'help' }; }
    /   HP WS n:MOD { return { 'command': 'stat', 'stat': 'HP', 'add': n }; }
    /   HP WS n:NUMBER { return { 'command': 'stat', 'stat': 'HP', 'set': n }; }
    /   IMPROVE WS MARKED { return { 'command': 'improve' }; }
    /   IMPROVE WS s:WORDS { return { 'command': 'improve', 'skill': s }; }
    /   INITIATIVE { return { 'command': 'initiative' }; }
    /   LIST WS CHARACTERS { return { 'command': 'list characters' }; }
    /   LIST WS SERVER WS CHARACTERS { return { 'command': 'list server characters' }; }
    /   LIST WS (SERVER WS)? NPCS { return { 'command': 'list npcs' }; }
    /   LUCK WS n:MOD { return { 'command': 'stat', 'stat': 'Luck', 'add': n }; }
    /   LUCK WS n:NUMBER { return { 'command': 'stat', 'stat': 'Luck', 'set': n }; }
    /   MARK WS s:WORDS { return { 'command': 'mark', 'skill': s }; }
    /   MAGIC WS n:MOD { return { 'command': 'stat', 'stat': 'MP', 'add': n }; }
    /   MAGIC WS n:NUMBER { return { 'command': 'stat', 'stat': 'MP', 'set': n }; }
    /   NEW WS CHARACTER WS n:NAME { return { 'command': 'new character', 'name': n }; }
    /   NEW WS CHARACTER { return { 'command': 'new character' }; }
    /   RENAME WS CHARACTER WS n:NAME { return { 'command': 'rename character', 'name': n }; }
    /   RESET WS MARK WS s:WORDS { return { 'command': 'reset mark', 'skill': s }; }
    /   RESET WS SKILL WS s:WORDS { return { 'command': 'reset skill', 'skill': s }; }
    /   RESET WS s:WORDS { return { 'command': 'reset skill', 'skill': s }; }
    /   ROLL WS d:Dice { return { 'command': 'roll', 'dice': d }; }
    /   ROLL WS (SKILL WS)? s:Skill { return { 'command': 'skill roll', ...s }; }
    /   ROLL WS (CHECK WS)? n:NUMBER WS s:Skill { return { 'command': 'check', 'value': n, ...s }; }
    /   ROLL WS (CHECK WS)? n:NUMBER { return { 'command': 'check', 'value': n, 'bonus': 0, 'penalty': 0 }; }
    /   SANITY WS n:MOD { return { 'command': 'stat', 'stat': 'Sanity', 'add': n }; }
    /   SANITY WS n:NUMBER { return { 'command': 'stat', 'stat': 'Sanity', 'set': n }; }
    /   SET WS CUSTOM WS SKILL WS s:WORDS WS n:NUMBER { return { 'command': 'set skill', 'skill': s, 'value': n, 'custom': true }; }
    /   SET WS HP WS n:NUMBER { return { 'command': 'stat', 'stat': 'HP', 'set': n }; }
    /   SET WS MAGIC WS n:NUMBER { return { 'command': 'stat', 'stat': 'MP', 'set': n }; }
    /   SET WS LUCK WS n:NUMBER { return { 'command': 'stat', 'stat': 'Luck', 'set': n }; }
    /   SET WS SANITY WS n:NUMBER { return { 'command': 'stat', 'stat': 'Sanity', 'set': n }; }
    /   SET WS SKILL WS s:WORDS WS n:NUMBER { return { 'command': 'set skill', 'skill': s, 'value': n }; }
    /   SET WS NPC WS b:BOOLEAN { return { 'command': 'set npc', 'value': b }; }
    /   SHEET { return { 'command': 'sheet' }; }
    /   SKILL WS s:WORDS WS n:NUMBER { return { 'command': 'set skill', 'skill': s, 'value': n }; }
    /   SKILL WS s:Skill { return { 'command': 'skill roll', ...s }; }
    /   STATS { return { 'command': 'stats' }; }
    ;

Skill
    =   n:WORD m:Modifiers { return { 'skill': n, 'bonus': m.bonus, 'penalty': m.penalty }; }
    /   n:WORD WS s:Skill { return { 'skill': `${n} ${s.skill}`, 'bonus': s.bonus, 'penalty': s.penalty }; }
    /   n:WORD { return { 'skill': n, 'bonus': 0, 'penalty': 0 }; }
    ;

Modifiers
    =   WS BONUS m:Modifiers { return { 'bonus': m.bonus + 1, 'penalty': m.penalty }; }
    /   WS PENALTY m:Modifiers { return { 'bonus': m.bonus, 'penalty': m.penalty + 1 }; }
    /   WS BONUS { return { 'bonus': 1, 'penalty': 0 }; }
    /   WS PENALTY { return { 'bonus': 0, 'penalty': 1 }; }
    ;

Dice
    =   '(' WS? t:Term WS? '+' WS? a:NUMBER WS? ')' WS? '*' WS? m:NUMBER  { return { ...t, add: a, multiply: m }; }
    /   '(' WS? t:Term WS? '-' WS? a:NUMBER WS? ')' WS? '*' WS? m:NUMBER  { return { ...t, add: -a, multiply: m }; }
    /   '(' WS? t:Term WS? '+' WS? a:NUMBER WS? ')' WS? '/' WS? m:NUMBER  { return { ...t, add: a, multiply: 1/m }; }
    /   '(' WS? t:Term WS? '-' WS? a:NUMBER WS? ')' WS? '/' WS? m:NUMBER  { return { ...t, add: -a, multiply: 1/m }; }
    /   t:Term WS? '+' WS? a:NUMBER { return { ...t, add: a }; }
    /   t:Term WS? '-' WS? a:NUMBER { return { ...t, add: -a }; }
    /   t:Term WS? '*' WS? m:NUMBER { return { ...t, multiply: m }; }
    /   t:Term WS? '/' WS? m:NUMBER { return { ...t, multiply: 1/m }; }
    /   t:Term { return t; }
    ;

Term
    =   n:NUMBER WS? DIE WS? d:NUMBER { return { 'sides': d, 'number': n }; }
    /   DIE WS? d:NUMBER { return { 'sides': d, 'number': 1 }; }
    ;

Help
    =   CHARACTER { return 'character'; }
    /   DELETE WS CHARACTER { return 'deleteCharacter'; }
    /   EDIT WS CHARACTER { return 'editCharacter'; }
    /   HP { return 'hp'; }
    /   IMPROVE WS MARKED { return 'improveMarked'; }
    /   IMPROVE { return 'improve'; }
    /   LIST WS CHARACTERS { return 'listCharacters'; }
    /   LIST WS SERVER WS CHARACTERS { return 'listServerCharacters'; }
    /   LUCK { return 'luck'; }
    /   MAGIC { return 'magic'; }
    /   MARK { return 'mark'; }
    /   NEW WS CHARACTER { return 'newCharacter'; }
    /   RENAME WS CHARACTER { return 'renameCharacter'; }
    /   RESET WS MARK { return 'resetMark'; }
    /   RESET WS SKILL { return 'resetSkill'; }
    /   ROLL { return 'roll'; }
    /   (ROLL WS)? CHECK { return 'rollCheck'; }
    /   (ROLL WS)? SKILL { return 'rollCheck'; }
    /   SANITY { return 'sanity'; }
    /   SET WS SKILL { return 'setSkill'; }
    /   (SET WS)? CUSTOM WS SKILL { return 'customSkill'; }
    /   SHEET { return 'sheet'; }
    /   STATS { return 'stats'; }
    ;

BOOLEAN
    =   (   'on'i
        /   'true'i
        /   'yes'i
        ) { return true; }
    /   (   'off'i
        /   'false'i
        /   'no'i
        ) { return false; }
    ;
BONUS
    =   'bonus'i
    ;
CHARACTER
    =   'character'i
    /   'investigator'i
    ;
CHARACTERS
    =   'characters'i
    /   'investigators'i
    ;
CHECK
    =   'check'i
    ;
CUSTOM
    =   'custom'i
    ;
CREATE
    =   'create'i
    ;
DELETE
    =   'delete'i
    ;
DIE
    =   'd'i
    ;
EDIT
    =   'edit'i
    ;
HELP
    =   'help'i
    ;
HP
    =   'hit'i WS 'points'i
    /   'hp'i
    ;
IMPROVE
    =   'improve'i
    ;
INITIATIVE
    =   'initiative'i
    /   'init'i
    ;
LIST
    =   'list'i
    ;
LUCK
    =   'luck'i
    ;
MAGIC
    =   'magic'i
    /   'mp'i
    ;
MARK
    =   'mark'i
    ;
MARKED
    =   'marked'i
    ;
MOD
    =   '+' n:NUMBER { return n; }
    /   '+' WS n:NUMBER { return n; }
    /   '-' n:NUMBER { return -n; }
    /   '-' WS n:NUMBER { return -n; }
    ;
NAME
    =   [A-Za-z]+ (WS [A-Za-z]+)* { return text(); }
    ;
NEW
    =   'new'i
    ;
NUMBER
    =   ('0' / [1-9][0-9]*) { return parseInt(text(), 10); }
    ;
NPC
    =   'npc'i
    ;
NPCS
    =   'npcs'i
    ;
PENALTY 
    =   'penalty'i
    ;
RENAME
    =   'rename'i
    ;
RESET
    =   'reset'i
    ;
ROLL
    =   'roll'i
    /   'r'i
    ;
SANITY
    =   'sanity'i
    ;
SERVER
    =   'server'i
    ;
SET
    =   'set'i
    ;
SHEET
    =   'sheet'i
    ;
SKILL
    =   'skill'i
    ;
STATS
    =   'stats'i
    ;
WORD
    =   [A-Za-z()]+ { return text(); }
    ;
WORDS
    =   WORD (WS WORD)* { return text(); }
    ;
WS  =   [ \t\r\n]+
    ;