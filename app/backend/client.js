const tmi = require('tmi.js')

const CHANNEL = process.env.CHANNEL
const BOT_USERNAME = process.env.BOT_USERNAME

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
            username: BOT_USERNAME,
            password: process.env.C_ACCESS_TOKEN
        },
        channels: [CHANNEL]
    }
)

const say = (message) =>
{
    client.say(CHANNEL, message)
} 

const whisper = (username , message) =>
{
    client.whisper(username, message)
}

const connect = () =>
{
    client.connect();
}

module.exports = 
{
    say     : (message) => { return say(message) },
    whisper : (username, message) => { return whisper(usernaem, message) },
    connect : () => { return connect() },
    Client:  client
}