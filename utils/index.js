const fetch = require("node-fetch");
const logger = require('pino')();
const path      = require("path");
const mongoose = require("mongoose");
const db  = require("../config/db");
const nodemailer = require('nodemailer');

const setsCollection     = require("../models/set");
const accountsCollection = require("../models/account");

require('dotenv').config({ path: path.join(__dirname , ".." ,".env") });

let LIVEPRICES_URL = process.env.LIVEPRICES_URL || "http://localhost:4001";
let LIVEIND_URL    = process.env.LIVEIND_URL    || "http://localhost:4002";
let BMS_URL        = process.env.BMS_URL        || "http://localhost:4003";

//let adminEmails = [  "vats0726@gmail.com" ];
let adminEmails = [ "rachit.chawla@finwaycapital.com",
                    "vats0726@gmail.com",
                    "Aayush.suri2423@gmail.com" ,
                    "pratikmi906@gmail.com" ,
                    "info@alphabot.ai" ,
                    "kanishk.250026@gmail.com"
                ];


console.log("LIVEPRICES_URL  = ", LIVEPRICES_URL)
console.log("LIVEIND_URL     = ", LIVEIND_URL)
console.log("BMS_URL         = ", BMS_URL)

const indx = {"time" : 0, "open" : 1 , "high" : 2 ,"low" : 3,"close" : 4 ,"vol" : 5 ,"oi" : 6 };

async function waitForXseconds(x){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve("done");
        },x*1000);
    })
};

function print(msg1,msg2,msg3,msg4,msg5,msg6,msg7,msg8,msg9,msg10,msg11){
    var dt = new Date();
    var currTime = dt.toLocaleString("en-US");
    if(msg1 === undefined){
        console.log(currTime);
    }else if(msg2 === undefined){
        console.log(currTime," ::  ", msg1);
    }else if(msg3 === undefined){
        console.log(currTime," ::  ",msg1,msg2);
    }else if(msg4 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3);
    }else if(msg5 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4);
    }else if(msg6 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4,msg5);
    }else if(msg7 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4,msg5,msg6);
    }else if(msg8 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4,msg5,msg6,msg7);
    }else if(msg9 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4,msg5,msg6,msg7,msg8);
    }else if(msg10 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4,msg5,msg6,msg7,msg8,msg9);
    }else if(msg11 === undefined){
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4,msg5,msg6,msg7,msg8,msg9,msg10);
    }else{
        console.log(currTime," ::  ",msg1,msg2,msg3,msg4,msg5,msg6,msg7,msg8,msg9,msg10,msg11);
    }
};

function getLTP(instrument){
    
    return new Promise(async (resolve,reject)=>{
        let url = LIVEPRICES_URL + "/api/LTP?instrument=" + instrument;
        try{
            let res = await fetch(url);
            res = await res.json();
            if(res['status'] == 'success'){
                resolve(res['ltp']);
            }else{
                print("ERROR-log",res);
                reject(res);
            }           
        }catch(err){
            print("ERROR-log",err);
            reject(err);
        }
    })
}

function getBreakoutRange(prevDayHigh , prevDayLow , prevDayClose , openHigh , openLow){

    let A = prevDayHigh;
    let B = prevDayLow;
    let C = prevDayClose;
    let D = openHigh;
    let E = openLow;
    let F = ((A-B) + (D-E))*0.618;
    let G = ( D >(C+F) || E < (C-F)) 
    let H4 = 999999;
    let L4 = 0;

    if ( G == true){
        H4 = D;
        L4 = E;
    }else{
        H4 = C+F;
        L4 = C-F;
    }

    let retObj = {
        "H4" : parseFloat(H4.toFixed(2)) ,
        "L4" : parseFloat(L4.toFixed(2))
    }

    return retObj;   

}

function getCurrentExpiryDetails(){
    
    return new Promise(async (resolve,reject)=>{
        let url = LIVEPRICES_URL + "/api/expiry";
        try{
            let res = await fetch(url);
            res = await res.json();
            if(res['status']=="success"){
                resolve(res['expiry']);
            }else{
                reject(res);
            }
            
        }catch(err){
            print("ERROR-log",err);
            reject(err);
        }
    })
}

function waitForTime(entryHour,entryMinute,entrySecond){

    return new Promise(async (resolve,reject)=>{
        while(1){   
            var dt = new Date();
            print("WaitingForTime " +  entryHour + ":" + entryMinute + ":" + entrySecond) ;

            if( dt.getHours() > entryHour || 
                (dt.getHours() == entryHour && dt.getMinutes() > entryMinute)  ||
                (dt.getHours() == entryHour && dt.getMinutes() >= entryMinute && dt.getSeconds() >= entrySecond) ){
                // print( { message : " Strategy Start Time Reached starting BNF Express ", time : dt.toLocaleTimeString()  });
                resolve(true);
                break;
            }else{
                //print("waiting for " , 1000 - (new Date()).getMilliseconds()  );
                await waitForXseconds( 1 - (new Date()).getMilliseconds()/1000 );
            }
        }
    });
}

