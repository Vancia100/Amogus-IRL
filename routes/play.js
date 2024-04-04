const express = require("express")
const router = express.Router() 
const http = require("http")
const WebSocket = require("ws")
const server = http.createServer(router)

wss = new WebSocket.Server( {port:3001} )

let gameStarted = false
let hostClient = null
wss.on('connection', (ws) => {
    console.log('WebSocket client connected')
  
    ws.on('message', (message) => {
      ms = JSON.parse(message)
      console.log('Received message from client:', ms)
      if (ms.client == "HOST") {
        gameStarted = true
        hostClient = ws
        console.log("GAME STARTED!", ms)
      }
      else {
        if (!gameStarted) {
            ws.send(JSON.stringify({game: false, status:"Game is currently offline!"}))
        }else {
            ws.send(JSON.stringify({game: true, status:"Hell yeah"}))
            hostClient.send(message)
        }
      } 
    })
  
    ws.on('close', () => {
      console.log('WebSocket client disconnected')
    })
  })

router.get("/", (req, res) => {
    res.render("play")
})

router.get("/checkGame", (req, res) => {
  res.send(JSON.stringify(gameStarted))
})

// router.get('//:id', function(req , res){
// // const loadFiles = require("../code_tools/read_all_files")
//     // const {taskList} = loadFiles()
//     // if (taskList.forEach(item => {
//     //     return item.options.name == (String(req.params.id).replaceAll("-", " "))
//     // })) {
//     //     console.log("That task exists.")
//     // }
//   });

module.exports = router