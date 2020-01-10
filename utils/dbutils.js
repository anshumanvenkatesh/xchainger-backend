const Promise = require('bluebird')
const URLs = require("../utils/URLs")


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
  const session = driver.session()
  return session
    .run(`CREATE (a:User {
      email: "${userDetails.name}",
      name: "${userDetails.name}",
      firstName: "${userDetails.firstName}",
      lastName: "${userDetails.lastName}",
      institution: "${userDetails.institution}",
      avatar: "${userDetails.avatar}"
    })`)
    .then(results => {
      console.log("results: ", results)
      console.log("User added succesfully");
    })
    .catch(err => {
      console.error("Error while creating user: ", err);
    })
};

const getUserInfo = driver => async userEmail => {
  const sesssion = driver.session()
  return session.run(`
    MATCH (u:User {email: "${userEmail}"})
  `)
}

const addUserSubject = driver => async (userDetails, subjectDetails, demand) => {
  const _userExists = await userExists(driver)(userDetails)
  const _subjectExists = await subjectExists(driver)(subjectDetails)
  if (!_userExists) {
    console.error("User does not exist")
    return {
      code: 5001,
      msg: "User does not exist. Please create account"
    }
  } else if (!_subjectExists) {
    console.error("Subject does not exist")
    return {
      code: 5001,
      msg: "Subject does not exist. Please mail support team to add subject"
    }
  } else { // User and Subject exist
    const session = driver.session()
    const relation = (
      demand === "has" ?
      `(u)-[:CONNECTS]->(s)` :
      `(u)<-[:CONNECTS]-(s)`
    )
    const query = `
      MATCH ${userNodePattern(userDetails)}, ${subjectNodePattern(subjectDetails)} CREATE ${relation} RETURN u, s
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
  const session = driver.session()
  return session.run(`MATCH ${userNodePattern(userDetails)} RETURN u`)
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

module.exports = {
  initDB,
  addUser,
  userExists,
  subjectExists,
  addUserSubject,
}