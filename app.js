var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var login = require('./routes/login');
var teacher = require('./routes/teacher');
var student = require('./routes/student');
var users = require('./routes/users');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","html");
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(session({ secret: 'keyboard cat', name:"abc",cookie: {  }}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
app.use('/student', student);
app.use('/teacher', teacher);
app.use('/',index);/*前台路由*/
app.use('/login',login);
app.use('/admin',function(req,res,next){
    if(req.session.login=="admin"){
        next();
    }else if(req.session.login=="teacher"){
        res.redirect("/teacher");
    }else if(req.session.login=="student"){
        res.redirect("/student");
    }else{
        res.redirect("/login")
    }
} ,users);/*后台路由*/


// catch 404 and forward to error handler
// error handler
//app.use(function(err, req, res, next) {
//  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//  // render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});
app.listen(8080);
