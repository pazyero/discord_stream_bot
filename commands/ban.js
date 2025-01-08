const { SlashCommandBuilder } = require('discord.js');
const cmdName = 'ban';


module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription('指定ユーザーの音声通信を終了')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('userBan')
                .setRequired(true)),
    async execute(interaction, client1, client2, userVolumes = {}, connections ,message ,userBans) {
		const command = interaction.client.commands.get(cmdName);
        const user = interaction.options.getUser('user');

        // 音声を送らないユーザーを設定
        userBans.push(user.id.toString())

        message =  `${user.username} を送信しない`
		command.reply(interaction, message);
        return userBans;
    },
	async reply(interaction, message ) {
		if(interaction.commandName == cmdName){
			await interaction.reply({ content: message, ephemeral: true });
		}
	},
};