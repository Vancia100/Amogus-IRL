const socket = new WebSocket("ws://localhost:3001/play")

document.addEventListener("DOMContentLoaded", () =>{
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
                console.log("Tied adding box")
                const container = document.getElementById("playerContainer")
                const playerDiv = document.createElement("div")
                const playerText = document.createElement("h2")
                playerText.textContent = messageJSON.username
                playerText.classList.add("text1")
                playerDiv.classList.add("player")
                playerDiv.id = messageJSON.username
                playerDiv.appendChild(playerText)
                playerDiv.addEventListener("click", (thisPlayerDiv) =>{
                    console.log("tried kicking player", thisPlayerDiv.srcElement.id)
                    socket.send(JSON.stringify({
                        client:"HOST",
                        action: "kick",
                        player: thisPlayerDiv.srcElement.id ? thisPlayerDiv.srcElement.id : thisPlayerDiv.srcElement.parentNode.id,
                    }))
                })
                container.appendChild(playerDiv)
                break

            case "kick":
                console.log("Tried kicking player", messageJSON.player)
                nowKickedPlayer = document.getElementById(messageJSON.player)
                if (nowKickedPlayer) {
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
        //window.location = "/"
    })
})

function startGameBtn() {
    console.log("Tried starting game")
    socket.send(JSON.stringify({
        client:"HOST",
        action: "start",
    }))
}