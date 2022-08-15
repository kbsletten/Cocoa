function isAdmin(msg) {
  return (
    msg.guild.ownerId === msg.member.id ||
    msg.member.roles.cache.find((role) =>
      role.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)
    )
  );
}

module.exports = {
  isAdmin,
};
