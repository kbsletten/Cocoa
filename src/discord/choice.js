const Discord = require("discord.js");
const { v4: uuid } = require("uuid");
const Button = require("./button");

const CHOICE_PAGE_SIZE = 5;
const callbacks = {};

function removeAll(cleanup) {
  for (const id of cleanup) {
    delete callbacks[id];
  }
}

function choicePageButton(page, currentPage, maxPage, id) {
  if (page < 0 || page >= maxPage || page === currentPage) return null;
  const diff = page - currentPage;
  const prefix = diff === -1 ? "< " : diff < -1 ? "<< " : "";
  const postfix = diff === 1 ? " >" : diff > 1 ? " >>" : "";
  return Button.Navigation(`${prefix}${page + 1}${postfix}`, `callback:${id}`);
}

function getPageComponents(options, cleanup, choicePage, maxPage) {
  const components = [
    new Discord.MessageActionRow({
      components: options
        .map(
          (option, index) =>
            Button.Complete(option.label, `callback:${cleanup[index]}`)
        )
        .slice(
          choicePage * CHOICE_PAGE_SIZE,
          choicePage * CHOICE_PAGE_SIZE + CHOICE_PAGE_SIZE
        ),
    }),
  ];
  if (maxPage > 1) {
    components.push(
      new Discord.MessageActionRow({
        components: [
          choicePageButton(0, choicePage, maxPage, cleanup[options.length]),
          choicePageButton(
            choicePage - 1,
            choicePage,
            maxPage,
            cleanup[options.length + choicePage - 1]
          ),
          choicePageButton(
            choicePage + 1,
            choicePage,
            maxPage,
            cleanup[options.length + choicePage + 1]
          ),
          choicePageButton(
            maxPage - 1,
            choicePage,
            maxPage,
            cleanup[options.length + maxPage - 1]
          ),
        ].filter(
          (it, index, arr) =>
            it &&
            index === arr.findIndex((x) => x && x.customId === it.customId)
        ),
      })
    );
  }
  return components;
}

function makeCallbacks(options) {
  const maxPage = Math.ceil(options.length / CHOICE_PAGE_SIZE);
  const cleanup = [];
  return {
    cleanup,
    maxPage,
    promise: new Promise(async (resolve, reject) => {
      for (const option of options) {
        const id = uuid();
        cleanup.push(id);
        callbacks[id] = (interaction) => {
          resolve(option.value);
          removeAll(cleanup);
          interaction.update({ components: [] });
        };
      }
      for (let i = 0; i < maxPage; i++) {
        const page = i;
        const id = uuid();
        cleanup.push(id);
        callbacks[id] = (interaction) => {
          interaction.update({
            components: getPageComponents(options, cleanup, page, maxPage),
          });
        };
      }
    }),
  };
}

async function choice(msg, content, options) {
  const { cleanup, maxPage, promise } = makeCallbacks(options);
  await msg.reply({
    content,
    components: getPageComponents(options, cleanup, 0, maxPage),
  });
  return await promise;
}

function choiceCallback(id, interaction) {
  callbacks[id](interaction);
}

module.exports = {
  choice,
  choiceCallback,
};
