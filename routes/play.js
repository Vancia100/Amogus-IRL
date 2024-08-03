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
let killedPlayers = []
const voting = new Map()
let currentGameTime = 0
let impostorCount = 0
let pushbackTaskcount = 0 //task completed that will be updated on a emergency meeting
//Sets up for non updating task-meter option

wss.on('connection', (ws) => {
  console.log('WebSocket client connected')
  ws.on('message', (message) => {
    ms = JSON.parse(message)
    console.log('Received message from client:', ms)

    //If massage is from host
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
          case "timeOut":
            endGame(ms.isImpostorWin)
            console.log("Time ran out!")
            break
          case "vote":
            pushbackTaskcount && incrementTaskCounter(pushbackTaskcount)
            pushbackTaskcount = 0

            console.log("voting time!!!")
            currentGameTime = ms.time
            players.forEach(player =>{
              player.send(JSON.stringify({
                action:"vote",
                playerList: [...players.keys()]
              }))
            })
            break
          default:
            console.log("wierd message from host")
        }
      }
    }

    //If the game is started
    else if (hostClient) {
      if (ms.sendToHost) {
        hostClient.send(JSON.stringify(ms))
      }
      switch (ms.event){
        case "join":
          if (players.has(ms.username)) {
            ws.send(JSON.stringify({error:"usrName"}))
            ws.close()
            break
          }
          console.log("Player has joined, sending message to host")
          players.set(ms.username, ws)
          ws.playerId = ms.username
          ws.impostor = false
          ws.clr = ms.clr
          //ws.alive = true
          hostClient.send(JSON.stringify(ms))
          break
        case "playerSend":
          console.log(`${ws.playerId} completed a task`)
          ws.tasksLeft --
          //if (taskbarupdateOption)
          incrementTaskCounter(1)
          //else pushbackTaskcount ++
          break
        case "myVote":
          // Voting is a map of votes, defined on the top of the document
          voting.has(ms.player) ? 
          voting.set(ms.player, voting.get(ms.player) +1) : 
          voting.set(ms.player, 1)
          const voteAmount = [...voting.values()].reduce((total, current) =>{
            return total += current
          })
          console.log("Voting amount", voteAmount)
          if (voteAmount == players.size) {
            //Puts out the player with the most votes
            const kickingPlayer = [...voting.entries()].reduce(([highestPlayer, highestCount], [player, count]) =>{
              return [
                count > highestCount ? player : count == highestCount ? null :highestPlayer,
                count < highestCount ? highestCount : count
              ]
            }, ["", 0])[0];
              hostClient.send(JSON.stringify({
                ...{
                  event:"voteKicked",
                  voteList: {...voting},
                  time: currentGameTime,
                  },
                ... function() {
                  //First we define a function to run if the game resumes:
                  const resumeFunction = function(){
                    players.forEach(player =>{
                      player.send(JSON.stringify({
                        action:"resume",
                        time: currentGameTime,
                      }))
                    })
                  }

                  //Check if there is someone to be kicked:
                  if (kickingPlayer) {
                    const returnObj = {}
                    //Voted out player "dies"
                    players.get(kickingPlayer).send(JSON.stringify({
                      action:"die"
                    }))
                    //Defines what is to be sent to host
                    returnObj.player = kickingPlayer
                    if (players.get(kickingPlayer).impostor) {
                      returnObj.impostor = true,
                      impostorCount --
                    } else{
                      returnObj.impostor = false
                    }
                    players.delete(kickingPlayer)

                    //Does the game end? if not: run the function.
                    checkEndGame(resumeFunction)

                    //return object will be deconstructed and sent to the host
                    return returnObj
                  }
                  //Nobody is killed, the games continues like usual
                  resumeFunction()
                  return {}
                }()
              }
            ))
            voting.clear()
          }
          break
        case "died":
          console.log(ws.playerId, "died")
          killedPlayers.push(ws.playerId)
          //Needs to remove the tasks that this player has done from the global counter!
          checkEndGame(() =>{
            pushbackTaskcount += ws.tasksLeft
          })
          break
        case "report":
          if (killedPlayers.length > 0) {
            incrementTaskCounter(pushbackTaskcount)
            pushbackTaskcount = 0
            
            killedPlayers.forEach(player=>{
              const playerSocket = players.get(player)
              playerSocket.send(JSON.stringify({
                action:"getBack"
              }))
              players.delete(player)
            })
            players.forEach(player =>{
              player.send(JSON.stringify({
                action:"vote",
                playerList: [...players.keys()],
              }))
            })
            killedPlayers = []
            hostClient.send(JSON.stringify({
              action:"report",
              playerList: [...players.keys()]
            }))
          }else {
            ws.send(JSON.stringify({
              action:"deley"
            }))
          }
        break
        //Change colour
        case "clrChange":
          ws.clr = ms.clr
          break
        default:
          console.log("unknown command", ms)
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

function endGame(isImpostorWin = false) {
  console.log("the game has ended!")
  wss.clients.forEach(player =>{
    player.send(JSON.stringify({
      action:"end",
      event:"end",
      isImpostorWin,
    }))
  })
  players.clear()
  hostClient = null
  gameJoinable = false
  gameStarted = false
}
function incrementTaskCounter(amount) {
  wss.clients.forEach(player =>{
    player.send(JSON.stringify({
      action: "updateTaskCounter",
      event: "updateTaskCounter",
      amount
    }))
  })
}

function checkEndGame(failCb = null) {
  if (impostorCount == 0 || (players.size - impostorCount - killedPlayers.length < 2)) {
    endGame(impostorCount != 0)
  return {
    win:true,
    isImpostorWin: impostorCount != 0
  }
  }
  failCb && failCb()
  return false
}

function assignRandomTasks(impostors = 1) {
  impostorCount = impostors
  const {readTasks} = require("../code_tools/read_all_files")
  const {amounts, taskEnableJson} = readTasks()
  for (let i = 0; i < impostors; i++){
    const impostorsPlayer = [...players.keys()].splice(Math.floor(players.size * Math.random()), 1)[0]
    players.get(impostorsPlayer)["impostor"] = true
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
    player.tasksLeft = totalTaskAmount
    
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