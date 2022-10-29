const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars')
const db = require('./config/connection')
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const session=require('express-session')


const multer = require('multer');
const app = express();






const fileStorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: (req, file, cb)=> {
    console.log(file)
    cb(null,Date.now() +'--'+ file.originalname)
  }
})
const upload = multer({ storage: fileStorageEngine });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'user-layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }));
// app.engine('hbs',hbs.engine({helpers:{inc:function(value,options){return parseInt(value)+1;}},extname:'hbs',defaultLayout:'user-layout',layoutsDir:_dirname+'/views/layout/',partialsDir:_dirname+'/views/partials/', runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true,},}));

app.engine('hbs',hbs.engine({helpers:{
  inc:function(value,options){
    return parseInt(value)+1;
  },
  eqPacked: (status)=>{
    return status==='packed'? true : false
  },
  eqShipped: (status)=>{
    return status==='Shipped'? true : false
  }
  ,
  eqPlaced: (status)=>{
    return status==='placed'? true : false
  },
  
  eqDelivered: (status)=>{
    return status==='delivered'? true : false
  },
  eqPending: (status)=>{
    return status==='pending'? true : false
  },
  isoToDate:(date)=>{
    return date.toDateString()
  },
  
  multiply:(num1,num2)=>num1*num2,
  Subtraction:(n1,n2)=>n1-n2
},


  extname:'hbs',
  defaultLayout:'user-layout',
  layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/', 
  runtimeOptions: { 
    allowProtoPropertiesByDefault: true, 
    allowProtoMethodsByDefault: true,}}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.post('/multiple',(req,res)=>{
  console.log(req.files);
  res.send('multiple')
})
app.use(session({secret:"key",resave: true,saveUninitialized: true,cookie:{maxAge:600000}}))
app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


db.connect((err)=>{
  if(err) console.log('Connection Error '+err)
  else console.log("Database Connected")
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
 
// used this for cache control
app.use(function(req,res,next){
  res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
 
  next();
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('users/uerror');
});


// app.post("/api/uploadFile", upload.single("myFile"), (req, res) => {
//   // Stuff to be added later
//   console.log(req.file);
// });


module.exports = app;
