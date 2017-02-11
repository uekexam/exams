var express = require('express');
var multiparty = require('multiparty');
var router = express.Router();
var query = require("../mysql.js");
var crypto = require('crypto');
var pool=require("./mysql");
var async=require("async");



/* GET users listing. */
//试题管理
router.use('/addQuestion', function(req, res, next) {
  pool.getConnection(function(err,conn){
    conn.query(`select * from type`,function(error,rows,field){
      conn.release();
       pool.getConnection(function(err,conn){
         conn.query("select * from stage where s_id=0",function(error,vals,fields){
           if(!error){
             conn.release();
             res.render("admin/add",{data:rows,data1:vals});
           }
         })
       })
    })
  })


});
router.use('/addQue', function(req,res,next){
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    console.log(fields);
    var stage=fields.stage;
    var str="";
    for(var i=0;i<fields.stage.length;i++){
         str+=fields.stage[i]+";";
    }
    stage=str.slice(0,-1);
    //console.log(stage)

    pool.getConnection(function(err,conn){
      conn.query("INSERT INTO question SET about=?,type_id=?,stage_id=?,del=?",[fields.con[0],fields.type[0],stage,fields.del[0]],function(error,rows,field){
        conn.release();
        if(!error){
          res.send(JSON.stringify(rows.insertId));
        }
      })
    })

  })
});
router.use('/Stage/:id', function(req,res,next){
  var  sid=req.params.id;
    pool.getConnection(function(err,conn){
      conn.query("SELECT * FROM stage WHERE s_id=?",[sid],function(error,rows,field){
        conn.release();
        if(!error){
          res.json(rows);
        }
      })
    })

});


//试题解析添加
router.use('/addAnalysis', function(req,res,next){
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    pool.getConnection(function(err,conn){
      conn.query("INSERT INTO analysis SET q_id=?,del=?,con=?",[fields.q_id[0],fields.del[0],fields.acon[0]],function(error,vals,fields){
        conn.release();
        console.log(error);
        if(!error){
          res.send("yes");
        }
      });
    });

  });
});
//选项添加
router.use('/addOption', function(req,res,next){
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    var arr=[];
    for(var i=0;i<fields.content.length;i++){
      var newarr=[];
      newarr.push(fields.q_id);
      newarr.push(fields.del);
      newarr.push(fields.content[i]);
      newarr.push(i+1);
      arr.push(newarr);
    }
    var sql = "INSERT INTO options (q_id,del,con,mark) VALUES ?";
    pool.query(sql,[arr],function(error,rows,field){
      if(!error){
        res.send("yes");
      }
    })
  });
});
//试题答案添加
router.use('/addSolution', function(req,res,next){
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    pool.getConnection(function(err,conn){
        conn.query("INSERT INTO solution SET q_id=?,del=?,correct=?",[fields.q_id[0],fields.del[0],fields.correct[0]],function(error,vals,fields){
          conn.release();
          console.log(error);
          if(!error){
            res.send("yes");
          }
        });
    });
  })
});



//习题选项、解析、答案管理
router.use("/editOption",function(req,res){
  pool.getConnection(function(err,conn){
      pool.query("select * from options where del=0",function(error,vals,fields){
        conn.release();
        if(!error){
            pool.getConnection(function(err,conn){
              pool.query("select * from analysis where del=0",function(error1,vals1,fields){
                conn.release();
                if(!error1){
                  pool.getConnection(function(err,conn){
                    conn.query("select * from solution where del=0",function(error,vals2,fields){
                      conn.release();
                      if(!error){
                        pool.getConnection(function(err,conn){
                          conn.query("SELECT * FROM question where del=0",function(error,vals3,fields){
                             if(!error){
                               res.render("admin/editOption",{data:vals,data1:vals1,rows:vals2,rows1:vals3});
                             }

                          })
                        })
                      }
                    });
                  });

                }
              });
            });
        }
      });
  });
});




