const { RefreshableAuthProvider, StaticAuthProvider, ClientCredentialsAuthProvider } = require('twitch-auth')
const { PubSubClient, PubSubRedemptionMessage  } = require('twitch-pubsub-client')
const { ApiClient } = require('twitch')

const CHANNEL      = process.env.CHANNEL
const clientId     = process.env.U_CLIENT_ID
const clientSecret = process.env.TWITCH_SECRET
const accessToken  = process.env.U_ACCESS_TOKEN

let p = { }

const buildPub = () =>
{
    const pub = { }

    const authProvider = new StaticAuthProvider(clientId, accessToken)
    const apiClient = new ApiClient({authProvider})
    const pubSubClient = new PubSubClient();   

    pub["auth"] = authProvider
    pub["api"] = apiClient
    pub["client"] = pubSubClient

    return pub
}

p = buildPub();

module.exports = 
{
    pub : p
}