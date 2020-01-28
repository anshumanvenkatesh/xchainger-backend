const jwt = require('jsonwebtoken')
const URLs = require('../utils/URLs')
const dbUtils = require('../utils/dbutils')
const codes = require('../utils/codes')

const homeHandler = (session) => (request, h) => {
  return "API docs comin up";
}

const addUser = async (request, h) => {
  const userDetails = request.payload
  console.log("Going to add user: ", user);
  const results = await dbUtils.addUser(request.server.app.driver)(userDetails)
  return results
}

const removeUser = async (request, h) => {
  const user = request.params
  console.log("Going to remove user: ", user);
  const results = await dbUtils.removeUser(request.server.app.driver)(user)
  return results
}

const addSubject = async (request, h) => {
  const subjectDetails = request.payload
  const results = await dbUtils.addSubject(request.server.app.driver)(subjectDetails)
  return results
}

const removeSubject = async (request, h) => {
  const subjectDetails = request.payload
  const results = await dbUtils.removeSubject(request.server.app.driver)(subjectDetails)
  return results
}

const updateUser = async (request, h) => {
  const user = request.params
  console.log("user: ", user);
  const userDetails = request.payload.userDetails
  console.log("userDetails: ", userDetails);
  
  // const results = await dbUtils.removeUser(request.server.app.driver)(user)
  // return results
  return "debugging route"
}

const addUserSubject = async (request, h) => {
  const {
    userDetails, subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return codes.institutionMismatch
  }
  const results = await dbUtils.addUserSubject(request.server.app.driver)(userDetails, subjectDetails, demand)
  return codes.all_ok
}

const removeUserSubject = async (request, h) => {
  const {
    userDetails, subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return codes.institutionMismatch
  }
  const results = await dbUtils.removeUserSubject(request.server.app.driver)(userDetails, subjectDetails, demand)
  return codes.all_ok
}

const testReco = async (request, h) => {
  return dbUtils.getRecos(request.server.app.driver)("foo")
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