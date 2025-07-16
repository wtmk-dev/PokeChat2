require('dotenv').config()

console.log("starting...")
const game = require('./app/game/pokechat.js')

console.log("game created...")

game.run().catch(err => {
  console.error("Fatal error in game.run():", err.message);
})

