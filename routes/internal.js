const homeHandler = (request, h) => {

  return "API docs comin up";
}

const ping = (request, h) => {
  console.log("User pinged -> Server woke up.");
  return {
    status: 2000,
    msg: "Server Up" 
  }
}

module.exports = {
  homeHandler,
  ping
}