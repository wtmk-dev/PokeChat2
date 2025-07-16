require('dotenv').config()
const game = require('./trainerGame.js');
const request = require('request')
const { RefreshableAuthProvider, StaticAuthProvider, ClientCredentialsAuthProvider } = require('twitch-auth')
const { PubSubClient, PubSubRedemptionMessage  } = require('twitch-pubsub-client')
const { ApiClient } = require('twitch')
const fs = require('fs')

const clientId     = process.env.U_CLIENT_ID;
const clientSecret = process.env.TWITCH_SECRET;
const accessToken  = process.env.U_ACCESS_TOKEN;
const CHANNEL      = process.env.CHANNEL

async function main(model, c, v)
{
    const server = model
    const client = c.Client
    const view = v

    let token = ""
    const authProvider = new StaticAuthProvider(clientId, accessToken)
    
    const apiClient = new ApiClient({authProvider})
    const pubSubClient = new PubSubClient();

    const userId = await pubSubClient.registerUserListener(apiClient)

    const listener = await pubSubClient.onRedemption(userId, (message) => {
        console.log(`${message.userDisplayName} just used ${message.rewardName} ${message.rewardImage}`)

        const reward   = message.rewardName.toLowerCase()
        const username = message.userDisplayName.toLowerCase()

        const isTrainer = (username in server.trainers)
        if(!isTrainer) return client.say(CHANNEL, `${username} hey you need to make a trainer first type $pkm to get started`)
        
        const trainer = server.trainers[username]
        const rankExp = .001 + (Math.random() * .3)
        trainer.rank += rankExp;
        server.saveTrainers()

        if(reward === "tall grass" || reward === "dark cave" || reward === "surf zone" || reward === "sky zone")
        {
            processEncounterReward(reward,trainer,server,client)
            processExtraReward(reward,trainer,server,client, view)
        }

        switch(reward)
        {
            case "prime ball":
                trainer.pkBalls += 1
                server.saveTrainers();
                client.say(CHANNEL, `PKazon has delivered ${username} 1 PKBall`);
            break;
            case "box flex":
                let box = "BigPhish BOX FLEX \n "
                trainer.box.forEach(pkm=>{
                    box += `GlitchLit [${pkm}] ` 
                })
                client.say(CHANNEL, box);
            break;
            case "rank flex":
                let rank = `TwitchLit ${username} - Rank: ${trainer.rank}`
                client.say(CHANNEL, rank);
            break;
            case "prime trade":
                trainer.tt++;
                server.saveTrainers();
                client.say(CHANNEL, `PKazon has delivered ${username} 1 Trade Token`);
            break;
            case "prime evo":
                trainer.evo++;
                server.saveTrainers();
                client.say(CHANNEL, `PKazon has delivered ${username} 1 Evo Soda`);
            break;

        }

        if(reward == "rank flex" || reward == "box flex")
        {
            return;
        }

        client.say(CHANNEL, `PraiseIt ${username} you are now Rank: ${Math.floor(trainer.rank)}`)

    });

    return Promise.all(token)
}

const processEncounterReward = (reward, trainer, server, client) =>
{
    const encounter = game.getEncounter(reward,trainer.rank);
    const username  = trainer.username

    let reply = ""
    if(encounter.type == 'p')
    {
        const options = `\ntype $toss/$catch to throw a PKBall! or $pass to gain a small reward`
        const pkmReward =`\n${username} a wild ${encounter.pkm[0]} has appeared!${options}`

        reply += pkmReward;
        trainer.enc = encounter.pkm
    } 

    if(encounter.type == 'b')
    {
        const pokeBallReward = `\n${username} has found ${encounter.pkBalls} Pokeball(s)!`

        reply += pokeBallReward

        trainer.pkBalls += encounter.pkBalls
    }

    const coinReward =`\n${username} has found ${encounter.coin} Coin(s)!`

    reply += coinReward

    trainer.rank += encounter.rank
    trainer.coin += encounter.coin
    server.saveTrainers();

    client.say(CHANNEL, reply);
}

const processExtraReward = (reward, trainer, server, client, view) =>
{
    const encounter = game.getExtraEncounter(reward,trainer.rank);
    let roll = game.random(10);
    let baseCheck = 3;
    let reply = " ";
    if(trainer.hasMedBag && roll > baseCheck)
    {
        reply += "Meds Found: " 
        baseCheck++;

        trainer.medbag[encounter["med"]]++
        const bonusMedRoll = game.random(10)
    
        if(bonusMedRoll > baseCheck)
        {
            trainer.medbag[encounter["med"]]++
            reply += " ~LUCKY BONUS~ "
        }

        reply += encounter["med"].toUpperCase() + "!"
    }

    roll = game.random(10);
    baseCheck++
    if(trainer.rank > 199 && roll > baseCheck)
    {
        reply += " Expert Bonus: "
        switch(encounter["200"])
        {
            case"coin":
            let c = game.random(trainer.rank)
            trainer.coin + c
            reply += `Coin(s) ${c}!`
            break
            case"soda":
            let s = game.random(3)
            trainer.soda + s
            reply += `Soda(s) ${s}! `
            break
            case"tt":
            let t = game.random(3)
            trainer.tt + t
            reply += `Trade Token(s) ${t}!`
            break
            case"xp":
            let x = game.random(trainer.rank)
            trainer.xp + x
            reply += `XP ${x}...`
            break
            case"legend":
            //reply = `${trainer.username} HAS SPOTTED A LEGENDARY!`
            //view.playGif("legend")
            break
        }
    }

    roll = game.random(10);
    baseCheck++
    if(trainer.rank > 149 && !trainer.hasGymBadge && roll > baseCheck)
    {
        if(encounter["150"] == "quest")
        {
            reply += trainer.username + "  may now select your path $quest to get started";
        }
    }

    server.saveTrainers();
    client.say(CHANNEL, reply);
}

module.exports = {
    main : async (model, client, view) => {return main(model, client, view)}
}