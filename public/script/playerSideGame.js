import taskCounterObject from "./Object/taskCounterObject.js"
let isImpostor = false
const playerData = {
    event: "join",
    username: localStorage.getItem("username")
    }


document.addEventListener("DOMContentLoaded", () => {
    customElements.define("task-counter", taskCounterObject)

    const nameField = document.getElementById("myUsername")
    nameField.textContent = playerData.username
    const taskCounter = new taskCounterObject("taskCounter")
    const socket = new WebSocket(`ws://${window.location.hostname}:3001/play`)
    socket.addEventListener("open", () =>{
        console.log("Started socket!")
        socket.send(JSON.stringify(playerData))
    })
    socket.addEventListener("message", (message) =>{
        const messageJSON = JSON.parse(message.data)
        switch (messageJSON.action) {
            case "start":
                isImpostor = messageJSON.impostor
                doStartupAnimation(messageJSON, () =>{
                    taskCounter.classList.remove("invisible")
                })
                taskCounter.defineMaxTaskAmount(messageJSON.totalTaskAmount, messageJSON.playTime)
                break
            case "updateTaskCounter":
                taskCounter.updateTaskCount()
                break
            case "end":
                //play endgame animation...
                taskCounter.classList.add("invisible")
                console.log(`You ${messageJSON.isImpostorWin == isImpostor ? "win" : "loose"}`)
            case "vote":
                const skipBtn = document.getElementById("skipBtn")
                skipBtn.addEventListener("click", () =>{
                    socket.send(JSON.stringify({
                        event: "myVote",
                        player: 0
                    }))
                    container.classList.add("invisible")
                    document.querySelectorAll(".player").forEach(selectedPlayer =>{
                        selectedPlayer.remove()
                    })
                })
                //Now vote for the players that are left...
                console.log("Vote Started!")
                taskCounter.stopTimer()
                const container = document.getElementById("playerContainer")
                messageJSON.playerList.forEach(player => {
                    const playerDiv = document.createElement("div")
                    container.classList.remove("invisible")
                    const playerText = document.createElement("h2")
                    const playerIcon = document.createElement("img")
                    const playerIconDiv = document.createElement("div")
                    const playerTextDiv = document.createElement("div")
                    playerIconDiv.classList.add("playerIconDiv")
                    playerTextDiv.classList.add("playerTextDiv")
                    playerIcon.id = `icon-${player}`
                    playerIcon.src = "/pictures/playericon.svg"
                    playerIcon.classList.add("playerIcon")
                    playerIcon.width = "55"
                    playerText.textContent = player
                    playerText.classList.add("text1")
                    playerDiv.classList.add("player")
                    playerDiv.id = player
                    playerIconDiv.appendChild(playerIcon)
                    playerTextDiv.appendChild(playerText)
                    playerDiv.appendChild(playerIconDiv)
                    playerDiv.appendChild(playerTextDiv)
                    playerDiv.addEventListener("click", () =>{
                        socket.send(JSON.stringify({
                            event: "myVote",
                            player: player
                        }))
                        container.classList.add("invisible")
                        document.querySelectorAll(".player").forEach(selectedPlayer =>{
                            selectedPlayer.remove()
                        })
                    })
                    //container.appendChild(playerDiv)
                    container.insertBefore(playerDiv, skipBtn.parentElement)
                });
            default:
                console.log(messageJSON)
        }
    })

    socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error)
    })
    socket.addEventListener("close", () =>{
        window.location = "/"
    })
})
function doStartupAnimation(messageJSON, cb) {
    const startScreen = document.getElementById("startScreen")
    startScreen.innerHTML = ""
    const playerImpostorScreen = document.createElement("img")
    playerImpostorScreen.src = `/pictures/playericon.svg`
    //replace first instance with impostor.svg once the icon is made
    const playerImpostorText = document.createElement("div")
    playerImpostorText.textContent = `You are ${messageJSON.impostor ? "the Impostor" : "a Crewmate"}`
    playerImpostorText.classList.add("text1")
    startScreen.appendChild(playerImpostorScreen)
    startScreen.appendChild(playerImpostorText)
    startScreen.classList.add("menueOptionWindow")
    
    startScreen.addEventListener("animationend", () =>{
        const taskView = document.getElementById("taskDiv")
        for (const task of messageJSON.tasks) {
            console.log(task)
            const thisTaskDiv = document.createElement("div")
            thisTaskDiv.classList.add("box2", "text1")
            thisTaskDiv.textContent = task.name
            taskView.appendChild(thisTaskDiv)
        }
        taskView.classList.remove("invisible")
        taskView.classList.add("menueOptionWindow")
        taskView.addEventListener("animationend", () =>{
            const beQuietDiv = document.getElementById("beQuietDiv")
            beQuietDiv.classList.remove("invisible")
            beQuietDiv.classList.add("menueOptionWindow")
            beQuietDiv.addEventListener("animationend", () =>{
                cb && cb()
            })
        })
    })
}