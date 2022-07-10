const Discord = require('discord.js');

module.exports = {
    Complete: (label, customId) => new Discord.MessageButton({ style: 'PRIMARY', label, customId }),
    Navigation: (label, customId) => new Discord.MessageButton({ style: 'SECONDARY', label, customId }),
    Update: (label, customId) => new Discord.MessageButton({ style: 'SUCCESS', label, customId }),
}