const Users = require('./Users.js');
const userState = require("./userStates.js");

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
       lock.acquire('app:feature:lock').then(async () => {
            await this.addUserToWaitingList(userID);
            //function that pairs two users  
            if(this.activeSinglesLength || this.waitingListLength > 1) {
                let user1;
                let user2;
                if(this.activeSinglesLength > 0) {
                    user1 = await this.client.lpop('activeSingles');
                    user2 = await this.client.lpop('waitingList');
                    this.waitListLength = this.waitListLength - 1;
                    this.activeSinglesLength = this.activeSinglesLength - 1;
                }
                else if(this.waitingListLength > 1) {
                    user1 = await this.client.lpop('waitingList');
                    user2 = await this.client.lpop('waitingList');
                    this.waitListLength = this.waitListLength-2;
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

            return lock.release();
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
        lock.acquire('app:feature:lock').then(async () => {
            await this.addUserToActiveSingles(userID);
            await this.updateUserStatus(userID, userState.activeSingles);
            await this.updateUserTalkPartner(userID, '');
            //function that pairs two users  
            if(this.activeSinglesLength > 1 || this.waitingListLength > 0) {
                let user1;
                let user2;
                if(this.activeSinglesLength > 1) {
                    user1 = await this.client.lpop('activeSingles');
                    user2 = await this.client.lpop('activeSingles');
                    this.activeSinglesLength = this.activeSinglesLength - 2;
                }
                else if(this.waitingListLength > 0) {
                    user1 = await this.client.lpop('activeSingles');
                    user2 = await this.client.lpop('waitingList');
                    this.activeSinglesLength = this.activeSinglesLength - 1;
                    this.waitingListLength = this.waitingListLength - 1;
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

            return lock.release();
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

    async clickedLeave(userID) {
        lock.acquire('app:feature:lock').then(async () => {
            await this.updateUserTalkPartner(userID, '');
            await this.updateUserStatus(userID, userState.Disconnected);
            return lock.release();
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