const createTrainer = () =>
{
    let trainer =
    {
        username : "",
        creationState : 0, // 0 new - 1 pick region - 2 complete
        regionNumber : -1, // -1 none - 0 kanto - 2 joto -3 hoenn
        type:1,
        party : [], // max 6
        rank : 0,
        coin : 10, 
        pkBalls : 6,
        tradeToken : 0,
        evoToken: 0,
        box : [], // pokemon in box
        tradeState: 
        {
            state: 0, // 0 none - 1 inTrade
            trader: "",
            offer: ""
        },
        encounter: "",
        throwState: 0, //ball thrown 1
        exoloreState: 0, //exploring 1
    }

    return trainer;
}

const createTrainerCommand = "pkm"
const joinAdventrueCommand = "j"
const martCommand = "mart"
const buyBallCommand = "ball"
const buyFlexCommand = "flex"
const tossCommand = "toss"
const catchCommand = "catch"
const passCommand = "pass"

module.exports = 
{
    createTrainer : createTrainer,
    createTrainerCommand : createTrainerCommand,
    joinAdventrueCommand : joinAdventrueCommand,
    martCommand : martCommand,
    buyBallCommand : buyBallCommand,
    buyFlexCommand : buyFlexCommand,
    tossCommand : tossCommand,
    catchCommand : catchCommand,
    passCommand : passCommand
}