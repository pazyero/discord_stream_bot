const { SlashCommandBuilder } = require('discord.js');
const cmdName = 'ping';

module.exports = {
	data: new SlashCommandBuilder()
        // コマンドの名前
		.setName(cmdName)
        // コマンドの説明文
		.setDescription('Pong!と返信。'),
	async execute(interaction, client1, client2, userVolumes, connections,message,userBans) {
		const command = interaction.client.commands.get(cmdName);
		const [connection1, connection2, mixer] = connections;
        // Pong!と返信
		message = 'Pong!'
		command.reply(interaction, message);
		return [connection1, connection2, mixer] ;
	},
	async reply(interaction, messege ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(messege);
		}
	},
};