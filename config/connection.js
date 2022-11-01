const mongoClient = require('mongodb').MongoClient
const env=require('dotenv')

const state = {
    db:null
}

module.exports.connect = (done)=>{
    
    const url = process.env.db;
   
    const dbname = 'shopify'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err) 
        
        state.db = data.db(dbname)
    })

    done()

}


module.exports.get = ()=>{
    return state.db
}