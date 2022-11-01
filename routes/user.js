const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const twilioHelpers = require('../helpers/twilio-helper')
const userMiddelware = require('../middleware/userMiddleware')
const productHelpers = require('../helpers/product-helpers')
const bannerHelpers = require('../helpers/banner-helpers');
const cartHelpers = require('../helpers/cart-helpers');
const orderHelpers = require('../helpers/order-helpers');
const razorpayHelpers = require('../helpers/razorpay-helpers');
const couponHelpers = require('../helpers/coupon-helpers');
const collection = require('../config/collection');
/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
   let bannerDetails = await bannerHelpers.viewBanners()
    let users = req.session.user
    console.log(users);
    let cartCount = null
    let wishCount = null
    let productDetails = await productHelpers.viewProducts()
  
    if (users) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      wishCount = await userHelpers.getWishCount(req.session.user._id)
  
    }
  
    res.render('users/user-home', { layout: 'user-layout', user: true, users, cartCount, wishCount, productDetails, bannerDetails });
  } catch (error) {
    next(error)
  }

});

router.get('/home', function (req, res, next) {
  try {
    res.redirect('/')
  } catch (error) {
    next(error)
  }
 
});





router.get('/shop', async function (req, res, next) {
   try {
    let users = req.session.user
    if (users) {
      let cartCount = await userHelpers.getCartCount(req.session.user._id)
      wishCount = await userHelpers.getWishCount(req.session.user._id)
  
  
  
      productDetails = await productHelpers.viewProducts()
      console.log(productDetails);
  
      res.render('users/shop', { layout: 'user-layout', productDetails, user: true, users, cartCount, wishCount });
    }
   } catch (error) {
    next(error)
   }

});


router.get('/login', userMiddelware.login, function (req, res, next) {
  try {
    res.render('users/login', { user: true, "loginErr": req.session.loginErr });
    req.session.loginErr = false
  } catch (error) {
    next(error)
  }

});

router.get('/signup', function (req, res, next) {

  try {
    res.render('users/signup', { user: true });
  } catch (error) {
    next(error)
  }
 
});



router.post('/signup', (req, res, next) => {
  try {
    userHelpers.verifyUser(req.body).then((response) => {
      if (response.status) {
        // console.log('iiiiiiiiiiiiiiiiiii');
        req.session.body = req.body
        twilioHelpers.doSms(req.body).then((data) => {
          // console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');
          req.session.body = req.body
          if (data) {
            res.redirect('/otp')
          } else {
            res.redirect('/signup')
          }
        })
      } else {
        req.session.signUpErr = "Email already exists"
        res.redirect('/signup')
  
  
        //   userHelpers.dosignup(req.body).then((response)=>{
        //   console.log(req.body);
        //   res.redirect('/')
        // }) 
      }
    })
  } catch (error) {
    next(error)
  }
  

})



router.post('/otp', (req, res) => {
  try {
    twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
      if (response) {
  
        userHelpers.dosignup(req.session.body).then((response) => {
  
          res.redirect('/login')
        })
  
      } else {
        req.session.message = "Invalid  OTP"
        res.redirect('/otp')
  
      }
  
    })
  } catch (error) {
    next(error)
  }

  
})



router.post('/login', (req, res, next) => {
  try {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user
        req.session.master=response.user._id
        res.redirect('/')
      } else {
        req.session.loginErr = "Invalid Username or Password"
        res.redirect('/login')
      }
    })
  } catch (error) {
    next(error)
  }

})

router.get('/logout', (req, res, next) => {
  try {
    req.session.loggedIn = false
  req.session.user = null
  res.redirect('/')
  } catch (error) {
    next(error)
  }
  
});

router.get('/otp', (req, res, next) => {
  try {
    signUpErr = req.session.loginErr
    res.render('users/otp', { signUpErr })
  } catch (error) {
    next(error)
  }
 
});

router.get('/cart', userMiddelware.cart, async function (req, res) {
  try {
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
  wishCount = await userHelpers.getWishCount(req.session.user._id)
  let userId = req.session.user._id
  let users = req.session.user
  let products = await userHelpers.getCartProducts(userId)
  console.log(products, 'prooooooooooooooooooo');
  // console.log('dddddaa'+req.session.user._id);

  let total = await userHelpers.getTotalAmount(userId)
  res.render('users/cart', { user: true, products, users, cartCount, wishCount, total });
  } catch (error) {
    next(error)
  }
  
});


router.get('/add-to-cart/:id', userMiddelware.cart, (req, res) => {
  try {
    console.log('idddddd paramss');
    console.log(req.params.id);
    console.log('api callllllllllllllllll');
    let userId = req.session.user._id
    //  console.log(userId,'sdfsdfsdfsdf');
  
    userHelpers.addToCart(req.params.id, userId).then(() => {
      res.json({ status: true })
    })
  } catch (error) {
    next(error)
  }

})

