const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware')
const adminHelpers=require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const categoryHelpers=require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const bannerHelpers = require('../helpers/banner-helpers');
const dashbHelpers = require('../helpers/dashb-helpers');
const couponHelpers = require('../helpers/coupon-helpers');


const path=require('path')
const multer = require('multer');
const fileStorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: (req, file, cb)=> {
    console.log(file)
    cb(null,Date.now() +'--'+ file.originalname)
  }
})
const upload = multer({ storage: fileStorageEngine });

// app.post('/multiple', upload.array('images',3) ,(req, res)=> {
//   console.log(req.files)
//   res.send("Multiple File Upload success")
// });



/* GET users listing. */
router.get('/',adminMiddleware.admin, async(req, res, next)=> {
  try {

    let userCount = await dashbHelpers.getUserCount()
    let orderCount = await dashbHelpers.getOrderCount()
    let codCount = await dashbHelpers.totalCOD()
  
    let ONLINECount = await dashbHelpers.totalONLINE()
  
    let totalDelivered = await dashbHelpers.totalDelivered()
  
    let totalShipped = await dashbHelpers.totalShipped()
  
    let cancelled = await dashbHelpers.cancelled()
  
    let monthamount = await dashbHelpers.totalMonthAmount()
  
    console.log(monthamount,'ddddddddddddddddddddddddddddd');
    console.log(monthamount.Tamount,'lllllllllllllllllllllllllllllllll');
   
    res.render('admin/admin-home',{layout:'admin-layout',admin:true,userCount,orderCount,codCount,ONLINECount,totalDelivered,totalShipped,cancelled,monthamount});
    
  } catch (error) {
    next(error)
  }
  // let adminw = req.session.admin

});

router.get('/login', function(req, res, next) {
  try {
    res.render('admin/admin-login',{layout:'admin-layout'});
  } catch (error) {
    next(error)
  }

});




router.post('/admin-login',(req,res,next)=>{
  try {
    adminHelpers.adoLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.admin=response.admin
        res.redirect('/admin')
      }else{
        req.session.loginErr="Invalid Username or Password"
        res.redirect('/admin/login')
      }
    })
  } catch (error) {
    next(error)
  }

})

router.get('/user-management',(req,res,next)=>{
  try {
    adminHelpers.getUsers().then((usersFromDatabase)=>{
      res.render('admin/user-management',{admin:true,usersFromDatabase,layout:'admin-layout'})
    })
  } catch (error) {
    next(error)
  }
})

router.get('/block/:id',(req,res,next)=>{
  try {
    let userId=req.params.id;
  console.log(userId);
  adminHelpers.blockUser(userId).then((response)=>{
    res.redirect('/admin/user-management')
  })
  } catch (error) {
    next(error)
  }
  
})

router.get('/unblock/:id',(req,res,next)=>{
  try {
    let userId=req.params.id;
    adminHelpers.unblockUser(userId).then((response)=>{
      res.redirect('/admin/user-management')
    })
  } catch (error) {
    next(error)
  }
 
})

router.get('/logout',(req, res, next)=> {
  try {
    res.redirect('/admin/login')
  } catch (error) {
    next(error)
  } 
}); 



router.get('/add-category', function(req, res, next) {
  try {
    res.render('admin/add-category',{layout:'admin-layout',admin:true});
  } catch (error) {
    next(error)
  }
 
});

router.post('/add-category',(req, res, next)=>{
  try {
    console.log(req.body);
  categoryHelpers.insertCategory(req.body).then((response)=>{
    res.redirect('/admin/category-management')
  })
  } catch (error) {
    next(error)
  }

})

router.get('/category-management', async function(req, res, next) {
  try {
    
  catDetails=await categoryHelpers.viewCategory()

  res.render('admin/category-management',{layout:'admin-layout',catDetails,admin:true});
  } catch (error) {
    next(error)
  }

});

router.get('/delete/:id',(req,res,next)=>{
  try {
    let catId=req.params.id;
    console.log(catId);
    categoryHelpers.deleteCategory(catId).then((response)=>{
      res.redirect('/admin/category-management')
    })
  } catch (error) {
    next(error)
  }

})

router.get('/add-products', function(req, res, next) {
  try {
    categoryHelpers.viewCategory().then((catDetail)=>{
      res.render('admin/add-products',{layout:'admin-layout',catDetail,admin:true});
  
    })
  } catch (error) {
    next(error)
  }
  
  
});

