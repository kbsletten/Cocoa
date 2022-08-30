const { CHARACTERISTICS, STATS, getDefaults } = require("./data");

function die(sides = 6, number = 1, add = 0, multiply = 1) {
  const rolls = [...Array(number).keys()].map(
    () => Math.floor(Math.random() * sides) + 1
  );
  const result = {
    total: rolls.reduce((l, r) => l + r),
    display: `${number}d${sides} (${rolls.join(", ")})`,
  };
  if (add) {
    result.total += add;
    result.display = `${result.display} + ${add}`;
  }
  if (multiply !== 1) {
    result.total = Math.floor(result.total * multiply);
    if (result.display.includes("+")) {
      result.display = `(${result.display})`;
    }
    result.display = `${result.display} * ${multiply}`;
  }
  return result;
}

function d6(number = 1, { add, multiply } = { add: 0, multiply: 1 }) {
  return die(6, number, add, multiply);
}

function d10(number = 1, { add, multiply } = { add: 0, multiply: 1 }) {
  return die(10, number, add, multiply);
}

function formatOptions(options) {
  if (options.length == 2) {
    return `${options[0]} or ${options[1]}`;
  }
  return [
    ...options.slice(0, options.length - 1),
    `or ${options[options.length - 1]}`,
  ].join(", ");
}

function fuzzySearch(arr, term) {
  const matching = arr.filter((it) =>
    it.toLowerCase().includes(term.toLowerCase())
  );
  const match = matching.length == 1 ? matching[0] : null;
  return {
    matching,
    match,
  };
}

function getSkill(
  game,
  character,
  skill,
  includeCharacteristics = true,
  includeDefaults = true
) {
  const skills = {
    ...(includeDefaults ? getDefaults(game, character, includeCharacteristics) : {}),
    ...character.Data.Skills,
  };
  const value = skills[skill];
  return { skill, value };
}

function findSkill(
  game,
  character,
  skillName,
  includeCharacteristics = true,
  includeDefaults = true
) {
  const skills = {
    ...(includeDefaults ? getDefaults(game, character, includeCharacteristics) : {}),
    ...character.Data.Skills,
  };
  const { matching: skillOptions, match: skill } = fuzzySearch(
    Object.keys(skills),
    skillName
  );
  if (!skillOptions.length) {
    return { error: `I'm sorry, I haven't heard of "${skillName}".` };
  }
  if (skillOptions.length > 1) {
    return {
      skillOptions: skillOptions,
      error: `I'm sorry, I can't tell if you mean ${formatOptions(
        skillOptions
      )}.`,
    };
  }
  const value = skills[skill];
  return { skill, value };
}

function check(value, bonus = 0) {
  const dice = 1 + Math.abs(bonus);
  const ones = Math.min(10, Math.floor(Math.random() * 10));
  const tens = [...Array(dice).keys()].map(
    () =>
      10 * Math.min(10, (ones === 0 ? 1 : 0) + Math.floor(Math.random() * 10))
  );
  const roll = (bonus > 0 ? Math.min(...tens) : Math.max(...tens)) + ones;
  let result = "Failure";
  let success = 0;
  if (roll === 100 || (value < 50 && roll >= 96)) {
    result = "Fumble";
    success = -1;
  }
  if (roll <= value) {
    result = "Success";
    success = 1;
  }
  if (roll <= value / 2) {
    result = "Hard Success";
    success = 2;
  }
  if (roll <= value / 5) {
    result = "Extreme Success";
    success = 3;
  }
  return {
    roll,
    success,
    result,
    message: `${dice}d% (${tens
      .map((it) => it.toString().padStart(2, "0"))
      .join(", ")}) + 1d10 (${ones}) = ${roll}`,
  };
}

function modify(current, max, add = undefined, set = undefined) {
  let next = current;
  if (!isNaN(set)) {
    next = set;
  } else if (!isNaN(add)) {
    next = current + add;
  }
  next = Math.max(0, Math.min(max, next));
  if (isNaN(next)) {
    next = current;
  }
  return {
    value: next,
    display: `${next}/${max}${
      !isNaN(add ?? set)
        ? ` (${next < current ? "" : "+"}${next - current})`
        : ""
    }`,
  };
}

function improve(game, character, skill_or_characteristic) {
  const pool = CHARACTERISTICS.includes(skill_or_characteristic)
    ? character.Data.Characteristics
    : character.Data.Skills;
  const improvement = d10();
  const oldValue = isNaN(pool[skill_or_characteristic])
    ? getDefaults(game, character)[skill_or_characteristic] ?? 0
    : pool[skill_or_characteristic];
  const newValue = Math.min(99, oldValue + improvement.total);
  pool[skill_or_characteristic] = newValue;
  return {
    oldValue,
    newValue,
    display: `${oldValue} + ${improvement.display} = ${newValue}`,
  };
}

function listStats(character) {
  return Object.entries(STATS)
    .sort(([lhs], [rhs]) => lhs.localeCompare(rhs))
    .map(
      ([stat, { max, default: defaultFn }]) =>
        `${stat}: ${character.Data.Stats[stat] ?? defaultFn(character)}/${max(
          character
        )}`
    )
    .join(", ");
}

function listSkills(game, character) {
  const skills = {
    ...getDefaults(game, character, false),
    ...character.Data.Skills,
  };
  const skillNames = [
    ...character.Data.Improvements.filter(it => skills[it]),
    ...Object.keys(character.Data.Skills),
  ]
    .sort()
    .filter((it, index, arr) => index === arr.indexOf(it));

  return !skillNames.length
    ? "Not set"
    : skillNames
        .map((skill) => {
          const imp = character.Data.Improvements.includes(skill) ? "*" : "";
          return `${imp}${skill} (${skills[skill]}%)${imp}`;
        })
        .join(", ");
}

module.exports = {
  check,
  d10,
  d6,
  die,
  findSkill,
  fuzzySearch,
  getSkill,
  improve,
  listSkills,
  listStats,
  modify,
};
