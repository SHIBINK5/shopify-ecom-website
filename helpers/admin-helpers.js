var db=require('../config/connection')
var collection=require('../config/collection')
let objectid=require('mongodb').ObjectId 

const bcrypt=require('bcrypt')  
const { response } = require('express')


module.exports={

    adoLogin:(adminData)=>{
        
        return new Promise(async(resolve,reject)=>{
            try {
                let loginStatus=false
                let response={}
                console.log(adminData.Email);
                let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.Email})
                console.log(admin);
                if(admin){
                    bcrypt.compare(adminData.Password,admin.password).then((status)=>{
                        if(status){
                            console.log("login success");
                            response.admin=admin
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
    getUsers:()=>{
        try {
            return new Promise(async(resolve,reject)=>{
                let usersFromDatabase=await db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(usersFromDatabase)
            })
        } catch (error) {
            reject(error)
        }

       

    },
    blockUser:(userId)=>{
        try {
            console.log(userId)
            return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectid(userId)},{$set:{block:true}}).then(()=>{
                resolve()
            })
            
            })
        } catch (error) {
            reject(error)
        }
       
    },
    unblockUser:(userId)=>{
        try {
            console.log(userId)
            return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectid(userId)},{$set:{block:false}}).then(()=>{
                resolve()
            })
    
            })
            
        } catch (error) {
            reject(error)
        }
       
    },
   
    agetOrderDetails: () => {
        return new Promise(async (resolve, reject) => {
            try {

                orderDetails = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
                resolve(orderDetails)



            } catch (error) {
                reject(error)
            }
        })


    },
    agetSingleOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {

                orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectid(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity',
                            status: '$status',
                            date: '$date',
                            totalAmount: '$totalAmount',
                            value: '$value'

                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,  
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            totalAmount: 1, status: 1, data: 1, value: 1, item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray()

                resolve(orderItems)



            } catch (error) {
                reject(error)
            }
        })

    },
      
    achangeStatusCancelled: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {

                let changeOrderStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectid(orderId) }, { $set: { status: 'Cancelled', value: false } })
                resolve()


            } catch (error) {
                reject(error)
            }
        })

    },
    
    avalue: (orderId) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            try {

                let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectid(orderId) })
                console.log(order);
                console.log(order._id);
                if (order) {
                    if (order.value) {
                        response.status = true
                        response.id = order._id

                        resolve(response)
                    } else {
                        if (order.cancel) {

                        } else {
                            response.status = false
                            response.id = order._id
                            resolve(response)

                        }


                    }

                } else {
                    response.status = false
                    response.id = order._id
                    resolve(response)

                }



            } catch (error) {
                reject(error)
            }
        })
    },

}