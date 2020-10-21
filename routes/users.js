const express = require("express");
const router = express.Router();
const dotenv = require('dotenv').config()
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const nodemailer = require('nodemailer');



var User = require('../models/User');

router.get('/sign_up', function(req, res){
  res.render('sign_up');
});

router.post("/sign_up", (req, res, next) => {

  var name = req.body.name;
  //const contactNumber = req.body.contactNumber;
  var email = req.body.email;
  var password = req.body.password;
  //var password2 = req.body.password2;
  
  

 
  User.findOne({ email:email } ,function(err,user)
  {
    if(err){
      return res.status(500).send({msg: 'Error'});
  }
    else if (user) {
    return res.status(400).send({msg:' Email address exist.'});
}
   else {
    

    password = bcrypt.hashSync(password, 10);
    
  
      user = new User({
        name:name,
        
        email:email,
        password:password,
        
      });
      user.save(function (err) {
        if (err) { 
          return res.status(500).send({msg:'Error'});
        }    
      
    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
    token.save(function (err) {
      if (err) { return res.status(500).send({ msg:'Error' }); }


      var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
      
      var mailOptions = 
      { 
        from: 'no-reply@example.com', 
        to: user.email, subject: 'Account Verification Link',
        text: 'Hello '+ req.body.name +',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' 
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) { 
          return res.status(500).send({msg:' Please click on resend for verify your Email.'});
       }
      return res.status(200).send('A verification email has been sent to ' + user.email + '.  If you not get verification Email click on resend token.');
  });

 });
      });
  }
});
});

  
module.exports = router;