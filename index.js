import fetch from "node-fetch";
import sharp from "sharp"
import pkg from 'discord.js';
import dotenv from 'dotenv'

dotenv.config()
const { Client, GatewayIntentBits,EmbedBuilder ,AttachmentBuilder  } = pkg;
async function getImageUrls(){
    const res = await fetch("https://www.bgreco.net/garfield")
    const html =await  res.text();
    const imageUrls =  html.split(`'`)
        .filter(x=>x.startsWith("panel.gif"))
        .map(x=>"https://www.bgreco.net/garfield/"+x)
    return imageUrls;
}

async function getImageBuffer(url){
    const res = await fetch(url);
    return await res.arrayBuffer();
}
async function getCombineBuffer(){
    const urls = await getImageUrls();
    const buffers = await Promise.all(urls.map(url=>getImageBuffer(url)))
    return await sharp({
        create:{
            width:610,
            height:177,
            channels:3,
            background:{r:0,b:0,g:0}
        }
    }).composite([
        {input:buffers[0],top:0,left:0},
        {input:buffers[1],top:0,left:205},
        {input:buffers[2],top:0,left:410}
    ]).png().toBuffer();
}


const client = new Client(
    { intents: 
        [GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async msg => {
  if (msg.content === '#garf'){
    const combineImageBuffer = await getCombineBuffer();
    const file = new AttachmentBuilder(combineImageBuffer,'res.png');

    msg.reply({ files: [file] })
  }
});

client.login(process.env.BOT_TOKEN)

