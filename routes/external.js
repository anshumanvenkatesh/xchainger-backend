const dbUtils = require('../utils/dbutils')
const jwt = require('jsonwebtoken')
const codes = require('../utils/codes')
const utils = require('../utils/misc')

const ping = (request, h) => {
  console.log("User pinged -> Server woke up.");
  return {
    status: 2000,
    msg: "Server Up"
  }
}

const removeUser = async (request, h) => {
  const userDetails = request.app.userDetails
  console.log("Going to remove user: ", userDetails);
  const results = await dbUtils.removeUser(request.server.app.driver)(userDetails)
  return results
}

const addUserSubject = async (request, h) => {
  // const decoded = jwt.verify(request.headers.authorization, process.env.JWT_SECRET)
  // console.log("header: ", decoded);
  const userDetails = request.app.userDetails
  console.log("userDetails in addUserSubject: ", userDetails);
  const {
    subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return codes.institutionMismatch
  }
  return await dbUtils.addUserSubject(request.server.app.driver)(userDetails, subjectDetails, demand)
}

const removeUserSubject = async (request, h) => {
  const userDetails = request.app.userDetails
  console.log("userDetails in removeUserSubject: ", userDetails);
  const {
    subjectDetails, demand
  } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    return codes.institutionMismatch
  }
  const results = await dbUtils.removeUserSubject(request.server.app.driver)(userDetails, subjectDetails, demand)
  return {
    code: 2000,
    msg: results
  }
}

const getRecos = async (request, h) => {
  const { email } = request.app.userDetails
  const session = request.query.session
  console.log("email: ", email);
  console.log("session: ", session);
  
  return dbUtils.getRecos(request.server.app.driver)(email, session)
}

const restricted = (request, h) => {
  console.log("restricted route");
  return {
    status: 2000,
    msg: "google auth route hit, hopefully authorised!!!!",
    value: "1"
  }
}

const getSubjects = async (request, h) => {
  // console.log("request.app.userDetails: ", request.app.userDetails);
  
  const institution = request.app.userDetails.institution
  // console.log("institution: ", institution);
  
  try {
    let subjects = await dbUtils.getSubjects(request.server.app.driver)(institution)
    // subjects = subjects.records.map(s => s._fields[0].properties)
    console.log("subjects: ", subjects);
    
    return subjects
  } catch (ex) {
    console.error("Error while getting subject list");
    console.error(ex);
    
  }
}

const getUserSubjects = async (request, h) => {
  const { email } = request.app.userDetails
  return dbUtils.getUserSubjects(request.server.app.driver)(email)
}

module.exports = {
  ping,
  removeUser,
  addUserSubject,
  removeUserSubject,
  getRecos,
  restricted,
  getSubjects,
  getUserSubjects,
}