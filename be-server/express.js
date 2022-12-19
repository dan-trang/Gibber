const express = require("express");
//const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

class Express {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3007;
        this.middleware();
        this.expressServer = this.app.listen(this.port);
    }
    middleware() {
        this.app.use(cors({
            origin: "*"
        }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
    }
}

module.exports = Express;
