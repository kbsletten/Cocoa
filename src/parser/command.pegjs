Command
    =   NEW WS CHARACTER WS n:NAME { return { 'command': 'new character', 'name': n }; }
    /   NEW WS CHARACTER { return { 'command': 'new character' }; }
    /   EDIT WS CHARACTER { return { 'command': 'edit character' }; }
    /   RENAME WS CHARACTER WS n:NAME { return { 'command': 'rename character', 'name': n }; }
    /   DELETE WS CHARACTER WS n:NAME { return { 'command': 'delete character', 'name': n }; }
    /   LIST WS SERVER WS CHARACTERS { return { 'command': 'list server characters' }; }
    /   LIST WS CHARACTERS { return { 'command': 'list characters' }; }
    /   (SET WS)? SKILL WS s:WORDS WS n:NUMBER { return { 'command': 'set skill', 'skill': s, 'value': n }; }
    /   (SET WS)? CUSTOM WS SKILL WS s:WORDS WS n:NUMBER { return { 'command': 'set skill', 'skill': s, 'value': n, 'custom': true }; }
    /   RESET WS SKILL WS s:WORDS { return { 'command': 'reset skill', 'skill': s }; }
    /   (SKILL (WS ROLL)? / CHECK) WS s:Skill { return { 'command': 'skill roll', ...s }; }
    /   CHECK WS n:NUMBER WS s:Skill { return { 'command': 'check', 'value': n, ...s }; }
    /   CHECK WS n:NUMBER { return { 'command': 'check', 'value': n }; }
    /   ROLL WS d:Dice { return { 'command': 'roll', 'dice': d }; }
    /   HP WS '+' WS? n:NUMBER { return { 'command': 'hp', 'add': n }; }
    /   HP WS '-' WS? n:NUMBER { return { 'command': 'hp', 'add': -n }; }
    /   (SET WS)? HP WS n:NUMBER { return { 'command': 'hp', 'set': n }; }
    /   SANITY WS '+' WS? n:NUMBER { return { 'command': 'sanity', 'add': n }; }
    /   SANITY WS '-' WS? n:NUMBER { return { 'command': 'sanity', 'add': -n }; }
    /   (SET WS)? SANITY WS n:NUMBER { return { 'command': 'sanity', 'set': n }; }
    /   LUCK WS '+' WS? n:NUMBER { return { 'command': 'luck', 'add': n }; }
    /   LUCK WS '-' WS? n:NUMBER { return { 'command': 'luck', 'add': -n }; }
    /   (SET WS)? LUCK WS n:NUMBER { return { 'command': 'luck', 'set': n }; }
    /   MARK WS s:WORDS { return { 'command': 'mark', 'skill': s }; }
    /   IMPROVE WS MARKED { return { 'command': 'improve' }; }
    /   IMPROVE WS s:WORDS { return { 'command': 'improve', 'skill': s }; }
    /   STATS { return { 'command': 'stats' }; }
    /   SHEET { return { 'command': 'sheet' }; }
    /   HELP WS h:Help { return { 'command': 'help', 'help': h }; }
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
    /   NEW WS CHARACTER { return 'newCharacter'; }
    /   EDIT WS CHARACTER { return 'editCharacter'; }
    /   RENAME WS CHARACTER { return 'renameCharacter'; }
    /   DELETE WS CHARACTER { return 'deleteCharacter'; }
    /   LIST WS CHARACTERS { return 'listCharacters'; }
    /   LIST WS SERVER WS CHARACTERS { return 'listServerCharacters'; }
    /   SKILL { return 'skill'; }
    /   (SET WS)? CUSTOM WS SKILL { return 'customSkill'; }
    /   SET WS SKILL { return 'setSkill'; }
    /   CHECK { return 'check'; }
    /   ROLL { return 'roll'; }
    /   HP { return 'hp'; }
    /   SANITY { return 'sanity'; }
    /   LUCK { return 'luck'; }
    /   MARK { return 'mark'; }
    /   IMPROVE WS MARKED { return 'improveMarked'; }
    /   IMPROVE { return 'improve'; }
    /   STATS { return 'stats'; }
    /   SHEET { return 'sheet'; }
    ;

BONUS
    =   'bonus'i
    /   'bon'i &WS
    /   'b'i &WS
    ;
CHARACTER
    =   'character'i
    /   'char'i &WS
    /   'ch'i &WS
    ;
CHARACTERS
    =   'characters'i
    /   CHARACTER
    ;
CHECK
    =   'check'i
    /   'c'i &WS
    ;
CUSTOM
    =   'custom'i
    ;
DELETE
    =   'delete'i
    ;
DIE
    =   'die'i
    /   'd'i
    ;
EDIT
    =   'edit'i
    /   'e'i &WS
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
LIST
    =   'list'i
    /   'l'i &WS
    ;
LUCK
    =   'luck'i
    ;
MARK
    =   'mark'i
    ;
MARKED
    =   'marked'i
    /   MARK
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
PENALTY 
    =   'penalty'i
    /   'pen'i &WS
    /   'p'i &WS
    ;
RENAME
    =   'rename'i
    ;
RESET
    =   'reset'i
    ;
ROLL
    =   'roll'i
    /   'r'i &WS
    ;
SANITY
    =   'sanity'i
    /   'san'i &WS
    ;
SERVER
    =   'server'i
    /   'serv'i &WS
    ;
SET
    =   'set'i
    ;
SHEET
    =   'sheet'i
    ;
SKILL
    =   'skill'i
    /   'sk'i &WS
    /   's'i &WS
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