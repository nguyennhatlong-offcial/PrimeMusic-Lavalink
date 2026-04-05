const https = require('https');
const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config.js");
const fs = require("fs");
const path = require('path');
const { initializePlayer } = require('./player');
const { connectToDatabase } = require('./mongodb');
const colors = require('./UI/colors/colors');
const { getLavalinkManager } = require('./lavalink.js');
const { getLang, getLangSync } = require('./utils/languageLoader.js');
require('dotenv').config();

// 1. KIỂM TRA KẾT NỐI DISCORD (Để xem có bị chặn IP không)
https.get('https://discord.com/api/v10/gateway', (res) => {
    console.log(`${colors.magenta}[ TEST IP ]${colors.reset} Trạng thái: ${res.statusCode}`);
    if(res.statusCode === 403) console.log(`${colors.red}=> XÁC NHẬN: IP này bị Discord chặn (403)!${colors.reset}`);
}).on('error', (e) => {
    console.error(`${colors.magenta}[ TEST IP ]${colors.reset} Lỗi kết nối: ${e.message}`);
});

// 2. CẤU HÌNH INTENTS (Chỉ lấy những quyền cần thiết để tránh lỗi Disallowed Intents)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildVoiceStates
    ],
});

client.config = config;

// 3. XỬ LÝ LỖI HỆ THỐNG
process.on('unhandledRejection', (error) => {
    const lang = getLangSync();
    if (error?.message?.includes('player.restart') || error?.message?.includes('restart is not a function')) {
        console.warn(`${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Ignoring Riffy bug: ${error.message}${colors.reset}`);
        return;
    }
    console.error(lang.console?.bot?.unhandledRejection || 'Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// 4. KHỞI TẠO PLAYER & EVENT
initializePlayer(client).catch(error => {
    console.error(`${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.red}Error: ${error.message}${colors.reset}`);
});

client.on("clientReady", () => {
    const lang = getLangSync();
    console.log(`${colors.cyan}[ SYSTEM ]${colors.reset} ${colors.green}Client logged as ${client.user.tag}${colors.reset}`);
   
    const nodeManager = getLavalinkManager();
    if (nodeManager) {
        nodeManager.init(client.user.id);
        setTimeout(() => {
            const availableCount = nodeManager.getNodeCount();
            const totalCount = nodeManager.getTotalNodeCount();
            console.log(`${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.green}Nodes: ${availableCount}/${totalCount} available${colors.reset}`);
        }, 3000);
    }
});

// LOAD EVENTS
fs.readdir("./events", (_err, files) => {
  if (files) {
    files.forEach((file) => {
      if (!file.endsWith(".js")) return;
      const event = require(`./events/${file}`);
      let eventName = file.split(".")[0]; 
      client.on(eventName, event.bind(null, client));
    });
  }
});

// 5. QUẢN LÝ LỆNH (COMMANDS) - CHỈ KHAI BÁO 1 LẦN DUY NHẤT
client.commands = new Map();
client.commandsArray = [];

const loadCommands = () => {
  const commandsDir = path.resolve(__dirname, config.commandsDir);
  const loadFromDir = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) loadFromDir(fullPath);
      else if (item.name.endsWith('.js')) {
        try {
          const command = require(fullPath);
          if (command.data && command.run) {
            client.commands.set(command.data.name, command);
            client.commandsArray.push(command.data.toJSON());
          }
        } catch (e) { console.error(`Error loading ${item.name}: ${e.message}`); }
      }
    }
  };
  loadFromDir(commandsDir);
  console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}Loaded ${client.commands.size} commands${colors.reset}`);
};

loadCommands();

// 6. VOICE STATE & LOGIN
client.on("raw", (d) => {
    const { GatewayDispatchEvents } = require("discord.js");
    if ([GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) {
        client.riffy?.updateVoiceState(d);
    }
});

// LOGIN VỚI LOG LỖI CHI TIẾT
client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
  console.log('\n' + '─'.repeat(40));
  console.log(`${colors.red}❌ LỖI ĐĂNG NHẬP: ${e.message}${colors.reset}`);
  console.log(`${colors.gray}Gợi ý: Kiểm tra lại TOKEN trong .env và 3 cái Intents xanh ở Discord Dev Portal.${colors.reset}`);
  console.log('─'.repeat(40));
});

// 7. DATABASE & SERVER PHỤ
connectToDatabase().then(() => {
  console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.green}MongoDB Online ✅${colors.reset}`);
}).catch((err) => {
  console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.red}Failed: ${err.message}${colors.reset}`);
});

const express = require("express");
const app = express();
const port = process.env.PORT || 7860;
app.get('/', (req, res) => res.send("LunaBot is Running!"));
app.listen(port, () => {
    console.log(`${colors.cyan}[ SERVER ]${colors.reset} Online tại port ${port} ✅`);
});
                    console.log(nodeInfo);
                }
            }
        }, 3000);
    } else if (client.riffy) {
    client.riffy.init(client.user.id);
    }
});
client.config = config;

fs.readdir("./events", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0]; 
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});



client.commands = new Map();
client.commandsArray = [];


const loadCommands = () => {
  const loadCommandsFromDir = (dir, category = '') => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
    
        loadCommandsFromDir(fullPath, item.name);
      } else if (item.isFile() && item.name.endsWith('.js')) {
        try {
       
          const absolutePath = path.resolve(fullPath);
          const command = require(absolutePath);
          
          if (command.data && command.run) {
            client.commands.set(command.data.name, command);
            client.commandsArray.push(command.data.toJSON());
            const categoryInfo = category ? ` [${category}]` : '';
            //console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}Loaded: ${colors.yellow}${command.data.name}${categoryInfo}${colors.reset}`);
          } else {
            const lang = getLangSync();
            console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.red}${lang.console?.bot?.commandLoadFailed?.replace('{name}', item.name) || `Failed to load: ${item.name} - Missing data or run property`}${colors.reset}`);
      }
        } catch (error) {
          const lang = getLangSync();
          console.error(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.red}${lang.console?.bot?.commandLoadError?.replace('{name}', item.name).replace('{message}', error.message) || `Error loading ${item.name}: ${error.message}`}${colors.reset}`);
    }
      }
    }
  };
  

  const commandsDir = path.resolve(__dirname, config.commandsDir);
  loadCommandsFromDir(commandsDir);
  const lang = getLangSync();
  console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}${lang.console?.bot?.commandsLoaded?.replace('{count}', client.commands.size) || `Total Commands Loaded: ${client.commands.size}`}${colors.reset}`);
};

loadCommands();


client.on("raw", (d) => {
    const { GatewayDispatchEvents } = require("discord.js");
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
    if (config.voiceDebug === true) {
        if (d.t === GatewayDispatchEvents.VoiceStateUpdate) {
            const isBot = d.d?.user_id === client.user?.id;
            console.log(`[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || 'null'} botUser=${isBot} channel=${d.d?.channel_id || 'null'} sessionId=${d.d?.session_id ? 'yes' : 'no'}`);
        } else {
            console.log(`[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || 'null'} endpoint=${d.d?.endpoint ? 'yes' : 'no'} token=${d.d?.token ? 'yes' : 'no'}`);
        }
    }
    client.riffy.updateVoiceState(d);
});

client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
  const lang = getLangSync();
  console.log('\n' + '─'.repeat(40));
  console.log(`${colors.magenta}${colors.bright}${lang.console?.bot?.tokenVerification || '🔐 TOKEN VERIFICATION'}${colors.reset}`);
  console.log('─'.repeat(40));
  console.log(`${colors.cyan}[ TOKEN ]${colors.reset} ${colors.red}${lang.console?.bot?.tokenAuthFailed || 'Authentication Failed ❌'}${colors.reset}`);
  console.log(`${colors.gray}${lang.console?.bot?.tokenError || 'Error: Turn On Intents or Reset New Token'}${colors.reset}`);
});
connectToDatabase().then(() => {
  const lang = getLangSync();
  console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.green}${lang.console?.bot?.databaseOnline || 'MongoDB Online ✅'}${colors.reset}`);
}).catch((err) => {
  const lang = getLangSync();
  console.log('\n' + '─'.repeat(40));
  console.log(`${colors.magenta}${colors.bright}${lang.console?.bot?.databaseStatus || '🕸️  DATABASE STATUS'}${colors.reset}`);
  console.log('─'.repeat(40));
  console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.red}${lang.console?.bot?.databaseFailed || 'Connection Failed ❌'}${colors.reset}`);
  console.log(`${colors.gray}${lang.console?.bot?.databaseError?.replace('{message}', err.message) || `Error: ${err.message}`}${colors.reset}`);
});
const express = require("express");
const app = express();
const port = 7860;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});

app.listen(port, () => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}🌐 SERVER STATUS${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.cyan}[ SERVER ]${colors.reset} ${colors.green}Online ✅${colors.reset}`);
    console.log(`${colors.cyan}[ PORT ]${colors.reset} ${colors.yellow}http://localhost:${port}${colors.reset}`);
    console.log(`${colors.cyan}[ TIME ]${colors.reset} ${colors.gray}${new Date().toISOString().replace('T', ' ').split('.')[0]}${colors.reset}`);
    console.log(`${colors.cyan}[ USER ]${colors.reset} ${colors.yellow}GlaceYT${colors.reset}`);
});
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0]; 
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});



