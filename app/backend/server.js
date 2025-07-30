require(`dotenv`).config()
const request = require('request')
const fs = require('fs')
const struct = require("../game/data/struct")
const {ClientCredentialsAuthProvider} = require('twitch-auth')

const trainerPath = 'Z:/trainers.json'
let trainers = new Map();
let trainersOnAdventure = new Map();
let adventureState = 0
let adventureZone = ""

const adventureStateNone = 0
const adventureStateQueuing = 1
const adventureStateRunning = 2

const setClientToken = () => 
{
    const options = {
        url: `https://id.twitch.tv/oauth2/token`,
        json: true,
        body:{
            client_id: process.env.A_CLIENT_ID,
            client_secret: process.env.TWITCH_SECRET,
            grant_type: 'client_credentials',
            scope: 'viewing_activity_read'
        }
    }

    request.post(options, (err,res,body) => {
        if(err){
            return console.log(err)
        }
        token = body.access_token;
    })
}

const loadPokechatEncoutner = () =>
{
    fs.readFile(encounterPath, (err, data))
    {
        const trainersJSON = JSON.parse(data.toString())
        encounters.push(trainersJSON)
    }
}

const loadTrainers = () => 
{
    fs.readFile(trainerPath, (err, data) => {
        if (err) {
            console.error("Error loading trainers, initializing new one.");
            const t = struct.createTrainer();
            t.username = "dumb";
            trainers.set(t.username, t);
            saveTrainers();
            return;
        }

        try {
            const jsonArray = JSON.parse(data.toString());
            trainers = new Map(jsonArray); // Rehydrate the map
            console.log("Trainers loaded");
        } catch (e) {
            console.error("Failed to parse trainers:", e);
        }
    });
};

const saveTrainers = () => 
{
    console.log(`Saving trainers...`);
    
    // Convert the Map to an array of [key, value] pairs
    const trainersJson = JSON.stringify([...trainers], null, 2);
    
    fs.writeFile(trainerPath, trainersJson, () => {
        console.log('Trainers Saved');
    });
};

const getFollowers = () => 
{
    console.log(`getting followers`)
    const options = {
        url: `https://api.twitch.tv/helix/users/follows?to_id=${process.env.CHANNEL_ID}&first=100`,
        method: 'GET',
        headers:{
            'Client-ID':process.env.A_CLIENT_ID,
            'Authorization': 'Bearer ' + process.env.A_ACCESS_TOKEN
        }
    }

    if(!process.env.A_ACCESS_TOKEN){
        console.log("No Token")
    }else{
        console.log("Token Aquired *-*")
    }

    request.get(options, (err,res,body)=>{
        if(err){
            return console.log(err)
        }

        const followerJson = JSON.parse(body)
        followerJson.data.forEach(element => {

            const user = element.from_name.toLowerCase()
            const followerSaved =  (user in followers);

            if(!followerSaved)
            {
                const follower = 
                {
                    username: user,
                    isAEARPG : false,
                    isTrainer: false,
                    isHollow : false,
                    followDate: element.followed_at,
                    tickets: 0
                }

                followers[user] = follower
            }
        });

        saveFollowers();
    })
}

const has = (username) =>
{ 
    //console.log(trainers.has(username));
    //console.log(trainers)
    return trainers.has(username)
}

const add = (user) =>
{   
    if(trainers.has(user.username))
    {
        trainers[user.username] = user
    }else{
        trainers.set(user.username, user)
    }
    
    console.log(user)
    save()
}

const getTrainer = (username) =>
{
    let hasTrainer = has(username)

    if(hasTrainer)
    {
        return trainers.get(username)
    }else{
        let trainer = struct.createTrainer()
        trainer.username = username;
        add(trainer)
        return getTrainer(username)
    }
}

const save = () =>
{
    //console.log("save trainers")
    saveTrainers();
}

const addTrainerToAdventure = (trainer) =>
{
    let status = ""
    if(trainersOnAdventure.has(trainer.username))
    {
        trainersOnAdventure[trainer.username] = trainer
    }else
    {
        trainersOnAdventure.set(trainer.username, trainer)
        status = `You will start gaining encounter tokens. 
            - Type $t to explore Tall Grass
            - Type $w to explore Water Zone
            - Type $s to explore Sky Zone
            - Type $d to explore Dark Cave`
    }
    
    return status
}

const getTrainersOnAdventure = () =>
{
    return trainersOnAdventure
}

const clearTrainersOnAdventure = () =>
{
    trainersOnAdventure.clear()
}

const isTrainerOnAdventure = (username) =>
{
    return trainersOnAdventure.has(has)
}

const setAdventureState = (state) =>
{
    adventureState = state
}

const voteCommand =
[
    "t","w","s","d"
]

