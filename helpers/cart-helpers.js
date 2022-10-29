var db=require('../config/connection')
var collection=require('../config/collection')
let Objectid=require('mongodb').ObjectId

module.exports={


    getCartProductList: (userId) => {
        console.log(userId,'kkjjkg');
        return new Promise(async (resolve, reject) => {
        try {
         
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: Objectid(userId) })
                
                resolve(cart)
         
            
        } catch (error) {
            reject(error)
        }
       
    })
    }





}