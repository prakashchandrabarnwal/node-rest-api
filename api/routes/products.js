const express=require("express");
const router = express.Router();
const mongoose=require("mongoose");
const multer=require("multer");
const checkAuth=require("../middleware/check-auth")
const storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./uploads/")
  },
  filename:function(req,file,cb){
      const now = new Date().toISOString();
       const date = now.replace(/:/g, '-');
       cb(null, date + file.originalname);
      }
})

const fileFilter=(req,file,cb)=>{
  if(file.mimetype==='image/jpeg'||file.mimetype==='image/jpg'||file.mimetype==='image/png'){
    cb(null,true)
  }else{
    cb(null,false)
  }
}

const upload=multer({storage:storage,limits:{
  fileSize:1024*1024*5
},fileFilter:fileFilter});
const Product=require("../models/product");

router.get("/",(req,res,next)=>{
Product.find()
.select("name price _id productImage").then(result=>{
  const response={
    count:result.length,
    products:result.map(doc=>{
      return {
        name:doc.name,
        price:doc.price,
        productImage:doc.productImage,
        id:doc._id,
        request:{
          type:"GET",
          url:"http://localhost:8080/products/"+doc._id
        }
      }
    })
  }
    res.status(200).json(response)


}).catch(err=>{
  res.status(500).json({
    error:err
  })
})
});

router.delete("/:productId",checkAuth,(req,res,next)=>{
  const id=req.params.productId
  Product.remove({_id:id})
  .exec()
  .then(result=>{
    res.status(200).json(result)
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
});

router.post("/",checkAuth,upload.single("productImage"),(req,res,next)=>{
  //console.log(req.file)
  const product=new Product({
    _id:new mongoose.Types.ObjectId(),
    name:req.body.name,
    price:req.body.price,
    productImage:req.file.path
  });

  product.save().then(result=>{
    res.status(201).json({
      message:"created products",
      createdProduct:{
        name:result.name,
        price:result.price,
        _id:result._id,
        request:{
          type:"GET",
          url:"http://localhost:8080/products/"+result._id
        }
      }
    })
  }).catch(err=>{
    res.status(501).json({
      message:"Handling POST requets to /products",
      Error:err
    })
  });


});

router.get("/:productId",(req,res,next)=>{
  const id=req.params.productId;
    Product.findById(id)
    .select("name _id price productImage")
      .exec()
      .then(doc=>{
        if(doc){
          res.status(200).json({
            product:doc,
            request:{
              type:"GET",
              description:"Get all products",
              url:"http://localhost:8080/products/"
            }
          })
        }
        else {
          res.status(404).json({messgae:"No Valid record"})
        }
      })
      .catch(err=>{
        console.log(err);
        res.status(500).json({error:err})
      })
})

router.patch("/:productId",checkAuth,(req,res,next)=>{
  const id=req.params.productId;
  const updateOps={}
  for(const ops of req.body){
    updateOps[ops.propName]=ops.value
  }
  Product.update({_id:id},{$set:updateOps})
  .exec()
  .then((result)=>{
    res.status(200).json(result)
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})

router.delete("/:productId",checkAuth,(req,res,next)=>{
  const id=req.params.productId;
  res.status(200).json({
    message:"Handling Delete request with param to /products",
    id:id
  })
})


module.exports=router;