router.post('/add-products',upload.array("image",3),(req, res,next)=>{
  try {
    console.log('helloo');
  const images=req.files
  let array=[]
  array=images.map((value)=>value.filename);
  req.body.image=array;
  console.log(req.body);
    productHelpers.insertProducts(req.body).then((response)=>{
      res.redirect('/admin/product-management')
    })
  } catch (error) {
    next(error)
  }
  
  })

  

  router.get('/product-management', async function(req, res, next) {
    try {
      productDetails=await productHelpers.viewProducts()
      console.log(productDetails);
    
      res.render('admin/product-management',{layout:'admin-layout',productDetails,admin:true});
    } catch (error) {
      next(error)
    }
   
  });
  
  router.get('/pdelete/:id',(req,res,next)=>{
    try {
      let productId=req.params.id;
      console.log(productId);
      productHelpers.deleteProduct(productId).then((response)=>{
        res.redirect('/admin/product-management')
      })
    } catch (error) {
      next(error)
    }
  
  })

  router.get('/edit-products/:id', async function(req, res, next) {
    try {
      let proId = req.params.id
   
      console.log(proId);
      let updatepId= await productHelpers.getproductId(proId)
      console.log(updatepId); 
      let catDetail=await categoryHelpers.viewCategory()
      console.log('catdetailssssssssss',catDetail);
      res.render('admin/edit-products',{layout:'admin-layout',admin:true,updatepId,catDetail});
   
    } catch (error) {
      next(error)
    }
    
  });
  
  router.post('/edit-products/:id', function(req, res, next) {
    try {
      console.log('post activeeeeeeeeeeeee');
      console.log(req.params.id);
        console.log(req.body);
        productHelpers.updateProduct(req.params.id,req.body).then((response)=>{
          console.log(response);
          res.redirect('/admin/product-management')
        })
     
    } catch (error) {
      next(error)
    }
  
  });

  
  router.get('/add-banner', function(req, res, next) {
    try {
      res.render('admin/add-banner',{layout:'admin-layout',admin:true});
    } catch (error) {
      next(error)
    }
    
  });

  router.post('/add-banner',upload.array("image",3),(req, res,next)=>{
    try {
      const images=req.files
      let array=[]
      array=images.map((value)=>value.filename);
      req.body.image=array;
      console.log(req.body);
        bannerHelpers.insertBanner(req.body).then((response)=>{
          res.redirect('/admin/banner-management')
        })
    } catch (error) {
      next(error)
    }
   
    })

    router.get('/banner-management', async function(req, res, next) {
      try {
        bannerDetails=await bannerHelpers.viewBanners()
        res.render('admin/banner-management',{layout:'admin-layout',bannerDetails,admin:true});
      } catch (error) {
        next(error)
      }
     
    });

    router.get('/bannerdelete/:id',(req,res,next)=>{
      try {
        let bannerId=req.params.id;
        bannerHelpers.deleteBanner(bannerId).then((response)=>{
          res.redirect('/admin/banner-management')
        })
      } catch (error) {
        next(error)
      }
     
    })


    router.get('/editbanner/:id', async (req, res, next)=> {
      try {
        let bannerId = req.params.id
        let updatebId= await bannerHelpers.getBannerId(bannerId)
       
        res.redirect('/admin/banner-management',{layout:'admin-layout',admin:true,updatebId});
      } catch (error) {
        next(error)
      }
        
    });

   
    router.get('/aorder-list', async(req, res, next) =>{
      try {
        order = await adminHelpers.agetOrderDetails()

        res.render('admin/aorder-list',{layout:'admin-layout',admin:true,order});
      } catch (error) {
        next(error)
      }
    
     
    });


    router.get('/order-management/:id' ,async (req, res, next) => {
      try {
        
        let singleId = req.params.id
        // let users=req.session.user
       
    
        avalue = await adminHelpers.avalue(singleId)
    
        singleOrder = await adminHelpers.agetSingleOrder(singleId)
    
    
        res.render('admin/order-management', {layout:'admin-layout',admin:true,singleOrder,avalue})
      } catch (error) {
    
        next(error)
      }
    
    }),
    router.get("/item-packed/:id", async (req, res, next) => {
      try {
       
        orderId = req.params.id;
        console.log(orderId,'fgggggggggggggggggggggggggggg');
        changeStatusPacked = userHelpers.changeStatus(orderId);
        res.redirect("/admin/aorder-list");
      } catch (error) {
        next(error);
      }
    }),
      router.get("/item-shipped/:id", async (req, res, next) => {
        try {
          orderId = req.params.id;
          changeStatusShipped = userHelpers.changeStatusShipped(orderId);
          res.redirect("/admin/aorder-list");
        } catch (error) {
          next(error);
        }
      });
    router.get("/item-delivered/:id", async (req, res, next) => {
      try {
        orderId = req.params.id;
        changeStatusDelivered = userHelpers.changeStatusDelivered(orderId);
        res.redirect("/admin/aorder-list");
      } catch (error) {
        next(error);
      }
    });

    
    router.get('/aitem-cancelled/:id',async (req, res, next) => {
      try {
        orderId = req.params.id
        console.log('cancelled');
        console.log(orderId);
        itemCancelled = adminHelpers.achangeStatusCancelled(orderId)
        res.redirect('/admin/aorder-list')
    
      } catch (error) {
        next(error)
      }
    })

   

      router.get('/add-coupon', async(req, res, next) =>{
        try {
          res.render('admin/add-coupon',{layout:'admin-layout',admin:true});
        } catch (error) {
          next(error)
        }
       
        });

      router.post('/add-coupon', async (req, res,next) => {
        try {
          let coupon = req.body
          console.log(coupon,'fffffffffffffffffffffffffffffffffff');
          addCoupon = await couponHelpers.addCoupon(req.body)
    
          res.redirect('/admin/coupon-management')
    
        } catch (error) {
          next(error)
        }
      }),

      router.get('/coupon-management', async (req, res,next) => {
        try {
          let viewCoupon = await couponHelpers.viewCoupon()
          res.render('admin/coupon-management', { layout: 'admin-layout', admin: true, viewCoupon })
    
        } catch (error) {
          next(error)
        }
    
      }),

      router.get('/coupondelete/:id',(req,res,next)=>{
        try {
          let couponId=req.params.id;
          couponHelpers.deleteCoupon(couponId).then((response)=>{
            res.redirect('/admin/coupon-management')
          })
        } catch (error) {
          next(error)
        }
       
      })


      router.use(function(req, res, next) {
        next(createError(404));
      });
      

      router.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
      
        // render the error page
        res.status(err.status || 500);
        res.render('admin/aerror');
      });
      
    
    

    // router.get('/add-coupon', async(req, res, next) =>{
    // res.render('admin/add-coupon',{layout:'admin-layout',admin:true});
    // });


module.exports = router;
