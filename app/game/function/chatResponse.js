const struct = require('../data/struct')

const startingPokemon  = 
{
    0 : ['BULBASAUR','CHARMANDER','SQUIRTLE'],
    1 : ['CYNDAQUIL','CHIKORITA','TOTODILE'],
    2 : ['TORCHIC','MUDKIP','TREECKO']
}

const respondToTrainerCommand = (command, username, channel, server, client, args) =>
{
    let isTrainer = server.has(username)
    let trainer

    if(!isTrainer)
    {
        handelCreationState(command, username, channel, server, client, args)
    }
    else if(command == struct.createTrainerCommand)
    {
        handelShowStats(command, username, channel, server, client, args);
    }
}

const handelShowStats = (command, username, channel, server, client, args) =>
{
    let regionPicked = 2
    let trainer = server.getTrainer(username)
    if(trainer.creationState == regionPicked)
    {
        console.log(trainer)
    }
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

    const pickRegionState = 1
    if(trainer.creationState == pickRegionState)
    {
        if(command == struct.createTrainerCommand)
        {
            pickRegion(trainer, channel, client, args)
        }
        else
        {
            setRegion(command, trainer, channel, server, client, args)
        }
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

const rollForStartingPkm= (trainer) =>
{
    let startingPkmOptions = startingPokemon[trainer.regionNumber]
    const roll =  Math.floor(Math.random() * startingPkmOptions.length)
    return startingPkm = startingPkmOptions[roll]
}

module.exports = 
{
    respondToTrainerCommand : respondToTrainerCommand
}
