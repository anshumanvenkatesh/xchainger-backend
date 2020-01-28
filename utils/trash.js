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

server.route({
  method: ['GET', 'POST'], // Must handle both GET and POST
  path: '/login', // The callback endpoint registered with the provider
  options: {
    auth: 'google',
    handler: external.login
  }
})

const login = async (request, h) => {
  
  if (!request.auth.isAuthenticated) {
    return `Authentication failed due to: ${request.auth.error.message}`;
  }

  console.log("request.auth.credentials: ", request.auth.credentials);
  
 
  // Perform any account lookup or registration, setup local session,
  // and redirect to the application. The third-party credentials are
  // stored in request.auth.credentials. Any query parameters from
  // the initial request are passed back via request.auth.credentials.query.
  
  const rawData = request.auth.credentials.profile.raw

  if (!utils.isValidInstitution(rawData.hd)) {
    return codes.invalidInstitution
  }

  const data = {
    email: rawData.email,
    name: rawData.name,
    firstName: rawData.given_name,
    lastName: rawData.family_name,
    avatar: rawData.picture,
    institution: rawData.hd,
  }

  const userExists = await dbUtils.userExists(request.server.app.driver)(data)
  console.log("userExists: ", userExists);
  
  if (!userExists){
    console.log("User does not already exist, adding him to the db");
    await dbUtils.addUser(request.server.app.driver)(data)
  } else {
    console.log("User already exists");
  }
  
  console.log("profile data: ", data);

  const token = {
    msg: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVlZGQ5NzgyZDgyMDQwM2VlODUxOGM0YWFiYjJiOWZlMzEwY2FjMTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzQ0MjM3NTY4MzczLWtqZDAwMW1qMWlsaDdsbWl0b3B0M21yaDI5NWduNWFmLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzQ0MjM3NTY4MzczLWtqZDAwMW1qMWlsaDdsbWl0b3B0M21yaDI5NWduNWFmLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3ODg4NTEwMzg2MzY1MTc1NjIyIiwiZW1haWwiOiJhbnNodW1hbnZlbmthdGVzaEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjdId3VSaElUS0M5RE1Pd1BBOUdtd0EiLCJuYW1lIjoiQW5zaHVtYW4gVmVua2F0ZXNoIiwicGljdHVyZSI6Imh0dHBzOi8vbGg1Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tVTJ2cFM3Z0ZESWcvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUNIaTNyZTZvNV9CeFVPelhJN1hKM3RLRjBOTXZkZnFXdy9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiQW5zaHVtYW4iLCJmYW1pbHlfbmFtZSI6IlZlbmthdGVzaCIsImxvY2FsZSI6ImVuLUdCIiwiaWF0IjoxNTc5NDcxMzQ5LCJleHAiOjE1Nzk0NzQ5NDksImp0aSI6Ijk5YjFlMzMxYzJmZGQxYjU5NjRiODE5OWJkMjhhMGU4YmEwN2U1OGUifQ.xPd0ckSRPdOcFSMlt3yNEyI7S6jo7jDiWE8nSnRxwc1bZFOC6_YT1flMk-TcV0L2FVnuyPIu8Va0hKf2AZ7lv7KRo7-9WaKrlf6-Kwzd8F-ggNfD7tSqz1We2mdUz4C00i6ESe6RN2mOZRohgSzWRUuk3WQGNoEGiLuVenthBY5lYw74CPCsNXRpxGE8ONQXpzEQP8kHwMwbBC0NeywG2QN1Hqn1CWYQDxw1s0oGZ_iLJEd8xVCetzuDyq-tuib66DH2fWm1w-YRPGoUx7U3J5YLQ52cscnu4vqIawxMH9tBba_ow-MhTErgPTvIMrISY7no-oq76avkhY9P1XQVEQ"
  }

  const jToken = jwt.sign(
    token,
    process.env.JWT_SECRET
  )
  return {
    status: 2000,
    msg: "Authenticated!",
    token: jToken
  };
}

server.auth.strategy('google', 'bell', {
  provider: 'google',
  password: 'cookie_encryption_password_secure',
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  isSecure: false // Terrible idea but required if not using HTTPS especially if developing locally
});

// Thought of adding edit user, but that is not relavant in this context due to graphDB domain 

  // server.route({
  //   method: 'PUT',
  //   path: '/internal/users/{email}',
  //   // path: '/users/{userEmail}',
  //   options: {
  //     // auth: 'jwt',
  //     handler: internal.updateUser(driver)
  //   }
  // });
