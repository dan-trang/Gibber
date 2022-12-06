const express = require("express");
const app = express();
const socketio = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const randInt = require("./newID.js");
const Redis = require("ioredis");
const { v4: uuidv4 } = require('uuid');
const Origin = "https://capable-toffee-ebaa27.netlify.app";
//const Origin = "http://127.0.0.1:5173/"

require("dotenv").config();
//const logger = require("morgan");
//const joinRouter = require("./routes/join");
//going to add redis IP:PORT from here
//need .env file to store security sensitive info like this Redis password and Port#
const client = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
});

const lock = require('./public_modules/ioredis-lock').createLock(client, {
    retries: 10,
    delay: 10000
});
 
const LockAcquisitionError = lock.LockAcquisitionError;
const LockReleaseError = lock.LockReleaseError;

const port = process.env.PORT || 3007;

//app.unsubscribe(logger('dev'));
app.use(cors({
    origin: "*"
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.set("trust proxy", true);

//app.use("/join", joinRouter);

const expressServer = app.listen(port);
const io = socketio(expressServer, {
    cors: {
        origin: "*",
        method: "GET, POST",
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
        if(res == 0) console.log(`[User DNE in DB] status #: ${res}`)
        if(res == 1) console.log(`[User Exists in DB] status #: ${res}`)

        return res;
    })
    if(alreadyJoined == 1) {
            await client.hset(`${userID}`, 'peerID', peerID);
    }
    return alreadyJoined;
}

async function checkIfUserInWaitingRoom(userID) {
    let existInWaitingRoom = client.smismember('waitingRoom', userID, (err, res)=> {
        if(err) console.log(err)
        if(res == 0) console.log(`[User DNE in Waiting Room] status #: ${res}`)
        if(res == 1) console.log(`[User Exists in Waiting Room] status #: ${res}`)
        return res
    })
    return existInWaitingRoom
}

/* DESC: Socket.io functionalities
* params: 
*
*
*/


io.on('connection', (socket) => {
    console.log("HEYEHEYHEY")
    socket.emit('messageFromServer', {data: "Hello and welcome!"});
    
    socket.on('peerID', async (user) => {

        console.log("[Initial UserID]" + user.userID)

        //check if userID is in the database as a user hash key already...
        let userInDatabase = await checkForUser(user.userID, user.peerID);
        if(userInDatabase == 0) console.log("[User no existo in DB]" + userInDatabase)
        if(userInDatabase == 1) console.log("[User Exists in DB]" + userInDatabase)
        if(userInDatabase == 0) {
            //if user.userID happens to be null, generate a new one
            if(!user.userID){
                var userID = uuidv4();
                console.log("[NEW userID generated for ya]: " + userID)
            }
            else{
                userID = user.userID
            }

           //emit userID event back to specific socket
            io.to(socket.id).emit('newUID', {
                newUID: userID
            })

            await addUserToDB(userID, user.peerID, socket.id);
            console.log("[Added User to DB]: " + userID + " with peerID = " + user.peerID)
        }

        lock.acquire('app:feature:lock').then(async () => {
            console.log("DOES USERID EXIST AT THIS POINT?: " + userID)

            //if userID does not yet exist in the waiting room, add then to the room and queue 'er up!
            let userInWaitingRoom = await checkIfUserInWaitingRoom(userID)
            console.log("WHY ARE YOU NOT WORKING " + userInWaitingRoom)
            if(userInWaitingRoom == 0){
                let room_status = await client.sadd('waitingRoom', userID );
                console.log("Waiting Room SADD = " + room_status)
                let list_status = await client.rpush('waitingList', userID );
                console.log("Waiting List RPUSH = " + list_status)
            }

            let length = await client.llen('waitingList');
            console.log("Waiting List length = " + length)

            let contents = await client.lrange('waitingList',0,-1);
            console.log(`[Waiting List]: ${contents}`)

            if(length > 1) {
                //pop user1 and user2 to extract info and remove from waitingList
                let user1 = await client.lpop('waitingList');
                let user2 = await client.lpop('waitingList');

                //Get user1's socket ID
                let user1_socketID = await client.hget(user1, "socketID", (err,res)=> {
                    if(err) console.log(err)
                    else console.log("socketID 1: " + res)
                    return res
                });

                //Get user2's peerID
                let user2_peerID = await client.hget(user2, "peerID", (err,res)=> {
                    if(err) console.log(err)
                    else console.log("peerID 2: " + res)
                    return res
                })
                console.log(`[User2 PeerID]: ${user2_peerID} and [User1 socketID]: ${user1_socketID}` )

                //Use socketID and peerID 
                io.to(user1_socketID).emit('remoteID', {remote: user2_peerID})
            }
                
            return lock.release();
        }).then(() => {
            // Lock has been released
            console.log("WAHWAHWEEWAH RELEAAAASE")
            console.log("**************  END ******************")
        }).catch(LockAcquisitionError, (err) => {
            console.log("Acquisition Error" + err)
            // The lock could not be acquired
        }).catch(LockReleaseError, (err) => {
            console.log("Release Error" + err)
            // The lock could not be released
        });

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

