const mongoClient = require('mongodb').MongoClient

const state = {
    db:null
}

module.exports.connect = (done)=>{
    
    const url = 'mongodb+srv://shibink:shibink515.sk@cluster0.h2ema2c.mongodb.net/shopify?retryWrites=true&w=majority'
   
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