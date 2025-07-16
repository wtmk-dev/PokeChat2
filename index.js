require('dotenv').config()

console.log("starting...")
const game = require('./app/game/pokechat.js')

console.log("game created...")
let passedTest = game.test()

if(passedTest)
{
    console.log("tests passed...")
    game.run()

    console.log("game running...")
}