router.post('/change-product-quantity', userMiddelware.cart, async (req, res, next) => {
  try {
    let user = req.session.user
    console.log(user);
    console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    console.log(req.body);
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      // let userId =req.session.user._id
      response.total = await userHelpers.getTotalAmount(user._id)
  
      res.json(response)
    })
  } catch (error) {
    next(error)
  }

})

router.post('/delete-product', (req, res) => {
  try {
    userHelpers.deleteProduct(req.body).then((response) => { 
      res.json({ response })
    })
  } catch (error) {
    next(error)
  }
 
})


router.get('/place-order', userMiddelware.cart, async (req, res,) => {
  try {
    let userId = req.session.user._id
    let total = await userHelpers.getTotalAmount(userId)
    res.render('users/shop', { total })
  } catch (error) {
    next(error)
  }
  
 
})

router.get('/wishlist', async (req, res, next) => {
  try {
    let users = req.session.user
    let wishCount = await userHelpers.getWishCount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
  
    let wishProducts = await userHelpers.getWishProducts(req.session.user._id)
    res.render('users/wishlist', { user: true, users, wishProducts, cartCount, wishCount })
  } catch (error) {
    next(error)
  }
 
});



router.get('/add-to-wishlist/:id', (req, res, next) => {
  try {
    if (req.session.loggedIn) {
      let p = {}
      console.log(' *** Item added to wishlist ***');
      userHelpers.addToWishlist(req.params.id, req.session.user._id).then((response) => {
        p.response = response
        res.json(p)
      })
    }
  } catch (error) {
    next(error)
  }
})


router.post('/delete-wishproduct', (req, res) => {
  try {
    userHelpers.deleteWishProduct(req.body).then((response) => {
      res.json({ response })
     })
  } catch (error) {
    next(error)
  }
 
})

router.get('/checkout', async (req, res, next) => {
  try {
    let users = req.session.user
    let userId = req.session.user._id
     let wishCount = await userHelpers.getWishCount(req.session.user._id)
     let cartCount = await userHelpers.getCartCount(req.session.user._id)
     let addressId = req.query.id

     let selectAddress = await userHelpers.placeAddress(addressId, userId)
     let userAddress = await userHelpers.userAddress(userId)
     let products = await userHelpers.getCartProducts(userId)
     let total = await userHelpers.getTotalAmount(userId)
     let viewCoupon = await couponHelpers.viewCoupon()
   
     let wishProducts = await userHelpers.getWishProducts(req.session.user._id)
     res.render('users/checkout', { user: true, users,userId, wishProducts, cartCount, wishCount, userAddress,selectAddress, products, total, viewCoupon })
  } catch (error) {
    next(error)
  }
});

router.get('/user-profile', async (req, res, next) => {
  try {
    let users = req.session.user
    userId = req.session.user._id
    let wishCount = await userHelpers.getWishCount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let userAddress = await userHelpers.userAddress(userId)
  
    let userSignUpDetails = await userHelpers.getUserDetails(userId)
    res.render('users/user-profile', { user: true, users, cartCount, wishCount, userAddress, userSignUpDetails });
  } catch (error) {
    next(error)
  }

});

router.post('/user-profile', async (req, res, next) => {
  try {
    console.log(req.body);
    userId = req.session.user._id

    let userProfileDetails = await userHelpers.profileDetails(req.body, userId)

    res.redirect('/user-profile')

  } catch (error) {
    next(error)
  }

}),

  router.post('/edit-address/:id', async (req, res, next) => {
    try {
      userId = req.session.user._id
      addressId = req.params.id

      console.log(addressId);

      let editAddress = await userHelpers.editAddress(userId, req.body, addressId)

      res.redirect('/user-profile')

    } catch (error) {
      next(error)
    }

  })

