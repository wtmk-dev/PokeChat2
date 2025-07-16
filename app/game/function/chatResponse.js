const struct = require('../data/struct')

const startingPokemon  = 
{
    0 : ['BULBASAUR','CHARMANDER','SQUIRTLE'],
    1 : ['CYNDAQUIL','CHIKORITA','TOTODILE'],
    2 : ['TORCHIC','MUDKIP','TREECKO']
}

const respondToTrainerCommand = (command, username, channel, args) =>
{
    handelCreationState(command, username, channel, args)
}


const handelCreationState = (command, username, channel, args) =>
{
    let isTrainer = args.server.has(username)

    if(!isTrainer)
    {
        const newTrainer = struct.createTrainer();
        newTrainer.username = username;
        newTrainer.creationState = 1;
        args.server.add(newTrainer)
    }

    const pickRegion = 1
    if(trainer.creationState == pickRegion)
    {
        if(command == struct.createTrainerCommand)
        {
            pickRegion(trainer, channel, args)
        }
        else
        {
            setRegion(command, trainer, channel, args)
        }
    }
}

const pickRegion = (trainer, channel, args) => 
{
    args.client.say(channel, 
        `@${trainer.username}, Welcome to Pokechat!\n What Region are you from reply\n
        $1 for KANTO\n 
        $2 for JOHTO\n
        $3 for HOENN!`);
}

const setRegion = (command, trainer, channel, args) =>
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

        args.server.save()
        args.client.say(channel, 
        `@${trainer.username}, MorphinTime...\n
        So you are from ${region} PowerUpL! \n
        Great to have you. Type $pkm in chat to see your stats`);
    }
}

const rollForStartingPkm= (trainer) =>
{
    let startingPkmOptions = startingPokemon[trainer.regionNumber]
    const roll =  Math.floor(Math.random() * startingPkmOptions.length)
    return startingPkm = startingPkmOptions[roll]
}


