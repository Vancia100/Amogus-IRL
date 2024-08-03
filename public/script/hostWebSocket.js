import taskCounterObject from "./Object/taskCounterObject.js"
let playerCount = 0

const socket = new WebSocket(`ws://${window.location.hostname}:3001/play`)
const livePlayers = []

document.addEventListener("DOMContentLoaded", () =>{
  //Start game
  const startBtn = document.getElementById("startGameBtn")
  startBtn.addEventListener("click", startGameBtn)

  const emergencyBtn = document.getElementById("emergencyButton")
  customElements.define("task-counter", taskCounterObject)

  //Counter
  const taskCounter = new taskCounterObject("taskCounter")
  const container = document.getElementById("playerContainer")

  //Start socket
  socket.addEventListener("open", () =>{
    console.log("Started socket!")
    socket.send(JSON.stringify({client: "HOST"}))
  })

  //On message
  socket.addEventListener("message", (message) => {
    const messageJSON = JSON.parse(message.data)
    console.log(messageJSON)
    switch (messageJSON.event) {
      case "join":
        updatePlayerCount()
        console.log("Tied adding box")
        hydrateHTML({
          root: container,
          username: messageJSON.username,
          clr: messageJSON.clr
        })
        break
      case "kick":
        console.log("Tried kicking player", messageJSON.player)
        const nowKickedPlayer = document.getElementById(messageJSON.player)
        if (nowKickedPlayer) {
          updatePlayerCount(true)
          nowKickedPlayer.remove()
        }
        break
      case "beginGame":
        taskCounter.defineMaxTaskAmount(messageJSON.totalTaskAmount, messageJSON.playTime, endGame)
        taskCounter.classList.remove("invisible")
        emergencyBtn.classList.remove("invisible")
        document.querySelectorAll(".player").forEach(playerDiv =>{
          playerDiv.removeEventListener("click", playerDiv._clickHandler)
          delete playerDiv._clickHandler
        })
            //Delay on emergency button
    setTimeout(() =>{
      emergencyBtn.addEventListener("click", e =>{
        taskCounter.stopTimer()
        emergencyBtn.classList.add("invisible")
        socket.send(JSON.stringify({
          client:"HOST",
          event:"vote",
          time:taskCounter.timerCount
        }))
        //Wait for another press?
        container.classList.remove("invisible")
      })
    }, 10000)
        break
      case "updateTaskCounter":
        taskCounter.updateTaskCount()
        break
      case "voteKicked":
        //add small charachters to the names?
        //Will that be too hard?
        if (messageJSON.player){
          document.getElementById(messageJSON.player)?.remove()
        }
        taskCounter.timerCount = messageJSON.time
        taskCounter.startTimer()
        break

      case "clrChange":
        const thisPlayerDiv = document.getElementById(messageJSON.player)
        console.log(thisPlayerDiv)
        thisPlayerDiv.querySelector(".cls-2").setAttribute("fill", messageJSON.clr)
        break
      case "end":
        startBtn.remove()
        taskCounter.remove()
        //End game animation
        break
      default:
        console.error("Unknown message recived from WS")
    }
  })
  socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error)
  })
  socket.addEventListener("close", () =>{
      window.location = "/"
  })
})

//Some react looking ass shit right here ("But without intellisense")
function hydrateHTML({
username,
root,
clr,
}){
fetchSVG(svg =>{
  const playerDiv = document.createElement("div")
  playerDiv.id = username
  playerDiv.classList.add("player")
  playerDiv.innerHTML =
  `
  <div id="${username}" class="player">
    <div class="playerIconDiv">
      ${svg}
    </div>
    <div class="playerTextDiv">
      <h2 class="text1">${username}</h2>
    </div>
  </div>
  `

root.appendChild(playerDiv)
//Hydration in the hydration...

playerDiv.querySelector(".cls-2").setAttribute("fill", clr)
//Kick players
playerDiv._clickHandler = function () {
  socket.send(JSON.stringify({
    client:"HOST",
    event: "kick",
    player: playerDiv.id
  }))
}
playerDiv.addEventListener("click", playerDiv._clickHandler)
})
}

function fetchSVG(cb) {
  fetch("/pictures/playericon1.svg").then(res =>res.text())
  .then(svg => cb(svg))
  .catch(e => console.log("There was an error fetching the icon", e))
}

function startGameBtn() {
  console.log("Tried Starting game")
  if(playerCount >= 1){ //4
    console.log("Tried starting game")
    socket.send(JSON.stringify({
      client:"HOST",
      event: "start",
    }))
    document.getElementById("startGameBtn").remove()
    const containers = document.querySelectorAll(".container")
    containers.forEach(item =>{
      item.classList.add("invisible")
    })
  } else{
    console.log("Not enough players!")
  }
}


function endGame(){
  console.log("the game ended...")
  socket.send(JSON.stringify({
    client:"HOST",
    event:"timeOut",
    isImpostorWin:false
  }))
  setTimeout(() =>{
    // location.reload()
  }, 6000)
}

function updatePlayerCount(kick = false) {
  const playerCounterDiv = document.getElementById("playerCount")
  
  playerCount = kick ? playerCount - 1 : playerCount + 1
  playerCounterDiv.textContent = playerCount
  //when start button is available add so that is unblurred
}