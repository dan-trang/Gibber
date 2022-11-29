const express = require("express");
const app = express();
const socketio = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const randInt = require("./newID.js");
const Redis = require("ioredis");
const uuidv4 = require("uuid");
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

// client.hset('8654985469', 'peerID', "435987549387kuwgh").then(
// client.hget('8654985469', 'peerID', (err, res)=> {
//     console.log(res)
// })
// )




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

//Functions for redis
async function checkForUser(userID) {
        const alreadyJoined = await client.hexists(users, `${userID}`, (err, res)=> {
            if (err) console.log(err);
            return res;
        }
        )
    
}

//timestamp could go here
async function addUserToDB(userID, peerID) {

    const result1 = await client.hset(userID, 'peerID', peerID, (err, res)=> {
        return res;
    });
    console.log(result1)
}

addUserToDB("dfasfdsah463432095u5432hngw", "023980423")
//End functions for redis

io.on('connection',(socket)=>{
    socket.emit('messageFromServer', {data: "Hello and welcome!"})
    socket.on('peerID', (user)=> {
        //userID is the peerJS ID, subject to change, user
        //needs to be assigned a uuid
        //if the user isn't in the user set?array? then
        //generate a new ID and return it
        console.log('main:' + user.peerID);
        console.log("USERID: " + user.userID);
        //I want to use a hash for the user to store data
        let inRoom = checkForUser(user.userID);
        if(!inRoom) {
            //generate userID
            let userID = uuidv4();
           //emit userID event back to specific socket
            io.to(socket.id).emit('UID', {
                newUID: userID
            })
            addUserToDB(userID, user.peerID);
            //Two queues: in call and waiting
            //implemented with redis list
            //Check length of waiting list
                //if length==0
                //put in waiting list
                //if length>0
                //add this user to waiting list 
                //pair first two users in waiting room


            
            //check available users list, if user there
                //pair them
            //else
                //put them in available waiting room
        }
        else {

        }
        //only emit remoteID when they will connect to someone
        //else
        // socket.emit('remoteID', {remote: userID.data});
    });
   
});


module.exports = app;