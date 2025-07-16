const struct = require("./data/struct")
const tests = require("./tests/pokechatTests")
const server = require("../backend/server")

const run = () =>
{
  console.log("pokechat is running")
}

const test = () =>
{
  let passed = false
  console.log("tests are running")
  let createTrainerTest = tests.createTrainerTest()

  return passed
}

module.exports = 
{
  run : () => { return run() },
  test: () => { return test() }
}