client.commands = new Map();
client.commandsArray = [];


const loadCommands = () => {
  const loadCommandsFromDir = (dir, category = '') => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
    
        loadCommandsFromDir(fullPath, item.name);
      } else if (item.isFile() && item.name.endsWith('.js')) {
        try {
       
          const absolutePath = path.resolve(fullPath);
          const command = require(absolutePath);
          
          if (command.data && command.run) {
            client.commands.set(command.data.name, command);
            client.commandsArray.push(command.data.toJSON());
            const categoryInfo = category ? ` [${category}]` : '';
            //console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}Loaded: ${colors.yellow}${command.data.name}${categoryInfo}${colors.reset}`);
          } else {
            const lang = getLangSync();
            console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.red}${lang.console?.bot?.commandLoadFailed?.replace('{name}', item.name) || `Failed to load: ${item.name} - Missing data or run property`}${colors.reset}`);
      }
        } catch (error) {
          const lang = getLangSync();
          console.error(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.red}${lang.console?.bot?.commandLoadError?.replace('{name}', item.name).replace('{message}', error.message) || `Error loading ${item.name}: ${error.message}`}${colors.reset}`);
    }
      }
    }
  };
  

  const commandsDir = path.resolve(__dirname, config.commandsDir);
  loadCommandsFromDir(commandsDir);
  const lang = getLangSync();
  console.log(`${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}${lang.console?.bot?.commandsLoaded?.replace('{count}', client.commands.size) || `Total Commands Loaded: ${client.commands.size}`}${colors.reset}`);
};

