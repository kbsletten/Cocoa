const { GAMES } = require('./data');
const { check, findSkill } = require("./game");

const dummyCharacter = {
  Name: "Dummy Character",
  Data: {
    Characteristics: {},
    Skills: {},
    Stats: {},
  },
};

test("findSkill(..., 'Nonsense') returns an error", () => {
  expect(findSkill(GAMES.CORE, dummyCharacter, "Nonsense")).toEqual({
    error: "I'm sorry, I haven't heard of \"Nonsense\".",
  });
});

test("findSkill(..., 'Psych') returns an error", () => {
  expect(findSkill(GAMES.CORE, dummyCharacter, "Psych")).toEqual({
    error: "I'm sorry, I can't tell if you mean Psychoanalysis or Psychology.",
    skillOptions: ["Psychoanalysis", "Psychology"],
  });
});

test("findSkill(..., 'Firearms') returns an error", () => {
  expect(findSkill(GAMES.CORE, dummyCharacter, "Firearms")).toEqual({
    error:
      "I'm sorry, I can't tell if you mean Firearms (Flamethrower), Firearms (Handgun), Firearms (Heavy Weapons), Firearms (Machine Gun), Firearms (Rifle/Shotgun), or Firearms (Submachine Gun).",
    skillOptions: [
      "Firearms (Flamethrower)",
      "Firearms (Handgun)",
      "Firearms (Heavy Weapons)",
      "Firearms (Machine Gun)",
      "Firearms (Rifle/Shotgun)",
      "Firearms (Submachine Gun)",
    ],
  });
});

test("check(50) returns fumble sometimes", () => {
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.0)
    .mockImplementationOnce(() => 9.0);
  expect(check(50)).toEqual({
    message: "1d% (100) + 1d10 (0) = 100",
    result: "Fumble",
    roll: 100,
    success: -1,
  });
});

test("check(25) returns fumble sometimes", () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.9);
  expect(check(25)).toEqual({
    message: "1d% (90) + 1d10 (9) = 99",
    result: "Fumble",
    roll: 99,
    success: -1,
  });
});

test("check(50) returns failure sometimes", () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.6);
  expect(check(50)).toEqual({
    message: "1d% (60) + 1d10 (6) = 66",
    result: "Failure",
    roll: 66,
    success: 0,
  });
});

test("check(50) returns success sometimes", () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.3);
  expect(check(50)).toEqual({
    message: "1d% (30) + 1d10 (3) = 33",
    result: "Success",
    roll: 33,
    success: 1,
  });
});

test("check(50) returns hard success sometimes", () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.2);
  expect(check(50)).toEqual({
    message: "1d% (20) + 1d10 (2) = 22",
    result: "Hard Success",
    roll: 22,
    success: 2,
  });
});

test("check(50) returns extreme success sometimes", () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.0);
  expect(check(50)).toEqual({
    message: "1d% (10) + 1d10 (0) = 10",
    result: "Extreme Success",
    roll: 10,
    success: 3,
  });
});
