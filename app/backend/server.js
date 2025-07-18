require(`dotenv`).config()
const request = require('request')
const fs = require('fs')
const struct = require("../game/data/struct")
const {ClientCredentialsAuthProvider} = require('twitch-auth')

const trainerPath = 'F:/trainers.json'
const trainers = new Map();

const setClientToken = () => {
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
            let t = struct.createTrainer()
            t.username = "dumb"
            trainers.set(t.username, t)
            save()
            console.log(data)
        }
    
        const savedData = data.toString()
        const trainersJSON = JSON.parse(savedData)
        const keys = Object.keys(trainersJSON)

        console.log(trainersJSON)

        keys.forEach( key => {
            const trainer = 
            {
                username: trainersJSON[key].username,
                creationState : trainersJSON[key].creationState, // 0 new - 1 pick region - 2 complete
                regionNumber : trainersJSON[key].regionNumber, // -1 none - 0 kanto - 2 joto -3 hoenn
                type: trainersJSON[key].type,
                party : trainersJSON[key].party, // max 6
                rank: trainersJSON[key].rank || 0,
                coin: trainersJSON[key].coin || 0,
                pkBalls: trainersJSON[key].pkBalls || 0,
                tradeToken : trainersJSON[key].tradeToken|| 0,
                evoToken: trainersJSON[key].evoToken || 0,
                box: trainersJSON[key].box || [ ],
                encounter:  trainersJSON[key].box || ""
            }

            trainers[key] = trainer
        })

        console.log('trainers loaded')
    })    
}

const saveTrainers = () =>
{
    console.log(`Saving trainers...`);
    const trainersJson = JSON.stringify(trainers)
    fs.writeFile(trainerPath, trainersJson, ()=> { return console.log('Trainers Saved') })
}

const getFollowers = () => {
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
    console.log(trainers.has(username));
    console.log(trainers)
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
    console.log("save trainers")
    saveTrainers();
}

loadTrainers()

module.exports = 
{ 
    setClientToken : setClientToken,
    has : has,
    add : add,
    getTrainer : getTrainer,
    save : save
}