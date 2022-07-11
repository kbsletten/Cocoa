**Roll Dice**
`roll [NUMBER]d[DIE SIZE] <+ [ADD]>`
`roll [NUMBER]d[DIE SIZE] <* [MULTIPLY]>`
`roll ([NUMBER]d[DIE SIZE] + ADD) * [MULTIPLY]`
Roll differently sized dice. Also supports multiplying and adding constant values to the dice.

__Example__
*Jane Doe*
```
roll (2d6 + 6) * 5
```
*Cocoa*
```
(2d6 (4, 3) + 6) * 5 = 65
```
__Related Commands__
**roll skill** - Roll a skill on your investigator's sheet.
**roll check** - Perform a custom skill check.
