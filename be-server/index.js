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

const redisWithLock = require('./redisWithLock.js');
var database = new redisWithLock();
//require("dotenv").config();

console.log("Check to see if APP can load if repushed");
//require("dotenv").config();
//const logger = require("morgan");
//const joinRouter = require("./routes/join");
//going to add redis IP:PORT from here
//need .env file to store security sensitive info like this Redis password and Port#
// const client = new Redis({
//     host: 'redis-14138.c259.us-central1-2.gce.cloud.redislabs.com',
//     port: 14138,
//     password: 'Pj74-qDMbM7BVEpPu'
// });

// const lock = require('./public_modules/ioredis-lock').createLock(client, {
//     retries: 10,
//     delay: 10000
// });
 
// const LockAcquisitionError = lock.LockAcquisitionError;
// const LockReleaseError = lock.LockReleaseError;

const port = process.env.PORT || 3007;
console.log("Heroku Port is: " + port);
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


/* DESC: Socket.io functionalities
* params: 
*
*
*/

console.log("Right before connection socket event")
io.on('connection', (socket) => {
    console.log("Just started connection event")
    socket.on('peerID', async (user) => {

        console.log("[Initial UserID]" + user.userID)

        //check if userID is in the database as a user hash key already...
        
        let userInDatabase = await database.checkForUser(user.userID);
        let userID;
        if(!userInDatabase) {
            if(user.userID == null || user.userID == undefined)
                userID = await database.generateUID();
            else
                userID = user.userID;
            io.to(socket.id).emit('newUID', {
                newUID: userID
            })
            await database.addUserToDB(userID,user.peerID,socket.id);
        }
        else {
            await database.updateUserConnection(user.userID, user.peerID, socket.id);
        }
        console.log("Heroku should log Waiting List Add console logs after this: ");
        await database.waitingListAdd(user.userID, socket, io);
        console.log(await database.client.lrange('waitingList', 0 , 0));
    });

    //Add user active singles
    socket.on('remote leave', async (user) => {
        await database.activeSinglesAdd(user.userID, io);
    })

    socket.on('clickedLeave', async (user)=> {
        await database.clickedLeave(user.userID);
    })

    socket.on("disconnect", (reason)=> {
        console.log(reason);
    })
});

module.exports = app;

////////// THROW TESTS IN HERE  ////////////
// client.flushall()
// console.log("########  TESTS  ########")
// const testHashKey = "hash_key01"
// const testHashValue = "hash_value01"

// client.hset([testHashKey, 'peerID', testHashValue], (err, res) => {
//     if(res == 0) console.log("[Hash SET: Already Exists] key: " + testHashKey + " / value: " + testHashValue)
//     if(res == 1) console.log("[Hash SET: New Entry] key: " + testHashKey + " / value: " + testHashValue)
// })

// client.hget(testHashKey, 'peerID', (err, res) => {
//     if(!res){
//         console.log("[Hash GET: Failed to retrieve] from: " + testHashKey)
//     } else{
//         console.log("[Hash GET] from: " + testHashKey + " / received: " + res)
//     }
// })

//addUserToDB(client,"John.Doe", "0987654321")
////////////////////////////////////////////

