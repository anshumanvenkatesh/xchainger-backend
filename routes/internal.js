const jwt = require('jsonwebtoken')
const URLs = require('../utils/URLs')
const dbUtils = require('../utils/dbutils')
const codes = require('../utils/codes')

const homeHandler = (session) => (request, h) => {
  return "API docs comin up";
}

const addUser = driver => async (request, h) => {
  const userDetails = request.payload
  console.log("Going to add user: ", user);
  const results = await dbUtils.addUser(driver)(userDetails)
  return results
}

const removeUser = driver => async (request, h) => {
  const user = request.params
  console.log("Going to remove user: ", user);
  const results = await dbUtils.removeUser(driver)(user)
  return results
}

const addSubject = driver => async (request, h) => {
  const subjectDetails = request.payload
  const results = await dbUtils.addSubject(driver)(subjectDetails)
  return results
}

const removeSubject = driver => async (request, h) => {
  const subjectDetails = request.payload
  const results = await dbUtils.removeSubject(driver)(subjectDetails)
  return results
}

const updateUser = driver => async (request, h) => {
  const user = request.params
  console.log("user: ", user);
  const userDetails = request.payload.userDetails
  console.log("userDetails: ", userDetails);
  
  // const results = await dbUtils.removeUser(driver)(user)
  // return results
  return "debugging route"
}

const addUserSubject = driver => async (request, h) => {
  const {
    userDetails, subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return codes.institutionMismatch
  }
  const results = await dbUtils.addUserSubject(driver)(userDetails, subjectDetails, demand)
  return codes.all_ok
}

const removeUserSubject = driver => async (request, h) => {
  const {
    userDetails, subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return codes.institutionMismatch
  }
  const results = await dbUtils.removeUserSubject(driver)(userDetails, subjectDetails, demand)
  return codes.all_ok
}

const testReco = driver => async (request, h) => {
  return dbUtils.getRecos(driver)("foo")
}

module.exports = {
  homeHandler,
  addUser,
  removeUser,
  addSubject,
  removeSubject,
  updateUser,
  addUserSubject,
  removeUserSubject,
  testReco,
}