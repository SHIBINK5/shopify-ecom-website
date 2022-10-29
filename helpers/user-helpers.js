var db=require('../config/connection')


var collection=require('../config/collection')
const bcrypt=require('bcrypt')  
const { response } = require('express')
let objectid=require('mongodb').ObjectId  
module.exports={
    dosignup:(userData)=>{
       return new Promise(async(resolve,reject)=>{
        try {
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then ((response)=>{
                console.log('insertedIDDDD');
                console.log(userData.insertedId);
                resolve(userData.insertedId)
            })
        } catch (error) {
            reject(error)
        }
       
           
       })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let loginStatus=false
                let response={}
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
                if(user){
                    bcrypt.compare(userData.Password,user.Password).then((status)=>{
                        if(status){
                            console.log("login success");
                            response.user=user
                            response.status=true
                            resolve(response)
                        }else{
                            console.log("login failed");
                            resolve({status:false})
                        }
                    })
    
                }else{
                    console.log("login failed")
                    resolve({status:false})
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },

    verifyUser:(userData)=>{
        console.log(userData);
       let response={}
        return new Promise(async(resolve,reject)=>{
            try {
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.Email})
                if(user){
                    response.status=false
                    resolve(response)
                }
                else{
                    response.status=true
                    resolve(response)
                }
            } catch (error) {
                reject(error)
            }
       
        
    })
},
addToCart:(proId,userId)=>{
    let proObj={
        item:objectid(proId),
        quantity:1
    }
    return new Promise(async(resolve,reject)=>{
        try {
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectid(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=>product.item==proId)
                console.log(proExist);
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectid(userId),'products.item':objectid(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectid(userId)},
                        {
                            $push:{products:proObj}
                        }
                      ).then((response)=>{
                            resolve()
                        })
                }
                
            }else{
                let cartObj={
                    user:objectid(userId),
                     products:[proObj]
    
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    console.log(response);
                    resolve()
                })
            }
        } catch (error) {
            reject(error)
        }
       
    })
},
getCartProducts:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectid(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
    
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                // {
                //     $group:{
                //         _id:null,
                //         total:{$sum:{$multiply:['$quantity','$product.price' ]}}
                //     }
                // },
               
            ]).toArray()
            
            resolve(cartItems) 
        } catch (error) {
            reject(error)
        }
       
    })
},

getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            console.log('ffffffffffffffffffffffffffffffffffff');
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectid(userId)})
            if(cart){
                count=cart.products.length
            }
              resolve(count)  
        } catch (error) {
            reject(error)
        }
       
    })
 
},
changeProductQuantity:(details)=>{
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.Quantity)
    console.log('hhhhhhhhhhhhhhhhhhhhhhhhhh');
    console.log(details.count);
    console.log( details.quantity);
    return new Promise((resolve,reject)=>{
        try {
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id:objectid(details.cart)},
                        {
                            $pull:{products:{item:objectid(details.product)}}
                        }
                         ).then((response)=>{
                            resolve({removeProduct:true})
                        })
                    }else{
                        db.get().collection(collection.CART_COLLECTION).updateOne({ _id:objectid(details.cart),'products.item':objectid(details.product)},
                        {
                            $inc:{'products.$.quantity':details.count}
                        }
                    ).then((response)=>{
                        resolve(true)
                    })
                    }
        } catch (error) {
            reject(error)
        }
        
     
    })
},
deleteProduct: (proDetails) => {
    console.log('iiiiiiiiiiiiiiiiiiiiiiiiiii');
    console.log(proDetails);
    return new Promise((resolve, reject) => {
        try {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectid(proDetails.cart) },
            {
                $pull: { products: { item: objectid(proDetails.product) } }
            }
        ).then((response) => {

            resolve({ removePro: true })

        }).catch(function () {

            console.log('Some error has occurred');

        })

        } catch (error) {
            reject(error)
        }
       
    })

},
    getTotalAmount: (userId)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectid(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
    
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.price' }]}}
                    }
                },
               
            ]).toArray()
            if (total.length == 0) {
                resolve(total)
            } else {
                resolve(total[0].total)
    
            }
           
        } catch (error) {
            reject(error)
        }
       
    })


} ,



