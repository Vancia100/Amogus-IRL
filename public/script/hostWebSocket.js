import taskCounterObject from "./Object/taskCounterObject.js"
let playerCount = 0

const socket = new WebSocket(`ws://${window.location.hostname}:3001/play`)
const livePlayers = []

document.addEventListener("DOMContentLoaded", () =>{

    const startBtn = document.getElementById("startGameBtn")
    startBtn.addEventListener("click", startGameBtn)
    const emergencyBtn = document.getElementById("emergencyButton")
    customElements.define("task-counter", taskCounterObject)
    const taskCounter = new taskCounterObject("taskCounter")
    console.log("tried opening socket")
    socket.addEventListener("open", () =>{
        console.log("Started socket!")
        socket.send(JSON.stringify({client: "HOST"}))
    })
    socket.addEventListener("message", (message) => {
        const messageJSON = JSON.parse(message.data)
        console.log(messageJSON)
        switch (messageJSON.event) {
            case "join":
                updatePlayerCount()
                console.log("Tied adding box")
                const container = document.getElementById("playerContainer")
                const playerDiv = document.createElement("div")
                const playerText = document.createElement("h2")
                const playerIcon = document.createElement("img")
                const playerIconDiv = document.createElement("div")
                const playerTextDiv = document.createElement("div")
                playerIconDiv.classList.add("playerIconDiv")
                playerTextDiv.classList.add("playerTextDiv")
                playerIcon.id = `icon-${messageJSON.username}`
                playerIcon.src = "/pictures/playericon.svg"
                playerIcon.classList.add("playerIcon")
                playerIcon.width = "55"
                playerText.textContent = messageJSON.username
                playerText.classList.add("text1")
                playerDiv.classList.add("player")
                playerDiv.id = messageJSON.username
                playerIconDiv.appendChild(playerIcon)
                playerTextDiv.appendChild(playerText)
                playerDiv.appendChild(playerIconDiv)
                playerDiv.appendChild(playerTextDiv)
                playerDiv.addEventListener("click", () =>{
                    socket.send(JSON.stringify({
                        client:"HOST",
                        event: "kick",
                        player: playerDiv.id
                    }))
                })
                container.appendChild(playerDiv)
                break

            case "kick":
                console.log("Tried kicking player", messageJSON.player)
                nowKickedPlayer = document.getElementById(messageJSON.player)
                if (nowKickedPlayer) {
                    updatePlayerCount(true)
                    nowKickedPlayer.remove()
                }
                break
            case "beginGame":
                //Show emergency button and add that functionality...
                taskCounter.defineMaxTaskAmount(messageJSON.totalTaskAmount, messageJSON.playTime, endGame)
                console.log(taskCounter.classList)
                taskCounter.classList.remove("invisible")
                emergencyBtn.classList.remove("invisible")
                break
            case "updateTaskCounter":
                taskCounter.updateTaskCount()
            default:
                console.error("Unknown message recived from WS")
        }
    })
    socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error)
    })
    socket.addEventListener("close", () =>{
        //window.location = "/"
    })

    emergencyBtn.addEventListener("click", e =>{
        taskCounter.stopTimer()
        emergencyBtn.classList.add("invisible")
        socket.send(JSON.stringify({
            client:"HOST",
            event:"vote",
            time:taskCounter.timerCount
        }))
        //Wait for another press?
        //Perhaps reuse this already existing player div?
    })
})

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
        console.log(containers)
        containers.forEach(item =>{
            item.classList.toggle("invisible")
        })

    } else{
        console.log("Not enough players!")
    }
}


function endGame(){
    console.log("the game ended...")
    socket.send(JSON.stringify({
        client:"HOST",
        event:"end",
        isImpostorWin:false
    }))
    setTimeout(() =>{
        location.reload()
    }, 6000)
}

function updatePlayerCount(kick = false) {
    const playerCounterDiv = document.getElementById("playerCount")
    
    playerCount = kick ? playerCount - 1 : playerCount + 1
    playerCounterDiv.textContent = playerCount
    //when start button is available add so that is unblurred
}