const Promise = require('bluebird')
const URLs = require("../utils/URLs")


const addConstraints = (session, constraints) => {
  // const promises = constraints.map(constraint => session.run(constraint))
  return Promise.map(constraints, constraint => {
    return session.run(constraint)
  }, {concurrency: 1})
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
        console.log("STATUS", "DB init already!")
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
    .catch(function(error) {
      console.error(error);
  });
}

module.exports = {
  initDB
}