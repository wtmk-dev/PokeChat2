//const server = require('../../backend/server.js')
let server
let client
let view
const game = require('./trainerGame.js')
const fs = require('fs')
//const tmi = require(`tmi.js`)

const CHANNEL = 'aftereartharcade'
const REGION_AMOUNT = 3
const pkballcost = 9
const tradetokencost = 18
const evosodacost = 100
const medbagcost  = 200

const TRAINING_RANK = 100
const medbagRank = 50
const evoRank = 24
const tradeRank = 12
const transferRank = 8

const creationStates = {"type":1, "pkm":2, "getPkm":3,"done":4}
Object.freeze(creationStates)

const startingPokemon  = 
{
    0 : ['BULBASAUR','CHARMANDER','SQUIRTLE'],
    1 : ['CYNDAQUIL','CHIKORITA','TOTODILE'],
    2 : ['TORCHIC','MUDKIP','TREECKO']
}

const startingItems = ['XATTACK','XSPATK','DIREHIT','HYPERPOTION']

const medToStat = 
{
    "calcium"   : "sa",    
    "carbos"    : "speed",
    "iron"      : "defense",
    "hp-up"     : "hp",
    "protein"   : "attack", 
    "zinc"      : "sd"
}

/*
============================
functions
============================
*/


const offerTrainerCreation = (follower, channel) => {
    client.say(channel, `@${follower.username}, Would you like to make a Trainer!?\nTo select OPTION 1 type $1\nor\nTo select OPTION 2 type $2`);
}


const handelCreationStepType = (follower, choice, channel) =>
{
    follower.type = choice
    follower.creationState = creationStates.pkm
    choosePokemon(follower, channel)
}


const handelCreationStepPkm = (follower, choice, channel) =>
{
    const key = choice-- //off by 1 for yourPkm index
    const region = follower.regionNumber
    const startingPkm = startingPokemon[region]
    const yourPkm = startingPkm[choice]
    const startingBattleItem = rollForBattleItem()

    follower.creationState = creationStates.done; // allow for name 
    follower.pkm.push(yourPkm)
    follower.items.push(startingBattleItem)

    client.say(channel, `MorphinTime ... Welcome to the acrade ${follower.username} PowerUpL \nType $pkm to see your stats!`)

    server.trainers[follower.username] = follower
    
    server.saveTrainers()
}


const rollForRegion = () =>{
    return regionRoll = Math.floor(Math.random() * REGION_AMOUNT);
}


const rollForBattleItem = () =>
{
    const roll =  Math.floor(Math.random() * startingItems.length)
    return battleItem = startingItems[roll]
}


const choosePokemon = (follower, channel) =>
{
    const regionNumber = rollForRegion()
    const pkmChoice = startingPokemon[regionNumber]
    follower.regionNumber = regionNumber

    client.say(channel, `@${follower.username},You may choose a starting pokemon!\nTo choose ${pkmChoice[0]} type $1\nTo choose ${pkmChoice[1]} type $2\nTo choose ${pkmChoice[2]} type $3`)
}


const exitCatching = (trainer) => {
    trainer.enc = []
    trainer.rank += .3
    server.saveTrainers();
    client.say(CHANNEL, `${trainer.username} you have no PKBalls, your Rank is now ${Math.floor(trainer.rank)}`)
}


const successfulCapture = (trainer) => {
    pkm = trainer.enc[0];
    trainer.enc = [ ]
    if(trainer.pkm.length < 6)
    {
        trainer.pkm.push(pkm.toUpperCase())
        client.say(CHANNEL, `${trainer.username} YOU CAPTURED ${pkm.toUpperCase()} GlitchLit`)
        
        //cut scean
    } else {
        trainer.box.push(pkm.toUpperCase())
        client.say(CHANNEL, `${trainer.username} YOU CAPTURED ${pkm.toUpperCase()} GlitchLit!! SENT TO BOX!`)
    }
}


const failedCapture = (trainer) => {
    if(trainer.pkBalls > 0)
    {
        client.say(CHANNEL, `${trainer.username} type $toss/$catch to throw a PKBall!`)
    } else {

       if(trainer.enc != undefined && trainer.enc.length > 0)
       {
            pkm = trainer.enc[0];
            client.say(CHANNEL, `${trainer.username} Looks like ${pkm} got away SirSad`);
            trainer.enc = [ ]
       }
    
    }
}


