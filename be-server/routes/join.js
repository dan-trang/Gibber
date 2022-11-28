const express = require("express");
const router = express.Router();

let waitingRoom = require('../dummyDatabase')

//add player to database  or make request to database?
//what order should those things occur in ?
//if no available user, add to pool
//otherwise don't add to pool, add to inConversation database

//so in request I will have username. Express middlewear will assign unique id
//and log users time they join chat