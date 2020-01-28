// import 'wreck'
const wreck = require('wreck')
const dbutils = require('./dbutils')
const Boom = require('boom')
const joi = require('joi')

const isValidInstitution = (institution) => {
  return institution === "asu.edu"
}

const isValidUser = async (token) => {
  const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
  try {
    const { res, payload } = await wreck.get(url, {json: true})
    // console.log("payload: ", payload);
    
    return {
      isValidUser: true,
      details: payload,
    }
  }
  catch (ex) {
    console.error("Error while google checking");
    console.error(ex);
    if (ex.data.payload.error_description === "Invalid Value") {
      return {
        isValidUser: false,
        details: null,
      }
    }
  }
}

const getUserObject = async (rawUserObject) => {
  let { name, given_name, family_name, hd, email } = rawUserObject
  return { name, given_name, family_name, institution: hd, email }
}

const preEnsureUserExists = async (request, h) => {
  const driver = request.server.app.driver
  const userExists = await dbutils.userExists(driver)(request.app.userDetails)
  console.log("User Exists: ", userExists);
  
  if (userExists) {
    return request  // Trivial case
  } else {
    try {
      dbutils.addUser(driver)(request.app.userDetails)
      return true
    } catch (ex) {
      console.error("Error while creating user")
      console.error(ex)
      return false
    }
  }
}

const preCheckUserExists = async (request, h) => {
  const driver = request.server.app.driver
  const userExists = await dbutils.userExists(driver)(request.app.userDetails)
  if (userExists) {
    return request  // Trivial case
  } else {
    throw Boom.badRequest("User does not exist")
  }
}

const preCheckInstitutionIntegrity = async (request, h) => {
  const userDetails = request.app.userDetails
  const { subjectDetails } = request.payload
  if (userDetails.institution !== subjectDetails.institution) {
    throw Boom.badRequest("Institution mismatch")
  }
  return request
}

const preCheckSubjectExists = async (request, h) => {
  const { subjectDetails } = request.payload
  const subjectExists = await dbutils.subjectExists(request.server.app.driver)(subjectDetails)
  if (!subjectExists) {
    throw Boom.badRequest("Subject does not exist")
  }
  return request
}

const validSubjectDetails = joi.object({
  name: joi.string().required(),
  id: joi.string().required(),
  institution: joi.string().required(),
  session: joi.string().required(),
  instructor: joi.string().required(),
})

const validDemand = joi.string().valid("has", "wants").required()

const validModifyUserSubject = {
  payload: joi.object({
    subjectDetails: validSubjectDetails,
    demand: validDemand,
  })
}

const preCheckIsUserRelatedToSubject = async (request, h) => {
  const userDetails = request.app.userDetails
  const { subjectDetails } = request.payload
  const userHasSubject = await dbutils.userRelatedToSubject(request.server.app.driver)(userDetails, subjectDetails)
  console.log("userHasSubject: ", userHasSubject);
  
  if (userHasSubject) {
    throw Boom.badRequest("User already either has/wants subject")
  } 
  return request
}

module.exports = {
  isValidInstitution,
  isValidUser,
  getUserObject,
  preCheckUserExists,
  preEnsureUserExists,
  preCheckSubjectExists,
  preCheckInstitutionIntegrity,
  preCheckIsUserRelatedToSubject,
  validSubjectDetails,
  validDemand,
  validModifyUserSubject,
}