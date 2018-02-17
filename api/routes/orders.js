const express=require("express");

const router = express.Router();

router.get("/",(req,res,next)=>{
  res.status(200).json({
    message:"Handling GET requets to /orders"
  })
});

router.post("/",(req,res,next)=>{
  const order={
    productId:req.body.productId,
    quantity:req.body.quantity
  }
  res.status(201).json({
    message:"Handling POST requets to /orders",
    orderCreated:order
  })
});

router.get("/:orderId",(req,res,next)=>{
  const id=req.params.orderId;

  if(id==="special"){
    res.status(200).json({
      message:"Handling special GET request to /order",
      id:id
    })
  }else{
  res.status(200).json({
    message:"Handling GET request with param to /order",
    id:id
  })
}
})


router.delete("/:orderId",(req,res,next)=>{
  const id=req.params.orderId;
  res.status(200).json({
    message:"Handling Delete request with param to /orderId",
    id:id
  })
})


module.exports=router;
