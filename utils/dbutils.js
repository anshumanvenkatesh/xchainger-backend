const Promise = require('bluebird')
const URLs = require("../utils/URLs")
const codes = require("../utils/codes")
const R = require('ramda')


const addConstraints = (session, constraints) => {
  // const promises = constraints.map(constraint => session.run(constraint))
  return Promise.map(constraints, constraint => {
      return session.run(constraint)
    }, {
      concurrency: 1
    })
    .then(results => {
      console.log("all constraints added: ", results);
      return true
    })
    .catch(err => {
      console.error("Error executing constraint: ", err);
      return false
    })
}

const initDB = (session) => {
  return session
    .run(URLs.CHECKINIT)
    .then(result => {
      return (result.records.length !== 0)
    })
    .then(isDBInited => {
      if (isDBInited) {
        console.log("STATUS", "DB initing done already!")
        return
      } else {
        console.log("STATUS:  ", "starting init DB...")
        console.log("STATUS:  ", "adding constraints...")
        constraints = [URLs.ADDUNIQCONSTRAINT_USER, URLs.ADDUNIQCONSTRAINT_SUBJECT, URLs.ADDCONFIGNODE]
        return addConstraints(session, constraints)
      }
    })
    .then(() => {
      session.close()
    })
    .catch(function (error) {
      console.error(error);
    });
}

const addUser = (driver) => async userDetails => {
  const _userExists = await userExists(driver)(userDetails)
  if (_userExists) {
    return codes.userAlreadyExist
  }
  // const user = {}
  const session = driver.session()
  return session
    .run(`CREATE (a:User {
      email: "${userDetails.email}",
      name: "${userDetails.name}",
      firstName: "${userDetails.firstName}",
      lastName: "${userDetails.lastName}",
      institution: "${userDetails.institution}",
      avatar: "${userDetails.avatar}"
    })`)
    .then(results => {
      console.log("results: ", results)
      console.log("User added succesfully");
      return codes.all_ok
    })
    .catch(err => {
      console.error("Error while creating user: ", err);
    })
};

const removeUser = (driver) => async userDetails => {
  const session = driver.session()
  return session
    .run(`
      MATCH ${userNodePattern(userDetails)} DETACH DELETE u
    `)
    .then(results => {
      console.log("results for deleting user: ", results);
      
      return codes.all_ok
    })
    .catch(err => {
      console.error("Error while removing user")
      console.error(err)
    })
}

const addSubject = driver => async subject => {
  const _userExists = await subjectExists(driver)(subjectDetails)
  if (_userExists) {
    return codes.userAlreadyExist
  }
  const session = driver.session()
  return session.run(`
    CREATE (s:Subject {
      id: ${subject.id},
      name: ${subject.name},
      session: ${subject.session},
      institution: ${subject.institution}
    })
  `)
  .then(results => {
    console.log("results: ", results)
    console.log("Subject added succesfully");
    return codes.all_ok
  })
  .catch(err => {
    console.error("Error while creating subject: ", err);
  })
}

const removeSubject = (driver) => async subject => {
  const session = driver.session()
  return session
    .run(`
      MATCH ${subjectNodePattern(subject)} DETACH DELETE u
    `)
    .then(results => {
      console.log("results for deleting user: ", results);
      return codes.all_ok
    })
    .catch(err => {
      console.error("Error while removing subject")
      console.error(err)
    })
}

const getUserInfo = driver => async userEmail => {
  const sesssion = driver.session()
  return session.run(`
    MATCH (u:User {email: "${userEmail}"})
  `)
}


const modifyUserSubject = modification => driver => async (userDetails, subjectDetails, demand) => {
  const _userExists = await userExists(driver)(userDetails)
  const _subjectExists = await subjectExists(driver)(subjectDetails)
  if (!_userExists) {
    console.error("User does not exist")
    return codes.userNotExist
  } else if (!_subjectExists) {
    console.error("Subject does not exist")
    return codes.subjectNotExist
  } else { // User and Subject exist
    const session = driver.session()
    const relation = (
      demand === "has" ?
      `(u)-[r:CONNECTS]->(s)` :
      `(u)<-[r:CONNECTS]-(s)`
    )
    const query = `
      MATCH ${userNodePattern(userDetails)}, ${subjectNodePattern(subjectDetails)}
      ${modification === "DELETE" ? 
        `MATCH ${relation} DELETE r`: 
        `CREATE ${relation} RETURN u, s`
      }
    `
    console.log("complex query: ", query, "\n\n");
    
    return session.run(query)
      .then(results => {
        console.log("after adding connection: ", results);

      })
      .catch(err => {
        console.error(`Error while adding connection from User ${userDetails.email} to Subject: ${subjectDetails}`)
        console.error(err)
        throw err
      })
  }
}

