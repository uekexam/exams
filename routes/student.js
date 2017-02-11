var express = require('express');
var router = express.Router();
var pool=require("./mysql.js");


router.get('/', function(req, res, next){
    res.render("index/student/homepage");
});
router.use("/exam",function(req,res,next){
    pool.getConnection(function(err,conn){
        conn.query("SELECT * FROM task WHERE status=? ORDER BY ID DESC",["0"],function(error,rows,fields){
            if(!error){
                conn.release();
                var myDate=new Date();
                var month=myDate.getMonth()+1;
                var day=myDate.getDate();
                res.render("index/student/exam",{data:rows,m:month,day:day});
            }
        });
    })

});
router.use("/test/:id",function(req,res,next){
        var tid=req.params.id;
        pool.getConnection(function(err,conn){
            conn.query("SELECT * FROM taskrecord WHERE task_id=?",[tid],function(error,vals,fields){
                conn.release();
                if(!error){
                    var arr="";
                    for(var i=0;i<vals.length;i++){
                        arr+=vals[i].q_id+";";
                    }
                    var newarr=arr.slice(0,-1);
                    pool.getConnection(function(erro,conn){
                        conn.query("SELECT * FROM question",function(error,rows,fields){
                            conn.release();
                            if(!error){
                                res.render('index/student/exam_online',{data:rows,data1:newarr});
                            }
                        })
                    })
                }
            })
        })
});

router.use("/option/:id",function(req,res,next){
    var id=req.params.id;
    pool.getConnection(function(err,conn){
        conn.query("SELECT * FROM options WHERE q_id=?",[id],function(error,rows,fields){
            conn.release();
            if(!error){
                res.json(rows);
            }
        })
    })
})
module.exports=router;

