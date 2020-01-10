const jwt = require('jsonwebtoken')
const URLs = require("../utils/URLs")
const dbUtils = require('../utils/dbutils')

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

  var {
    userName,
    ASUID
  } = request.payload
  const query = `create (u:User {name: "${userName}", UID: "${ASUID}"})`
  var body = {}
  await session
    .run(query)
    .then(function (result) {
      console.log("res:", result)
      status = 4000
      msg = "success"
      body = result.records
      session.close();
    })
    .catch(function (error) {
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

const restricted = (request, h) => {
  console.log("restricted route");
  return {
    status: 2000,
    msg: "google auth route hit, hopefully authorised!!!!",
    value: "1"
  }
}

const login = driver => async (request, h) => {
  
  if (!request.auth.isAuthenticated) {
    return `Authentication failed due to: ${request.auth.error.message}`;
  }
 
  // Perform any account lookup or registration, setup local session,
  // and redirect to the application. The third-party credentials are
  // stored in request.auth.credentials. Any query parameters from
  // the initial request are passed back via request.auth.credentials.query.
  
  // const data = ({
  //   given_name,
  //   family_name,
  //   name,
  //   email,
  //   picture,
  //   hd
  // } = request.auth.credentials.profile.raw)

  const rawData = request.auth.credentials.profile.raw

  const data = {
    email: rawData.email,
    name: rawData.name,
    firstName: rawData.given_name,
    lastName: rawData.family_name,
    avatar: rawData.picture,
    institution: rawData.hd,
  }

  // console.log("is func? ",  dbUtils.userExists(session));
  

  const userExists = await dbUtils.userExists(driver)(data)
  console.log("userExists: ", userExists);
  
  if (!userExists){
    console.log("User does not already exist, adding him to the db");
    await dbUtils.addUser(driver)(data)
  } else {
    console.log("User already exists");
  }
  
  console.log("profile data: ", data);

  const jToken = jwt.sign(
    data,
    process.env.JWT_SECRET
  )
  return {
    status: 2000,
    msg: "Authenticated!",
    token: jToken
  };
}

const addUserSubject = driver => async (request, h) => {
  const {
    userDetails, subjectDetails, demand
  } = request.payload
  const results = await dbUtils.addUserSubject(driver)(userDetails, subjectDetails, demand)
  return {
    code: 2000,
    msg: results
  }
}


module.exports = {
  homeHandler,
  ping,
  addUser,
  restricted,
  login,
  addUserSubject
}