const transfer = (trainer, client, channel, args) =>
{
    try
    {
        let transfer = args

        let party = transfer[0]
        let box   = transfer[1]
        
        let hasParty
        let hasBox

        trainer.pkm.forEach((mon)=>{
            if(mon.toLowerCase() == party.toLowerCase())
            {
                hasParty = true
            }
        })

        trainer.box.forEach((mon)=>{
            if(mon.toLowerCase() == box.toLowerCase())
            {
                hasBox = true
            }
        })

        if(hasParty && hasBox)
        {

            let partyIndex = trainer.pkm.indexOf(party.toUpperCase())
            let boxIndex   = trainer.box.indexOf(box.toUpperCase())

            trainer.pkm.splice(partyIndex, 1)
            trainer.box.splice(boxIndex, 1)

            trainer.pkm.push(box.toUpperCase())
            trainer.box.push(party.toUpperCase())

            client.say(channel,`${trainer.username} has exchanged ${party} with ${box}!`)
        }
    }catch {
        client.say(channel,`type $transfer pkmInParty pkmInBox`)
    }
    
}

const train = (trainer, client, channel, args) =>
{
    try
    {
        const send = args[0]
        const hasBox = hasPKMInBox(trainer, send)

        if(hasBox)
        {
            let boxIndex   = trainer.box.indexOf(send.toUpperCase())
            trainer.box.splice(boxIndex, 1)

            const hasTG = getTGPKM(trainer, send)

            if(hasTG.tag != undefined)
            {
                const boost = game.getIvBoost();
                const pkmInGround = getPKMInTG(trainer,send);

                pkmInGround.iv[boost.type] += boost.boost;
                
                if(pkmInGround.iv[boost.type] > pkmInGround.iv.cap)
                {
                    pkmInGround.iv[boost.type] = pkmInGround.iv.cap;
                    client.say(channel,`${send} IV CAPPED!`)
                    return;
                }

                client.say(channel,`${send} gained IV ${boost.type}!`)
                
            }else 
            {
                const pkm = 
                {
                    tag : send,
                    ev : 
                    {
                        "sa" : 0,    
                        "speed" : 0,
                        "defense" : 0,
                        "hp" : 0,
                        "attack": 0,
                        "sd" : 0
                    },
                    iv :
                    {
                        "cap": 31,
                        "sa" : 0,    
                        "speed" : 0,
                        "defense" : 0,
                        "hp" : 0,
                        "attack": 0,
                        "sd" : 0
                    },
                    Item : "",
                    Moves : "",
                    Ability : "",
                    Gender : "",
                    Shiny : false,
                    Nature : "",
                    Happiness : "",
                    Name : "",
                    Ball : ""
                }

                if(send.includes('*'))
                {
                    pkm.Shiny = true
                }

                trainer.grounds.push(pkm)
                client.say(channel,`${trainer.username} has sent ${send} to their Traning Grounds!`)

                server.saveTrainers()
            }
        }else { client.say(channel,`pkm must be in your box to train`) }
    }catch(e) {
        console.log(e)
        client.say(channel,`type $train pkmInBox`)
    }
    
}

const hasPKMInBox = (trainer, send) =>
{
    let has = false
    trainer.box.forEach((mon)=>{
        if(mon.toLowerCase() == send.toLowerCase())
        {
            has = true
        }
    })

    return has
}

const hasPKMInParty = (trainer, send) =>
{
    let has = false
    trainer.pkm.forEach((mon)=>{
        if(mon.toLowerCase() == send.toLowerCase())
        {
            has = true
        }
    })

    return has
}

const getTGPKM = (trainer, send) =>
{
    let pkm = { }
    trainer.grounds.forEach((mon)=>{
        if(mon.tag.toLowerCase() == send.toLowerCase())
        {
            pkm = mon
        }
    })

    return pkm
}

const getPKMInTG = (trainer, send) =>
{
    for(let i = 0; i < trainer.grounds.length; i++)
    {
        let name = trainer.grounds[i].tag.toLowerCase();

        if(name == send.toLowerCase()) 
        {
            console.log("found " + name)
            console.dir(trainer.grounds[i])
            return trainer.grounds[i]
        }
    }
}

const hasMedInBag = (trainer, med) => 
{ 
    const medCount = trainer.medbag[med]

    if(medCount > 0)
    {
        return true
    }

    return false
}

