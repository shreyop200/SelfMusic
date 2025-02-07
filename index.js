const { Client, Intents } = require('discord.js-selfbot-v13');
const fs = require('fs');
const yaml = require('js-yaml');
const { spawn } = require('child_process');

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));
const token = config.token;

async function main() {
  const botProcess = spawn('node', ['bot.js', token], { stdio: 'inherit' });

  botProcess.on('close', (code) => {
    console.log(`Bot process exited with code ${code}`);
  });
}

main();