// In autoLogin , first check if setToken is valid or not .
async function autoLogin(client){

    print({ "function" : "autoLogin()" , "client" : client });
    return new Promise(async (resolve,reject)=>{
        let url = BMS_URL + "/api/brokers/" + client.broker + "/autologin";

        try{
            let res = await fetch(url , {
                method : "POST" ,
                headers: { 'Content-Type': 'application/json' },
                body : JSON.stringify(client)
            });
            res = await res.json();
            print(res);
            resolve(res['accessToken']);
        }catch(err){
            print("ERROR-log"," Could not find AccessToken !!\n ");
            print("ERROR-log",err);
        }
    });

}

function getCurrentDayCandles(instrument,timeframe){
    return new Promise(async (resolve,reject)=>{
        
        let today = new Date();
        let dateFormat = today.getFullYear().toString() + "-" + (today.getMonth() + 1 ).toString() + "-" + today.getDate().toString();

        let url = LIVEIND_URL + "/api/candles?instrument=" + instrument + "&timeframe=" + timeframe + "&from=" + dateFormat +  "&to=" + dateFormat;
        //print({ "url" : url });
        try {
            let res = await fetch(url);
            res = await res.json();
            //print(res);
            if (res['status'] == "success") {
                // last element is the latest candle 
                resolve(res['data']);
            }else{
                reject(res);
            }
        }catch(err){
            reject(err);
        }

    })
}


function getPrevDayCandle(instrument ){

    return new Promise(async (resolve,reject)=>{

        let url = LIVEIND_URL + "/api/candles/latest?instrument=" + instrument + "&timeframe=" + "day" + "&count=" + "2";
        //print(url);
        try {
            let res = await fetch(url);
            res = await res.json();
            //print(res);
            if (res['status'] == "success") {
                // last element is the latest candle 
                let candles = res['data'];
                candles.reverse();

               if( (new Date(candles[0][0])).getDate() == (new Date()).getDate()){
                    resolve(candles[1]);
               } else{
                    resolve(candles[0]);
               }
            }else{
                reject(res);
            }
        }catch(err){
            reject(err);
        }

    })
    
}


async function placeTrade({ userID, broker , apiKey, accessToken, t_type, instrument, qty, product, order_type, price, trigger_price  } ){
    
    trade = {        
        "userID"        : userID ,
        "apiKey"        : apiKey ,
        "accessToken"   : accessToken,
        "t_type"        : t_type ,
        "instrument"    : instrument,
        "qty"           : qty ,  
        "product"       : product ,
        "order_type"    : order_type ,
        "price"         : price ,
        "trigger_price" : trigger_price 
    }
    
    let url = BMS_URL + "/api/brokers/" + broker + "/placeTrade";
    //console.log(url);

    try{
        let res = await fetch(url , {
            method : "POST" ,
            headers: { 'Content-Type': 'application/json' },
            body : JSON.stringify(trade)
        });
        res = await res.json();

        if(res['status'] == 'success'){
            print({ "broker": broker , "userId" : userID, res });
        }else{
            print("ERROR-log",{ "broker": broker , "userId" : userID, "response" : res.message });
        }
        
    }catch(err){
        print("ERROR-log"," Could not Place Trade on ", client.userID);
        print("ERROR-log",{ "broker": broker , "userId" : userID, "error" : err });
    }

}

async function placeTradeOnAllClients( strategy , trades ){
    
    try{
         let strategySet = await  setsCollection.findOne({"nameOfSet" : strategy });
         //console.log(strategySet);
         
         strategySet['accounts'].forEach( async (account) =>{
 
             // Find Account Details , for each account listed in SET
             let accountDetails = await accountsCollection.findById( mongoose.Types.ObjectId(account['accountID']) );
             //console.log(accountDetails);
 
             // Take all the trades mentioned in trades [] on each account .
             trades.forEach(async (trade) =>{
                 // other details are already present in trade object
                 trade['userID']      = accountDetails['userID'];
                 trade['broker']      = accountDetails['broker'];
                 trade['qty']         = account['multiplier'] * trade['lotSize'] ;
                 trade['apiKey']      = accountDetails['apiKey'];                
                 trade['accessToken'] = accountDetails['accessToken'];
 
                 placeTrade(trade);
                 //console.log(trade);
             })
         })
    }catch(err){
         print("ERROR-log",err);
    }   
 
 }


