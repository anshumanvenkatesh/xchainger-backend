const wreck = require('wreck')

const isValidInstitution = (institution) => {
  return institution === "asu.edu"
}

const isValidUser = async (token) => {
  console.log("inside isValidUser with token: ", token);
  
  const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
  try {
    const { res, payload } = await wreck.get(url, {json: true})
    console.log("googl validation response: ", res);
    console.log("googl validation payload: ", payload);
    // if ("error_description" in payload) {
    //   return false
    // }
    return true
  }
  catch (ex) {
    console.error("Error while google checking");
    console.error(ex);
    if (ex.data.payload.error_description === "Invalid Value")
      return false
  }
}

module.exports = {
  isValidInstitution,
  isValidUser,
}