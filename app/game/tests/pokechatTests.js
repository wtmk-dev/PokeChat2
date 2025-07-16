const struct = require("../data/struct")
const server = require("../../backend/server")
const client = require("../../backend/client")

const createTrainerTest = () =>
{
    let testTrainer = struct.createTrainer()
    console.log(testTrainer);
    return true;
}

const createServerTest = () =>
{
    server.setClientToken()
}

const createClientTest = () =>
{
    return client.createClient()
}

module.exports = 
{
    createTrainerTest : createTrainerTest,
    createServerTest : createServerTest,
    createClientTest : createClientTest
}