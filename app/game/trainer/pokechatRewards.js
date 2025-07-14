const encounterCost = 100
const ballCost = 500
const flexCost = 1

const tallGrass = {
    autoFulfill : true,
    cost: encounterCost,
    backbackgroundColor: "00ff00",
    globalCooldown: 60,
    isEnabled: true,
    prompt: "If you are a Pokechat Trainer then you may redeem this for a chance to encounter a PKM! $pkm in chat for more info.",
    title: "Tall Grass",
    userInputRequired: false
}

const skyZone = {
    autoFulfill : true,
    cost: encounterCost,
    backbackgroundColor: "000066",
    globalCooldown: 60,
    isEnabled: true,
    prompt: "If you are a Pokechat Trainer then you may redeem this for a chance to encounter a PKM! $pkm in chat for more info.",
    title: "Sky Zone",
    userInputRequired: false
}

const darkCave = {
    autoFulfill : true,
    cost: encounterCost,
    backbackgroundColor: "663366",
    globalCooldown: 60,
    isEnabled: true,
    prompt: "If you are a Pokechat Trainer then you may redeem this for a chance to encounter a PKM! $pkm in chat for more info.",
    title: "Dark Cave",
    userInputRequired: false
}

const surfZone = {
    autoFulfill : true,
    cost: encounterCost,
    backbackgroundColor: "0000ff",
    globalCooldown: 60,
    isEnabled: true,
    prompt: "If you are a Pokechat Trainer then you may redeem this for a chance to encounter a PKM! $pkm in chat for more info.",
    title: "Surf Zone",
    userInputRequired: false
}


const primeBall = {
    autoFulfill : true,
    cost: ballCost,
    globalCooldown: 10,
    isEnabled: true,
    prompt: `If you are a Pokechat Trainer then you may redeem this to order 1 PKBall from PKazon.`,
    title: "Prime Ball",
    userInputRequired: false
}

const boxFlex = {
    autoFulfill : true,
    cost: flexCost,
    globalCooldown: 30,
    isEnabled: true,
    prompt: `If you are a Pokechat Trainer then you may redeem this flex what is in your box`,
    title: "Box Flex",
    userInputRequired: false
}

const rankFlex = {
    autoFulfill : true,
    cost: flexCost,
    globalCooldown: 30,
    isEnabled: true,
    prompt: `If you are a Pokechat Trainer then you may redeem this flex what is in your box`,
    title: "Rank Flex",
    userInputRequired: false
}

const rewards = [tallGrass,skyZone,darkCave,surfZone,primeBall,boxFlex,rankFlex]

module.exports = {
    rewards : rewards
}


