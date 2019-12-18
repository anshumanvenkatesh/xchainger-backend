const Hapi = require('@hapi/hapi');
const internal = require('./routes/internal')

const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: 'localhost'
  });
  
  server.route({
    method: 'GET',
    path: '/',
    handler: internal.homeHandler
  });

  server.route({
    method: 'GET',
    path: '/ping',
    handler: internal.ping
  });


  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();