let playerCount = 0


document.addEventListener("DOMContentLoaded", () =>{
    const socket = new WebSocket("ws://localhost:3001/play")
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
                        action: "kick",
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

    // Add envent listener for start game
    const startBtn = document.getElementById("startBtn")
    startBtn.addEventListener("click", () =>{
        if(playerCount >= 4){
            //Start Game
        } else{
            //Outline
        }
    })
})


function updatePlayerCount(kick = false) {
    const playerCounterDiv = document.getElementById("playerCount")
    if (kick) {
        playerCount --
    } else {
        playerCount ++
    }
    playerCounterDiv.textContent = playerCount
    //when start button is available add so that us unblurred
}