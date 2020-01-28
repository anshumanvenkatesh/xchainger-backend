const wreck = require('wreck')
const dbutils = require('./dbutils')

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
  return { name, given_name, family_name, domain: hd, email }
}

const preEnsureUserExists = async (request, h) => {
  const driver = request.server.app.driver
  console.log("request.app.userDetails: ", request.app.userDetails);
  
  const userExists = await dbutils.userExists(driver)(request.app.userDetails)
  console.log("User Exists: ", userExists);
  
  if (userExists) {
    return true  // Trivial case
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

module.exports = {
  isValidInstitution,
  isValidUser,
  getUserObject,
  preEnsureUserExists
}