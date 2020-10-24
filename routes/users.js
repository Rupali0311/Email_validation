const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bodyParser = require("body-parser")
var flash = require('connect-flash')
var session = require("express-session");




const app = express();
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(function(req,res,next){
  currentUserId = req.session.userId;
  currentUser = req.session.username;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


var User = require('../models/User');
var Token = require('../models/Token');
const { getMaxListeners } = require("../models/User");

router.get('/sign_up', function(req, res){
  res.render('sign_up');
});

router.post("/sign_up", (req, res, next) => {

  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  

 
  User.findOne({ email:email } ,function(err,user)
  {
    if(err){
      return console.log(err); 
  }
    else if (user) {
     req.flash('error','Email is registred');
}
   else {
    
    password = bcrypt.hashSync(password, 10);
    
  
       user = new User({
        name:name,
        email:email,
        password:password,
        
      });
      user.save(function (err) {
        if (err) { return console.log(err); }    
      
    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
    token.save(function (err) {

      if (err) {return console.log(err); }


      var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: 'tiwaryrupali4@gmail.com', pass: 'Rupaliwantstosendemail' } });
      var mailOptions = 
      { 
        from: 'mahateymanvika@gmail.com', 
        to: user.email, subject: 'Verification Link',
        text: 'Hello '+ name +',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' 
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) { 
          req.flash({msg:' Please click on resend for verify your Email.'});
       }
       req.flash(200).send('A verification email has been sent to ' + user.email + '.  If you not get verification Email click on resend token.');
  });

 });
      });
  }
});
});


app.get('/confirmation/:email/:token',function(req,res,next){
  Token.findOne({ token: req.params.token }, function (err, token) {
      if (!token){
          req.flash('error','We were unable to find a valid token. Your token may have expired. Please click on resend for verify your Email.');
         
      }else{
          User.findOne({ _id: token._userId, email: req.params.email }, function (err, user) {
              if (!user){
                  req.flash('error','We were unable to find a user for this verification. Please SignUp!');
                  res.redirect('/register');
              } 
              else if (user.isVerified){
                  req.flash('success','This user has already been verified. Please Login');
                
              }
              else{
                  user.isVerified = true;
                  user.save(function (err) {
                      if (err) { return console.log(err); }
                      req.flash('success','The account has been verified. Please Login.')
                     
                      
                  });
              }
          });
      }
      
  });
});
app.post('/resendToken',function(req,res,next) {

  User.findOne({ email: req.body.email }, function (err, user) {
      if (!user){
          req.flash('error','We were unable to find a user with that email. Make sure your Email is correct!');
          
      }
      else if (user.isVerified){
          req.flash('error','This account has already been verified. Please log in.');
         
      } 
      else{
          var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
          token.save(function (err) {
              if (err) { return console.log(err); }
  
              // Send the email
                  var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: 'Username', pass: 'Password' } });
                  var mailOptions = { from: 'Your_Email', to: user.email, subject: 'Account Verification Token', text: 'Hello '+ user.name +',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' };
                  transporter.sendMail(mailOptions, function (err) {
                      if (err) { 
                          req.flash('error','Technical Issue!, Please click on resend verify Email.');
                          res.redirect('/blogs');
                       }
                      req.flash('success','A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.')
                      
                  });
          });
      }
  });
});


  
module.exports = router;