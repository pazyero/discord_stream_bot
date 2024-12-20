const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, EndBehaviorType, createAudioResource, StreamType } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');
const cmdName = 'resatar';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('VCの中継を再起動する'),
	async execute(interaction, client1, client2, userVolumes, connections,message,userBans) {
		const command = interaction.client.commands.get(cmdName);

		const voiceChannel1 = {
			id: connections[0].joinConfig.channelId
		};
		const voiceChannel2 = connections[1].joinConfig.channelId;

		//endとstartを呼び出す
		const endCommand = interaction.client.commands.get('bye');
		connections = await endCommand.execute(interaction, client1, client2, userVolumes, connections,message,userBans);

		//endとstartを呼び出す
		const joinCommand = interaction.client.commands.get('join');
		connections = await joinCommand.execute(interaction, client1, client2, userVolumes, connections,message,userBans,voiceChannel1,voiceChannel2);


		const startCommand = interaction.client.commands.get('start');
		connections  = await startCommand.execute(interaction, client1, client2, userVolumes, connections,message,userBans);

		command.reply(interaction, connections[3]);
		return [connections[0],connections[1],connections[2]];

	},
	async reply(interaction, messege ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(messege);
		}
	},
};
