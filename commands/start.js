const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { getVoiceConnection, createAudioPlayer, NoSubscriberBehavior, EndBehaviorType, createAudioResource, StreamType } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('VCを中継。'),
	async execute(interaction, client1, client2, userVolumes) {

		const connection1 = getVoiceConnection(interaction.guildId, 'listener')
		const connection2 = getVoiceConnection(interaction.guildId, 'speaker')
		if (connection1 && connection2) {

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
				console.log(userId);

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

		} else {
			await interaction.reply('VCに接続してください');
		}

	},
};
