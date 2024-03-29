const express = require("express")
const router = express.Router() 
const http = require("http")
const WebSocket = require("ws")
const server = http.createServer(router)
const wss = new WebSocket.Server({ server })


wss.on("connection", (ws) =>{
    console.log(ws)
})


router.get("/", (req, res) => {
    res.render("play")
})

router.get("/nowHosted", (req, res) => {
    res.render("game")
})

router.get('//:id', function(req , res){
    const loadFiles = require("../code_tools/read_all_files")
    const {taskList} = loadFiles()
    if (taskList.forEach(item => {
        return item.options.name == (String(req.params.id).replaceAll("-", " "))
    })) {
        console.log("That task exists.")
    }
  });

module.exports = router