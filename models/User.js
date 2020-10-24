const mongoose = require('mongoose');
const dotenv = require('dotenv');

var UserSchema = new mongoose.Schema({

  id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
      },
  
    name: {
      type: String,
      required: true

      
    },
    
    email: {
      type: String,
      required: true,
      unique:true,
      match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    
    },
     isVerified: 
      { 
      type: Boolean,
       default: false
       },
    
      password: {
      type: String,
      required: true,
      select:false

    },
    
    
  });
  
  var User = mongoose.model('User', UserSchema);
  
  module.exports = User;

  