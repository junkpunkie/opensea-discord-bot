import 'dotenv/config';
import Discord, { TextChannel, MessageAttachment, Intents } from 'discord.js';
import fetch from 'node-fetch';
import { ethers } from "ethers";
import fs from "pn/fs"
import buildSaleHTML from "./buildSaleHtml"
import nodeHtmlToImage from 'node-html-to-image';

const OPENSEA_SHARED_STOREFRONT_ADDRESS = '0x495f947276749Ce646f68AC8c248420045cb7b5e';

const discordBot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const  discordSetup = async (): Promise<TextChannel> => {
  return new Promise<TextChannel>((resolve, reject) => {
    ['DISCORD_BOT_TOKEN', 'DISCORD_CHANNEL_ID'].forEach((envVar) => {
      if (!process.env[envVar]) reject(`${envVar} not set`)
    })
  
    discordBot.login(process.env.DISCORD_BOT_TOKEN);
    discordBot.on('ready', async () => {
      const channel = await discordBot.channels.fetch(process.env.DISCORD_CHANNEL_ID!);
      resolve(channel as TextChannel);
    });
  })
}

const buildImage = (image: any) => (
  new Discord.MessageAttachment(image, 'realm.jpeg') 
)

/*const buildLinks = (sale: any) => (
  new Discord.MessageEmbed()
  .addFields(
    { name: "Open sea link",
      value: sale.asset.permalink
    },
    { name: "See on Bibliotheca",
    value: `https://bibliotheca.com/realms/${sale.asset.token_id}`
  })
)*/

async function main() {
  const channel = await discordSetup();
  const seconds = process.env.SECONDS ? parseInt(process.env.SECONDS) : 3_600;
  const hoursAgo = (Math.round(new Date().getTime() / 1000) - (seconds)); // in the last hour, run hourly?
  
  const params = new URLSearchParams({
    offset: '0',
    event_type: 'successful',
    only_opensea: 'false',
    occurred_after: hoursAgo.toString(), 
    collection_slug: process.env.COLLECTION_SLUG!,
  })

  if (process.env.CONTRACT_ADDRESS !== OPENSEA_SHARED_STOREFRONT_ADDRESS) {
    params.append('asset_contract_address', process.env.CONTRACT_ADDRESS!)
  }

  const openSeaResponse = await fetch(
    "https://api.opensea.io/api/v1/events?" + params).then((resp) => resp.json());
    
  return await Promise.all(
    openSeaResponse?.asset_events?.reverse().map(async (sale: any) => {

      const openSeaResponse = await fetch(
        "https://api.opensea.io/api/v1/asset/0x7afe30cb3e53dba6801aa0ea647a0ecea7cbe18d/" + sale.asset.token_id).then((resp) => resp.json());

      const image = await nodeHtmlToImage({
        html: buildSaleHTML(sale, openSeaResponse),
        quality: 100,
        type: 'jpeg',
        puppeteerArgs: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
      })
      await fs.writeFileSync('realm.jpeg', image);

      const embed = new Discord.MessageEmbed()
        .setTitle('🗺️ New Realm Sale')
        .setImage("attachment://realm.jpeg")        
        .addFields(
          { name: 'Name', value: sale.asset.name },
          { name: 'Amount', value: `${ethers.utils.formatEther(sale.total_price || '0')}${ethers.constants.EtherSymbol}`},
          { name: "Bibliotheca Link",
            value: `[Click here](https://bibliothecaforloot.com/realms/${sale.asset.token_id})`,
            inline: true
          },
          { name: "OpenSea Link",
            value: `[Click here](${sale.asset.permalink})`,
            inline: true
          },
        );
      return channel.send({ embeds: [embed], files: [buildImage(image)] });

     /* const message = buildMessage(image);
      const links = buildLinks(sale);
      channel.send(message)
      return channel.send(links)*/
    })
  );   
}

main()
  .then((res) =>{ 
    if (!res.length) console.log("No recent sales")
    process.exit(0)
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
