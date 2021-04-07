let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs');

let db;
let mongoClient = require('mongodb').MongoClient;
mongoClient.connect('mongodb+srv://ziming99:coolsinxx2@cluster0.e9nwn.mongodb.net/test',(err,client)=>{
    db = client.db('fitness');
})
app.use(express.json());
const ObjectID = require('mongodb').ObjectID;

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","*");
    res.header("Access-Control-Allow-Methods","*");
    next();
});

app.use(function(req,res,next){
    console.log("Request IP:"+req.url);
    console.log("Request date:"+new Date());
    next();
})

var imagePath = path.resolve(__dirname,"images");
app.use('/images',express.static(imagePath));


app.use(function(req,res,next){
    var filePath = path.join(__dirname,"static",req.url);
    fs.stat(filePath,function(err,fileInfo){
        if(err)
        {
            next();
            return;
        }
        if(fileInfo.isFile())
            res.sendFile(filePath);
        else
            next();
    })
})
app.param('collectionName',(req,res,next,collectionName)=>{
    req.collection = db.collection(collectionName);
    return next();
})

app.get('/',(req,res,next)=>{
    res.send("testing123");
})

app.put('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.update(
    {_id: new ObjectID(req.params.id)},
    {$set:req.body},
    {safe:true,multi:false},
    (e,result)=>{
        if (e) return next(e);
        res.send(result.result.n===1) ? {msg:'success'} :{msg:'error'}
    })
})
app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insert(req.body,(e,results)=>{
        if (e) return next (e);
        res.send(results.ops)
    })
})
app.get('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.findOne({_id: new ObjectID(req.params.id)},(e,results)=>{
        if(e)return next(e);
        res.send(results);  
    })
})
app.get('/collection/:collectionName',(req,res,next)=>{
    req.collection.find({}).toArray((e,results)=>{
        if(e)return next(e);
        res.send(results);
    })
})


const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log("Express server is running at localhost:3000"); 
})