const addUserSubject = modifyUserSubject("CREATE")
const removeUserSubject = modifyUserSubject("DELETE")

const subjectExists = driver => async subjectDetails => {
  console.log("In subjectExists, subjectDetails: ", subjectDetails.id);

  const session = driver.session()
  return session.run(`
    MATCH ${subjectNodePattern(subjectDetails)} RETURN s
  `)
    .then(results => {
      console.log("subject exists: ", results.records);
      return (results.records.length !== 0)
    })
    .catch(err => {
      console.error("Error while checking if user exists: ", err);
    })
}

const userExists = (driver) => async (userDetails) => {
  console.log("userDetails: ", userDetails);
  const { email } = userDetails
  const session = driver.session()
  return session.run(`MATCH ${userNodePattern(email)} RETURN u`)
    .then(results => {
      console.log("user exists: ", results.records);
      return (results.records.length !== 0)
    })
    .catch(err => {
      console.error("Error while checking if user exists: ", err);
    })
}

const userRelationSubject = relation => driver => async (user, subject) => {
  const session = driver.session()
  const query = `
    MATCH ${userNodePattern(user)}, ${subjectNodePattern(subject)} 
    WHERE (u)${relation}(s)
    RETURN u, s
  `
  return session.run(query)
    .then(results => results.records.length !== 0)
    .catch(err => {
      console.error(`Error while checking if ${userDetails.email} wants ${subjectDetails.name}`)
      console.error(err)
    })
}

const userHasSubject = userRelationSubject("-[r]->")
const userWantsSubject = userRelationSubject("<-[r]-")
const userRelatedToSubject = userRelationSubject("-[r]-")

const userNodePattern = (userDetails) => `(u:User {
  email: "${userDetails.email}"
})`

const subjectNodePattern = (subjectDetails) => `(s:Subject {
  id: "${subjectDetails.id}",
  institution: "${subjectDetails.institution}",
  session: "${subjectDetails.session}",
  name: "${subjectDetails.name}"
})`

const getRecos = (driver) => async (userDetails) => {
  // const recoGetter = getReco(driver)(userDetails)
  const recoGetter = getReco(driver)("a@asu.edu", "Spring 2020")
  return Promise.all([
    recoGetter(oneHopReco),
    recoGetter(twoHopReco),
    recoGetter(threeHopReco),
  ])
  .then(results => ({
    oneHop: results[0],
    twoHop: results[1],
    threeHop: results[2],
  }))
  .catch(err => {
    console.error("Error while processing recos:")
    console.error(err)
  })
  // return {
  //   oneHop: await recoGetter(oneHopReco),
  //   twoHop: await recoGetter(twoHopReco),
  //   threeHop: await recoGetter(threeHopReco),
  // }
}

const getReco = (driver) => (user, courseSession) => async fn => {
  const session = driver.session()
  return session
    .run(fn(user, courseSession))
    .then(processRecoResults)
    .catch(err => {
      console.error("Error while getting Recos")
      console.error(err)
    })
}

const oneHopReco = (user, session) => `
  MATCH (u1: User {email: "${user}"})-->(s1:Subject {session: "${session}"})-->
        (u2)-->(s2:Subject {session: "${session}"})-->
        (u1) 
  RETURN u1, s1, u2, s2
`

const twoHopReco = (user, session) => `
  MATCH (u1:User {email:"${user}"})-->(s1:Subject {session: "${session}"})-->
        (u2)-->(s2:Subject {session: "${session}"})-->
        (u3)-->(s3:Subject {session: "${session}"})-->
        (u1) 
  RETURN u1, s1, u2, s2, u3, s3
`

const threeHopReco = (user, session) => `
  MATCH (u1:User {email:"${user}"})-->(s1:Subject {session: "${session}"})-->
        (u2)-->(s2:Subject {session: "${session}"})-->
        (u3)-->(s3:Subject {session: "${session}"})-->
        (u4)-->(s4:Subject {session: "${session}"})-->
        (u1) 
  RETURN u1, s1, u2, s2, u3, s3, u4, s4
`

const processRecoResults = (results) => {
  results = R.pipe(
    R.map(R.path(["_fields"])),
    R.map(R.map(R.prop("properties")))
  )(results.records)
  console.log(results);
  return results
}

module.exports = {
  initDB,
  addUser,
  removeUser,
  addSubject,
  removeSubject,
  getRecos,
  userExists,
  subjectExists,
  addUserSubject,
  removeUserSubject
}