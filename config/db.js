const mongoose = require('mongoose');
const firebase = require("firebase/app");
const path      = require("path");


require('dotenv').config({ path: path.join(__dirname , ".." ,".env") });


const db_url = process.env.DB_HOST || "mongodb://127.0.0.1:27017/RSI";    
mongoose.connect(db_url,{  useNewUrlParser: true  } ,(err)=>{
    if(err){
        console.log("Some problem occured While Connecting to MongoDB ", err);
    }else{
        console.log("Mongodb Connected Successfully at" , db_url );
    }
});





//-----------------------------------------------------------FirebaseConfiguration-------------------------------------------------------//

const firebaseConfig =  {
    "apiKey": "AIzaSyDSxF3ELmh25350kWS2BEOwpQeHJu1oPPs",
    "authDomain": "vats-retbot.firebaseapp.com",
    "projectId": "vats-retbot",
    "storageBucket": "vats-retbot.appspot.com",
    "messagingSenderId": "366608863292",
    "appId": "1:366608863292:web:e6649a5937cee633fff339",
    "measurementId": "G-S467FZ292Z"
  }


require("firebase/auth");
firebase.initializeApp(firebaseConfig);
console.log("Firebase Initialized Successfully!!");

//---------------------------------------------------------------------------------------------------------------------------------------//
