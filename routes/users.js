var express = require('express');
var router = express.Router();
var mysql=require("./mysql");
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/index');
});
router.use('/editquestion', function(req, res, next) {
  mysql.query(`select * from type`,function(error,rows,field){
    res.render("admin/add",{data:rows});
  })
});
router.use('/showquestion', function(req, res, next) {
  res.render('admin/list');
});




//类型管理
router.use('/editType',function(req,res,next){
  mysql.query(`select * from type`,function(error,rows,field){
    res.render('admin/column',{data:rows});
  })
});
router.use('/addType',function(req,res,next){
  var name=req.body.name;
  var del=req.body.del;
  mysql.query(`insert into  type (name,del) values ('${name}','${del}') `,function(error,rows,field){
    if(error){
      res.send("数据储存出现错误！！");
    }else{
      res.redirect('/admin/editType');
    }
  })
});





//阶段管理
router.use('/editStage',function(req,res,next){
  res.render('admin/list')
});
router.use('/addStage',function(req,res,next){
  var name=req.body.name;
  var del=req.body.del;
  var sid=req.body.s_id;
  mysql.query(`insert into  stage (name,del,s_id) values ('${name}','${del}','${sid}') `,function(error,rows,field){
    if(error){
      res.send("数据储存出现错误！！");
    }else{
      res.redirect('/admin/editType');
    }
  })
});





module.exports = router;
