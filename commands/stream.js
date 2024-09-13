const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, EndBehaviorType, createAudioResource, StreamType } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stream')
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
				unSelectedVoiceChannels.push(voiceChannel);
			}
		}

		const filtered = unSelectedVoiceChannels.filter(unSelectedVoiceChannel => unSelectedVoiceChannel[1].name.startsWith(focusedValue));

		await interaction.respond(
			filtered.map(unSelectedVoiceChannel => ({ name: unSelectedVoiceChannel[1].name, value: unSelectedVoiceChannel[1].id })).slice(0, 25)
		);
	},
	async execute(interaction, client1, client2, userVolumes) {
		const voiceChannel1 = interaction.options.getChannel('channel1');
		const voiceChannel2 = interaction.options.getString('channel2');
		if (voiceChannel1 && voiceChannel2) {
			if (voiceChannel1 === voiceChannel2) {
				await interaction.reply('同じVCには参加できません');
				return;
			}

			const connection1 = joinVoiceChannel({
				group: 'listener',
				guildId: interaction.guildId,
				channelId: voiceChannel1.id,
				adapterCreator: client1.guilds.cache.get(interaction.guildId).voiceAdapterCreator,
				selfMute: true,
				selfDeaf: false,
			});

			const connection2 = joinVoiceChannel({
				group: 'speaker',
				guildId: interaction.guildId,
				channelId: voiceChannel2,
				adapterCreator: client2.guilds.cache.get(interaction.guildId).voiceAdapterCreator,
				selfMute: false,
				selfDeaf: true,
			});

			connection1.on('stateChange', (oldState, newState) => {
				console.log("connection1");
				console.log(newState.status);
			});


			connection2.on('stateChange', (oldState, newState) => {

				console.log("connection2");
				console.log(newState.status);
			});

			const mixer = new AudioMixer.Mixer({
				channels: 2,
				bitDepth: 16,
				sampleRate: 48000,
				clearInterval: 250,
			});

			mixer.setMaxListeners(20);

			const handleUserSpeakingStart = (userId) => {
				console.log("volume");
				console.log(userId);
				console.log(userVolumes);
				console.log(userVolumes[userId]);

				const standaloneInput = new AudioMixer.Input({
					channels: 2,
					bitDepth: 16,
					sampleRate: 48000,
					volume: userVolumes[userId] || 100,  // ユーザーごとの音量を設定,
				});
				mixer.addInput(standaloneInput);

				const audio = connection1.receiver.subscribe(userId, {
					end: {
						behavior: EndBehaviorType.AfterSilence,
						duration: 100,
					},
				});

				const rawStream = new PassThrough();
				audio
					.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
					.pipe(rawStream);

				rawStream.pipe(standaloneInput);

				const player = createAudioPlayer({
					behaviors: {
						noSubscriber: NoSubscriberBehavior.play,
					},
				});

				const resource = createAudioResource(mixer, {
					inputType: StreamType.Raw,
				});

				player.play(resource);
				connection2.subscribe(player);

				rawStream.on('end', () => {
					mixer.removeAllListeners('close');
					mixer.removeAllListeners('error');
					mixer.removeAllListeners('end');
					mixer.removeAllListeners('finish');

					mixer.removeInput(standaloneInput);
					standaloneInput.destroy();
					rawStream.destroy();
				});

				rawStream.on('error', (error) => {
					console.error('Stream error:', error);
					mixer.removeInput(standaloneInput);
					standaloneInput.destroy();
					rawStream.destroy();
				});
			};

			const handleReceiverError = (error) => {
				console.log('handleReceiverError');
				console.log(error);
			};

			const handleUserSpeakingEnd = (userId) => {
				console.log('handleUserSpeakingEnd');
			};

			connection1.receiver.speaking.on('start', handleUserSpeakingStart);
			connection1.receiver.speaking.on('error', handleReceiverError);
			connection1.receiver.speaking.on('end', handleUserSpeakingEnd);

			await interaction.reply('VCを中継します！');
			return [connection1, connection2, mixer];
		} 
	},
};
