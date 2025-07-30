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
                if(trainer.exploreState != 1)
                {
                    let status = server.exploreZone(trainer, command)

                    client.say(channel, 
                        `${status.text}`)

                    if(status.zone != "")
                    {
                        //trainer.exploreState = 1
                        game.doEncounter(client, channel, server, trainer, status)
                    }
                }
                    
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
            else if(command === struct.tossCommand || command === struct.catchCommand)
            {
                if(trainer.pkBalls > 0 && trainer.encounter != "" && trainer.throwState === 0)
                {
                    trainer.pkBalls--
                    doTossBall(client, channel, server, trainer, game)
                }
            }else if(command === struct.passCommand)
            {
                if(trainer.encounter != "")
                {
                    let passReward = game.getPassReward()
                    doPass(client, channel, server, trainer, passReward)
                    server.save()
                }
            }
        }
    }
}

const doPass = (client, channel, server, trainer, reward) =>
{
    console.log(reward)
    let text = `@${trainer.username} ran from ${trainer.encounter} TPFufun `

    if(reward.coin > 0)
    {
        trainer.coin += reward.coin
        text += ` -You gained ${reward.coin} `
    }

    if(reward.pkBalls > 0)
    {
        trainer.pkBalls += reward.pkBalls
        text += ` -You gained ${reward.pkBalls} `
    }

    if(reward.rank > 0)
    {
        trainer.rank += reward.rank
        text += ` -You gained ${reward.rank} `
    }

    trainer.encounter = ""
    client.say(channel, text)
}

const doTossBall = (client, channel, server, trainer, game) =>
{
    trainer.throwState = 1 // use to lock throw state
    let tossResults = game.tossBall()
    let time = 5000
    client.say(channel, tossResults.text)

    if(tossResults.shake)
    {
        setTimeout(()=>
            {
                doTossBall(client, channel, server, trainer, game)
            },time)
    }else
    {
        if(tossResults.captured)
        {
            successfulCapture(client, channel, trainer)
        } else {
            failedCapture(client, channel, trainer)
        }

        server.save()
    }
}

const successfulCapture = (client, channel, trainer) => 
{
    pkm = trainer.encounter;
    trainer.encounter = ""
    trainer.throwState = 0 // to unlock throw state

    trainer.party.push(pkm.toUpperCase())
    client.say(channel, 
        `@${trainer.username} 
        YOU CAPTURED ${pkm.toUpperCase()} GlitchLit`
    )
}

const failedCapture = (client, channel, trainer) => 
{
    trainer.throwState = 0 // to unlock throw state

    if(trainer.pkBalls > 0)
    {
        client.say(channel, 
            `@${trainer.username} 
            type $toss/$catch to throw a PKBall!`)
    } 
    else 
    {
        pkm = trainer.encounter;
        client.say(CHANNEL, 
            `@${trainer.username} 
            Looks like ${pkm} got away SirSad`)

        trainer.encounter = ""
    }
}

const handelShowStats = (command, trainer, channel, server, client, args) =>
{
    let total = trainer.party.length
    let result = `@${trainer.username} MorphinTime  
        - Rank: ${trainer.rank}
        - Coins: ${trainer.coin}
        - PokeBalls: ${trainer.pkBalls}
        - PKM Captured: ${total} 
        - Encoutner Tokens: ${trainer.tradeToken} `

    if(trainer.encounter != "")
    {
        result += ` 
        - PKM encounter: 
        ${trainer.encounter} Type $toss/$catch to use a PokeBall or $pass to run`
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