const trade = (trainer, client, channel, args) =>
{
    try{
        trainer.isInTrade = true

        if(trainer.tt <= 0)
        {
            client.say(CHANNEL, `${trainer.username} Not enough Trade Tokens. $tt`)
            trainer.isInTrade = false
            return
        }

        const transfer = args

        const user    = transfer[0].toLowerCase()
        const send    = transfer[1]
        const receive = transfer[2]

        const trader = server.trainers[user]

        if(trader.isInTrade == undefined || !trader.isInTrade)
        {
            trader.isInTrade = true
        }else if(trader.isInTrade)
        {
            client.say(CHANNEL, `${trader.username} its already in a trade. Please try again later.`)
            trainer.isInTrade = false
            return
        }
        
        let hasSend = hasPKMInBox(trainer, send)
        let hasReceive = hasPKMInBox(trader, receive)

        if(hasSend && hasReceive)
        {
            trader.pendingTrade = 
            {
                trainer : trainer.username,
                send: send,
                receive: receive
            }

            client.whisper(user,`Pokechat trainer ${trainer.username} wants to trade their ${send.toUpperCase()} for your ${receive.toUpperCase()}. 
                        type $accept to take the trade. once accepted it can't be undone. or $decline to stop the trade`)
        }else{

            trainer.isInTrade = false
            trader.isInTrade = false
            trader.pendingTrade  = null

            client.say(CHANNEL, `${trainer.username} invalid trade`)
            client.say(CHANNEL, `${trader.username} X ${trainer.username} TRADE CANCLED!`)
            return
        }
    }catch(e){
        console.log(e)
        trainer.isInTrade = false
        client.say(CHANNEL, `To trade type $trade username yourpkm theirpkm`)
    }    
}

const acceptTrade = (trainer,client,channel) =>
{
    try
    {
        let pendingTrade = trainer.pendingTrade

        let trader = server.trainers[pendingTrade.trainer]
    
        let sendIndex      = trainer.box.indexOf(pendingTrade.receive.toUpperCase())
        let receiveIndex   = trader.box.indexOf(pendingTrade.send.toUpperCase())

        if(sendIndex == -1 || receiveIndex == -1)
        {
            if(sendIndex == -1)
            {
                client.say(channel, `${trainer.username} ${pendingTrade.send.toUpperCase()} pkm are not in you box `)
            }

            if(receiveIndex == -1)
            {
                client.say(channel,  `${trader.username} ${pendingTrade.receive.toUpperCase()} pkm are not in you box `)
            }

            return
        }

        trader.tt--

        trainer.box.splice(sendIndex, 1)
        trader.box.splice(receiveIndex, 1)

        trainer.box.push(pendingTrade.send.toUpperCase())
        trader.box.push(pendingTrade.receive.toUpperCase())

        server.saveTrainers()

        client.say(channel,` ${trader.username} GivePLZ ${pendingTrade.send} TwitchUnity ${pendingTrade.receive} TakeNRG ${trainer.username}`)

        trainer.isInTrade = false
        trader.isInTrade = false
        
        trainer.pendingTrade = null        
    }catch(error){
        console.log(error)
        client.say(channel,`${trainer.username} BOP you do not have a pending trade...`)
    }
}

const declineTrade = (trainer,client,channel) =>
{
    try{
        
        let pendingTrade = trainer.pendingTrade
        let trader = server.trainers[pendingTrade.trainer]

        trainer.isInTrade = false
        trader.isInTrade = false
        trainer.pendingTrade = null
        
        client.say(channel,`${trainer.username} has declined ${trader.username}'s trade request`)
    } catch(error) {
        console.log(error)
        client.say(channel,`${trainer.username} BOP you do not have a pending trade...`)
    }
}

const processEvolve = (trainer,pre,post) =>
{
    trainer.evo--

    const evoIndex = trainer.pkm.indexOf(pre.toUpperCase())
    trainer.pkm.splice(evoIndex, 1)
    trainer.pkm.push(post.toUpperCase())
}

