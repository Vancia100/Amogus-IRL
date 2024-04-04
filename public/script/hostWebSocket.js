data = {client: "HOST"}


document.addEventListener("DOMContentLoaded", () =>{
    const socket = new WebSocket("ws://localhost:3001/play")
    console.log("tried opening socket")
    socket.addEventListener("open", () =>{
        console.log("Started socket!")
        socket.send(JSON.stringify(data))
    })
    socket.addEventListener("message", (message) => {
        console.log(message)
    })


    socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
    });
})