const trainer =
{
    username : "",
    creationState : 0, // 0 new - 1 pick region - 2 complete
    regionNumber : -1, // -1 none - 0 kanto - 2 joto -3 hoenn
    type:1,
    party : [], // max 6
    rank : 0,
    coin : 0, 
    pkBalls : 0,
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
}