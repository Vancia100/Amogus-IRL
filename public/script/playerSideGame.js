playerData = {
    event: "join",
    username: localStorage.getItem("username")
    }
document.addEventListener("DOMContentLoaded", () => {
    const nameField = document.getElementById("myUsername")
    nameField.textContent = playerData.username
    const socket = new WebSocket(`ws://${window.location.hostname}:3001/play`)
    socket.addEventListener("open", () =>{
        console.log("Started socket!")
        socket.send(JSON.stringify(playerData))
    })
    socket.addEventListener("message", (message) =>{
        const messageJSON = JSON.parse(message.data)
        switch (messageJSON.event) {
            case "start":
                console.log(`You are ${messageJSON.impostor ? "the Impostor" : "a Crewmate"}`)
                console.log(messageJSON.tasks)
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