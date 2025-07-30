const fs = require('fs')

let pokemonJson = require("../data/pokechatEncounters.json")
const { channel } = require('diagnostics_channel')

let adventureTimerMin = 90000
let adventureTimerMax = 160000

let adventureTimer = 60000

let adventureTimerStep = 60000
let encountersCompletedTime = 100

const run = (channel, client, server) =>
{
    adventureTimer = server.getRandomInt(adventureTimerMin, adventureTimerMax)
    
    setTimeout(() => 
    {
        console.log("award encounter token")

        //server.setAdventureState(server.adventureStateQueuing)
        awardEncounterTokens(channel, client, server)
    }, adventureTimer)
}

const awardEncounterTokens = (channel, client, server) =>
{
    let trainers = server.getTrainersOnAdventure()
    let time = 5000

    client.say(channel,
            `Type $pkm to join PokeChat! 
            TwitchLit ALL joined trainers gained an encounter token!`)

    for(const [key, value] of trainers)
    {
        value.tradeToken++
        /*time + 1000

        setTimeout(() => 
        {
            client.say(channel,
            `@${value.username} gained an Encounter token`)
        }, time)
        */
    }

    setTimeout(() => 
    {
//        client.say(channel,
//        `Type $t, $d, $w or $s to start an encounter`)
        run(channel, client, server)
        server.save()
    }, time)

}

const voteOnZone = (channel, client, server) =>
{
    client.say(channel,
        `Adventrue starting soon. Please vote for what zone the the 
        adventrue will take place in. $s for Sky, $d for Dark Cave,
        $t for Tall Grass, $w for Water.... anyone in chat can vote`
    )

    setTimeout(() =>
    {
        console.log("start adventrue lobby")
        startAdventrueLobby(channel, client, server)
    }, adventureTimerStep)
}

const startAdventrueLobby = (channel, client, server) =>
{
    server.clearTrainersOnAdventure()

    client.say(channel,
        `ATTENTION PokeChat Trainers!!
        An ADVENTURE is starting soon...
        enter $j to Join the adventer $pkm to create a trainer`
    )

    setTimeout(() =>
    {
        console.log("start adventure")
        let numberOfTrainers = server.getTrainersOnAdventure().size

        if(numberOfTrainers > 0)
        {
            startAdventrue(channel, client, server)
        }else
        {
            let zone = server.getZone()[0]
            server.setAdventureState(server.adventureStateNone)
            client.say(channel,
            `No trainers joined adventure`
            )

            run(channel, client, server)
        }

    },adventureTimerStep)
}

const startAdventrue = (channel, client, server) =>
{
    let numberOfTrainers = server.getTrainersOnAdventure().size
    let ts = "trainer"

    if(numberOfTrainers > 1)
    {
        ts += "s"
    }

    let adventrueRank = server.getAdventureRank()
    let zone = server.getZone()[0]
    let balls = server.awardTrainersBalls(adventrueRank)

    server.setAdventureState(server.adventureStateRunning)

    client.say(channel,
        `ATTENTION PokeChat Trainers. 
         RANK ${adventrueRank} Adventrue is starting
         in ${zone} with ${numberOfTrainers} ${ts}`
    )

    client.say(channel, 
        `all trainers on adventure will recieve ${balls} PokeBalls`
    )

    setTimeout(()=>
    {
        console.log("Prep Adventure")
        adventurePrep(channel, client, server, adventrueRank, zone)
    }, adventureTimerStep / 4)
}

const adventurePrep = (channel, client, server, adventrueRank, adventureZone) =>
{
    let trainers = server.getTrainersOnAdventure()
    let timeMod = 5000

    for(const [key, value] of trainers)
    {
        timeMod += timeMod

        setTimeout(()=>
        {
            console.log(`resolve encounter for trainer ${value.username}`)
            let encounter = getEncounter(adventureZone, adventrueRank)
            let result = `@${value.username}`

            if(encounter.rank > 0)
            {
                result += ` You gained ${encounter.rank} Rank`
                value.rank += encounter.rank
            }

            if(encounter.coin > 0)
            {
                result += ` You gained ${encounter.coin} Coin`
                value.coin += encounter.coin
            }

            if(encounter.pkBalls > 0)
            {
                result += ` You gained ${encounter.pkBalls} PokeBalls`
                value.pkBalls += encounter.pkBalls
            }

            client.say(channel, result)

            if(encounter.pkm.length > 0)
            {
                if(value.encounter != "")
                {

                }
                else
                {
                    result = `@${value.username} You encountered a wild ${encounter.pkm[0]} Type $toss/$catch to use a PokeBall - Type $pass to run`
                    value.encounter = encounter.pkm[0]

                    client.say(channel, result)
                }
            }

            server.save()
            
        }, adventureTimerStep + timeMod / 4)
    }

    setTimeout(()=>
    {
        client.say(channel, `Congratz you completed an adventure!`)
        server.setAdventureState(server.adventureStateNone)
        run(channel, client, server)
    }, adventureTimerStep + timeMod)
}

const doEncounter = (client, channel, server, trainer, status) =>
{
    setTimeout(()=>
    {
        console.log(`resolve encounter for trainer ${trainer.username}`)

        let encounter = getEncounter(status.zone, trainer.rank)
        let result = `@${trainer.username}`

        if(encounter.rank > 0)
        {
            result += ` You gained ${encounter.rank} Rank`
            trainer.rank += encounter.rank
        }

        if(encounter.coin > 0)
        {
            result += ` You gained ${encounter.coin} Coin`
            trainer.coin += encounter.coin
        }

        if(encounter.pkBalls > 0)
        {
            result += ` You gained ${encounter.pkBalls} PokeBalls`
            trainer.pkBalls += encounter.pkBalls
        }

        client.say(channel, result)

        if(encounter.pkm.length > 0)
        {
            if(trainer.encounter != "")
            {
                console.log(`${trainer.username} Already in encounter`)
            }
            else
            {
                result = `@${trainer.username} You encountered a wild ${encounter.pkm[0]} Type $toss/$catch to use a PokeBall - Type $pass to run`
                trainer.encounter = encounter.pkm[0]

                client.say(channel, result)
            }
        }

        //trainer.exoloreState = 0
        server.save()
        
    }, encountersCompletedTime)
    
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

const getPkm = (zone, rank) =>
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

    if(zone == "Tall Grass")
    {
        addToPool(pkms,pokemonJson.tallgrass.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.tallgrass.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.tallgrass.hard,encounterRolls.hardRolls)
    } else if(zone == "Water")
    {
        addToPool(pkms,pokemonJson.surfzone.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.surfzone.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.surfzone.hard,encounterRolls.hardRolls)
    } else if(zone == "Dark Cave")
    {
        addToPool(pkms,pokemonJson.darkcave.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.darkcave.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.darkcave.hard,encounterRolls.hardRolls)
    }else if(zone == "Sky")
    {
        addToPool(pkms,pokemonJson.skyzone.easy,encounterRolls.easyRolls)
        addToPool(pkms,pokemonJson.skyzone.medium,encounterRolls.mediumRolls)
        addToPool(pkms,pokemonJson.skyzone.hard,encounterRolls.hardRolls)
    }

    let mons = pkms.length
    let pkm  = pkms[random(mons-1)]
    //console.log(pokemonData)
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
const tossBall = () => {
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
        text: capturedText,
        shake: shake
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
    run : (channel, client, server) => {return run(channel, client, server)},
    doEncounter : doEncounter
}