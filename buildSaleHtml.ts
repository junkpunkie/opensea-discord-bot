import { ethers } from "ethers";
import useRarity from './useRarity';
const { checkRealmRarity } = useRarity();

export default (sale: any, openSeaResponse: any): string => {
    const openSeaEventType = sale.event_type
    const imageUrl = sale.asset.image_url
    const name = sale.asset.name
    const id = sale.asset.token_id
    const buyer = sale?.winner_account?.address
    const seller = sale?.seller?.address
    let price
    if (openSeaEventType === 'successful') {
        price = `${ethers.utils.formatEther(sale.total_price || '0')}${ethers.constants.EtherSymbol}`
    } else if (openSeaEventType === 'created') {
        price = `${ethers.utils.formatEther(sale.starting_price || '0')}${ethers.constants.EtherSymbol}`
    } else {
        return
    }

    const traits = openSeaResponse.traits.filter(resource => resource.trait_type === 'Resource')
    const cities = openSeaResponse.traits.find(resource => resource.trait_type === 'Cities')
    const harbours = openSeaResponse.traits.find(resource => resource.trait_type === 'Harbors')
    const regions = openSeaResponse.traits.find(resource => resource.trait_type === 'Regions')
    const rivers = openSeaResponse.traits.find(resource => resource.trait_type === 'Rivers')
    const wonder = openSeaResponse.traits.find(resource => resource.trait_type === 'Wonder (translated)')

    const getRarityColour = (rarity) => {
        if (rarity > 8000) {
          return 'bg-gradient-to-r from-purple-300 via-pink-400 to-red-400'
        } else if (rarity > 200) {
          return 'bg-red-800 text-white'
        } else if (rarity > 100) {
          return 'bg-red-600 text-white'
        } else if (rarity > 50) {
          return 'bg-red-400 text-white'
        } else if (rarity > 25) {
          return 'bg-red-200 text-white text-gray-700'
        } else if (rarity > 10) {
          return 'bg-red-50 text-gray-700'
        } else {
          return 'text-black'
        }
      }

    const colour = [
      {
          value: "Wood",
          colour: "bg-yellow-900"
      },
      {
          value: "Stone",
          colour: "bg-gray-300 text-gray-800"
      },
      {
          value: "Coal",
          colour: "bg-gray-600"
      },
                              {
          value: "Copper",
          colour: "bg-yellow-500"
      },
      {
          value: "Obsidian",
          colour: "bg-black"
      },
      {
          value: "Silver",
          colour: "bg-gray-200 text-gray-700"
      },
      {
          value: "Ironwood",
          colour: "bg-red-700"
      },
      {
          value: "Cold Iron",
          colour: "bg-red-300 text-red-700"
      },
      {
          value: "Gold",
          colour: "bg-yellow-300 text-yellow-700"
      },
      {
          value: "Hartwood",
          colour: "bg-red-300"
      },
      {
          value: "Diamonds",
          colour: "bg-purple-100 text-purple-400"
      },
      {
          value: "Sapphire",
          colour: "bg-blue-500"
      },
      {
          value: "Deep Crystal",
          colour: "bg-blue-300"
      },
      {
          value: "Ruby",
          colour: "bg-red-600"
      },
      {
          value: "Ignium",
          colour: "bg-red-500 text-yellow-200"
      },
      {
          value: "Ethereal Silica",
          colour: "bg-green-500"
      },
      {
          value: "True Ice",
          colour: "bg-white text-blue-700"
      },
      {
          value: "Twilight Quartz",
          colour: "bg-purple-700"
      },
      {
          value: "Alchemical Silver",
          colour: "bg-gray-400"
      },
      {
          value: "Adamantine",
          colour: "bg-blue-900"
      },
      {
          value: "Mithral",
          colour: "bg-blue-400"
      },
      {
          value: "Dragonhide",
          colour: "bg-pink-500"
      }
  ]
    const getColour = (value) => {
        return colour.find(c => c.value === value).colour
    }

    const traitDetail = (t) => {
      let html: string = ''
      for (var trait of t) {
        html += "<span class=\""+ getColour(trait.value) + " px-6 py-2 rounded text-sm mb-1 mr-4\">" + trait.value +"</span>";
      }
      return html
    }

    const rarity = checkRealmRarity(openSeaResponse.traits).toFixed(2)
    const rarityColour = getRarityColour(rarity)

    const body: string = `<body class="bg-black">

      <div class="relative">
        <span class="
            absolute
            bg-white
            rounded
            px-2
            py-1
            shadow-2xl
            top-10
            right-10
            text-4xl
            ${rarityColour}
        ">
            Rarity: ${rarity}
        </span>
        <img src="${imageUrl}" />
      </div>
      <div class="text-white">
          <div class="container pt-4 pb-6 px-10">
            ${openSeaEventType === 'successful' ?
            `
                <h1 class="text-5xl mb-4">#${id} - ${name} has a new Lord!</h1>
                <h4 class="text-4xl my-2">👑 Sold for: ${price}</h4> 
            ` : 
            `
                <h1 class="text-5xl mb-4">#${id} - ${name} is for sale!</h1>
                <h4 class="text-4xl my-2">👑 Price: ${price}</h4> 
            `}

            <div class="flex my-2 flex-wrap space-y-4 text-2xl">
              <div class="flex flex-wrap my-4">
                ${traitDetail(traits)}
              </div>
            </div>
            <div class="my-2 text-xl">       
            <div class="my-2">
                Cities: ${ cities.value } / 21
                <div class="bg-gray-200 bg-white w-full rounded">
                    <div style="width: ${ (parseInt(cities.value)  / 21) * 100 + '%'}"  class="rounded px-4 py-2 bg-red-500"></div> 
                </div>
            </div>        
            <div class="my-2">
                Harbours: ${ harbours.value } / 35
                <div class="bg-gray-200 bg-white w-full rounded">
                    <div style="width: ${ (parseInt(harbours.value)  / 35) * 100 + '%'}"  class="rounded px-4 py-2 bg-gray-500"></div> 
                </div>
            </div>
            <div class="my-2">
                Regions: ${ regions.value } / 7
                <div class="bg-gray-200 w-full rounded">
                    <div style="width: ${ (parseInt(regions.value)  / 7) * 100 + '%'}"  class="rounded px-4 py-2 bg-yellow-300"></div> 
                </div>
            </div>        
            <div class="my-2">
                Rivers: ${ rivers.value } / 60
                <div class="bg-gray-200  bg-white w-full rounded">
                    <div style="width: ${ (parseInt(rivers.value) / 60) * 100 + '%' }"  class="rounded px-4 py-2 bg-blue-300"></div> 
                </div>
            </div>
            ${
                wonder ? 
                `<div class="my-2">Wonder: ${ wonder.value }</div>` :
                ''
            }
        </div>
          </div>
      </div>
    </body>`;
  
  
    return `
    <!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta http-equiv="X-UA-Compatible" content="ie=edge" />
              <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=EB+Garamond&display=swap');
                body {
                  font-family: 'EB Garamond', serif;
                  width: 800px;
                }
                img {
                  width: 800px;
                  height: 800px;
                }
              </style>
          </head>
          ${body}
      </html>`;
  };