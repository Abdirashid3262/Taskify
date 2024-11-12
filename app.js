const http= require('http');
const taskRouters = require('./routes/taskRouters');

const hostName='localhost'
const port=900

const server = http.createServer((req,res)=>{
    if(req.url.startsWith('/tasks')){
        taskRouters(req,res)
    }
    else
    {
        res.writeHead(404, 'Not Found', {'content-type': 'application/json'})
        res.end(JSON.stringify({
            message: 'Sorry You Got Lost!'
        }))
    }
})
server.listen(port,hostName,()=>{
    console.log(`Server Running on Port ${port}`)
})