const wreck = require('wreck')

const isValidInstitution = (institution) => {
  return institution === "asu.edu"
}

const isValidUser = async token => {
  const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
  const { res, payload } = await wreck.get(url, {json: true})
  console.log("googl validation response: ", payload);
  if ("error_description" in payload) {
    return false
  }
  return true
}

module.exports = {
  isValidInstitution,
  isValidUser,
}