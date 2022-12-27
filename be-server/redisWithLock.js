const Users = require('./Users.js');
const userState = require('./userStates.js');
const userStatus = require("./userStates.js");

class redisWithLock extends Users {
    constructor() {
        super();
        this.lock = require('./public_modules/ioredis-lock/lib/redislock').createLock(this.client, {
            retries: 10,
            delay: 10000
        });
        this.LockAcquisitionError = this.lock.LockAcquisitionError;
        this.LockReleaseError = this.lock.LockReleaseError;
    }

    async waitingListAdd(userID, socket, io) {
       //should put lock here
       this.lock.acquire('app:feature:lock').then(async () => {
            await this.addUserToWaitingList(userID);
            let activeSinglesLength = await this.client.llen('activeSingles');
            let waitingListLength = await this.client.llen('waitingList');
            //function that pairs two users  
            if(activeSinglesLength > 0 || waitingListLength > 1) {
                let user1;
                let user2;
                let first_in_line = await this.client.lrange('waitingList',0,1);
                let first_in_activeSingles = await this.client.lrange('activeSingles',0,1);
                console.log(`The first person in waitingRoom is: ${first_in_line}`);
                console.log(`The first in Active Singles is: ${first_in_activeSingles}`);
                if(activeSinglesLength > 0) {
                    user1 = await this.client.lpop('activeSingles');
                    user2 = await this.client.lpop('waitingList');
                }
                else if(waitingListLength > 1) {
                    user1 = await this.client.lpop('waitingList');
                    user2 = await this.client.lpop('waitingList');
                }
                //update user1 and user2 status and talkPartner fields
                this.updateUserStatus(user1, userStatus.InCall);
                this.updateUserStatus(user2, userStatus.InCall);

                this.updateUserTalkPartner(user1, user2);
                this.updateUserTalkPartner(user2, user1);

                let user1_socketID = await this.getSocketID(user1);
                let user2_peerID = await this.getPeerID(user2);

                io.to(user1_socketID).emit('remoteID', {remote: user2_peerID})
            }

            return this.lock.release();
        }).then(() => {
        // Lock has been released
            console.log("Waiting List ADD event occurred")
            console.log("**************  END ******************")
        }).catch(this.LockAcquisitionError, (err) => {
            console.log("Acquisition Error" + err)
        // The lock could not be acquired
        }).catch(this.LockReleaseError, (err) => {
            console.log("Release Error" + err)
        // The lock could not be released
        });
    }

    async activeSinglesAdd(userID, io) {
        console.log("In activeSinglesADD outside of lock")
        this.lock.acquire('app:feature:lock').then(async () => {
            console.log("In active SinglesADD inside of lock")
            await this.addUserToActiveSingles(userID);
            await this.updateUserStatus(userID, userState.ActiveSingles);
            await this.updateUserTalkPartner(userID, '');
            let activeSinglesLength = await this.client.llen('activeSingles');
            let waitingListLength = await this.client.llen('waitingList');
            //function that pairs two users  
            if(activeSinglesLength > 1 || waitingListLength > 0) {
                let user1;
                let user2;
                if(activeSinglesLength > 1) {
                    user1 = await this.client.lpop('activeSingles');
                    user2 = await this.client.lpop('activeSingles');
                }
                else if(waitingListLength > 0) {
                    user1 = await this.client.lpop('activeSingles');
                    user2 = await this.client.lpop('waitingList');
                }
                //update user1 and user2 status and talkPartner fields
                this.updateUserStatus(user1, userStatus.InCall);
                this.updateUserStatus(user2, userStatus.InCall);

                this.updateUserTalkPartner(user1, user2);
                this.updateUserTalkPartner(user2, user1);

                let user1_socketID = await this.getSocketID(user1);
                let user2_peerID = await this.getPeerID(user2);

                io.to(user1_socketID).emit('remoteID', {remote: user2_peerID})
            }

            return this.lock.release();
        }).then(() => {
        // Lock has been released
            console.log("Active Singles ADD event occurred")
            console.log("**************  END ******************")
        }).catch(this.LockAcquisitionError, (err) => {
            console.log("Acquisition Error" + err)
        // The lock could not be acquired
        }).catch(this.LockReleaseError, (err) => {
            console.log("Release Error" + err)
        // The lock could not be released
        });
        
    }


    async setUserAvoidance(io, userID1, userID2, timeToAvoid) {
        //first add a hash to the database composed of both uids
        //seperate uids by z
        //put id that is less first
        //in milliseconds
        timeToAvoid = timeToAvoid * 1000;
        let key;
        if(userID1 > userID2)
            key = `${userID1}z${userID2}`;
        else
            key = `${userID2}z${userID1}`;
        this.lock.acquire('app:feature:lock').then(async () => {
            await this.client.hset(key);
            return this.lock.release();
            }).then(() => {
            // Lock has been released
                
                console.log("Active Singles ADD event occurred")
                console.log("**************  END ******************")
            }).catch(this.LockAcquisitionError, (err) => {
                console.log("Acquisition Error" + err)
            // The lock could not be acquired
            }).catch(this.LockReleaseError, (err) => {
                console.log("Release Error" + err)
            // The lock could not be released
            });
            setTimeout(()=> {
                this.lock.acquire('app:feature:lock').then(async () => {
                    //delete key
                    await this.client.del(key);
                    //send io message
                    let socketID = await this.client.hget(userID1, 'socketID');
                    io.to(socketID).emit('avoidExpired');
                    let user1isAvailable = await this.isAvailable(userID1);
                    let user2isAvailable= await this.isAvailable(userID2);
                    if(user1isAvailable && user2isAvailable) {
                        let user1Status = await this.client.hget(userID1, 'status');
                        let user2Status = await this.client.hget(userID2, 'status');
                        await this.removeFromLists(userID1, user1Status);
                        await this.removeFromLists(userID2, user2Status);
                        await this.updateUserStatus(userID1, userState.InCall);
                        await this.updateUserStatus(userID2, userState.InCall);
                        await this.updateUserTalkPartner(userID1, userID2);
                        await this.updateUserTalkPartner(userID2, userID1);

                        //send socket.io message
                        //Make sure that user States are updated correctly
                        //send peer2 id to socket1
                    }
                    
                    
                    return this.lock.release();
                    }).then(() => {
                    // Lock has been released
                        
                        console.log("Sent message of Avoidance Expiration")
                        console.log("**************  END ******************")
                    }).catch(this.LockAcquisitionError, (err) => {
                        console.log("Acquisition Error" + err)
                    // The lock could not be acquired
                    }).catch(this.LockReleaseError, (err) => {
                        console.log("Release Error" + err)
                    // The lock could not be released
                    });
                }, timeToAvoid);
            //setTimeout needed
            
    }

    async clickedLeave(userID) {
        this.lock.acquire('app:feature:lock').then(async () => {
            await this.updateUserTalkPartner(userID, '');
            await this.updateUserStatus(userID, userStatus.Disconnected);
            return this.lock.release();
        }).then(() => {
        // Lock has been released
            console.log("User Clicked LEave status updated")
            console.log("**************  END ******************")
        }).catch(this.LockAcquisitionError, (err) => {
            console.log("Acquisition Error" + err)
        // The lock could not be acquired
        }).catch(this.LockReleaseError, (err) => {
            console.log("Release Error" + err)
        // The lock could not be released
        });
        
    }

    

    async pairUsers(userID, socket, io) {
        
    }
}

module.exports = redisWithLock;