addToWishlist:(proId,userId)=>{
    let proObj = {
        item:objectid(proId)
    }

    return new Promise(async(resolve,reject)=>{

        try {
            
            let userList = await db.get().collection(collection.WISH_COLLECTION).findOne({user:objectid(userId)})
            if(userList){ 

                let prodExist = userList.products.findIndex(product => product.item == proId)

                if(prodExist != -1){
                    console.log("XXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXX")
                    db.get().collection(collection.WISH_COLLECTION)
                    // .updateOne({user:ObjectId(proId)},
                    .updateOne({user:objectid(userId)},
                        {
                            $pull:{products:{item:objectid(proId)}}
                        }
                    ).then(()=>{
                        resolve({status:false})
                    })
                }else{
                    db.get().collection(collection.WISH_COLLECTION)
                    .updateOne({user:objectid(userId)},
                        {
                            $push:{products:proObj}
                        }
                    ).then((response)=>{
                        resolve({status:true})
                    })
                }
            }else{
                let listObj = {
                    user:objectid(userId),
                    products:[proObj]
                }
                db.get().collection(collection.WISH_COLLECTION).insertOne(listObj).then((response)=>{
                    resolve({status:true})
                })
            }
       
        } catch (error) {
            reject(error)
        }
    
       
    })
},

getWishCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            let count=0
            let wish=await db.get().collection(collection.WISH_COLLECTION).findOne({user:objectid(userId)})
            if(wish){
                count=wish.products.length
            }
              resolve(count) 
        } catch (error) {
            reject(error)
        }
        
    })
},
 
getWishProducts:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            let wishItems=await db.get().collection(collection.WISH_COLLECTION).aggregate([
                {
                    $match:{user:objectid(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
    
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                // {
                //     $group:{
                //         _id:null,
                //         total:{$sum:{$multiply:['$quantity','$product.price' ]}}
                //     }
                // },
               
            ]).toArray()
            
            resolve(wishItems)
        } catch (error) {
            reject(error)
        }
       
    })
},
deleteWishProduct: (proDetails) => {
 
    console.log(proDetails);
    return new Promise((resolve, reject) => {
        try {
            db.get().collection(collection.WISH_COLLECTION).updateOne({ _id: objectid(proDetails.cart) },
            {
                $pull: { products: { item: objectid(proDetails.product) } }
            }
        ).then((response) => {

            resolve({ removePro: true })

        }).catch(function () {

            console.log('Some error has occurred');

        })
        } catch (error) {
            reject(error)
        }
       

    })

},
getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
    try {
       
            userSignupDetails = db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectid(userId) })
            resolve(userSignupDetails)
     

    } catch (error) {
        reject(error)
    }
})

},
userAddress: (userId) => {
    return new Promise((resolve, reject) => {
    try {
       
            let address = db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectid(userId) }
                },
                {
                    $unwind: '$Addresses'
                },
                {
                    $project: {
                        id: '$Addresses._addId',
                        name: '$Addresses.Name',
                        mobile: '$Addresses.mobile',
                        Email: '$Addresses.Email',
                        city: '$Addresses.City',
                        pincode: '$Addresses.Pincode',
                        district: '$Addresses.District',
                        state: '$Addresses.State',
                        country: '$Addresses.Country',
                        building: '$Addresses.Building_Name',
                        street: '$Addresses.Street_Name'

                    }

                }

            ]).toArray()
            resolve(address)
     

    } catch (error) {
        reject(error)
    }
})


},
profileDetails: (addressData, userId) => {
    try {
        create_random_id(15)
        function create_random_id(string_Length) {
            var randomString = ''
            var numbers = '1234567890'
            for (var i = 0; i < string_Length; i++) {
                randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
            }
            addressData._addId = "ADD" + randomString
        }
        let subAddress = {
            _addId: addressData._addId,
            Name: addressData.Name,
            Email: addressData.Email,
            mobile: addressData.mobile,
            Building_Name: addressData.Building_Name,
            Street_Name: addressData.Street_Name,
            City: addressData.City,
            District: addressData.District,
            Pincode: addressData.Pincode,
            Country: addressData.Country,
            State: addressData.State
        }
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectid(userId) })

            if (user.Addresses) {
                if (user.Addresses.length < 4) {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, {
                        $push: { Addresses: subAddress }
                    }).then(() => {
                        resolve()
                    })
                } else {
                    resolve({ full: true })
                }

            } else {
                Addresses = [subAddress]
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, { $set: { Addresses } }).then(() => {
                    resolve()
                })
            }
        })

    } catch (error) {
        reject(error)
    }

},
editAddress: (userId, address, addressId) => {
    return new Promise((resolve, reject) => {
    try {
   
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId), 'Addresses._addId': addressId },


                {
                    $set: {

                        "Addresses.$.Name": address.Name,
                        "Addresses.$.Email": address.Email,
                        "Addresses.$.Building_Name": address.Building,
                        "Addresses.$.Street_Name": address.Street,
                        "Addresses.$.City": address.City,
                        "Addresses.$. District": address.District,
                        "Addresses.$.Country": address.Country,
                        "Addresses.$.State": address.State

                    }
                }
            ).then((response) => {
                resolve(response)
            })

    
    } catch (error) {
        reject(error)
    }
})
},
deleteAddress: (addressId, userId) => {
    return new Promise((resolve, reject) => {
    try {
      
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) },
                {
                    $pull: { Addresses: { _addId: addressId } }
                }
            ).then((response) => {
                resolve(response)
            })
    
  
    } catch (error) {
        reject(error)
    }
  
  })
  },
  updateUsername: (userId, userName) => {
    return new Promise((resolve, reject) => {
    try {
       
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, { $set: { name: userName.Name } }).then(() => {
                resolve()
            });

    

    } catch (error) {
        reject(error)
    }
})

},
updateUserPassword: (userId, userPassword) => {
    return new Promise(async (resolve, reject) => {
    try {


    

      

            userPassword.PasswordOne = await bcrypt.hash(userPassword.PasswordOne, 10);

            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, { $set: { Password: userPassword.PasswordOne } }).then((data) => {

                resolve(data)

            })
       

    } catch (error) {
        reject(error)
    }

})
},