loadCommands();


client.on("raw", (d) => {
    const { GatewayDispatchEvents } = require("discord.js");
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
    if (config.voiceDebug === true) {
        if (d.t === GatewayDispatchEvents.VoiceStateUpdate) {
            const isBot = d.d?.user_id === client.user?.id;
            console.log(`[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || 'null'} botUser=${isBot} channel=${d.d?.channel_id || 'null'} sessionId=${d.d?.session_id ? 'yes' : 'no'}`);
        } else {
            console.log(`[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || 'null'} endpoint=${d.d?.endpoint ? 'yes' : 'no'} token=${d.d?.token ? 'yes' : 'no'}`);
        }
    }
    client.riffy.updateVoiceState(d);
});

client.login(config.TOKEN || process.env.TOKEN).catch((e) => {
  const lang = getLangSync();
  console.log('\n' + '─'.repeat(40));
  console.log(`${colors.magenta}${colors.bright}${lang.console?.bot?.tokenVerification || '🔐 TOKEN VERIFICATION'}${colors.reset}`);
  console.log('─'.repeat(40));
  console.log(`${colors.cyan}[ TOKEN ]${colors.reset} ${colors.red}${lang.console?.bot?.tokenAuthFailed || 'Authentication Failed ❌'}${colors.reset}`);
  console.log(`${colors.gray}${lang.console?.bot?.tokenError || 'Error: Turn On Intents or Reset New Token'}${colors.reset}`);
});
connectToDatabase().then(() => {
  const lang = getLangSync();
  console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.green}${lang.console?.bot?.databaseOnline || 'MongoDB Online ✅'}${colors.reset}`);
}).catch((err) => {
  const lang = getLangSync();
  console.log('\n' + '─'.repeat(40));
  console.log(`${colors.magenta}${colors.bright}${lang.console?.bot?.databaseStatus || '🕸️  DATABASE STATUS'}${colors.reset}`);
  console.log('─'.repeat(40));
  console.log(`${colors.cyan}[ DATABASE ]${colors.reset} ${colors.red}${lang.console?.bot?.databaseFailed || 'Connection Failed ❌'}${colors.reset}`);
  console.log(`${colors.gray}${lang.console?.bot?.databaseError?.replace('{message}', err.message) || `Error: ${err.message}`}${colors.reset}`);
});
const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});

app.listen(port, () => {
    console.log('\n' + '─'.repeat(40));
    console.log(`${colors.magenta}${colors.bright}🌐 SERVER STATUS${colors.reset}`);
    console.log('─'.repeat(40));
    console.log(`${colors.cyan}[ SERVER ]${colors.reset} ${colors.green}Online ✅${colors.reset}`);
    console.log(`${colors.cyan}[ PORT ]${colors.reset} ${colors.yellow}http://localhost:${port}${colors.reset}`);
    console.log(`${colors.cyan}[ TIME ]${colors.reset} ${colors.gray}${new Date().toISOString().replace('T', ' ').split('.')[0]}${colors.reset}`);
    console.log(`${colors.cyan}[ USER ]${colors.reset} ${colors.yellow}GlaceYT${colors.reset}`);
});
