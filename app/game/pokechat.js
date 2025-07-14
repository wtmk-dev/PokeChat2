const run = () =>
{
  console.log("pokechat is running")
}

const test = () =>
{
  let passed = false
  console.log("tests are running")

  return passed
}


module.exports = 
{
  run : () => { return run() },
  test: () => { return test() }
}