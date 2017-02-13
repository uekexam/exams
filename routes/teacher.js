var express = require('express');
var router = express.Router();
var pool=require("./mysql.js");

/* GET home page. */
router.get('/', function(req, res, next){
  pool.getConnection(function(err,conn){
    conn.query("SELECT * FROM task WHERE status=?",["0"],function(error,rows,fields){
      var myDate=new Date();
      var month=myDate.getMonth()+1;
      var day=myDate.getDate();
      console.log(rows)
        if(!error){
          res.render('index/teacher/task',{data:rows,mon:month,day:day,});
        }
    })
  })
});

router.use('/task', function(req, res, next){
  pool.getConnection(function(err,conn){
    conn.query("SELECT * FROM stage  WHERE s_id=0",function(error,rows,fields){
      conn.release();
      res.render('index/teacher/arrange_task',{data:rows});
    })
  })
});
router.use('/Option/:id', function(req, res, next){
  var sid=req.params.id;
  pool.getConnection(function(err,conn){
    conn.query("SELECT * FROM stage  WHERE s_id=?",[sid],function(error,rows,fields){
      conn.release();
      res.render('index/teacher/arrange',{data:rows});
    })
  })
});

router.use('/point/:id', function(req, res, next){
  var sid=req.params.id;
  pool.getConnection(function(err,conn){
    conn.query("SELECT * FROM question",function(error,rows,fields){
      conn.release();
      pool.getConnection(function(err,conn){
        conn.query("SELECT * FROM type",function(error,rows1,fields){
          conn.release();
          res.render('index/teacher/know_test',{data:rows,data1:rows1,cid:sid});
        })
      })
    })
  })
});



router.use('/question/:id', function(req, res, next){
  var sid=req.params.id;
  pool.getConnection(function(err,conn){
    conn.query("SELECT * FROM question WHERE id=?",[sid],function(error,rows,fields){
      conn.release();
      if(rows[0].type_id==1||rows[0].type_id==2){
        pool.getConnection(function(err,conn){
          conn.query("SELECT * FROM options WHERE q_id=?",[sid],function(error,rows1,fields){
            conn.release();
            res.render('index/teacher/know_quest',{data:rows,data1:rows1});
          })
        })
      }else{
        res.render('index/teacher/know_quest',{data:rows,data1:""});
      }
    })
  })
});


router.use("/addTask",function(req,res,next){
      var data=req.body.data;
      var name="试卷草稿";
      pool.getConnection(function(err,conn){
        conn.query("INSERT INTO task SET name=?,c_id=?,t_id=?,status=?,del=?",[name,"","","0","0"],function(error,rows,fields){
             conn.release();
             if(!error){
               var tid=rows.insertId;
               var spl=data.split(";");
               var arr=[];
               for(i=0;i<spl.length;i++){
                 var newarr=[];
                 newarr.push(tid);
                 newarr.push(spl[i]);
                 newarr.push("0");
                 arr.push(newarr);
               }

               pool.getConnection(function(err,conn){
                 conn.query("INSERT INTO taskrecord  (task_id,q_id,del) VALUES ?",[arr],function(erro,vals,fields){
                   conn.release();
                   if(!erro){
                     res.send("yes");
                   }
                 })
               })

             }
        })
      })
});


router.use("/showQuest/:id",function(req,res,next){
  var tid=req.params.id;
  pool.getConnection(function(err,conn){
    conn.query("SELECT * FROM taskrecord WHERE task_id=?",[tid],function(error,vals,fields){
      conn.release();
      if(!error){
        var arr="";
        for(var i=0;i<vals.length;i++){
          arr+=vals[i].q_id+";";
        }
        var newarr=arr.split();
        pool.getConnection(function(erro,conn){
              conn.query("SELECT * FROM question",function(error,rows,fields){
                conn.release();
                if(!error){
                  res.render('index/teacher/show_task',{data:rows,data1:newarr});
                }
              })
        })
      }
    })
  })
})
















module.exports = router;
