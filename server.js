'use strict';

const   express        = require('express');
const   path           = require('path');
const   db             = require('./config/db');
const utils            = require("./utils");

const app = express();
app.set("view engine","ejs");
app.set('views',__dirname + "/views");
app.set('views', path.join(__dirname, 'views'));
app.use( express.static( "public" ) );


require('dotenv').config();
const cors = require('cors');
app.use(cors())

//---------------------------------------------------------------//

require('./routes/dashboard')(app);


//---------------------------------------------------------------//
const PORT = 1122; 
const IP = "localhost";
app.listen(PORT ,(err)=>{
    if(err){
        console.log("Some Error occured while starting Server ",err);
    }
    console.log("Server Started at http://"+ IP + ":" +PORT);
}) 

