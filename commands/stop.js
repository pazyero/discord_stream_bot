const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const cmdName = 'stop';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('VCの中継を終了'),
	async execute(interaction, client1, client2, userVolumes, connections,message,userBans) {
		const command = interaction.client.commands.get(cmdName);
		const [connection1, connection2, mixer] = connections;

		//登録しているイベントをすべて削除
		if (connection1) {
			mixer.removeAllListeners();
			connection1.receiver.speaking.removeAllListeners();  // Mixerのリスナーをすべて削除

			//イベントの新規作成を停止
			const startCommand = interaction.client.commands.get('start');
			await startCommand.stop();
		}

		message = '音声の中継を中止しました。'
		command.reply(interaction, message);
		return [connection1, connection2, mixer] ;
	},
	async reply(interaction, message ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(message);
		}
	},
};