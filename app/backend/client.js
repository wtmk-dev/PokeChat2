const tmi = require('tmi.js')
const game = require("../game/function/trainerGame")

const createClient = () =>
{
    const client = new tmi.Client
    (
        {
            connection: 
            {
                secure: true,
                reconnect: true
            },
            identity:
            {
                username: process.env.BOT_USERNAME,
                password: process.env.BOT_ACCESS_TOKEN
            },
            channels: [process.env.CHANNEL]
        }
    )

    return client
}

const connectClientToChat = (channel, client, server, respoonToCommand) => {    
    //game.run(channel,client,server)

    client.on('message', (channel, tags, message, self) =>{
        console.log(`${tags['display-name']}: ${message}`)

        if(self || !message.startsWith('$')) {
            return;
        }

        const args    = message.slice(1).split(' ')
        const command = args.shift().toLowerCase()
        const username = tags.username

        respoonToCommand(command, username, channel, server, client, args)
    })
}

module.exports = 
{
    createClient:  createClient,
    connectClientToChat: connectClientToChat
}