const express =require("express");
const router=express.Router();
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const User=require("../models/user");
const jwt=require("jsonwebtoken");

router.post("/login",(req,res,next)=>{
  User.find({
    email:req.body.email
  }).exec()
    .then(users=>{
      if(users.length<1){
        return res.status(401).json({
          message:"Auth failed"
        })
      }
      bcrypt.compare(req.body.password,users[0].password,(err,result)=>{
        if(err){
          return res.status(401).json({
            message:"Auth failed"
          })
        }
        if(result){
          const token=jwt.sign({
            email:users[0].email,
            userId:users[0]._id
          },
          process.env.JWT_KEY,
          {expiresIn:"1h"})
          return res.status(200).json({
            message:"Auth Successful",
            token
          })
        }
        res.status(401).json({
          message:"Auth failed"
        })
      })
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
        error:err
      })
    })
})


router.post("/signup",(req,res,next)=>{
  //console.log("passsword ",req.body.password);
  User.find({email:req.body.email}).exec()
    .then(user=>{
      if(user.length>=1){
        return res.status(409).json({
          message:"Mail exists"
        })
      }else {
        password:bcrypt.hash(req.body.password,10,(err,hash)=>{
          if(err){
            return res.status(500).json({
              error:err
            })
          }else {
            //console.log("hashedpasssword ",hash);
            const user=new User({
              _id:new mongoose.Types.ObjectId(),
              email:req.body.email,
              password:hash
          })
          user.save()
              .then((result)=>{
                console.log("resylt ",result)
                res.status(201).json({
                  message:"user created"
                })
              })
              .catch(error=>{
                console.log(error);
                res.status(500).json({
                  error
                })
              })
        }
      })
      }
    }).catch(error=>{
      console.log(error);
      res.status(500).json({
        error:err
      })
    })
});

router.delete("/:userId",(req,res,next)=>{
  User.remove({_id:req.params.userId})
  .exec()
  .then(result=>{
    res.status(200).json({
      message:"User deleted"
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})

module.exports=router;
