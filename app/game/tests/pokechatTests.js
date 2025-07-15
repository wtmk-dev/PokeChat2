const struct = require("../data/struct")

const createTrainerTest = () =>
{
    let testTrainer = struct.createTrainer()
    console.log(testTrainer);
    return true;
}

module.exports = 
{
    createTrainerTest : createTrainerTest
}