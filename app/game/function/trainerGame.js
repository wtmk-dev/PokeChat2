//const pokemonData = require('pokemongo-json-pokedex/output/pokemon.json')

const fs = require('fs')

let pokemonJson = require("../data/pokechatEncounters.json")
let encounterRank = 0
let adventureLobyTimer = 60000
let adventureTimer = 60000
let encoutnerStepTimer = 10000

const run = (channel, client, server) =>
{
    setTimeout(() => 
    {
        console.log("Start Adventure Lobby")
        startAdventrueLobby(channel, client, server)
    }, adventureTimer)
}

const startAdventrueLobby = (channel, client, server) =>
{
    server.clearTrainersOnAdventure()
    client.say(channel,
        "ATTENTION PokeChat Trainers " +
        "an adventrue will start in the next 60 seconds " +
        "enter $j to Join the adventer $pkm to create a trainer"
    )

    setTimeout(() =>
    {
        console.log("Starting adventure...")
        //startAdventrue(channel, client, server)
    },adventureTimer)
}

const startAdventrue = (channel, client, server) =>
{
    let numberOfTrainers = server.getTrainerToAdventure().length
    client.say(channel,
        `ATTENTION PokeChat Trainers. 
         Adventrue starting in ${zone}, 
         with ${numberOfTrainers}`
    )

    setTimeout(()=>
    {
        startEncounter(channel, client, server)
    },encoutnerStepTimer)
}

const startEncounter = (channel, client, server) =>
{
    let type = getEncounterType()
    console.log(type)
    client.say(channel,
        `encounter not emplemented ${type}`)
}

const encounterPokemon = (channel, client, server) =>
{
    client.say(channel, "PKM Trainers!")
}

const encounters = 
{
    1 : "l",
    2 : "m",
    3 : "s",
    4 : "b",
    5 : "p",
    6 : "p"
}

const encMedbag =
{
    1 : "calcium",
    2 : "carbos",
    3 : "iron",
    4 : "hp-up",
    5 : "protein",
    6 : "zinc"
}

const enc150 =
{
   1 : "",
   2 : "",
   3 : "",
   4 : "",
   5 : "",
   6 : ""
}

const enc200 =
{
   1 : "coin",
   2 : "soda",
   3 : "tt",
   4 : "xp",
   5 : "xp",
   6 : "legend"
}

const enciv =
{
    1: "sa" ,   
    2: "speed" ,
    3: "defense" ,
    4: "hp" ,
    5: "attack",
    6: "sd" 
}

const boost =
{
    1: 1,   
    2: 2,
    3: 3,
    4: 4,
    5: 6,
    6: 9,
    7: 12,
    8: 15,
    9: 18 
}

const min = 1
const max = 386

const random = (die) => {return Math.ceil(Math.random()*die) }

const getEncounterType = () => {
    const roll = random(6)
    const type = encounters[roll]

    return type;
}

const getIvBoost = () => {
    const roll = random(6)
    const type = enciv[roll]

    const bRoll = random(6)
    const boostAm = boost[bRoll]

    const iv =
    {
        "type" : type,
        "boost" : boostAm
    }

    return iv;
}

const getExtraEncounter = () => {

    const extraEncounters = 
    {
        "med" : "",
        "150" : "",
        "200" : "",
    }
    
    const mr = random(6)
    const med = encMedbag[mr]

    const rof = random(6)
    const rank150 = enc150[rof]

    const rth = random(6)
    const rank200 = enc200[6]

    extraEncounters["med"] = med;
    extraEncounters["150"] = rank150;
    extraEncounters["200"] = rank200;

    return extraEncounters;
}

const getEncounterOutcome = (type, pkm) =>
{
    const outcome = 
    {
        type : type,
        pkm: [],
        rank: 0.001,
        coin: 1,
        pkBalls: 0
    }

    if(type == 'p')
    {
        outcome.pkm.push(pkm)
    }else if (type == 'b')
    {
        outcome.pkBalls++;
    }else if (type == 's')
    {
        outcome.coin += 1
    }else if (type == 'm')
    {
        outcome.coin += 3
    }else if (type == 'l')
    {
        outcome.coin += 5
    }

    return outcome
}

const addToPool = (pool, pkm, ammount) => 
{
    let max = pkm.length

    for(let i = 0; i < ammount; i++)
    {
        pool.push(pkm[Math.floor(random(max -1))]);
    }
}