function getOpening10minCandle(instrument){

    // 1 day = 375 minutes  ( if candle size is 5min => then no. of candles req are 375/5 = 75  )
    return new Promise(async (resolve,reject)=>{

        let url = LIVEIND_URL + "/api/candles/latest?instrument=" + instrument + "&timeframe=" + "10minute" + "&count=" + "40";
        //console.log(url);
        try {
            let res = await fetch(url);
            res = await res.json();
            //console.log(res);           

            if (res['status'] == "success") {
                let candles = res['data'];               
                for(let i=candles.length -1 ;i>= 0;i--){
                    let candleTime = new Date(candles[i][0]);                    
                    // candleTime.getDate() == (new Date()).getDate() 
                    if(candleTime.getDate() == (new Date()).getDate() && candleTime.getHours() == 9 && candleTime.getMinutes() == 15  ){
                        // console.log(candles[i]);
                        resolve(candles[i]);
                        break;
                    }
                }
            }else{
                reject(err);
            }
        }catch(err){
            reject(err);
        }

    })
    
}

function getOpening25minCandle(instrument){

    // 1 day = 375 minutes  ( if candle size is 5min => then no. of candles req are 375/5 = 75  )
    return new Promise(async (resolve,reject)=>{

        let url = LIVEIND_URL + "/api/candles/latest?instrument=" + instrument + "&timeframe=" + "25minute" + "&count=" + "40";
        //console.log(url);
        try {
            let res = await fetch(url);
            res = await res.json();
            //console.log(res);           

            if (res['status'] == "success") {
                let candles = res['data'];               
                for(let i=candles.length -1 ;i>= 0;i--){
                    let candleTime = new Date(candles[i][0]);                    
                    // candleTime.getDate() == (new Date()).getDate() 
                    if(candleTime.getDate() == (new Date()).getDate() && candleTime.getHours() == 9 && candleTime.getMinutes() == 15  ){
                        // console.log(candles[i]);
                        resolve(candles[i]);
                        break;
                    }
                }
            }else{
                reject(err);
            }
        }catch(err){
            reject(err);
        }

    })
    
}


function sendMAIL(to , subject, message){

      
    let mailTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASS
        }
    });

    let mailDetails = {
        from: process.env.MAILER_EMAIL,
        to:   to ,
        subject: subject,
        text: message
    };

    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occured while Sending EMAIL ', err);
        } else {
            console.log('Email sent successfully to ', to );
        }
    });
}

function alertAdmins(subject, message){

    adminEmails.forEach(admin =>{
        sendMAIL(admin , " NEW " + subject, message);
    });

    console.log({
        action : " Sending Email to All Admins ",
        subject : subject ,
        message : message    
    })
}

function getSuperTrend(instrument, timeframe, period, multiplier){
    
    return new Promise(async (resolve,reject)=>{
        let url = LIVEIND_URL + "/api/indicators/supertrend?instrument=" + instrument + "&timeframe=" + timeframe + "&period=" +  period + "&multiplier=" + multiplier;
        console.log(url);
        try{
            let res = await fetch(url);
            res = await res.json();
            if(res['status'] == 'success'){
                resolve(res['data']['active']);
            }else{
                print("ERROR-log",res);
                reject(res);
            }           
        }catch(err){
            print("ERROR-log",err);
            reject(err);
        }
    })
}



function getLastNCandles(instrument, timeframe, N ){

    return new Promise(async (resolve,reject)=>{

        let url = LIVEIND_URL + "/api/candles/latest?instrument=" + instrument + "&timeframe=" + timeframe + "&count=" + N;
        //print(url);
        try {
            let res = await fetch(url);
            res = await res.json();
            if (res['status'] == "success") {
                // last element is the latest candle 
                resolve(res['data']);
            }else{
                reject(res);
            }
        }catch(err){
            reject(err);
        }

    })
    
}

// async function test(){

//     try{
//         let d = await getLastNCandles("NFO:BANKNIFTY21NOVFUT","5minute",1);
//         print(d);
//     }catch(err){
//         print(err);
//     }

// }

// test();


module.exports['print']                     = print;
module.exports['waitForXseconds']           = waitForXseconds;
module.exports['waitForTime']               = waitForTime;
module.exports['getLTP']                    = getLTP;
module.exports['getSuperTrend']             = getSuperTrend;
module.exports['getBreakoutRange']          = getBreakoutRange;
module.exports['autoLogin']                 = autoLogin;
module.exports['getCurrentDayCandles']      = getCurrentDayCandles;
module.exports['getCurrentExpiryDetails']   = getCurrentExpiryDetails;
module.exports['getLastNCandles']           = getLastNCandles;
module.exports['getPrevDayCandle']          = getPrevDayCandle;
module.exports['placeTrade']                = placeTrade;
module.exports['placeTradeOnAllClients']    = placeTradeOnAllClients;
module.exports['getOpening10minCandle']     = getOpening10minCandle;
module.exports['getOpening25minCandle']     = getOpening25minCandle;
module.exports['sendMAIL']                  = sendMAIL;
module.exports['alertAdmins']               = alertAdmins;




