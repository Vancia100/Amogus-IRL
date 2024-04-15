const express = require("express")
const router = express.Router() 
const http = require("http")
const WebSocket = require("ws")
const server = http.createServer(router)
const bodyParser = require('body-parser');

wss = new WebSocket.Server( {port:3001} )

router.use(bodyParser.json())

let gameStarted = false
let hostClient = null
const players = new Map()
wss.on('connection', (ws) => {
    console.log('WebSocket client connected')
    ws.on('message', (message) => {
      ms = JSON.parse(message)
      console.log('Received message from client:', ms)
      if (ms.client == "HOST") {
        if (!gameStarted){
          gameStarted = true
          hostClient = ws
          ws.playerId = 0
          console.log("GAME STARTED!", ms)
        }else{
          switch (ms.action) {
            case "kick":
              players.get(ms.player).close()
              break;
            default:
              ws.close()
          }
        }
      }
      else if (gameStarted) {
        switch (ms.event){
          case "join":
            if (players.has(ms.username)) {
              console.log("username is already in use!")
              ws.send(JSON.stringify({error:"usrName"}))
              ws.close()
              break
            }
            console.log("Sent massage to host")
            players.set(ms.username, ws)
            ws.playerId = ms.username
            hostClient.send(JSON.stringify(ms))
            break
          default:
            console.log(ms)
        }
      } 
    })
    ws.on('close', () => {
      console.log('WebSocket client disconnected')
      if (ws.playerId === 0) {
        console.log("The host quit!")
        wss.clients.forEach(element => {
          element.close()
        })
        players.clear()
        gameStarted = false
        hostClient = null
      }
      else {
        players.delete(ws.playerId)
          if (hostClient && ws.playerId) hostClient.send(JSON.stringify({event: "kick", player:ws.playerId}))
      }
    })
  })

router.get("/", (req, res) => {
    res.render("play")
})

router.post("/checkGame", (req, res) => {
  const inputUsername = req.body
  console.log(players.has(inputUsername.username), inputUsername.username)
  res.send(JSON.stringify({
    allowed: gameStarted && !(players.has(inputUsername.username)),
    message: !gameStarted ? players.has(inputUsername.username) ? "" : "Game not started" : "Username already in use"
  }))
})

module.exports = router