

module.exports={
    login:(req,res,next)=>{
        if(req.session.loggedIn){
            res.redirect('/')
        }else{
            next()
        }
    },
    cart:(req,res,next)=>{
        if(req.session.loggedIn){
            next()
        }else{
            res.redirect('/login')
        }
    },
  
}