const express=require("express");
const mongoose=require("mongoose");
const Order=require("../models/order");
const Product=require("../models/product");
const router = express.Router();
const checkAuth=require("../middleware/check-auth")

router.get("/",checkAuth,(req,res,next)=>{
  Order.find()
  .select("product quantity _id")
  .populate("product","name")
  .exec()
  .then(docs=>{
    res.status(200).json({count:docs.length,
      orders:docs.map(doc=>{
        return {
          _id:doc._id,
          product:doc.product,
          quantity:doc.quantity,
          request:{
            type:"GET",
            url:"http://localhost:8080/order/"+doc._id
          }
        }
      })
    })
  }).catch(err=>{
    res.status(200).json({
      error:err
    })
  })
});

router.post("/",checkAuth,(req,res,next)=>{

Product.findById(req.body.productId)
  .then(product=>{
    if(!product || product.error){
      return res.status(404).json({
        message:"Product not fount"
      })
    }
    const order=new Order({
      _id:mongoose.Types.ObjectId(),
      quantity:req.body.quantity,
      product:req.body.productId
    })
    return order.save()
  }).then(result=>{
    res.status(201).json({
      message:"order created",
      createdOrder:{
        _id:result._id,
        product:result.product,
        quantity:result.quantity
      },
      request:{
        type:"GET",
          url:"http://localhost:8080/order/"+result._id
      }
    })
  })
  .catch(err=>{
    res.status(500).json({
      message:"Product not found",
      error:err
    })
  })
});

router.get("/:orderId",checkAuth,(req,res,next)=>{
  const id=req.params.orderId;
  Order.findById(id)
  .populate("product")
  .exec()
  .then(order=>{
    if(!order){
      return res.status(404)
      .json({
        message:"order not found"
      })
    }
    res.status(200).json({
      order:order,
      request:{
        type:"GET",
        url:"http://localhost:8080/order"
      }
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})


router.delete("/:orderId",checkAuth,(req,res,next)=>{
  const id=req.params.orderId;
  Order.remove({_id:id}).exec()
  .then(result=>{
    res.status(200).json({
      message:"Deleted order",
      request:{
        type:"POST",
        url:"http://localhost:8080/order",
        body:{productId:"ID",quantity:"Number"}
      }
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})


module.exports=router;
