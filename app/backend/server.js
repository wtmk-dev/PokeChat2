require(`dotenv`).config()
const request = require('request')
const fs = require('fs')
const {ClientCredentialsAuthProvider} = require('twitch-auth')

const trainers    = require('./data/trainers.json')
const encounters  = [ ]
let token

const trainerPath = __dirname + '/data/trainers.json'

const setClientToken = () => {
    const options = {
        url: `https://id.twitch.tv/oauth2/token`,
        json: true,
        body:{
            client_id: process.env.A_CLIENT_ID,
            client_secret: process.env.A_SECRET,
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
          throw err; 
        }
    
        const savedData = data.toString()
        const trainersJSON = JSON.parse(savedData)
        const keys = Object.keys(trainersJSON)

        keys.forEach( key => {
            const trainer = 
            {
                creationState : trainersJSON[key].creationState,
                regionNumber : trainersJSON[key].regionNumber, // does not have a region set
                username: trainersJSON[key].username,
                type: trainersJSON[key].type, // not selected
                pkm: trainersJSON[key].pkm,
                items: trainersJSON[key].items,
                rank: trainersJSON[key].rank || 0,
                coin: trainersJSON[key].coin || 0,
                pkBalls: trainersJSON[key].pkBalls || 0,
                box: trainersJSON[key].box || [ ],
                tt: trainersJSON[key].tt || 0, //trade tokens
                evo: trainersJSON[key].evo || 0,
                hasMedBag: trainersJSON[key].hasMedBag || false,
                medbag: trainersJSON[key].medbag || { },
                isInTrade: false,
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

setTimeout( () => {
    //loadTrainers()
}, 800);

module.exports = { 
    trainers: trainers,
    saveTrainers: () => { return saveTrainers() },
}