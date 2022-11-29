const express = require("express");
const app = express();
const socketio = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const randInt = require("./newID.js");
const Redis = require("ioredis");
//const uuidv4 = require("uuid");
const { v4: uuidv4 } = require('uuid');

//const logger = require("morgan");
//const joinRouter = require("./routes/join");
//going to add redis IP:PORT from here
//need .env file to store security sensitive info like this Redis password and Port#
const client = new Redis({
    host: 'redis-14138.c259.us-central1-2.gce.cloud.redislabs.com',
    port: 14138,
    password: '5zF1UQSFG8it6mir5FRIZuT2zN4BTPWh' 
});



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
        origin: "https://capable-toffee-ebaa27.netlify.app/",
        //methods: ["GET", "POST"]
    }
});
/*
* DESC: Below are functions for communicating with Redis
* params: err -- error message returned if failed to execute
*         res -- response from Redis in the form of string (?)
*         userID -- unique and persistent IDs given to users as they connect with the website
*         peerID -- unique but temporary IDs to help socket.io connect two remote peers to webcall
*/
async function addUserToDB(userID, peerID) { //timestamp param could go here
    const result = await client.hset(userID, 'peerID', peerID, (err, res)=> {
        if(err) console.log(err);
        return res;
    });
    if(result == 0) console.log("[Updated Existing User] user: " + userID + " / peerID: " + peerID)
    if(result == 1) console.log("[New User Added] user: " + userID + " / peerID: " + peerID)
}

async function checkForUser(userID) {
    const alreadyJoined = await client.hexists(users, `${userID}`, (err, res)=> {
        if (err) console.log(err);
        return res;
    })
}

async function addUserToWaitingRoom(userID) {
    await client.rpush('waitingRoom', `${userID}`);
    await client.rpush('waitingRoom', `${uuidv4()}`);
    //let client1 = client.lmpop
}


/* DESC: Socket.io functionalities
* params: 
*
*
*/
io.on('connection', (socket) => {
    socket.emit('messageFromServer', {data: "Hello and welcome!"});
    socket.on('peerID', (user) => {
        //userID is the peerJS ID, subject to change, user
        //needs to be assigned a uuid
        console.log('main:' + user.peerID);
        console.log("USERID: " + user.userID);
        //I want to use a hash for the user to store data
        let inRoom = checkForUser(user.userID);
        if(!inRoom) { //if User does not exist in waiting list, then generate a new user ID and return it
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

////////// THROW TESTS IN HERE  ////////////
client.flushall()
console.log("########  TESTS  ########")
const testHashKey = "hash_key01"
const testHashValue = "hash_value01"

client.hset([testHashKey, 'peerID', testHashValue], (err, res) => {
    if(res == 0) console.log("[Hash SET: Already Exists] key: " + testHashKey + " / value: " + testHashValue)
    if(res == 1) console.log("[Hash SET: New Entry] key: " + testHashKey + " / value: " + testHashValue)
})

client.hget(testHashKey, 'peerID', (err, res) => {
    if(!res){
        console.log("[Hash GET: Failed to retrieve] from: " + testHashKey)
    } else{
        console.log("[Hash GET] from: " + testHashKey + " / received: " + res)
    }
})
let builtins = client.getBuiltinCommands();
console.log(builtins);
let id = uuidv4();
addUserToWaitingRoom(id).then(async (err, res)=> {
    let list = await client.lrange('waitingRoom',0,-1);
    console.log(list)
    let key = await client.keys('waitingRoom');
    console.log("key is key: " + key)
    let pops = await client.lmpop(2,['oops', 'waitingRoom'],"LEFT", (err,res) => {
        console.log(res)
    })
})

//addUserToDB("John.Doe", "0987654321")
////////////////////////////////////////////

