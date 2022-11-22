const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const joinRouter = require("./routes/join");

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