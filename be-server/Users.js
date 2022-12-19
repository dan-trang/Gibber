
/*
* DESC: Below are functions for communicating with Redis
* params: err -- error message returned if failed to execute
*         res -- response from Redis in the form of string (?)
*         userID -- unique and persistent IDs given to users as they connect with the website
*         peerID -- unique but temporary IDs to help socket.io connect two remote peers to webcall
*/
const { v4: uuidv4 } = require('uuid');
const userState = require("./userStates.js");
const Redis = require("ioredis");

class Users {
    constructor() {
        this.client = new Redis({
            host: 'redis-14138.c259.us-central1-2.gce.cloud.redislabs.com',
            port: 14138,
            password: 'Pj74-qDMbM7BVEpPu'
        });
        //this.client.flushall();
        this.waitingListLength = 0;
        this.activeSinglesLength = 0;
    }
    async addUserToDB(userID, peerID, socketID) { //timestamp param could go here
        const result = await this.client.hset(userID, 'peerID', peerID, 'socketID', socketID, 'status', userState.Waiting, (err, res)=> {
            if(err) console.log(err);
            return res;
        });
        if(result == 0) console.log("[Updated Existing User] user: " + userID + " / peerID: " + peerID)
        if(result == 1) console.log("[New User Added] user: " + userID + " / peerID: " + peerID)
        return result;
    }

    async checkForUser(userID) {
        const alreadyJoined = await this.client.hexists(`${userID}`,"peerID",(err, res)=> {
            if (err) console.log(err);
            if(res == 0) console.log(`[User DNE in DB] status #: ${res}`)
            if(res == 1) console.log(`[User Exists in DB] status #: ${res}`)

            return res;
        })
        return alreadyJoined;
    }

    async checkIfUserInWaitingRoom(userID) {
        let existInWaitingRoom = this.client.smismember('waitingRoom', userID, (err, res)=> {
            if(err) console.log(err)
            if(res == 0) console.log(`[User DNE in Waiting Room] status #: ${res}`)
            if(res == 1) console.log(`[User Exists in Waiting Room] status #: ${res}`)
            return res
        })
        return existInWaitingRoom
    }

    async addUserToActiveSingles(userID) {
        console.log("Pushing User into Active Singles list")
        await this.client.rpush('activeSingles', userID);
        //update status
        await this.updateUserStatus(userID, userState.ActiveSingles);
        //return activeSingles Length
        //let length = await this.client.llen('activeSingles');
        this.activeSinglesLength = this.activeSinglesLength + 1;
        return this.activeSinglesLength;
    }

    async addUserToWaitingList(userID) {
        await this.client.rpush('waitingList', userID);
        //update status
        await this.updateUserStatus(userID, userState.Waiting);
        //return waitingList length
        //let length = await this.client.llen('waitingList');
        this.waitingListLength = this.waitingListLength + 1;
        return this.waitingListLength;
    }
    //Function checks if the user already has an ID stored on their
    //local browser, eventually want to have accounts
    //if they don't have an ID a new one is generated for them
    //returned from the function

    // async checkUserID(user, userInDatabase) {
    //     let userID;
    //     let userInDatabase = await checkForUser(user.userID, user.peerID);
    //     if(userInDatabase == 0) console.log("[User no existo in DB]" + userInDatabase)
    //     if(userInDatabase == 1) console.log("[User Exists in DB]" + userInDatabase)
    //     if(userInDatabase == 0) {
    //         //if user.userID happens to be null, generate a new one
    //         if(user.userID == undefined || user.userID == null){
    //             userID = uuidv4();
    //             console.log("[NEW userID generated for ya]: " + userID)
    //         }
    //         else {
    //             userID = user.userID;
    //         }
    //     }
    //     else{
    //         userID = user.userID;
    //         console.log(`USER ID is ${userID}`);
    //     }
    //     return userID;
    // }    

    async updateUserConnection(userID, peerID, socketID) {
        await this.client.hset(`${userID}`, 'peerID', peerID, 'socketID', socketID);
    }

    async updateUserStatus(userID, state) {
        await this.client.hset(userID, 'status', state)
    }

    async updateUserTalkPartner(userID1, userID2) {
        await this.client.hset(userID1, 'talkPartner', userID2);
    }

    async getSocketID(userID) {
        let user1_socketID = await this.client.hget(userID, "socketID", (err,res)=> {
            if(err) console.log(err)
            else console.log("socketID 1: " + res)
            return res
        });
        return user1_socketID;
    }

    async getPeerID(userID) {
        let user2_peerID = await this.client.hget(user2, "peerID", (err,res)=> {
            if(err) console.log(err)
            else console.log("peerID 2: " + res)
            return res
        })
        return user2_peerID;
    }

    async generateUID() {
        //continue to generate new UID until not in database
        //based on probability should almost always be unique
        let uniqueID = false;
        let UID = '';
        while(uniqueID == false) {
            UID = uuidv4();
            let alreadyInUse = await this.checkForUser(UID);
            if(!alreadyInUse) {
                uniqueID = true;
            }
        }
        return UID;
    }
    // async handleUserLogIn(user) {
    //     let userID = await this.checkUserID(user);
    //     await addUserToDB(userID, user.peerID, socket.id);
    // }
}

module.exports = Users
// module.exports = {
//     addUserToDB,
//     checkForUser,
//     checkIfUserInWaitingRoom,
//     addUserToActiveSingles
// }

