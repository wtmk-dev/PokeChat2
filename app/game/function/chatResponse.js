const struct = require('../data/struct')

const startingPokemon  = 
{
    0 : ['BULBASAUR','CHARMANDER','SQUIRTLE'],
    1 : ['CYNDAQUIL','CHIKORITA','TOTODILE'],
    2 : ['TORCHIC','MUDKIP','TREECKO']
}

const pickRegionState = 1
const createStateComplete = 2

const respondToTrainerCommand = (command, username, channel, server, client, args) =>
{
    let isTrainer = server.has(username)
    let trainer

    if(!isTrainer)
    {
        handelCreationState(command, username, channel, server, client, args)
    }else
    {
        trainer = server.getTrainer(username)
        console.log(trainer.creationState)
        console.log(command)
        if(trainer.creationState === pickRegionState)
        {
            handelPickRegionState(command, trainer, channel, server, client, args)
        }
        else if (trainer.creationstate == createStateComplete)
        {
            console.log(command + " in creationState")
            handelShowStats(command, trainer, channel, server, client, args)
        }
    }

}

const handelShowStats = (command, trainer, channel, server, client, args) =>
{
    let total = trainer.party.length
    client.say(channel, 
        `@ MorphinTime ${trainer.username} 
        - Rank: ${trainer.rank} 
        - PKBalls: ${trainer.rank}
        - PKCaptured: ${total}`);
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

    handelPickRegionState(command, trainer, channel, server, client, args)
}

const handelPickRegionState = (command, trainer, channel, server, client, args) =>
{
    console.log(command)
    if(command === struct.createTrainerCommand)
    {
        pickRegion(trainer, channel, client, args)
    }else
    {
        setRegion (command, trainer, channel, server, client, args)
    }
    
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
        `@${trainer.username}, MorphinTime...\n
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
