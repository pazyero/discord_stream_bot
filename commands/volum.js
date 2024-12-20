const { SlashCommandBuilder } = require('discord.js');
const cmdName = 'volume';


module.exports = {
    data: new SlashCommandBuilder()
        .setName(cmdName)
        .setDescription('指定ユーザーの音量を設定')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('音量を設定するユーザー')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('音量を指定 (0-200%)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200)),
    async execute(interaction, client1, client2, userVolumes = {}, connections ,message ,userBans) {
		const command = interaction.client.commands.get(cmdName);
        const user = interaction.options.getUser('user');
        const volume = interaction.options.getInteger('volume');

        // ユーザーの音量を保存または更新
        userVolumes[user.id.toString()] = volume;

        message =  `${user.username} の音量を ${volume}% に設定しました。`
		command.reply(interaction, message);
        return userVolumes;
    },
	async reply(interaction, messege ) {
		if(interaction.commandName == cmdName){
			await interaction.reply(messege);
		}
	},
};