const Hapi = require('@hapi/hapi');
const internal = require('./routes/internal')

var neo4j = require('neo4j-driver');
var dbutils = require('./utils/dbutils')
var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
var session = driver.session();



const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    // host: 'localhost'
  });
  
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


  await server.start();
  console.log('Server running on %s', server.info.uri);
  await dbutils.initDB(session)
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();