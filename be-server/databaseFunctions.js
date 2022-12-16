
/*
* DESC: Below are functions for communicating with Redis
* params: err -- error message returned if failed to execute
*         res -- response from Redis in the form of string (?)
*         userID -- unique and persistent IDs given to users as they connect with the website
*         peerID -- unique but temporary IDs to help socket.io connect two remote peers to webcall
*/

async function addUserToDB(client, userID, peerID, socketID) { //timestamp param could go here
    const result = await client.hset(userID, 'peerID', peerID, 'socketID', socketID, 'status', 'waiting', (err, res)=> {
        if(err) console.log(err);
        return res;
    });
    if(result == 0) console.log("[Updated Existing User] user: " + userID + " / peerID: " + peerID)
    if(result == 1) console.log("[New User Added] user: " + userID + " / peerID: " + peerID)
}

async function checkForUser(client, userID, peerID) {
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

async function checkIfUserInWaitingRoom(client, userID) {
    let existInWaitingRoom = client.smismember('waitingRoom', userID, (err, res)=> {
        if(err) console.log(err)
        if(res == 0) console.log(`[User DNE in Waiting Room] status #: ${res}`)
        if(res == 1) console.log(`[User Exists in Waiting Room] status #: ${res}`)
        return res
    })
    return existInWaitingRoom
}

async function addUserToActiveSingles(client, userID) {
    console.log("Pushing User into Active Singles list")
    client.rpush('activeSingles', userID);
}

module.exports = {
    addUserToDB,
    checkForUser,
    checkIfUserInWaitingRoom,
    addUserToActiveSingles
}
