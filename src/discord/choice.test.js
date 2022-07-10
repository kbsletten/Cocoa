const { choice, choiceCallback } = require("./choice");

test(`choice works correctly with 1 option`, async () => {
  const msg = { reply: jest.fn() };
  const promise = choice(msg, "This is a test", [
    { label: "Option 1", value: "Option 1" },
  ]);
  expect(msg.reply).toHaveBeenCalled();
  expect(msg.reply.mock.lastCall[0].components.length).toBe(1);
  expect(msg.reply.mock.lastCall[0].components[0].components.length).toBe(1);
  const interaction = { update: jest.fn() };
  choiceCallback(
    msg.reply.mock.lastCall[0].components[0].components[0].customId.split(
      ":",
      4
    )[1],
    interaction
  );
  expect(interaction.update).toHaveBeenCalled();
  expect(await promise).toBe("Option 1");
});

test(`choice works correctly with 5 options`, async () => {
  const msg = { reply: jest.fn() };
  const promise = choice(msg, "This is a test", [
    { label: "Option 1", value: "Option 1" },
    { label: "Option 2", value: "Option 2" },
    { label: "Option 3", value: "Option 3" },
    { label: "Option 4", value: "Option 4" },
    { label: "Option 5", value: "Option 5" },
  ]);
  expect(msg.reply).toHaveBeenCalled();
  expect(msg.reply.mock.lastCall[0].components.length).toBe(1);
  expect(msg.reply.mock.lastCall[0].components[0].components.length).toBe(5);
  const interaction = { update: jest.fn() };
  choiceCallback(
    msg.reply.mock.lastCall[0].components[0].components[4].customId.split(
      ":",
      4
    )[1],
    interaction
  );
  expect(interaction.update).toHaveBeenCalled();
  expect(await promise).toBe("Option 5");
});

test(`choice works correctly with 10 options`, async () => {
  const msg = { reply: jest.fn() };
  const promise = choice(msg, "This is a test", [
    { label: "Option 1", value: "Option 1" },
    { label: "Option 2", value: "Option 2" },
    { label: "Option 3", value: "Option 3" },
    { label: "Option 4", value: "Option 4" },
    { label: "Option 5", value: "Option 5" },
    { label: "Option 6", value: "Option 6" },
    { label: "Option 7", value: "Option 7" },
    { label: "Option 8", value: "Option 8" },
    { label: "Option 9", value: "Option 9" },
    { label: "Option 10", value: "Option 10" },
  ]);
  expect(msg.reply).toHaveBeenCalled();
  expect(msg.reply.mock.lastCall[0].components.length).toBe(2);
  expect(msg.reply.mock.lastCall[0].components[0].components.length).toBe(5);
  const interaction = { update: jest.fn() };
  choiceCallback(
    msg.reply.mock.lastCall[0].components[1].components[0].customId.split(
      ":",
      4
    )[1],
    interaction
  );
  expect(interaction.update).toHaveBeenCalled();
  expect(interaction.update.mock.lastCall[0].components.length).toBe(2);
  expect(interaction.update.mock.lastCall[0].components[0].components.length).toBe(5);
  choiceCallback(
    interaction.update.mock.lastCall[0].components[0].components[4].customId.split(
      ":",
      4
    )[1],
    interaction
  );
  expect(interaction.update).toHaveBeenCalledTimes(2);
  expect(await promise).toBe("Option 10");
}); 
