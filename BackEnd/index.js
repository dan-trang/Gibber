const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const joinRouter = require("./routes/join");

//Agora Token generation
//uses integer userids for authentication
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')

//Test code for generator
const appId = '74276218f4974bd293d59106662ab774';
const appCertificate = '15e5de76fbb04fb781b871267e181361';
const channelName = 'Bobs';
const uid = 0;
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600
const currentTimestamp = Math.floor(Date.now() / 1000)
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
// Build token with uid
const tokenA = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs);
console.log("Token with integer number Uid: " + tokenA);



//going to add redis IP:PORT from here

const port = process.env.PORT || 3001;

app.unsubscribe(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/join", joinRouter);

app.listen(port, function() {
    console.log("Running on " + port)
});
module.exports = app;