const evolve = (trainer, client, channel, args) =>
{
    try
    {
        const pkm = args

        const isInParty = hasPKMInParty(trainer,pkm[0])

        if(!isInParty)
        {
            client.say(channel,`${trainer.username} ${pkm[0].toUpperCase()} must be in your party`)
            return
        }

        const data = game.getEvolved(pkm[0])

        if(data.futureBranches == undefined)
        {
            client.say(channel,`${trainer.username} ${pkm[0].toUpperCase()} does not evolve...`)
        }else if(data.futureBranches.length > 1)
        {
            const choice = pkm[1]
            const choices = [ ]

            for(let branch = 0; branch < data.futureBranches.length; branch++)
            {
                choices.push(data.futureBranches[branch].name.toLowerCase())
            }

            if(choice == undefined)
            {
                let chose = "choices "

                choices.forEach(c=>{
                    chose += `[${c.toUpperCase()}] MorphinTime `
                })
                 
                client.say(channel,`${trainer.username} ${pkm[0].toUpperCase()} has more than one evoltion`)
                client.say(channel,`${trainer.username} ${chose}`)
                client.say(channel,`${trainer.username} to selecte type $evo ${pkm[0]} choice ex ($evo ${pkm[0]}>${choices[0]})`)
            }else
            {
                choice.toLowerCase()
                console.log(choice)

                const can = choices.includes(choice)
                if(can)
                {
                    processEvolve(trainer,pkm[0],choice)
                    
                    server.saveTrainers()
                    client.say(channel,`${trainer.username} PogChamp ${pkm[0].toUpperCase()} MorphinTime ${choice.toUpperCase()} GlitchCat`)
                }else{ client.say(channel,`${trainer.username} ${pkm[0]} does not evolve to ${choice}`) }
            }

        }else if(data.futureBranches.length == 1)
        {
            const nextStage = data.futureBranches[0].name
            processEvolve(trainer,pkm[0],nextStage)

            server.saveTrainers()
            client.say(channel,`${trainer.username} PogChamp ${pkm[0].toUpperCase()} MorphinTime ${nextStage.toUpperCase()} GlitchCat`)
        }

        console.dir(data)
    }catch(e)
    {
        console.log(e)
        client.say(channel,`${trainer.username} Evolution failed...`);
    }
}

const feed = (trainer, client, channel, args) =>
{
    try
    {
        const pkm = args
        const argmin = 3

        if(pkm.length < argmin)
        {
            client.say(channel,`${trainer.username} type $feed pkm med number to feed ex : ($feed mew hp-up 9)`)
            return
        }

        const isInTg = getTGPKM(trainer,pkm[0])

        if(isInTg.tag == undefined)
        {
            client.say(channel,`${trainer.username} ${pkm[0].toUpperCase()} must be in your Training Ground`)
            return
        }

        const isMedInBag = hasMedInBag(trainer,pkm[1])

        if(!isMedInBag)
        {
            client.say(channel,`${trainer.username} ${pkm[0].toUpperCase()} must have med to feed`)
            return
        }

        let feedAmount = pkm[2]
        while(feedAmount > 0)
        {
            let med = trainer.medbag[pkm[1]]--
            feedAmount--

            if(med <= 0)
            {
                med = 0;
                client.say(channel,`${trainer.username} all boosts used`);
                break;
            }
        
            isInTg.ev[ medToStat[ pkm[1].toLowerCase() ] ]++
            client.say(channel,`${isInTg.tag} grows more powerful!`);
        }

        server.saveTrainers()
        
    }catch(e)
    {
        console.log(e)
        client.say(channel,`${trainer.username} feed failed...`);
    }
}

const createTrainer = () =>
{
    const trainer = 
    {
        creationState : creationStates["type"],
        regionNumber : -1, // does not have a region set
        username: username,
        type: -1, // not selected
        pkm: [],
        items: [],
        rank: 0,
        coin: 0,
        tt: 0, //trade
        evo: 0,
        xp: 0,
        pkBalls: 3,
        box: [ ],
        grounds: [ ],
        gym: [ ],
        isInTrade: false,
        hasMedBag: false,
        hasTrainingGrounds: false,
        hasGymBadge: false,
        medbag: { }
    }

    server.trainers[username] = trainer

    if(!username == CHANNEL)
    {
        server.followers[username].isTrainer = true;
    }
    
    offerTrainerCreation(trainer, channel)
}

const cmdPKM = (command) =>
{

}

const help = () =>
{
    client.say(CHANNEL, `PopCorn Use channle points to encounter pkm! $mart to buy pkBalls you will need 10 coins! TehePelo glhf`)
}

