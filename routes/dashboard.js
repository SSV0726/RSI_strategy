'use strict';

const mongoose = require('mongoose');
const firebase = require('firebase/app');
const utils = require('../utils');
const { exec } = require("child_process");
const db = require("../config/db");
const requireAdminLogin  = require("../middlewares/requireAdminLogin");
var path = require('path');


utils.print("./routes/dashboard.js file Loaded sucessfully!!");


    

module.exports = app =>{

    app.get('/',(req,res)=>{
        res.redirect("dashboard");
    })

    app.get('/login',(req,res)=>{
        res.redirect("/");
    })

    app.post('/login',(req, res)=>{
    
        var email = req.body.email;
        var password = req.body.password;
    
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function(data){
            
                if(data.user.email!="vats@retbot.com"){
                    utils.print("Normal User cann't access control panel  ");
                    res.render('error',{"err": " Normal User cann't access control panel  "});
                }else{
                    res.redirect('/dashboard');
                }
        
        
            }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
    
            utils.print("Problem while Logging In : ");
            utils.print(errorMessage);
            res.redirect('/login');

          }); 
    })

    app.get('/dashboard', async (req,res)=>{

       
       res.render("dashboard");

    });


}
