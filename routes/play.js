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

//Ingame stats
let isPlayerKilled = false
const voting = new Map()
let currentGameTime = 0

wss.on('connection', (ws) => {
  console.log('WebSocket client connected')
  ws.on('message', (message) => {
    ms = JSON.parse(message)
    console.log('Received message from client:', ms)
    if (ms.client == "HOST") {
      if (hostClient == null){
        gameJoinable = true
        hostClient = ws
        ws.playerId = 0
        console.log("GAME STARTED!", ms)
      }else if (ws === hostClient){
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
          case "end":
            console.log("Game should have ended")
            wss.clients.forEach(player =>{
              player.send(JSON.stringify({
                action:"end",
                win: player.impostor ? ms.isImpostorWin : !ms.isImpostorWin
              }))
            })
            players.clear()
            hostClient = null
            break
          case "vote":
            currentGameTime = ms.time
            players.forEach(player =>{
              player.send(JSON.stringify({
                action:"vote",
                playerList: [...players.keys()]
              }))
            })
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
            ws.send(JSON.stringify({error:"usrName"}))
            ws.close()
            break
          }
          console.log("Player has joined send message to host")
          players.set(ms.username, ws)
          ws.playerId = ms.username
          ws.impostor = false
          ws.alive = true
          hostClient.send(JSON.stringify(ms))
          break
        case "playerSend":
          console.log(`${ws.playerId} completed a task`)
          players.forEach(player =>{
            player.send(JSON.stringify({
              action: "updateTaskCounter"
            }))
          })
          break
        case "myVote":
          voting.has(ms.player) ? voting.set(ms.player, voting.get(ms.player) +1) : voting.set(ms.player, 1)
          console.log(voting)
          let voteAmount = [...voting.values()].reduce((total, current) =>{
            return total += current
          })
          console.log("Voting amount", voteAmount)
          if (voteAmount == players.size) {
            console.log("Voting complete!")
            const kickingPlayer = [...voting.entries()].reduce(([highestPlayer, highestCount], [player, count]) =>{
              return [
                count > highestCount ? player : count == highestCount ? null :highestPlayer,
                count < highestCount ? highestCount : count
              ]
            }, ["", 0])[0];
              hostClient.send(JSON.stringify({
                event:"voteKicked",
                voteList: {...voting},
                time: currentGameTime,
                player: function(){
                  if (kickingPlayer) {
                    players.get(kickingPlayer).send(JSON.stringify({
                      action:"die"
                    }))
                    players.delete(kickingPlayer)
                    return kickingPlayer
                  }
                  return null
                }()
              }))
            voting.clear()
            players.forEach(player =>{
              player.send(JSON.stringify({
                action:"resume",
                time: currentGameTime,
              }))
            })
          }
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

function endGame() {
  console.log("the game is ending!")
}

function assignRandomTasks(impostors = 1) {
  const {readTasks} = require("../code_tools/read_all_files")
  const {amounts, taskEnableJson} = readTasks()
  for (let i = 0; i < impostors; i++){
    impostors = [...players.keys()].splice(Math.floor(players.size * Math.random()), 1)[0]
    players.get(impostors)["impostor"] = true
  }
  let totalTaskAmount = 0
  players.forEach(player =>{
    totalTaskAmount = 0
    const tasks = []

    for (typeOfTask in amounts) {
      const filteredList = amounts[typeOfTask].filter(task => {
        return task.enabled 
      })
      const amountOfThisTask = taskEnableJson["current"][typeOfTask]
      totalTaskAmount += amountOfThisTask
      let i = 1
      while ( i <= amountOfThisTask && filteredList.length) {
        i++
        tasks.push(filteredList.splice(Math.floor(filteredList.length * Math.random()), 1)[0])
      }
    }
    totalTaskAmount = totalTaskAmount * (players.size - impostors)
    player.send(JSON.stringify({
      "action": "start",
      "impostor": player.impostor ? player.impostor : false,
      totalTaskAmount,
      tasks,
      playTime:taskEnableJson.time + 10
    }))
  })
  hostClient.send(JSON.stringify({
    "event": "beginGame",
    totalTaskAmount,
    playTime: taskEnableJson.time + 10
  }))
}

module.exports = router