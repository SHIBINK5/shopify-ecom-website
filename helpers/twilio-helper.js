const dotenv = require('dotenv')
require('dotenv').config();
//dotenv.config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const ServiceSID = process.env.TWILIO_Service_SID;
console.log(accountSid,authToken,ServiceSID);
const client = require('twilio')(accountSid,authToken,ServiceSID);

// const client = require('twilio')('AC0b5160b500190ec7bebca13e91ef7133','71a7a0907490c2067ed2d56c6372c4ab');  
// const serviceSid = 'VA1eb6d33e4fd77fce38c673b81ebafe26'

module.exports={
    
    doSms:(userData)=>{
        
        return new Promise(async(resolve,reject)=>{
            try {
                let res={}
                console.log(userData);
            
                await client.verify.services(ServiceSID).verifications.create({
                   
                    to :`+91${userData.Mobile}`,
                    channel:"sms"
                }).then((reeee)=>{
                    res.valid=true;
                   resolve(res)
                    console.log(reeee);
                }).catch((err)=>{
                    
                    console.log(err);
    
                })
            } catch (error) {
                reject(error)
            }
           
        })
    },
   
    otpVerify:(otpData,userData)=>{
        console.log(otpData);
        console.log(userData);
       

        return new Promise(async(resolve,reject)=>{
            try {
                await client.verify.services(ServiceSID).verificationChecks.create({
                    to :`+91${userData.Mobile}`,
                    code:otpData.otp
                }).then((verifications)=>{
                     console.log(verifications);
                    resolve(verifications.valid)
                })
            } catch (error) {
                reject(error)
            }
           
        })
}


}