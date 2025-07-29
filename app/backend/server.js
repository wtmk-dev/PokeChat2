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
    if(adventureState === adventureStateQueuing)
    {
        if(trainersOnAdventure.has(trainer.username))
        {
            trainersOnAdventure[trainer.username] = trainer
        }else
        {
            trainersOnAdventure.set(trainer.username, trainer)
        }
    }
    
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

let tVote = 0
let wVote = 0
let sVote = 0
let dVote = 0

const addVote = (command) =>
{
    if(adventureState != adventureStateNone)
    {
        if(command === "t")
        {
            tVote++
        }
        else if(command === "w")
        {
            wVote++
        }
        else if(command === "s")
        {
            sVote++
        }
        else if(command === "d")
        {
            dVote++
        }
    }
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
    console.log(sortedM)

    let next = sortedM.next()
    console.log(next)

    tVote = 0
    wVote = 0
    sVote = 0
    dVote = 0

    return next
}

const getAdventureRank = () =>
{
    return 0
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
    getAdventureRank : getAdventureRank

}