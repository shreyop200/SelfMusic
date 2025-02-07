# SelfMusic
⚠️ Using selfbots on Discord is strictly prohibited and violates their Terms of Service. This could result in your account being banned, **USE IT AT YOUR OWN RISK**
- This project is created purely for entertainment purposes. I do not endorse using selfbots to create disturbances on public servers.

## Introduction & Uses
**SelfMusic** is a **Music Selfbot** coded in **[JavaScript (Discord.JS)](https://nodejs.org/)**. It can play songs from YouTube search results in a voice channel while acting as a selfbot, meaning it uses a user account to play songs.
- This has many Uses in Itself, **For Example**: You can just Play music in any server without needing a dedicated bot or special permissions.

## Features
This selfbot is built with unique logic, eliminating the need for music APIs like LavaLink or MoonLink. It can download specific music as an **mp3** file and play it directly. 

It also saves the same music file in the `/musics` folder for future use, so you only need to download a song once and can play it again without downloading it 
### **Additional Features:**
- **Soundboard:** Use the bot as a soundboard without permissions. Simply place an **.mp3** file in the `/musics` folder and run the play command with the file name.
- **Text to Speech (TTS):** Run a command and the selfbot will speak the message using TTS.
- **ALT Account:** Run the selfbot on a different ALT account and grant admin access to your main account. The bot will respond to your commands 

# Installation
Configure `config.yaml` as needed. Follow these steps to set up the selfbot properly. After configuring, run `index.js`. For any module errors, use the manual installation process.

### **Steps:**
1. **Get a Discord Account Token** (not a bot token) and add it to the config file.
2. **Set a Prefix:** Define the prefix for selfbot actions. (Default: `,`)
3. **User ID Access:** Provide the User ID for those who can access the selfbot. (⚠️ **Caution:** Those User IDs can use selfbot commands.)
4. **Default Volume:** Set the default volume multiplier for songs. (Default: 1x)
5. **TTS Settings:** Do not alter unless you are familiar with the configurations.

If all steps are completed without errors, you can run `,help` to view available commands.

## **Manual Installation**

To install the necessary modules, run the following command in Terminal:

```sh
npm install discord.js-selfbot-v13 fs js-yaml google-tts-api lyrics-finder @discordjs/voice
```
Then, start the bot with:
```js
node index.js
```

# Contact
This Selfbot is Deisgned and Developed by **SHREYANSH** (Discord: shreyansh.org)
- For any assistance regarding the code, feel free to DM me on Discord.
### ⚠️ Please do not attempt to rebrand or sell this code. It is intended to remain freely accessible, and I trust that users will honor this commitment and refrain from commercializing it.
