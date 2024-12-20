# stream-bot
## 使い方

###環境作成
* どっかしらのサイトを参考にして、下記のものを入れる。
    - discord.js (14.7.1)
    - node.js (18.13.0)
    - npm (8.19.3)

* discordBotを２つ作成。

* `.zip`でダウンロード、展開。

* `config.json`の中身に先ほど作成したBOTのクライアントID,トークンを設定

* `index.js`の階層でコマンドプロンプト等を開き、`npm i`を実行しnpmをインストールする


###BOT実行手順

* `index.js`の階層でコマンドプロンプト等を開き、`node deploy-commands.js`を実行し
   commandsフォルダのコマンドが全て読み込まれていることを確認

* `index.js`の階層でコマンドプロンプト等を開き、`node index.js`を実行。



###コマンド説明
* /ban user
* 指定したユーザーの音声を中継しないようにする

/bye
VCからBOTを切断する

/end
VCの中継を終了する

/join channel1 channel2
channel1にリスナーBOT・channel1にスピーカーBOTを参加させる

/ping
BOTの生存確認「Pong!」と返信してくれる

/resatar
VC中継を一回終了し、再開させる。

/start
VC中継を開始する

/stream channel1 channel2
channel1にリスナーBOT・channel1にスピーカーBOTを参加させVC中継を開始する

/volum user volume
指定したユーザーの音量を調整する


