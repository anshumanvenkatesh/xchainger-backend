const Hapi = require('@hapi/hapi');
const Bell = require('@hapi/bell');
const jwt = require('jsonwebtoken');
var neo4j = require('neo4j-driver');
require('dotenv').config();

const internal = require('./routes/internal')
const external = require('./routes/external')
var dbutils = require('./utils/dbutils')
var utils = require('./utils/misc')

const graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
const graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
const graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET
} = process.env

// console.log("BOLT URL: ", process.env);

const registerRoutes = async (server, session, driver) => {
  server.route({
    method: 'GET',
    path: '/',
    handler: internal.homeHandler(session)
  });

  server.route({
    method: 'GET',
    path: '/ping',
    options: {
      pre: [{method: utils.preEnsureUserExists, assign: 'ensureUser'}],
      auth: 'jwt',
      handler: external.ping
    }
  });

  server.route({
    method: 'PUT',
    path: '/internal/users/{email}',
    options: {
      // auth: 'jwt',
      handler: internal.addUser(driver)
    }
  });

  server.route({
    method: 'DELETE',
    path: '/internal/users/{email}',
    options: {
      // auth: 'jwt',
      handler: internal.removeUser(driver)
    }
  });

  server.route({
    method: 'GET',
    path: '/internal/testreco',
    options: {
      // auth: 'jwt',
      handler: internal.testReco(driver)
    }
  });

  // server.route({
  //   method: 'GET',
  //   path: '/internal/subjects',
  //   options: {
  //     // auth: 'jwt',
  //     handler: internal.getSubjects(driver)
  //   }
  // });

  server.route({
    method: 'PUT',
    path: '/internal/subjects',
    options: {
      // auth: 'jwt',
      handler: internal.addSubject(driver)
    }
  });

  server.route({
    method: 'DELETE',
    path: '/internal/subjects',
    options: {
      // auth: 'jwt',
      handler: internal.removeSubject(driver)
    }
  });

  server.route({
    method: 'GET',
    path: '/restricted',
    options: {
      auth: 'jwt',
      handler: external.restricted
    }
  });

  server.route({
    method: 'DELETE',
    path: '/users'  ,
    options: {
      auth: 'jwt',
      handler: external.removeUser
    }
  });

  server.route({
    method: 'POST',
    path: '/addUserSubject',
    options: {
      auth: 'jwt',
      handler: external.addUserSubject(driver)
    }
  });

  server.route({
    method: 'POST',
    path: '/removeUserSubject',
    options: {
      auth: 'jwt',
      handler: external.removeUserSubject(driver)
    }
  });

  server.route({
    method: 'GET',
    path: '/recos',
    options: {
      auth: 'jwt',
      handler: external.getRecos(driver)
    }
  });

  server.route({
    method: ['GET', 'POST'], // Must handle both GET and POST
    path: '/login', // The callback endpoint registered with the provider
    options: {
      auth: 'google',
      handler: external.login(driver)
    }
  })
}

const init = async () => {
  var driver = await neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
  var session = await driver.session();

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    routes: {
      cors: true
    }
    // host: 'localhost'
  });

  server.app.driver = driver

  await server.register(Bell);
  await server.register(require('hapi-auth-jwt2'))

  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: 'cookie_encryption_password_secure',
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    isSecure: false // Terrible idea but required if not using HTTPS especially if developing locally
  });

  server.auth.strategy('jwt', 'jwt', {
    // key: process.env.JWT_SECRET, // Never Share your secret key
    verify: async (decoded, request) => { 
      const token = request.headers.authorization
      const _isValidUser = await utils.isValidUser(token)
      // console.log("_isValidUser: ", _isValidUser);
      
      if (_isValidUser.isValidUser) {
        // console.log("request.app b4: ", request.server.app);
        const userDetails = await utils.getUserObject(_isValidUser.details)
        request.app.userDetails = userDetails
        return {isValid: true, credentials: "try"}
      }
      return {
        isValid: false,
        credentials: "try"
      }
    },
    // validate: async (decoded, request, h) => {
    //   console.log("decoded in Bell validate: ", decoded);
    //   const isValid = utils.isValidUser(decoded.msg)
    //   return {
    //     isValid
    //   }
      
    // },  // validate function defined above
    verifyOptions: {
      algorithms: ["RS256"],
      ignoreExpiration: true
    }
  });

  await registerRoutes(server, session, driver)

  await server.start();
  console.log('Server running on %s', server.info.uri);
  session.run('MATCH (m) RETURN m')
    .then(res => {
      console.log("MATCH QUERY executed successfully");
      // console.log("results: ", res);
      return

    })
    .then(() => dbutils.initDB(session))
    .catch(err => {
      console.log("\n\n Some error happened \n\n");
      console.error(err);


    })

};


process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();