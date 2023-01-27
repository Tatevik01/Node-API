require('rootpath')();
//require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');
const http = require('http');
//initialize a simple http server
const server = http.createServer(app);
const session = require("express-session");

const WebSocket = require('ws');
const dronesService = require('./drones/drone.service');
const wss = new WebSocket.Server({  server });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
var sessionOptions = {
  key: 'session.sid',
  secret: 'Some secret key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: 600000
  }
};
app.use(session(sessionOptions));

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/users', require('./users/user.controller'));
app.use('/auth', require('./auth/auth.controller'));
app.use('/drones',require('./drones/drone.controller'));

// app.use(multer({ dest: './uploads/',
//     rename: function (fieldname, filename) {
//       return filename;
//     },
//    }));
// global error handler
app.use(errorHandler);

 

wss.on('connection', (ws) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (droneUpd) => {

        dronesService.updateMovement(droneUpd);
        //log the received message and send it back to the client
        console.log('received: %s', droneUpd);
        ws.send(`Hello, you sent -> ${droneUpd}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});


// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 4000;
server.listen(port, function () {
    console.log('Server listening on port ' + port);
});
