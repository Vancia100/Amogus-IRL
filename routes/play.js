const express = require("express")
const router = express.Router() 
const http = require("http")
const WebSocket = require("ws")
const server = http.createServer(router)
const bodyParser = require('body-parser');

wss = new WebSocket.Server( {port:3001} )

router.use(bodyParser.json())

let gameJoinable = false
let gameStarted = false
let hostClient = null
const players = new Map()

wss.on('connection', (ws) => {
  console.log('WebSocket client connected')
  ws.on('message', (message) => {
    ms = JSON.parse(message)
    console.log('Received message from client:', ms)
    if (ms.client == "HOST") {
      console.log("Host joined!")
      if (hostClient == null){
        gameJoinable = true
        hostClient = ws
        ws.playerId = 0
        console.log("GAME STARTED!", ms)
      }else{
        switch (ms.event) {
          case "kick":
            console.log(ms.player)
            const player = players.get(ms.player)
            player.close()
            break;
          case "start":
            console.log("Game should have started")
            gameStarted = true
            gameJoinable = false
            assignRandomTasks()
            break
          default:
            ws.close()
        }
      }
    }
    else if (hostClient) {
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
          ws.alive = true
          hostClient.send(JSON.stringify(ms))
          break
        case "taskComplete":
          console.log(`${ws.playerId} completed a task`)
          players.forEach(player =>{
            player.send(JSON.stringify({
              action: "updateTaskCounter"
            }))
          })
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
      gameJoinable = false
      gameStarted = false
      hostClient = null
    }
    else {
      players.delete(ws.playerId)
        if (hostClient && ws.playerId) hostClient.send(JSON.stringify({event: "kick", player:ws.playerId}))
    } //What if you could reconnect?
  })
})


router.get("/", (req, res) => {
    res.render("play")
})

router.post("/checkGame", (req, res) => {
  const inputUsername = req.body
  res.send(JSON.stringify({
    allowed: gameJoinable && !(players.has(inputUsername.username)),
    message: !gameJoinable ? players.has(inputUsername.username) ? "" : "Game not started" : "Username already in use"
  }))
})


function assignRandomTasks(impostors = 1) {
  const {readTasks} = require("../code_tools/read_all_files")
  const {amounts, taskEnableJson} = readTasks()
  const iterablePlayers =[...players.keys()]
  for (let i = 0; i < impostors; i++){
    impostors = iterablePlayers.splice(Math.floor(players.size * Math.random()), 1)[0]
    players.get(impostors)["impostor"] = true
  }
  players.forEach(player =>{
    const tasks = []

    for (typeOfTask in amounts) {
      const filteredList = amounts[typeOfTask].filter(task => {
        return task.enabled 
      })
      const amountOfThisTask = taskEnableJson["current"][typeOfTask]
      let i = 1
      while ( i <= amountOfThisTask && filteredList.length) {
        i++
        tasks.push(filteredList.splice(Math.floor(filteredList.length * Math.random()), 1)[0])
      }
    }
    player.send(JSON.stringify({
      "action": "start",
      "impostor": player.impostor ? player.impostor : false,
      tasks
    }))
  })
}

module.exports = router