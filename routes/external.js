const dbUtils = require('../utils/dbutils')
const jwt = require('jsonwebtoken')

const ping = (request, h) => {
  console.log("User pinged -> Server woke up.");
  return {
    status: 2000,
    msg: "Server Up"
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
  
  const rawData = request.auth.credentials.profile.raw

  const data = {
    email: rawData.email,
    name: rawData.name,
    firstName: rawData.given_name,
    lastName: rawData.family_name,
    avatar: rawData.picture,
    institution: rawData.hd,
  }

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
  const decoded = jwt.verify(request.headers.authorization, process.env.JWT_SECRET)
  console.log("header: ", decoded);
  const userDetails = {
    email: decoded.email,
    institution: decoded.hd,
  }
  const {
    subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return {
      code: 6000,
      msg: "Institution mismatch between user and subject"
    }
  }
  const results = await dbUtils.addUserSubject(driver)(userDetails, subjectDetails, demand)
  return {
    code: 2000,
    msg: results
  }
}

const removeUserSubject = driver => async (request, h) => {
  const decoded = jwt.verify(request.headers.authorization, process.env.JWT_SECRET)
  console.log("header: ", decoded);
  const userDetails = {
    email: decoded.email,
    institution: decoded.hd,
  }
  const {
    subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return {
      code: 6000,
      msg: "Institution mismatch between user and subject"
    }
  }
  const results = await dbUtils.removeUserSubject(driver)(userDetails, subjectDetails, demand)
  return {
    code: 2000,
    msg: results
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

module.exports = {
  ping,
  login,
  addUserSubject,
  removeUserSubject,
  restricted
}