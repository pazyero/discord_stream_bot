const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('end')
		.setDescription('VCの中継を終了'),
	async execute(interaction, connections) {
		const [connection1, connection2, mixer] = connections;

		if (connection1) {
			connection1.receiver.speaking.removeAllListeners();  // Mixerのリスナーをすべて削除
		}

		await interaction.reply('音声の中継を中止しました。');
	},
};