//类型管理
router.use('/editType',function(req,res,next){
  pool.query(`select * from type`,function(error,rows,field){
    res.render('admin/column',{data:rows});
  })
});
router.use('/addType',function(req,res,next){
  var name=req.body.name;
  var del=req.body.del;
  pool.query(`insert into  type (name,del) values ('${name}','${del}') `,function(error,rows,field){
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
router.use('/showStage',function(req,res,next){
 pool.query('SELECT * from stage', function(err, rows) {
    res.json(rows);   //将数组发回去
  });

});
router.use('/addStage',function(req,res,next){

  var name=req.body.name;
  var sid=req.body.sid;
  var del=req.body.del;

  pool.query(`insert into stage (name,s_id,del) values ('${name}','${sid}','${del}') `,function(error,rows,field){
    if(error){
      res.send("数据储存出现错误！！");
    }else{
      res.redirect('/admin/editStage');
    }
  })
});
router.use('/deleteStage',function(req,res){

  pool.query('delete from stage where id in ('+req.body.id+')',function(err, rows) {
    res.json({state:'ok'});
  })
});
router.use('/updateStage',function(req,res){
  pool.query('update stage set name=? where id=?',[req.body.name,req.body.id], function(err, rows) {
    if(!err){
      res.json({state:'ok'});
    }
  })
});
router.use('/addZiStage',function(req,res,next){
  console.log(req);
  var name='';
  var sid=req.body.sid;
  var del=req.body.del;
  pool.query(`insert into stage (name,s_id,del) values ('${name}','${sid}','${del}') `,function(error,rows,field){
    console.log(rows.insertId);
    if(error){
      res.send("数据储存出现错误！！");
    }else{
      res.json(rows.insertId);
    }
  })
});















//登陆模块

/* GET users listing. */

router.get('/', function(req, res, next) {
  res.render("admin/index");
});
router.get("/addclass",function(req,res,next){
  query(`select * from class where del=0 order by id Desc`,function(error,rows,field){
    res.render("admin/addclass",{data:rows});
  });
});
router.use("/addclassdata",function(req,res,next){
  var cname = req.body.cname;
  var genre = req.body.genre;
  var addtime = new Date().toLocaleString();
  query(`insert into class (cname,genre,addtime,del) values ('${cname}','${genre}','${addtime}',0)`,function(error,row,field){
    if(error){
      console.log(error);
    }else{
      res.redirect('/admin/addclass');/*跳转*/
    }
  })

});
router.use("/classdel",function(req,res,next){
  var id = req.body.id;
  console.log(id);
  query(`select * from student where c_id='${id}'`,function(error,rows1,field){
    if(error){
      console.log(error);
    }else{
      console.log(rows1.length);
      if(rows1.length==0){
        query(`update class set del=1 where id='${id}'`,function(error,rows,field){
          if(error){
            console.log(error)
          }else{
            res.redirect('/admin/addclass');
          }
        })
      }else{
        res.redirect('/admin/addclass');
      }
    }
  });

});
router.use("/delclassall",function(req,res,next){
  var arr = req.body['id[]'];
  var id="";
  for(var i=0;i<arr.length;i++){
    id=id+arr[i]+",";
  }
  id=id.slice(0,-1);
  query(`update class set del=1 where id in (${id})`,function(error,rows,field){
    if(error){

    }else{
      res.redirect('/admin/addclass');
    }
  });
});

router.use("/updatateacherdata",function(req,res,next){
  var id = req.body.cid;
  var cname = req.body.cname;
  var genre = req.body.genre;
  query(`update class set cname='${cname}',genre='${genre}' where id='${id}'`,function(error,rows,field){
    if(error){
      console.log(error);
    }else{
      res.redirect("/admin/addclass");
    }
  })
});
router.get("/addteacher",function(req,res,next) {
  query(`select * from teacherclass where del=0 order by id DESC`,function(error,rows1,field){
    if(error){
      console.log(error);
    }else{
      query(`select * from class where del=0`, function (error, rows, field) {
        res.render("admin/addteacher", {data: rows1,clas: rows});
      });
    }
  });

});
router.use("/addteacherdata",function(req,res,next){
  var jobnum = req.body.jobnum;
  var tname = req.body.tname;
  var cid = req.body.cid;
  var pass1 = req.body.pass1;
  var md5 = crypto.createHash('md5');
  md5.update(pass1);
  pass1=md5.digest("hex");
  var addtime = new Date().toLocaleString();
  query(`insert into teacher (jobnum,tname,pass,c_id,del,addtime) values ('${jobnum}','${tname}','${pass1}','${cid}',0,'${addtime}')`,function(error,rows,filed){
    if(error){
      console.log(error);
    }else{
      res.redirect("/admin/addteacher")
    }
  })
});
router.use("/teacherdel",function(req,res,next){
  var id = req.body.id;
  query(`update teacher set del=1 where id='${id}'`,function(error,rows,field){
    if(error){
      console.log(error)
    }else{
      res.redirect('/admin/addteacher');
    }
  })
});
router.use("/updatateacherdata",function(req,res,next){
  var id = req.body.tid;
  var jobnum = req.body.jobnum;
  var tname = req.body.tname;
  var cid = req.body.cid;
  var pass1 = req.body.pass1;
  var md5 = crypto.createHash('md5');
  md5.update(pass1);
  pass1=md5.digest("hex");
  console.log(id);
  query(`update teacher set jobnum='${jobnum}',tname='${cid}',pass='${pass1}' where id='${id}'`,function(error,rows,field){
    if(error){
      console.log(error);
    }else{
      res.redirect("/admin/addteacher");
    }
  })
});
router.use("/delteacherall",function(req,res,next){
  var arr = req.body['id[]'];
  var id="";
  for(var i=0;i<arr.length;i++){
    id=id+arr[i]+",";
  }
  id=id.slice(0,-1);
  query(`update teacher set del=1 where id in (${id})`,function(error,rows,field){
    if(error){

    }else{
      res.redirect('/admin/addteacher');
    }
  });
});

router.use("/addstudent",function(req,res,next){
  query(`select * from studentsclass where del=0 order by id DESC`,function(error,rows,field){
    if(error){
      console.log("error");
    }else{
      query(`select * from class where del=0`,function(error,rows2,field){
        if(error){

        }else{
          res.render("admin/addstudent",{stud:rows,clas:rows2});
        }
      })

    }

  });

});
router.use("/addstudentdata",function(req,res,next){
  var c_id = req.body.c_id;
  var stdnum;/*自动生成学号*/
  var sname = req.body.sname;
  var phone = req.body.phone;
  var pass1 = req.body.pass1;
  var md5 = crypto.createHash('md5');
  md5.update(pass1);
  pass1=md5.digest("hex");
  var addtime = new Date().toLocaleString();
  var sum;  //班级人数
  query(`select * from student where c_id='${c_id}' and del=0 order by id DESC`,function(error,rows,field){
    if(error){
    }else{
      if(rows.length>0){
        var id = rows.length+1;
        sum=rows.length+1;
        stdnum = c_id.toString()+id.toString();
      }else{
        sum=1;
        stdnum=c_id.toString()+1;
      }
      query(`insert into student (c_id,sname,phone,del,stdnum,pass,addtime) values ('${c_id}','${sname}','${phone}',0,'${stdnum}','${pass1}','${addtime}')`,function(error,rows,field){
        if(error){
          console.log(error);
        }else{
          console.log(sum);
          query(`update class set sum='${sum}' where id='${c_id}'`,function(error,rows,field){
            if(error){
              console.log(error);
            }else{
              res.redirect("addstudent");
            }
          });
        }
      })
    }
  });
});
router.use("/studentdel",function(req,res,next){
  var id = req.body.id;
  query(`update student set del=1 where id='${id}'`,function(error,rows,field){
    if(error){

    }else{
      res.redirect("/admin/addstudent");
    }
  })
});
router.use("/updatastudentdata",function(req,res,next){
  var id = req.body.sid;
  var sname = req.body.sname;
  var phone = req.body.phone;
  var c_id = req.body.c_id;
  console.log(c_id);
  var pass1 = req.body.pass1;
  var md5 = crypto.createHash('md5');
  md5.update(pass1);
  pass1=md5.digest("hex");
  query(`update student set sname='${sname}',phone='${phone}',c_id=${c_id},pass='${pass1}' where id='${id}'`,function(error,rows,field){
    if(error){
      console.log(error);
    }else{
      res.redirect("/admin/addstudent");
    }
  })
});
router.use("/delstudentall",function(req,res,next){
  var arr = req.body['id[]'];
  var id="";
  for(var i=0;i<arr.length;i++){
    id=id+arr[i]+",";
  }
  id=id.slice(0,-1);
  console.log(id);
  query(`update student set del=1 where id in (${id})`,function(error,rows,field){
    if(error){

    }else{
      res.redirect('/admin/addstudent');
    }
  });
});

router.use("/selectT",function(req,res,next){
  var id = req.body.id;
  query(`select * from teacher where id='${id}'`,function(error,rows,field){
    if(error){

    }else{
      res.send(rows);
    }
  })
});
router.use("/selectC",function(req,res,next){
  var id = req.body.id;
  query(`select * from class where id='${id}'`,function(error,rows,field){
    if(error){

    }else{
      res.send(rows);
    }
  })
});
router.use("/selectS",function(req,res,next){
  var id = req.body.id;
  query(`select * from student where id='${id}'`,function(error,rows,field){
    if(error){

    }else{
      res.send(rows);
    }
  })
});
router.use("/selectA",function(req,res,next){
  var id = req.body.id;
  query(`select * from Administrator where id='${id}'`,function(error,rows,field){
    if(error){

    }else{
      res.send(rows);
    }
  })
});

router.use("/selectclass",function(req,res,next){
  var c_id = req.values;
  query(`select * from student where del=0 and c_id='${c_id}'`,function(error,rows,field){
    if(error){
      console.log(error)
    }else{
      query(`select * from class where del=0`,function(error,rows2,field){
        if(error){

        }else{
          res.render("admin/addstudent",{stud:rows,clas:rows2});
        }
      })

    }

  });
});

router.use("/addAdministrator",function(req,res,next){
  query(`select * from Administrator where del=0 order by id DESC `,function(error,rows,field){
    if(error){
      console.log(error);
    }else{
      res.render("admin/addAdministrator",{data:rows});
    }
  });
});
router.use("/addAdministratordata",function(req,res,next){
  var aname = req.body.aname;
  var pass1 = req.body.pass1;
  var md5 = crypto.createHash('md5');
  md5.update(pass1);
  pass1=md5.digest("hex");
  var addtime = new Date().toLocaleString();
  query(`insert into Administrator (aname,pass,addtime,del) values ('${aname}','${pass1}','${addtime}','0')`,function(error,rows,field){
    if(error){
      console.log(error);
    }else{
      res.redirect("/admin/addAdministrator");
    }
  })
});
router.use("/Administratordel",function(req,res,next){
  var id = req.body.id;
  query(`update Administrator set del=1 where id='${id}'`,function(error,rows,field){
    if(error){

    }else{
      res.redirect("/admin/addAdministrator");
    }
  })
});
router.use("/updataAdministratordata",function(req,res,next){
  var id = req.body.sid;
  var aname = req.body.aname;
  var pass1 = req.body.pass1;
  var md5 = crypto.createHash('md5');
  md5.update(pass1);
  pass1=md5.digest("hex");
  query(`update Administrator set aname='${aname}',pass='${pass1}' where id='${id}'`,function(error,rows,field){
    if(error){
      console.log(error);
    }else{
      res.redirect("/admin/addAdministrator");
    }
  })
});











































module.exports=router;
