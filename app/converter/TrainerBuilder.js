const fs = require('fs')
const trainers = require('../app/backend/data/trainers.json')
const keys = Object.keys(trainers)
const dud = []

keys.forEach((key)=>{
    const td = trainers[key]

    if(td.pkm.length == 0)
    {
        dud.push(td.username)
    }
})

dud.forEach((d)=>{
    let index = keys.indexOf(d)
    if(index > -1)
    {
        keys.splice(index, 1);
    }
})

/* demo functions */

function randomList(n, a, b) {
  // create a list of n numbers between a and b
  var list = [],
    i;
  for (i = 0; i < n; i++) {
    list[i] = Math.random() * (b - a) + a;
  }
  return list;
}

function descriptives(list) {
  // compute mean, sd and the interval range: [min, max]
  var mean,
    sd,
    i,
    len = list.length,
    sum,
    a = Infinity,
    b = -a;
  for (sum = i = 0; i < len; i++) {
    sum += list[i];
    a = Math.min(a, list[i]);
    b = Math.max(b, list[i]);
  }
  mean = sum / len;
  for (sum = i = 0; i < len; i++) {
    sum += (list[i] - mean) * (list[i] - mean);
  }
  sd = Math.sqrt(sum / (len - 1));
  return {
    mean: mean,
    sd: sd,
    range: [a, b]
  };
}

function forceDescriptives(list, mean, sd) {
  // transfom a list to have an exact mean and sd
  var oldDescriptives = descriptives(list),
    oldMean = oldDescriptives.mean,
    oldSD = oldDescriptives.sd,
    newList = [],
    len = list.length,
    i;
  for (i = 0; i < len; i++) {
    newList[i] = sd * (list[i] - oldMean) / oldSD + mean;
  }
  return newList;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const getMeanRequirements = (badges) =>
{
    switch(badges)
    {
        case 0:
        return 13
        case 1:
        return 19
        case 2:
        return 21
        case 3:
        return 27
        case 4:
        return 38
        case 5:
        return 39
        case 6:
        return 43
        case 7:
        return 45
    }
}

const getIV = (rank, mod) =>
{
    let min = (rank + (2 * mod)) / 4
    let max = (rank + (2 * mod)) / 8
    min = Math.ceil(min)
    max = Math.ceil(max)
    let iv = clamp(31,min,max)
    if(iv > 31)
    {
        iv = 31
    }
    return iv
}

let data = ""

const buildTrainers = (k) =>
{
    k.forEach((user)=>{

        const td = trainers[user]
        const rank = td.rank
        let pkmCount = td.pkm.length

        if(pkmCount != 0)
        {
            for(let i = 0; i < 7; i++)
            {
                let sex = td.type != 1 ? "F" : "M"
                let trainer = `\nArcadian${sex}\n${td.username}_${i}\n${pkmCount}\n`

                /*
                if(td.items > 0)
                {
                    trainer += "Items="
                    td.items.forEach((item)=>{trainer += `${item}`})
                }
                */

                let meanRequirements = getMeanRequirements(i)
                
                if(pkmCount > 1)
                {
                    const list = randomList(td.pkm.length, 1, meanRequirements);
                    const newList = forceDescriptives(list, meanRequirements, 2);

                    td.pkm.forEach((pkm)=>{
                        let lvl = rank > 50 ? Math.ceil(newList.shift()) : Math.floor(newList.shift())
                        //todo ♂ = mA
                        trainer += `${pkm},${lvl}\n`
                    })
                }else if(pkmCount == 1){
                    trainer += `${td.pkm[0]},${meanRequirements}\n`
                }
                trainer += "#-------------------"
                data += trainer
            }
        }
    })
}

const buildTrainerPool = () =>
{
    let meta = "def getArcadians\n"
    meta += `   return [ ` 

    keys.forEach((k)=>{
        meta += `"${k}",`
    })

    let m2 = meta.slice(0, -1);
    
    m2 += " ]\n"
    m2 += "end"
    return m2
}

const getFemales = () =>
{
    let map = "def getFemales\n"
    map += `    return [ `

    keys.forEach((user)=>{
        const td = trainers[user]
        let sex = td.type != 1 ? true : false
        if(sex)
        {
            map += `"${user}",`
        }
    })

    let m2 = map.slice(0, -1);
    
    m2 += " ]\n"
    m2 += "end"
    return m2
}

buildTrainers(keys)

fs.writeFile("./trainers.txt",data,()=>{console.log("JOBS DONE!")})
//console.log(buildTrainerPool())
