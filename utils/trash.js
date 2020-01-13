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
