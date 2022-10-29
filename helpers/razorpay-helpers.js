var db=require('../config/connection')
var collection=require('../config/collection')
let objectid=require('mongodb').ObjectId 
const Razorpay = require('razorpay')

var instance = new Razorpay({
    key_id: 'rzp_test_L1AE3AmUbMLnUL',
    key_secret: 'EDI16656Vnhztke2QsTbSQmM',
  });
module.exports={

    generateRazorpay :(orderId,grandTotal)=>{
        return new Promise((resolve, reject) => {
        try {
        

                var options={
                    amount:grandTotal*100,
                    currency:"INR",
                    receipt: ""+orderId
    
    
                        }
    
                        instance.orders.create(options,function(err,order){
                            if(err){
                                console.log(err);
                            }else{
                            console.log("new order :",order);
                            resolve(order);
                            }
                        })
    
               
         
            
        } catch (error) {
            reject(error)
        }
    })
     
        
    },
    
    verifyPayment:(details)=>{

        return new Promise((resolve, reject) => {
        try {
            console.log(details,'details');
        
                const  crypto = require('crypto');
            
                let hmac = crypto.createHmac('sha256','EDI16656Vnhztke2QsTbSQmM')
               
                hmac.update (details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
              
                hmac=hmac.digest('hex')
               
                console.log(hmac);
                console.log(details['payment[razorpay_signature]']);
                if(hmac===details['payment[razorpay_signature]']){
                    
                    resolve()
                }else{
                    console.log('reject');
                    reject(err)
                }
          
            
        } catch (error) {
            reject(error)
        }
    });
 
    },



    changePaymentStatus:(orderId)=>{
        return new Promise((resolve, reject) => {
        try {
            console.log(orderId,'id--------------');
          
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId)},
                {
                    $set:{
                        status:'placed'
                    }
                },
                ).then((err)=>{
                    resolve(err)
                })
          
            
        } catch (error) {
            reject(error)
        }
    })
       

    }

}



