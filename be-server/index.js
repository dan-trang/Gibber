const express = require("express");
const app = express();
const socketio = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const randInt = require("./newID.js");
const Redis = require("ioredis");
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

const lock = require('./public_modules/ioredis-lock').createLock(client);
 
const LockAcquisitionError = lock.LockAcquisitionError;
const LockReleaseError = lock.LockReleaseError;

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
        origin: "*",
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
async function addUserToDB(userID, peerID, socketID) { //timestamp param could go here
    const result = await client.hset(userID, 'peerID', peerID, 'socketID', socketID, (err, res)=> {
        if(err) console.log(err);
        return res;
    });
    if(result == 0) console.log("[Updated Existing User] user: " + userID + " / peerID: " + peerID)
    if(result == 1) console.log("[New User Added] user: " + userID + " / peerID: " + peerID)
}

async function checkForUser(userID, peerID) {
    const alreadyJoined = await client.hexists(`${userID}`,"peerID",(err, res)=> {
        if (err) console.log(err);
        console.log("IN CHECK FOR USER")
        console.log(`userID: ${res}`)
        
        return res;
    })
    if(alreadyJoined != 0) {
            await client.hset(`${userID}`, 'peerID', peerID);
        }
    return alreadyJoined;
}

async function addUserToWaitingRoom(userID) {
    await client.rpush('waitingRoom', `${userID}`);
    await client.rpush('waitingRoom', `${uuidv4()}`);
    //let client1 = client.lmpop
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
    socket.on('peerID', async (user) => {
        //userID is the peerJS ID, subject to change, user
        //needs to be assigned a uuid
        // console.log(`SOCKETID: 
        // ${socket.id}`);
        // console.log('main:' + user.peerID);
        console.log("USERID: " + user.userID);
        //I want to use a hash for the user to store data
        let inRoom = await checkForUser(user.userID);
        console.log("inroom AMIAMIAMI inroom " + inRoom)
        if(inRoom == 0) { //if User does not exist in waiting list, then generate a new user ID and return it
            //generate userID
            let userID = uuidv4();
            console.log("YOYOYOYOYOYO")
           //emit userID event back to specific socket
            io.to(socket.id).emit('newUID', {
                newUID: userID
            })
            addUserToDB(userID, user.peerID, socket.id);
            //Two queues: in call and waiting
            //implemented with redis list
            //Check length of waiting list
                //if length==0
                //put in waiting list
                //if length>0
                //add this user to waiting list 
                //pair first two users in waiting room
                lock.acquire('app:feature:lock').then(async () => {
                    // Lock has been acquired
                    //check if any user inCall and free
                        //check if user is in waiting room   
                        //else pair self with inCall and free person
                    //else add self to back of queue
                        //if two users in queue pair them
                        //else do nothing
                    await client.rpush('waitingRoom',userID );
                    let length = await client.llen('waitingRoom');
                    let contents = await client.lrange('waitingRoom',0,-1);
                    console.log(`Thee waitingROOM is ${contents}`)
                    console.log(length + " IS THE LENGTH")
                    if(length > 1) {
                        let user1 = await client.lpop('waitingRoom');
                        let user2 = await client.lpop('waitingRoom');
                        let socketid1 = await client.hget(user1, "socketID", (err,res)=> {
                            if(err) console.log(err)
                            else console.log(res)
                        });
                        let peerid1 = await client.hget(user1, "peerID", (err,res)=> {
                            if(err) console.log(err)
                            else console.log(res)
                        })
                        console.log(`PEERID: ${peerid1} and SOCKETID: ${socketid1}` )
                        io.to(socketid1).emit('remoteID', {remote: peerid1})

                    }
                
                    return lock.release();
                  }).then(() => {
                    // Lock has been released
                    console.log("WAHWAHWEEWAH")
                  }).catch(LockAcquisitionError, (err) => {
                    // The lock could not be acquired
                  }).catch(LockReleaseError, (err) => {
                    // The lock could not be released
                  });

            
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

addUserToDB("John.Doe", "0987654321")
////////////////////////////////////////////

