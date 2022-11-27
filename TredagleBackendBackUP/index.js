const express = require("express");
const app = express();
const socketio = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const randInt = require("./randomNum.js");
//const logger = require("morgan");
//const joinRouter = require("./routes/join");
//going to add redis IP:PORT from here

app.use(cors());
const port = process.env.PORT || 3001;

//app.unsubscribe(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.use("/join", joinRouter);

const expressServer = app.listen(port);
const io = socketio(expressServer, {
    cors: {
        origin: "*"
    }
});

io.on('connection',(socket)=>{
    socket.emit('messageFromServer', {data: "Hello and welcome!"})
    socket.on('userID', (userID)=> {
        console.log(userID.data);
    });
    socket.on('join', (dataFromClient)=> {
        console.log(dataFromClient);
        //generate User ID, add user to waiting room,
        //add socketID to database, only want to 
        //update specific user based on id
        io.to(socket.id).emit("channelUpdate", {
            uid: 123125,
            channelName: "goodmorning",
            token: 23993249
        })
    })
    socket.on('imHome', (data)=> {
        console.log(`This be the data: ${data.data}`);
        io.to(socket.id).emit("message", {
            data: "Hey there buddy pal"
        })
    })
})


module.exports = app;