const respondToTrainerCommand = (command, username, channel, args) =>
{
    const isTrainer =  (username in server.trainers);
    const trainer = server.trainers[username]

    if(command === 'pkm'){
    
        if(!isTrainer)
        {
            createTrainer();
        } else if(isTrainer && trainer.creationState == creationStates.done)
        {
            let pkm = ""
            let items = ""

            trainer.pkm.forEach( p => {
                pkm += `[${p}] MorphinTime ` 
            })

            trainer.items.forEach( i => {
                items += `[${i}]`
            })

            client.say(channel, `PowerUpL ${trainer.username} PowerUpR PKM Team: ${pkm} Battle Items: ${items}, PKBalls: ${trainer.pkBalls} TheIlluminati : ${trainer.coin} TradeTokens : ${trainer.tt} Evosoda : ${trainer.evo} PraiseIt : ${Math.floor(trainer.rank)}`)
        } else {
            if(trainer.creationState == creationStates.type)
            {
                offerTrainerCreation(trainer, channel)
            }
            else if(trainer.creationState == creationStates.pkm)
            {
                const follower = server.followers[trainer.username]
                choosePokemon(follower, channel)
            }
        } 
    }

    if(command === '1'){ //dood 
         
        const choice = 1;

        if(trainer.creationState == creationStates.type)
        {
            handelCreationStepType(trainer, choice, channel)
        }
        else if(trainer.creationState == creationStates.pkm)
        {
            handelCreationStepPkm(trainer, choice, channel)
        }

    }else if(command === '2'){ //dood 
        
        const choice = 2;

        if(trainer.creationState == creationStates.type)
        {
            handelCreationStepType(trainer, choice, channel)
        }
        else if(trainer.creationState == creationStates.pkm)
        {
            handelCreationStepPkm(trainer, choice, channel)
        }
        
    }else if(command === '3'){ //dood 

        const choice = 3;

        if(trainer.creationState == creationStates.pkm)
        {
            handelCreationStepPkm(trainer, choice, channel)
        }

    }else if(command === 'pass')
    {
        if(trainer.enc != undefined && trainer.enc.length > 0)
        {
            trainer.enc = [ ]

            const passReward = game.getPassReward();

            trainer.coin += passReward.coin
            trainer.pkBalls += passReward.pkBalls
            trainer.rank += passReward.rank

            client.say(CHANNEL, `coin: ${passReward.coin}, pkBalls: ${passReward.pkBalls} rank: ${passReward.rank}`)
        }

    }else if(command === 'toss' || command === 'catch')
    {
        if(trainer.enc != undefined && trainer.enc.length > 0)
        {
            if(trainer.pkBalls > 0)
            {
                trainer.pkBalls--
                let tossResults = game.tossBall()
                client.say(CHANNEL, tossResults.text)
                
                if(tossResults.shake)
                {
                    tossResults = game.tossBall()
                    client.say(CHANNEL, tossResults.text)
                }else {
                    if(tossResults.captured)
                    {
                        successfulCapture(trainer)
                    } else {
                        failedCapture(trainer)
                    }
                }
                server.saveTrainers()
               
            }else {
                exitCatching(trainer)
                server.saveTrainers()
            }
        }
    }else if(command === 'mart')
    {
        client.say(CHANNEL, `${trainer.username} TheIlluminati : ${trainer.coin}`)
        client.say(CHANNEL, `$bb PKBall     : ${pkballcost}.
                             $tt TradeToken : ${tradetokencost}.
                             $soda Evosoda  : ${evosodacost}.`)

        if(trainer.rank >= medbagRank && !trainer.hasMedBag)
        {
            client.say(CHANNEL, `$medbag Medbag : ${medbagcost}.`)
        }
        
    }else if(command === 'bb')
    {
        if(trainer.coin >= pkballcost)
        {
            trainer.coin -= pkballcost
            trainer.pkBalls += 1
            server.saveTrainers()

            client.say(CHANNEL, `PKBalls: ${trainer.pkBalls} Coin: ${trainer.coin}`)
        }else {
            client.say(CHANNEL, `PKBalls's cost ${pkballcost}.`)
        }

    }else if(command === 'tt')
    {
        if(trainer.coin >= tradetokencost)
        {
            trainer.coin -= tradetokencost
            trainer.tt += 1
            server.saveTrainers()

            client.say(CHANNEL, `Trade Tokens: ${trainer.tt} Coin: ${trainer.coin}`)
        }else {
            client.say(CHANNEL, `Trade Tokens's cost ${tradetokencost}.`)
        }

    }else if(command === 'soda')
    {
        if(trainer.coin >= evosodacost)
        {
            trainer.coin -= evosodacost
            trainer.evo += 1
            server.saveTrainers()

            client.say(CHANNEL, `Evosoda's cost: ${trainer.evo} TheIlluminati : ${trainer.coin}`)
        }else {
            client.say(CHANNEL, `Evosoda's cost: ${evosodacost}.`)
        }

    }else if(command == 'help')
    {
        help()
    }else if(command == 'transfer')
    {
        if(trainer.rank <= transferRank)
        {
            client.say(channel, `${username} you need to be at least Rank ${transferRank} transfer a PKM. TearGlove`)
            return
        }

        transfer(trainer, client, channel, args)
    }else if(command == 'evo'){

        if(trainer.rank <= evoRank)
        {
            client.say(channel, `${username} you need to be at least Rank ${evoRank} evolove a PKM. TearGlove`)
            return
        }

        if(trainer.evo <= 0)
        {
            client.say(channel, `${username} you need an Evosoda. $soda Kappu`)
            return
        }

        evolve(trainer, client, channel, args)
    }else if(command == 'trade'){
        if(trainer.rank <= tradeRank)
        {
            client.say(channel, `${username} you need to be at least Rank ${tradeRank} to trade. TearGlove`)
            return
        }

        if(trainer.isInTrade)
        {
            client.say(channel, `${trainer.username} must complete their current trade`)
            return
        }

        trade(trainer, client, channel, args)
    }else if(command == 'accept'){
        if(trainer.isInTrade == undefined)
        {
            trainer.isInTrade = false
        }

        if(!trainer.isInTrade)
        {
            return
        }

        acceptTrade(trainer,client,channel)
    }else if(command == 'decline'){
        if(trainer.isInTrade == undefined)
        {
            trainer.isInTrade = false
        }

        if(!trainer.isInTrade)
        {
            return
        }

        declineTrade(trainer,client,channel)
    }else if(command == 'medbag')
    {
        if(trainer.rank <= medbagRank)
        {
            return
        }

        if(trainer.hasMedBag)
        {
            console.dir(trainer.medbag);

            let keys = Object.keys(trainer.medbag)
            let bag  = "Medbag -> "

            keys.forEach( (key) => 
            { 
                bag += ` ${key} : ${trainer.medbag[key]} `
            })

            client.say(channel, `${username}'s ${bag}`)
            return
        }

        if(trainer.coin >= medbagcost && !trainer.hasMedBag)
        {
            trainer.coin -= medbagcost
            trainer.hasMedBag = true
            trainer.medbag = 
            {
                "calcium": 0,
                "carbos": 0,
                "iron": 0,
                "hp-up": 0,
                "protein": 0,
                "zinc": 0
            }
            server.saveTrainers()
            client.say(channel, `${username} has aquired a Medbag. You may now pick up Meds! LUL`)
        }else if (trainer.coin < medbagcost)
        {
            client.say(CHANNEL, `Medbag cost ${medbagcost}.`)
        }
    }else if(command == 'feed')
    {
        if(!trainer.hasMedBag)
        {
            client.say(channel, 'visit the $mart to buy a Medbag first.')
            return
        }

        if(trainer.rank < TRAINING_RANK)
        {
            client.say(channel,`You need to be rank ${TRAINING_RANK} to feed...`);
            return
        }

        if(!trainer.hasTrainingGrounds)
        {
            client.say(channel,`Congrats!! ${trainer.username} your power grows!`);
            client.say(channel,`${trainer.username} has unlocked the Training Ground!`);
            client.say(channel,`You can now move pkm into your Training Ground.`);
            client.say(channel,`type $train pkmInBox ex($train pichu)`);
            client.say(channel,`When a pkm is transfered to the Training Ground it may never be taken out`);
            client.say(channel,`you can only have one of each pkm. but if your transfer one that is already in your Training Ground something good may happen`);
            client.say(channel,`....thats what they all say LUL`);
            trainer.hasTrainingGrounds = true;

            trainer.grounds = [ ]
            server.saveTrainers();
            return
        }

        feed(trainer, client, channel, args)
    }else if(command == 'train')
    {
        if(!trainer.hasTrainingGrounds)
        {
            client.say(channel, `${username} $feed to unlock your Training Grounds`)
            return
        }

        train(trainer, client, channel, args)
    }
    else { console.log(`no cmd ${command}`) }
}


//=====================================================================
//CLIENT CONNECTING
//=====================================================================
const main = (ser, cli, view) => {
    server = ser
    client = cli.Client
    view = p5
    
    client.on('message', (channel, tags, message, self) =>{
        console.log(`${tags['display-name']}: ${message}`)

        if(self || !message.startsWith('$')) {
            return;
        }

        const args    = message.slice(1).split(' ')
        const command = args.shift().toLowerCase()
        const username    = tags.username

        respondToTrainerCommand(command, username, CHANNEL, args)
    });

    server.saveTrainers()
}


//=====================================================================
//CLIENT
//=====================================================================


module.exports = {
    main : (server, client) => { return main(server, client) },
}