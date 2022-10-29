
var db=require('../config/connection')
var collection=require('../config/collection')
let objectid=require('mongodb').ObjectId 


module.exports={

   insertBanner:(bannerDetails)=>{
    return new Promise((resolve,reject)=>{
        try {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerDetails).then((data)=>{   
                resolve(data)
            })
        } catch (error) {
            reject(error)
        }
       
    })
},
viewBanners:()=>{

    return new Promise(async(resolve,reject)=>{
        try {
            let viewbanner=await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            console.log(viewbanner)
            resolve(viewbanner)
        
        } catch (error) {
            reject(error)
        }
   
    })
},
deleteBanner:(bannerId)=>{
    return new Promise((resolve,reject)=>{
        try {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectid(bannerId)}).then((response)=>{
                resolve(response)
            }) 
        } catch (error) {
            reject(error)
        }
       
            
    })

},
getBannerId:(updateBannerId)=>{
    return new Promise((resolve,reject)=>{
        try {
            db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectid(updateBannerId)}).then((result)=>{
                resolve(result)
            }) 
        } catch (error) {
            reject(error)
        }
        
    })
},

}