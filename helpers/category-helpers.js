var db=require('../config/connection')
var collection=require('../config/collection')
let objectid=require('mongodb').ObjectId 

module.exports={
    insertCategory:(proDetails)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(proDetails).then((data)=>{   
                    resolve(data)
                })  
            } catch (error) {
                reject(error)
            }
          
        })
    },

    viewCategory:()=>{

        return new Promise(async(resolve,reject)=>{
            try {
                let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                console.log(category)
                resolve(category)
            } catch (error) {
                reject(error)
            }
       

        })
    },
    deleteCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectid(catId)}).then((response)=>{
                    resolve(response)
                }) 
            } catch (error) {
                reject(error)
            }
         
                
        })

    }
}