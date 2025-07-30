const struct = require('../data/struct')

const startingPokemon  = 
{
    0 : ['BULBASAUR','CHARMANDER','SQUIRTLE'],
    1 : ['CYNDAQUIL','CHIKORITA','TOTODILE'],
    2 : ['TORCHIC','MUDKIP','TREECKO']
}

const pickRegionState = 1
const createStateComplete = 2

const respondToTrainerCommand = (command, username, channel, server, client, args, game) =>
{
    let isTrainer = server.has(username)
    let trainer

    if(!isTrainer)
    {
        handelCreationState(command, username, channel, server, client, args)
    }
    else 
    {
        trainer = server.getTrainer(username)

//        console.log(trainer.creationState)
//        console.log(command)

        if(trainer.creationState === pickRegionState)
        {
            let kanto = "1"
            let johto = "2"
            let hoenn = "3"

            if(command === kanto || command === johto || command === hoenn)
            {
                setRegion(command, trainer, channel, server, client, args)
            }else
            {
                pickRegion(trainer, channel, client, args)
            }
        }
        else if(trainer.creationState === createStateComplete)
        {
            console.log(command + " in creationState")
            
            if(command === struct.createTrainerCommand)
            {
                let status = server.addTrainerToAdventure(trainer)
                handelShowStats(command, trainer, channel, server, client, args)

                if(status != "")
                {
                    client.say(channel, status)
                }
            }
            else if(command === struct.joinAdventrueCommand)
            {
                let status = server.addTrainerToAdventure(trainer)

                client.say(channel, 
                    `@${trainer.username} ${status}`)
            }
            else if(server.isVoteCommand(command))
            {
                let status = server.exploreZone(trainer, command)

                client.say(channel, 
                    `@${trainer.username} ${status}`)
            }
            else if(command === struct.martCommand)
            {
                let martText = server.getMart()
                client.say(channel, 
                    `${martText}`
                )
            }
            else if(command === struct.buyBallCommand)
            {
                let ballText = server.buyBall(trainer)
                client.say(channel,
                    `${ballText}`
                )
            }
            else if(command === struct.buyFlexCommand)
            {
                let flexText = server.buyFlex(trainer)
                client.say(channel,
                    `${flexText}`
                )
            }
            else if(command === "toss" || command === "catch")
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

        }
    }
}

//const h

const handelShowStats = (command, trainer, channel, server, client, args) =>
{
    let total = trainer.party.length
    let result = `MorphinTime @${trainer.username} MorphinTime  
        - Rank: ${trainer.rank}
        - Coins: ${trainer.coin}
        - PokeBalls: ${trainer.pkBalls}
        - PKM Captured: ${total} `

    if(trainer.tradeToken > 0)
    {
        result += ` - Encoutner Tokens: ${trainer.tradeToken}`
    }

    if(trainer.encounter != "")
    {
        result += ` - PKM encounter: ${trainer.encounter} Type $toss/$catch to use a PokeBall or $pass to run`
    }

    client.say(channel, result)
}

const handelCreationState = (command, username, channel, server, client, args) =>
{
    console.log(command);

    let trainer;

    const newTrainer = struct.createTrainer();
    newTrainer.username = username;
    newTrainer.creationState = 1;
    server.add(newTrainer)
    trainer = newTrainer;

    pickRegion(trainer, channel, client, args)
}

const pickRegion = (trainer, channel, client, args) => 
{
    client.say(channel, 
        `@${trainer.username}, Welcome to Pokechat!\n What Region are you from reply\n
        $1 for KANTO\n 
        $2 for JOHTO\n
        $3 for HOENN!`);
}

const setRegion = (command, trainer, channel, server, client, args) =>
{
    let regionSelected = false
    let kanto = "1"
    let johto = "2"
    let hoenn = "3"
    let region = ""

    if(command == kanto)
    {
        regionSelected = true;
        trainer.regionNumber = 0
        region = "KANTO"
    }
    else if(command == johto)
    {
        regionSelected = true;
        trainer.regionNumber = 1
        region = "JOHTO"
    }
    else if(command == hoenn)
    {
        regionSelected = true;
        trainer.regionNumber = 2
        region = "HOENN"
    }

    if(regionSelected)
    {
        let startingPkm = rollForStartingPkm(trainer)
        trainer.creationState = 2
        trainer.party.push(startingPkm)

        server.save()
        client.say(channel, 
        `MorphinTime @${trainer.username}, MorphinTime 
        So you are from ${region} PowerUpL! \n
        Great to have you. Type $pkm in chat to see your stats`);

        console.log(trainer)
    }
}

const rollForStartingPkm = (trainer) =>
{
    let startingPkmOptions = startingPokemon[trainer.regionNumber]
    const roll =  Math.floor(Math.random() * startingPkmOptions.length)
    return startingPkm = startingPkmOptions[roll]
}

module.exports = 
{
    respondToTrainerCommand : respondToTrainerCommand
}
