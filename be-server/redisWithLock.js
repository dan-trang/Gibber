const Users = require('./Users.js');
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
            await this.updateUserStatus(userID, userStatus.activeSingles);
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

    async setUserToAvoid(userID1, userID2) {
        
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