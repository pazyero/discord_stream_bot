const { SlashCommandBuilder } = require('discord.js');
const cmdName = 'bye';

module.exports = {
	data: new SlashCommandBuilder()
		.setName(cmdName)
		.setDescription('VCから切断。'),
	async execute(interaction, client1, client2, userVolumes, connections ,message,userBans) {

		const command = interaction.client.commands.get(cmdName);
		if (connections === undefined) {
			message = 'VCに接続していません。'
			command.reply(interaction, message);
			return [null ,null,null] ;
		}
		else {
			for (const connection of connections) {
				if (connection !== undefined) {
					connection.destroy();
				}
			}
			message = 'Bye VC!'
			command.reply(interaction, message);
			return [null ,null,null] ;
		}
	},
	async reply(interaction, messege ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(messege);
		}
	},
};