import taskCounterObject from "./Object/taskCounterObject"

const playerData = {
    event: "join",
    username: localStorage.getItem("username")
    }

document.addEventListener("DOMContentLoaded", () => {
    customElements.define("task-counter", taskCounterObject)
    const taskCounter = new taskCounterObject("taskCounter")
    const nameField = document.getElementById("myUsername")
    nameField.textContent = playerData.username

    const socket = new WebSocket(`ws://${window.location.hostname}:3001/play`)
    socket.addEventListener("open", () =>{
        console.log("Started socket!")
        socket.send(JSON.stringify(playerData))
    })
    socket.addEventListener("message", (message) =>{
        const messageJSON = JSON.parse(message.data)
        switch (messageJSON.action) {
            case "start":
                doStartupAnimation(messageJSON)
                taskCounter.defineMaxTaskAmount(messageJSON.totalTaskAmount)
                break
            case "updateTaskCounter":
                taskCounter.updateTaskCount()
                break
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

function doStartupAnimation(messageJSON) {
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
        startScreen.removeEventListener("animationend")
        const taskView = document.getElementById("taskDiv")
        for (task of messageJSON.tasks) {
            console.log(task)
            const thisTaskDiv = document.createElement("div")
            thisTaskDiv.classList.add("box2", "text1")
            thisTaskDiv.textContent = task.name
            taskView.appendChild(thisTaskDiv)
        }
        taskView.classList.remove("invisible")
        taskView.classList.add("menueOptionWindow")
        taskView.addEventListener("animationend", () =>{
            taskView.removeEventListener("animationend")
            const beQuietDiv = document.getElementById("beQuietDiv")
            beQuietDiv.classList.remove("invisible")
            beQuietDiv.classList.add("menueOptionWindow")
            beQuietDiv.addEventListener("animationend", () =>{
                taskCounter.classList.remove("invisible")
                taskView.removeEventListener("animationend")
                beQuietDiv.log("StartGame!")
            })
        })
    })
}