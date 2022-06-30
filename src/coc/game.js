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

function findSkill(
  character,
  skill_name,
  includeCharacteristics = true,
  includeDefaults = true
) {
  const skills = {
    ...(includeDefaults ? getDefaults(character, includeCharacteristics) : {}),
    ...character.Data.Skills,
  };
  const skill_options = Object.keys(skills).filter((it) =>
    it.toLowerCase().includes(skill_name.toLowerCase())
  );
  if (!skill_options.length) {
    return { error: `I'm sorry, I haven't heard of "${skill_name}"` };
  }
  if (skill_options.length == 2) {
    return {
      error: `I'm sorry, I can't tell if you mean ${skill_options[0]} or ${skill_options[1]}`,
    };
  }
  if (skill_options.length > 1) {
    return {
      error: `I'm sorry, I can't tell if you mean ${[
        ...skill_options.slice(0, skill_options.length - 1),
        `or ${skill_options[skill_options.length - 1]}`,
      ].join(", ")}`,
    };
  }
  const skill = skill_options[0];
  const value = skills[skill];
  return { skill, value };
}

function skillRoll(character, skill_name, bonus = 0) {
  const { skill, value, error } = findSkill(character, skill_name);
  return error ? { error } : { ...check(value, bonus), skill, value };
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

function improve(character, skill_or_characteristic) {
  const pool = CHARACTERISTICS.includes(skill_or_characteristic)
    ? character.Data.Characteristics
    : character.Data.Skills;
  const improvement = d10();
  const oldValue = isNaN(pool[skill_or_characteristic])
    ? getDefaults(character)[skill_or_characteristic] ?? 0
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

function listSkills(character) {
  const skills = {
    ...getDefaults(character, false),
    ...character.Data.Skills,
  };
  const skillNames = [
    ...character.Data.Improvements,
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
  improve,
  listSkills,
  listStats,
  modify,
  skillRoll,
};