const getPkm = (reward, rank) =>
{
    let roll = random(10)
    let bonus = Math.floor(rank)

    console.log(roll)
    
    const encounterRolls = 
    {
        legendRolls : 0 ,
        easyRolls : 0,
        mediumRolls : 0,
        hardRolls : 0
    }
    
    if(roll == 10)
    {
        encounterRolls.legendRolls += 1  
        encounterRolls.hardRolls += 3 
        encounterRolls.mediumRolls += 3 
        encounterRolls.easyRolls += 3
        
        encounterRolls.legendRolls += bonus

    } else if(roll >= 7) 
    {
        encounterRolls.hardRolls += 9 
        encounterRolls.mediumRolls += 6
        encounterRolls.easyRolls += 3  

        encounterRolls.hardRolls += bonus

    } else if(roll >= 4)
    {
        encounterRolls.hardRolls += 3 
        encounterRolls.mediumRolls += 9
        encounterRolls.easyRolls += 6 
        
        encounterRolls.mediumRolls += bonus
    } else if(roll >= 1)
    {
        encounterRolls.hardRolls += 3
        encounterRolls.mediumRolls += 6
        encounterRolls.easyRolls += 9

        encounterRolls.easyRolls += bonus
    }

    let pkms = [ ]

    addToPool(pkms,pokemonJson.legendary.medium,encounterRolls.legendRolls)

    if(reward == 'tall grass')
    {
        addToPool(pkms,pokemonJson.tallgrass.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.tallgrass.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.tallgrass.hard,encounterRolls.hardRolls)
    } else if(reward == 'surf zone')
    {
        addToPool(pkms,pokemonJson.surfzone.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.surfzone.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.surfzone.hard,encounterRolls.hardRolls)
    } else if(reward == 'dark cave')
    {
        addToPool(pkms,pokemonJson.darkcave.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.darkcave.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.darkcave.hard,encounterRolls.hardRolls)
    }else if(reward == 'sky zone')
    {
        addToPool(pkms,pokemonJson.skyzone.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.skyzone.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.skyzone.hard,encounterRolls.hardRolls)
    }

    let mons = pkms.length
    let pkm  = pkms[random(mons-1)]
    console.log(pokemonData)
    return pkm//pokemonData.getPokemonByName(pkm)
}

const getEvolved = (pkm) =>
{
    for(let i = 0; i < pokemonData.length; i++)
    {
        if(pokemonData[i].name.toLowerCase() == pkm.toLowerCase())
        {
            return pokemonData[i].evolution
        }
    }
}

const getEncounter = (reward, rank) => {
    const type = getEncounterType()
    const results = getEncounterOutcome(type)

    if(type == 'p')
    {
        let pkm = getPkm(reward, rank, results)
        console.log(pkm)
        results.pkm[0] = pkm
    }

    return results; 
}

const test = (pulls) => {
    let count = pulls
    do{
        const enc = tallGrass();
        console.dir(enc)
        count--
    }while(count > 0)

    console.log('done')
}

const loadPokemonData = () =>
{
    fs.readFile(__dirname + '/data/pokechatEncounters.json', (err, data) => {

        if (err) {
          throw err; 
        }
    
        const savedData = data.toString()
        pokemonJson = JSON.parse(savedData)
    })

}

/////////////////////////////////////////////////
//Catch
////////////////////////////////////////////////
const tossBall = (pkm) => {
    let roll = Math.random()
    let capturedText = ""
    let captured = false
    let shake = false
    if(roll < 0.5)
    {
        capturedText += "MISS... PJSalt"
    } else if(roll < 0.7)
    {
        captured = true;
        capturedText += "1... 2... *CLICK* PowerUpL"
    } else {
        shake = true
        capturedText += "1... 2... *SHAKE* NotLikeThis"
    }
    
    const results = {
        captured : captured,
        text: capturedText
    }
    
    return results;
}

const passReward = (rank) => {
    const reward = {
        coin: 0,
        pkBalls: 0,
        rank: 0.1,
    }

    let roll = random(6)
    let type  = encounters[roll]

    if(type == 'p')
    {
        reward.pkBalls += 2 
    }else if (type == 'b')
    {
        reward.pkBalls++;
    }else if (type == 's')
    {
        reward.coin += 1
    }else if (type == 'm')
    {
        reward.coin += 3
    }else if (type == 'l')
    {
        reward.coin += 5
    }

    return reward
}

//loadPokemonData()

module.exports = 
{
    tallGrass : ()=>{return tallGrass() },
    tossBall: ()=>{return tossBall() },
    getPassReward: ()=>{return passReward()},
    getEncounter: (reward, rank) =>{return getEncounter(reward, rank)},
    getExtraEncounter: (reward, rank) =>{return getExtraEncounter(reward, rank)},
    getEvolved: (pkm) => {return getEvolved(pkm)},
    getIvBoost: () => {return getIvBoost()},
    random: (die) => {return random(die)},
    run : (channel, client, server) => {return run(channel, client, server)}
}