require(`dotenv`).config()
const struct = require("./data/struct")
const tests = require("./tests/pokechatTests")
const server = require("../backend/server")
const client = require("../backend/client")
const chatResponse = require("../game/function/chatResponse")

const run = async () =>
{
  try
  {
    console.log("pokechat is running")

    const twitchClient = client.createClient()
    console.log("client created")

    await twitchClient.connect()
    console.log("client connected")
    
    client.connectClientToChat(process.env.CHANNEL, twitchClient, server, chatResponse.respondToTrainerCommand)
  }
  catch(err)
  {
    console.log("error in run", err)
  }
}

const test = () =>
{
  let passed = false
  console.log("tests are running")
  let createTrainerTest = tests.createTrainerTest()
  let createClientTest = tests.createClientTest()
  console.log(createClientTest)

  return passed
}

module.exports = 
{
  run : () => { return run() },
  test: () => { return test() }
}