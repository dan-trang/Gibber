const express = require("express");
const app = express();
const socketio = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const randInt = require("./newID.js");
const Redis = require("ioredis");
//const logger = require("morgan");
//const joinRouter = require("./routes/join");
//going to add redis IP:PORT from here
const client = new Redis({
    host: 'redis-14138.c259.us-central1-2.gce.cloud.redislabs.com',
    port: 14138,
    password: '5zF1UQSFG8it6mir5FRIZuT2zN4BTPWh' 

});

client.set('foo','bar', (err, reply) => {
    if (err) throw err;
    console.log(reply);
});

client.get('foo', (err, reply)=> {
    if (err) throw err;
    console.log(reply);
})




app.use(cors());
const port = process.env.PORT || 3007;

//app.unsubscribe(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.use("/join", joinRouter);

const expressServer = app.listen(port);
const io = socketio(expressServer, {
    cors: {
        origin: "*"
    }
});

io.on('connection',(socket)=>{
    socket.emit('messageFromServer', {data: "Hello and welcome!"})
    socket.on('userID', (userID)=> {
        //userID is the peerJS ID, subject to change, user
        //needs to be assigned a uuid
        //if the user isn't in the user set?array? then
        //generate a new ID and return it
        console.log('main:' + userID.data);
        //only emit remoteID when they will connect to someone
        //else
        // socket.emit('remoteID', {remote: userID.data});
    });
   
});


module.exports = app;