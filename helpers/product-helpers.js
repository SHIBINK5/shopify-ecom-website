var db=require('../config/connection')
var collection=require('../config/collection')
let objectid=require('mongodb').ObjectId

module.exports={

    insertProducts:(productDetails)=>{
        return new Promise((resolve,reject)=>{
            try {
                productDetails.delete=false
                db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productDetails).then((data)=>{   
                    resolve(data)
                }) 
            } catch (error) {
                reject(error) 
            }
           
        })
    },
    viewProducts:()=>{

        return new Promise(async(resolve,reject)=>{
            try {
                let viewproduct=await db.get().collection('products').find({delete:false}).toArray()
                console.log(viewproduct)
                resolve(viewproduct)
            } catch (error) {
               reject(error) 
            }
       

        })
    },
    deleteProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectid(productId)},  
                {
                    $set:{
                        delete:true
                    }
                }
                
                ).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
          
                
        })

    },

    getproductId:(updateProductId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectid(updateProductId)}).then((result)=>{
                    resolve(result)
                })  
            } catch (error) {
                reject(error) 
            }
           
        })
    },
    updateProduct:(productId,productDetails)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectid(productId)},{
                    $set:{
                        name:productDetails.name,
                        description:productDetails.description,
                        price:productDetails.price,
                        category:productDetails.category
                    }
                }).then((updateResult)=>{
                    resolve()
                })
            } catch (error) {
                reject(error) 
            }
          
           
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
          try {
    
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectid(proId) }).then((product) => {
              resolve(product)
            })
    
    
          } catch (error) {
            reject(error)
          }
        })
    
      },
}