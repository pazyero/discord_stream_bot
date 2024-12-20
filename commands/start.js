const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { getVoiceConnection, createAudioPlayer, NoSubscriberBehavior, EndBehaviorType, createAudioResource, StreamType } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');
const cmdName = 'start';
let stopFlg = true;
let nowTolkUser = [];
const setMaxListeners = 80

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('VCを中継。'),
	async execute(interaction, client1, client2, userVolumes, connections,message,userBans) {
		stopFlg = false;
		const command = interaction.client.commands.get(cmdName);

		const connection1 = getVoiceConnection(interaction.guildId, 'listener')
		const connection2 = getVoiceConnection(interaction.guildId, 'speaker')
		if (connection1 && connection2) {

			const mixer = new AudioMixer.Mixer({
				channels: 2,
				bitDepth: 16,
				sampleRate: 48000,
				clearInterval: 250,
			});

			mixer.setMaxListeners(setMaxListeners);

			const handleUserSpeakingStart = (userId) => {

				if(!userBans.includes(userId)){
					console.log(userId);
					nowTolkUser.push(userId)

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
						mixer.removeInput(standaloneInput);
						standaloneInput.destroy();
						rawStream.destroy();

						var index = nowTolkUser.indexOf(userId);
						nowTolkUser.splice(index, 1)

						if (nowTolkUser.length == 0) {
							//接続ユーザーがいない場合イベントをリセットする。
							mixer.removeAllListeners();
						}

						//不要なイベントを削除する
						mixer.removeAllListeners('close');
						mixer.removeAllListeners('error');
						mixer.removeAllListeners('end');
						mixer.removeAllListeners('finish');
						connection1.receiver.speaking.removeAllListeners();
						command.restart(connection1,handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd);
					});

					rawStream.on('error', (error) => {
						console.error('Stream error:', error);
						mixer.removeInput(standaloneInput);
						standaloneInput.destroy();
						rawStream.destroy();

						var index = nowTolkUser.indexOf(userId);
						nowTolkUser.splice(index, 1)

						if (nowTolkUser.length == 0) {
							//接続ユーザーがいない場合イベントをリセットする。
							mixer.removeAllListeners();
						}

						//不要なイベントを削除する
						mixer.removeAllListeners('close');
						mixer.removeAllListeners('error');
						mixer.removeAllListeners('end');
						mixer.removeAllListeners('finish');
						connection1.receiver.speaking.removeAllListeners();
						command.restart(connection1,handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd);
					});
				}
			};

			const handleReceiverError = (error) => {
				console.log('handleReceiverError');
				console.log(error);
			};

			const handleUserSpeakingEnd = (userId) => {
				console.log('handleUserSpeakingEnd');
			};

			command.restart(connection1,handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd);


			message = 'VCを中継します！'
			command.reply(interaction, message);
			return command.returnObj(interaction, connection1, connection2, mixer ,message);
		} else {
			message = 'VCに接続してください'
			command.reply(interaction, message);
			return command.returnObj(interaction, null, null, null,message);
		}

	},
	async reply(interaction, messege ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(messege);
		}
	},
	async returnObj(interaction,connection1, connection2, mixer,message) {
		if(interaction.commandName == cmdName){
			return [connection1, connection2, mixer];
		}else{
			return [connection1, connection2, mixer , message];
		}
	},
	async restart(connection1,handleUserSpeakingStart, handleReceiverError, handleUserSpeakingEnd) {
		if(!stopFlg){
			connection1.receiver.speaking.on('start', handleUserSpeakingStart);
			connection1.receiver.speaking.on('error', handleReceiverError);
			connection1.receiver.speaking.on('end', handleUserSpeakingEnd);
		}
	},
	async stop() {
		stopFlg = true;
	},
};
