import nconf from "nconf";
import { Client, Intents, TextChannel, MessageOptions } from "discord.js";

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
});

client.on("ready", () =>
  console.log(`DISCORD: Logged in as ${client.user?.tag}!`)
);

client.login(nconf.get("DISCORD_CLIENT_TOKEN")); //login bot using token

export const sendMessage = (
  channelName: string,
  messageMarkdown?: MessageOptions | string
) => {
  if (!messageMarkdown) return;
  const channel = client.channels.cache.get(channelName);
  console.log(channelName, channel);
  (channel as TextChannel).send(messageMarkdown);
};

export const checkGuildMember = async (memberId: string) => {
  const guild = await client.guilds.fetch(nconf.get("DISCORD_GUILD_ID"));
  try {
    const response = await guild.members.fetch(memberId);
    if (response.user) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