getUserDetails: (userId) => {
   
    return new Promise((resolve, reject) => {
    try {
       
            userSignupDetails = db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectid(userId) })
            resolve(userSignupDetails)
     

    } catch (error) {
        reject(error)
    }
})

},
changeStatus: (orderId) => {
    return new Promise(async (resolve, reject) => {
      
      try {
        let changeOrderStatus = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectid(orderId) },
            { $set: { status: "packed" } }
          );
        resolve(changeOrderStatus);
      } catch (error) {
        reject(error);
      }
    });
  },
  changeStatusShipped: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let changeOrderStatus = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectid(orderId) },
            { $set: { status: "Shipped" } }
          );
        resolve(changeOrderStatus);
      } catch (error) {
        reject(error);
      }
    });
  },
  changeStatusDelivered: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let changeOrderStatus = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectid(orderId) },
            { $set: { status: "Delivered" } }
          );
        resolve(changeOrderStatus);
      } catch (error) {
        reject(error);
      }
    });
  },
  placeAddress: (addressId, userId) => {
    return new Promise(async (resolve, reject) => {
    try {
       
            let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectid(userId) }
                },
                {
                    $unwind: '$Addresses'
                },
                {
                    $match: { 'Addresses._addId': addressId }
                },
                {
                    $project: {
                        id: '$Addresses._addId',
                        name: '$Addresses.Name',
                        Email: '$Addresses.Email',
                        mobile: '$Addresses.mobile',
                        city: '$Addresses.City',
                        pincode: '$Addresses.Pincode',
                        district: '$Addresses.District',
                        state: '$Addresses.State',
                        country: '$Addresses.Country',
                        building: '$Addresses.Building_Name',
                        street: '$Addresses.Street_Name'

                    }

                }

            ]).toArray()
            resolve(address[0])
            console.log(address[0]);
      

    } catch (error) {
        reject(error)
    }

})
},
}