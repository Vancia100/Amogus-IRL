import taskCounterObject from "./Object/taskCounterObject.js"

let isImpostor = false
const playerData = {
    event: "join",
    username: localStorage.getItem("username"),
    clr: `#${Math.floor(Math.random() * (256**3)).toString(16)}`
    }

document.addEventListener("DOMContentLoaded", () => {
    customElements.define("task-counter", taskCounterObject)
    const taskCounter = new taskCounterObject("taskCounter")
    const actionBarDiv = document.getElementById("Actionbar")
    const taskWork = document.getElementById("taskOutline")
    
    //Handle task complete event
    let currentTask = null
    window.addEventListener("taskComplete", event =>{
        if (!isImpostor) {
            socket.send(JSON.stringify({
                "event":"playerSend",
                "data": event
            }))
        }
        actionBarDiv.classList.remove("inactive")
        taskWork.classList.remove("active")
        const comepletedTask = document.getElementById(currentTask)
        comepletedTask.removeEventListener("click", comepletedTask._function)
        comepletedTask.style.cursor = "default"
        const checkMark = document.createElement("img")
        checkMark.src = "/pictures/checkMark.png"
        checkMark.classList.add("check-mark")
        comepletedTask.appendChild(checkMark)
        currentTask = null
    })

    //Handle buttonpresses
    const buttonPressFunctions = {
        "DiedIcon": function(){
            if (!isImpostor) {
               actionBarDiv.classList.add("invisible")
               taskCounter.classList.add("invisible")
               socket.send(JSON.stringify({
                event:"died"
               }))
            }else{
                console.log("you can't be killed!")
            }
        },
        "TasklistIcon":function(){
            document.getElementById("taskDiv").classList.add("active")
            actionBarDiv.classList.add("inactive")
        },
        "ReportIcon":function(){
            socket.send(JSON.stringify({
                event:"report"
            }))
            //Add a spam-protection Layer, approved layer? Perhaps another Object?
        },
        "ScanIcon":function(){
            if(currentTask) {
                actionBarDiv.classList.add("inactive")
                taskWork.classList.add("active")
            }
            //Scan the QR-code...
            //display task
        }
    }
    

    const socket = new WebSocket(`ws://${window.location.hostname}:3001/play`)

    //Controlls the avatar colour picker system
    const nameField = document.getElementById("myUsername")
    nameField.querySelector("h2").textContent = playerData.username
    const svgIcon = document.getElementById("svg1")
    const clrPicker = nameField.querySelector("input[type=color]")
    clrPicker.value = playerData.clr
    nameField.addEventListener("click", () => clrPicker.click())
    svgIcon.querySelector(".cls-2").setAttribute("fill", playerData.clr)
    clrPicker.addEventListener("input", (e)=>{
        console.log(svgIcon.querySelector(".cls-2"))
        svgIcon.querySelector(".cls-2").setAttribute("fill", e.target.value)
    })
    clrPicker.addEventListener("change", (e) => {
        socket.send(JSON.stringify({
            sendToHost:true,
            event: "clrChange",
            clr: e.target.value,    
            player: playerData.username
        }))
    })

    //Socket things
    socket.addEventListener("open", () =>{
        console.log("Started socket!")
        socket.send(JSON.stringify(playerData))
    })
    socket.addEventListener("message", (message) =>{
        const messageJSON = JSON.parse(message.data)
        switch (messageJSON.action) {
            case "start":
                isImpostor = messageJSON.impostor
                for (const item in buttonPressFunctions) {
                    const thisDiv = document.getElementById(item)
                    thisDiv._function = buttonPressFunctions[item]
                    thisDiv.addEventListener("click", thisDiv._function)
                }
                doStartupAnimation(messageJSON, () =>{
                    taskCounter.classList.remove("invisible")

                    actionBarDiv.classList.remove("inactive")
                })
                taskCounter.defineMaxTaskAmount(messageJSON.totalTaskAmount, messageJSON.playTime)
                break
            case "updateTaskCounter":
                taskCounter.updateTaskCount()
                break
            case "end":
                //play endgame animation...
                taskCounter.remove()
                actionBarDiv.remove()
                console.log(`You ${messageJSON.isImpostorWin == isImpostor ? "win" : "loose"}`)
                break
            case "vote":
                actionBarDiv.classList.add("inactive")
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
                    actionBarDiv.classList.remove("inactive")
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
                        actionBarDiv.classList.remove("inactive")
                    })
                    //container.appendChild(playerDiv)
                    container.insertBefore(playerDiv, skipBtn.parentElement)
                })
                break
            case "deley":
                const reportDiv = document.getElementById("ReportIcon")
                reportDiv.removeEventListener("click", reportDiv._function)
                //add a loading icon?
                setTimeout(() =>{
                    reportDiv.addEventListener("click", reportDiv._function)
                }, 7000)
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
                thisTaskDiv.id = task.name.replace(/ /g, "-").toLowerCase()
                thisTaskDiv.classList.add("box2", "text1")
                thisTaskDiv.textContent = task.name
                taskView.appendChild(thisTaskDiv)
                //Temporary system to access the tasks until the QR-reader is done
                thisTaskDiv._function = function (){
                    if(!currentTask){
                        fetch(`/task/${thisTaskDiv.id}`).then(fetchedTask  =>{
                            if (!fetchedTask.ok) throw "Error reading task"
                            return fetchedTask.text()
                        })
                        .then(html =>{
                            currentTask = thisTaskDiv.id
                            taskWork.innerHTML = html
                            taskView.classList.remove("active")
                            taskWork.classList.add("active")
                            const closeTaskView = document.createElement("img")
                            closeTaskView.src = "/pictures/exitIcon.png"
                            closeTaskView.classList.add("Closeicon")
                            taskWork.appendChild(closeTaskView)
                            closeTaskView.addEventListener("click", () => {
                                taskWork.classList.remove("active")
                                actionBarDiv.classList.remove("inactive")
                            })

                            //refresh Scripts...
                            const scripts = taskWork.querySelectorAll("script")
                            scripts.forEach(script =>{
                                const newScript = document.createElement("script")
                                if (script.src) {
                                    newScript.src = script.src
                                } else {
                                    newScript.textContent = script.textContent
                                }
                                Array.from(script.attributes).forEach(attr =>{
                                    newScript.setAttribute(attr.name, attr.value)
                                })
                                script.parentNode.replaceChild(newScript, script)
                            })
                        })
                        .catch(err =>{
                            console.error(err)
                        })
                    }else{
                        taskWork.classList.add("active")
                        taskView.classList.remove("active")
                    }
                }
    
                setTimeout(() =>{
                    thisTaskDiv.addEventListener("click", thisTaskDiv._function)
                    thisTaskDiv.style.cursor = "pointer"
                }, 3000)
                //Done here...
            }
            taskView.classList.remove("invisible")
            taskView.classList.add("menueOptionWindow")
            taskView.addEventListener("animationend", () =>{
                const closeTaskView = document.createElement("img")
                closeTaskView.src = "/pictures/exitIcon.png"
                closeTaskView.classList.add("Closeicon")
                taskView.appendChild(closeTaskView)
                closeTaskView.addEventListener("click", () => {
                    taskView.classList.remove("active")
                    actionBarDiv.classList.remove("inactive")
                })
                const beQuietDiv = document.getElementById("beQuietDiv")
                beQuietDiv.classList.remove("invisible")
                beQuietDiv.classList.add("menueOptionWindow")
                beQuietDiv.addEventListener("animationend", () =>{
                    cb && cb()
                })
            })
        })
    }
})