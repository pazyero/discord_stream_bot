const { SlashCommandBuilder } = require('discord.js');

// 音量を保存するマップ
const volumeMap = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
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
    async execute(interaction, userVolumes = {}) {
        const user = interaction.options.getUser('user');
        const volume = interaction.options.getInteger('volume');

        // ユーザーの音量を保存または更新
        userVolumes[user.id.toString()] = volume;

        console.log(user.id);

        await interaction.reply(`${user.username} の音量を ${volume}% に設定しました。`);
        return userVolumes;
    },
};