const Hapi = require('@hapi/hapi');
const Bell = require('@hapi/bell');
const jwt = require('jsonwebtoken');
var neo4j = require('neo4j-driver');
require('dotenv').config();

const internal = require('./routes/internal')
var dbutils = require('./utils/dbutils')

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
    handler: internal.ping
  });

  server.route({
    method: 'PUT',
    path: '/users',
    handler: internal.addUser(session)
  });

  server.route({
    method: 'GET',
    path: '/restricted',
    options: {
      auth: 'jwt',
      handler: internal.restricted
    }
  });

  server.route({
    method: 'POST',
    path: '/addUserSubject',
    options: {
      // auth: 'jwt',
      handler: internal.addUserSubject(driver)
    }
  });

  server.route({
    method: 'POST',
    path: '/removeUserSubject',
    options: {
      // auth: 'jwt',
      handler: internal.removeUserSubject(driver)
    }
  });

  server.route({
    method: ['GET', 'POST'], // Must handle both GET and POST
    path: '/login', // The callback endpoint registered with the provider
    options: {
      auth: 'google',
      handler: internal.login(driver)
    }
  })
}

const registerAuthServices = async (server) => {

}


const init = async () => {
  var driver = await neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
  var session = await driver.session();

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    // host: 'localhost'
  });

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
    key: process.env.JWT_SECRET, // Never Share your secret key
    validate: async (decoded, request, h) => {
      console.log("decoded: ", decoded);
      // console.log("decoded: ", decoded);
      return {
        isValid: true
      }
      
    },  // validate function defined above
    headless: {
      alg: "HS256",
      typ: "JWT"
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
  // await session.run('CREATE (a:Person {name: "TEST NAME"}) RETURN a')
  // console.log("user inserted");

};


process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();