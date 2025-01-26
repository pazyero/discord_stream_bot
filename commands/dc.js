const { SlashCommandBuilder } = require('discord.js');
const cmdName = 'dc';

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
			message = 'disconnect VC!'
			command.reply(interaction, message);
			return [null ,null,null] ;
		}
	},
	async reply(interaction, message ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(message);
		}
	},
};