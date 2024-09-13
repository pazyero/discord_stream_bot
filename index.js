const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { LISTENER, SPEAKER } = require('./config.json');

const client1 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const client2 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });


let connections = [];
let userVolumes = {}; // ユーザーごとの音量を保存
// 今回はListenner-botに対してのみコマンドを割り当ててみる。
client1.commands = new Collection();

// commandsフォルダから、.jsで終わるファイルのみを取得
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// 取得した.jsファイル内の情報から、コマンドと名前をListenner-botに対して設定
	if ('data' in command && 'execute' in command) {
		client1.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING]  ${filePath} のコマンドには、必要な "data" または "execute" プロパティがありません。`);
	}
}

// コマンドが送られてきた際の処理
client1.on(Events.InteractionCreate, async interaction => {
    // コマンドでなかった場合は処理せずさよなら。
	if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

	const command = interaction.client.commands.get(interaction.commandName);

    // 一致するコマンドがなかった場合
	if (!command) {
		console.error(` ${interaction.commandName} というコマンドは存在しません。`);
		return;
	}

	try {
        // コマンドを実行
		if ( interaction.commandName === 'stream' || interaction.commandName === 'start' ) {
			connections = await command.execute(interaction, client1, client2, userVolumes);
		}
		else if (interaction.commandName === 'join') {
			connections = await command.execute(interaction, client1, client2);
		}
		else if (interaction.commandName === 'bye' || interaction.commandName === 'end') {
			await command.execute(interaction, connections);
		}
		else if (interaction.commandName === 'volume') {
			userVolumes = await command.execute(interaction, userVolumes);
		}
		else {
			await command.execute(interaction);
		}
		if (interaction.isAutocomplete()) {
			await command.autocomplete(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'コマンドを実行中にエラーが発生しました。', ephemeral: true });
	}
});

client1.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client2.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client1.login(LISTENER.TOKEN);
client2.login(SPEAKER.TOKEN);