router.get('/delete-address/:id', async (req, res, next) => {
  try {
    userId = req.session.user._id
    addressId = req.params.id
    console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');


    let deleteAddress = await userHelpers.deleteAddress(addressId, userId)

    res.redirect('/user-profile')

  } catch (error) {
    next(error)
  }

}),

  router.post('/update-name', async (req, res, next) => {
    try {
      userId = req.session.user._id

      let userName = await userHelpers.updateUsername(userId, req.body)

      res.redirect('/user-profile')

    } catch (error) {
      next(error)
    }


  }),

  router.post('/update-password', async (req, res, next) => {
    try {
      userId = req.session.user._id


      let userPassword = await userHelpers.updateUserPassword(userId, req.body)

      res.redirect('/user-profile')

    } catch (error) {
      next(error)

    }


  }),


  router.get('/single-product/:id', async (req, res, next) => {

    try {
      let users = req.session.user
      if (req.session.loggedIn) {

        let product = req.params.id

        console.log(product);

        let products = await productHelpers.getProductDetails(product)

        let wishCount = await userHelpers.getWishCount(req.session.user._id)
        let cartCount = await userHelpers.getCartCount(req.session.user._id)
        res.render('users/single-product', { layout: 'user-layout', user: true, products, users,wishCount,cartCount })

      } else {
        let product = req.params.id
        let products = await productHelpers.getProductDetails(product)


        res.render('users/single-product', { layout: 'user-layout', user: true, users, products })

      }


    } catch (error) {

      next(error)

    }

  }),

  router.post('/place-order', async (req, res, next) => {

    try {


      console.log(req.body,'  ===========this is id');
      if (req.session.coupon) {

        // let couponName =req.body.Couponnamers

        let user = await userHelpers.getUserDetails(req.session.master)

        let order = req.body
        let CoupDetails = req.session.coupon

        Couponname = CoupDetails.coupon
        
        let products = await cartHelpers.getCartProductList(req.session.master)
        console.log("USerAlenn",req.session.user._id)

        let totalPrice = await userHelpers.getTotalAmount(req.session.master)
        let discount = CoupDetails.price
        orderHelpers.placeOrder(order, products, totalPrice, req.session.master, discount, Couponname).then((orderId) => {

          // res.json(response)
          if (req.body['payment-method'] === 'COD') {
            res.json({ codSuccess: true })
          } else {

            let GrandTotal = totalPrice - discount

            razorpayHelpers.generateRazorpay(orderId, GrandTotal).then((response) => {

              res.json(response)
            })
          }

        })

      } else {


        let user = await userHelpers.getUserDetails(req.session.master)

        let order = req.body



        let products = await cartHelpers.getCartProductList(req.session.master)

        let totalPrice = await userHelpers.getTotalAmount(req.session.master)





        let GrandTotal = totalPrice

        orderHelpers.placeOrder(order, products, totalPrice,req.session.master).then(async (orderId) => {


          if (req.body['payment-method'] === 'COD') {
            res.json({ codSuccess: true })
          } else {
            GrandTotal = totalPrice

            razorpayHelpers.generateRazorpay(orderId, GrandTotal).then((response) => {
              res.json(response)
            })
          }

        })

      }

    } catch (error) {
      console.log(error);

      next(error)

    }


  }),


  router.get('/order-success', (req, res) => {
    try {
      res.render('users/order-success' ,{layout: 'user-layout'})
    } catch (error) {
      next(error)
    }
   

  })



router.get('/order-list', async (req, res, next) => {
  try {
    let userId = req.session.user._id
    let wishCount = await userHelpers.getWishCount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let users = req.session.user


    order = await orderHelpers.getOrderDetails(userId)



    res.render('users/order-list', { layout: 'user-layout', user: true, order, users, wishCount, cartCount })

  } catch (error) {

    next(error)

  }

}),


  router.get('/view-order/:id', async (req, res, next) => {
    try {

      let singleId = req.params.id
      let users = req.session.user


      value = await orderHelpers.value(singleId)

      singleOrder = await orderHelpers.getSingleOrder(singleId)

      console.log(singleOrder,'ssssssssssssssssssssssssssssssssssssssssss');
      res.render('users/view-order', { layout: 'user-layout', user: true, singleOrder, users, value })
    } catch (error) {

      next(error)
    }

  }),

  router.post('/verify-payment', (req, res, next) => {
    try {
      console.log(req.body);
      console.log('9999999');
      razorpayHelpers.verifyPayment(req.body).then(() => {
        razorpayHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
          console.log('Payment successful');
          res.json({ status: true })
        })
      }).catch((err) => {

        res.json({ status: false, errMsg: err })

      });

    } catch (error) {
      next(error)
    }

  }),


  router.get('/item-cancelled/:id', async (req, res, next) => {
    try {
      orderId = req.params.id
      console.log('cancelled');
      console.log(orderId);
      itemCancelled = orderHelpers.changeStatusCancelled(orderId)
      res.redirect('/order-list')

    } catch (error) {
      next(error)
    }

  }),

  router.post('/apply-coupon', (req, res, next) => {
    try {
      console.log('aplyyyyyyyyyyyyyyyyyyyyy');
      console.log(req.body, 'reqqqqqqqqqqqqqqqqqqqqqqqq bodyyyyyyyyyyyyyyyyyyyyyyyy');

      couponHelpers.getAllCoupon(req.body).then((response) => {
        console.log(response, 'cpoupon vanuuuuuuuuuuuuuuu');
        if (response.coupon) {
          req.session.coupon = response
          let addUser = couponHelpers.addUser(req.body)
        }

        res.json(response)



      })

    } catch (error) {
      next(error)
    }


  })

module.exports = router;
