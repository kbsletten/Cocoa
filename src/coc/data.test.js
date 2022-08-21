const { STATS } = require("./data");

test(`'HP' default and max work`, () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.4);
  expect(
    STATS.HP.default({
      Data: {
        Characteristics: {},
      },
    })
  ).toBe(8);
  expect(
    STATS.HP.default({
      Data: {
        Characteristics: {
          SIZ: 50,
          CON: 50,
        },
      },
    })
  ).toBe(10);
  expect(
    STATS.HP.max({
      Data: {
        Characteristics: {},
      },
    })
  ).toBe(8);
  expect(
    STATS.HP.max({
      Data: {
        Characteristics: {
          SIZ: 50,
          CON: 50,
        },
      },
    })
  ).toBe(10);
});

test(`'Sanity' default and max work`, () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.4);
  expect(
    STATS.Sanity.default({
      Data: {
        Characteristics: {},
      },
    })
  ).toBe(40);
  expect(
    STATS.Sanity.default({
      Data: {
        Characteristics: {
          POW: 50,
        },
      },
    })
  ).toBe(50);
  expect(
    STATS.Sanity.max({
      Data: {
        Skills: {},
      },
    })
  ).toBe(99);
  expect(
    STATS.Sanity.max({
      Data: {
        Skills: {
          "Cthuhlu Mythos": 20,
        },
      },
    })
  ).toBe(79);
});

test(`'Luck' default and max work`, () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.4);
  expect(STATS.Luck.default()).toBe(30);
  expect(STATS.Luck.max()).toBe(99);
});

test(`'MP' default and max work`, () => {
  expect(
    STATS.MP.default({
      Data: {
        Characteristics: {},
      },
    })
  ).toBe(8);
  expect(
    STATS.MP.default({
      Data: {
        Characteristics: {
          POW: 50,
        },
      },
    })
  ).toBe(10);
});
