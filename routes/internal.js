const URLs = require("../utils/URLs")
const homeHandler = (session) => (request, h) => {
  return "API docs comin up";
}

// PUT: /users/
// @params
// userName: String
// ASUID: String
const addUser = (session) => async (request, h) => {
  var status = 4001
  var msg = "failure"

  var { userName, ASUID } = request.payload
  const query = `create (u:User {name: "${userName}", UID: "${ASUID}"})`
  var body = {}
  await session
  .run(query)
  .then(function(result) {
      console.log("res:", result)
      status = 4000
      msg = "success"
      body = result.records
      session.close();
  })
  .catch(function(error) {
      body = error
      status = 4001
      msg = "error"
      console.error(error);
  });
  return {
    status,
    msg,
    body
  }
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
  ping,
  addUser
}