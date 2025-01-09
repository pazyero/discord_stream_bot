const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, EndBehaviorType, createAudioResource, StreamType } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');
const { copyFileSync } = require('fs');
const cmdName = 'stream';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('VCを中継。')
		.addChannelOption(option =>
			option.setName('channel1')
				.setDescription('The channel that Listener-bot join')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildVoice)
		)
		.addStringOption(option =>
			option.setName('channel2')
				.setDescription('The channel that Speaker-bot join')
				.setAutocomplete(true)
				.setRequired(true)
		),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const vc = interaction.options.get('channel1');
		const chats = interaction.guild.channels.cache;
		const voiceChannels = chats.filter(file => file.type === 2);
		let unSelectedVoiceChannels = [];

		for (const voiceChannel of voiceChannels) {
			if (voiceChannel[0] !== vc.value) {
				// コマンド実行者がアクセスできるか確認
				const permissions = voiceChannel[1].permissionsFor(interaction.user);
				if (permissions && permissions.has('Connect')) { // 'Connect' は VCへの接続権限
					unSelectedVoiceChannels.push(voiceChannel);
				}
			}
		}

		const filtered = unSelectedVoiceChannels.filter(unSelectedVoiceChannel => unSelectedVoiceChannel[1].name.startsWith(focusedValue));

		await interaction.respond(
			filtered.map(unSelectedVoiceChannel => ({ name: unSelectedVoiceChannel[1].name, value: unSelectedVoiceChannel[1].id })).slice(0, 25)
		);
	},
	async execute(interaction, client1, client2, userVolumes, connections,message,userBans) {
		const command = interaction.client.commands.get(cmdName);
		const voiceChannel1 = interaction.options.getChannel('channel1');
		const voiceChannel2 = interaction.options.getString('channel2');

		//joinとstartを呼び出す
		if (voiceChannel1 && voiceChannel2) {
			const joinCommand = interaction.client.commands.get('join');
			connections =  await joinCommand.execute(interaction, client1, client2, userVolumes, connections,message,userBans);

			const startCommand = interaction.client.commands.get('start');
			connections  = await startCommand.execute(interaction, client1, client2, userVolumes, connections,message,userBans);

			command.reply(interaction, connections[3]);
			return [connections[0],connections[1],connections[2]];
		}
	},
	async reply(interaction, message ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(message);
		}
	},
};