const isVoteCommand = (command) =>
{
    let isTrue = false
    for(let i = 0; i < voteCommand.length; i++)
    {
        if(command === voteCommand[i])
        {
            isTrue = true
            break
        }
    }

    return isTrue
}

const exploreZone = (trainer, command) =>
{
    let reward =
    {
        zone: "",
        text: `@${trainer.username} encounter token required.`,
    }

    if(trainer.tradeToken > 0)
    {
        trainer.tradeToken--
        reward.text = `@${trainer.username} `

        if(command === "t")
        {
            reward.zone = "Tall Grass"
            reward.text += `you enter the Tall Grass`
        }
        else if(command === "w")
        {
            reward.zone = "Water"
            reward.text += `you enter the Water Zone`
        }
        else if(command === "s")
        {
            reward.zone = "Sky"
            reward.text += `you enter the Sky Zone`
        }
        else if(command == "d")
        {
            reward.zone = "Dark Cave"
            reward.text += `you enter the Dark Cave`
        }
    }

    return reward
}

let tVote = 0
let wVote = 0
let sVote = 0
let dVote = 0

const addVote = (command) =>
{
    let status = "you can't vote right now"

    if(adventureState != adventureStateNone)
    {
        if(command === "t")
        {
            tVote++
            status = "voted for Tall Grass"
        }
        else if(command === "w")
        {
            wVote++
            status = "voted for Water"
        }
        else if(command === "s")
        {
            sVote++
            status = "voted for Sky"
        }
        else if(command === "d")
        {
            dVote++
            status = "voted for Dark Cave"
        }
    }

    return status
}

const getZone = () =>
{
    let zone = new Map()

    zone.set("Tall Grass", tVote)
    zone.set("Water", wVote)
    zone.set("Sky", sVote)
    zone.set("Dark Cave", dVote)

    let sortedE = [...zone.entries()].sort((a,b) => b[1] - a[1])
    let sortedM = new Map(sortedE)
    //console.log(sortedM)

    let next = [...sortedM][0]
    //console.log(next)

    tVote = 0
    wVote = 0
    sVote = 0
    dVote = 0

    return next
}

const getAdventureRank = () =>
{
    let rank = 0
    for(const [key, value] of trainersOnAdventure)
    {
        if(value.rank > 0)
        {
            rank += value.rank / 100 
        }else
        {
            rank += .001
        }
    }

    return Math.ceil(rank)
}

const ballCost = 5
const flexCost = 100

const getMart = () =>
{
    let mart = `Type command to purchase item 
    - $ball : 10 PokeBalls : Cost ${ballCost} Coin
    - $flex : list all PKM you own : Cost ${flexCost} Coin`

    return mart
}

const buyBall = (trainer) =>
{
    let result = "not enough coin"
    if(trainer.coin >= ballCost)
    {
        trainer.coin -= ballCost
        trainer.pkBalls += 10
        result = "balls purchased"

        saveTrainers()
    }

    return result 
}

const buyFlex = (trainer) =>
{
    let result = "not enough coin"
    if(trainer.coin >= flexCost)
    {
        trainer.coin -= flexCost
        result = `@${trainer.username} BigPhish `

        for(let i = 0; i < trainer.party.length; i++)
        {
            let party = trainer.party
            result += `GlitchLit ${party[i]} `
        }

        saveTrainers()
    }

    return result
}

const getRandomInt = (min, max) =>
{
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const awardTrainersBalls = (rank) =>
{
    let min = 3
    let max = 9

    if(rank > 3)
    {
        min++
        max++
    }

    if(rank > 6)
    {
        min++
        max++
    }

    if(rank > 9)
    {
        min++
        max++
    }

    let balls = getRandomInt(min,max)

    for(const [key, value] of trainersOnAdventure)
    {
        value.pkBalls += balls
    }

    saveTrainers()

    return balls
}

const getNumberOfEncoutners = () =>
{

}

loadTrainers()

module.exports = 
{ 
    setClientToken : setClientToken,
    has : has,
    add : add,
    getTrainer : getTrainer,
    save : save,
    clearTrainersOnAdventure : clearTrainersOnAdventure,
    addTrainerToAdventure : addTrainerToAdventure,
    getTrainersOnAdventure : getTrainersOnAdventure,
    setAdventureState : setAdventureState,
    adventureStateNone : adventureStateNone,
    adventureStateQueuing : adventureStateQueuing,
    adventureStateRunning : adventureStateRunning,
    isVoteCommand : isVoteCommand,
    addVote : addVote,
    getZone : getZone,
    getAdventureRank : getAdventureRank,
    getMart : getMart,
    buyBall : buyBall,
    buyFlex : buyFlex,
    awardTrainersBalls : awardTrainersBalls,
    getRandomInt : getRandomInt,
    getNumberOfEncoutners : getNumberOfEncoutners,
    exploreZone : exploreZone
}