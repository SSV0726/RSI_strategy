
const firebase = require('firebase/app');


module.exports = (req, res, next) => {

  var user = firebase.auth().currentUser;
  if(user){

    if( user.email=="vats@retbot.com"){
      next();
    }else{
      res.json({"message" :' Login as admin !!'} );
    }
    
  }else {
    res.render('unauthorized');
  }

};
