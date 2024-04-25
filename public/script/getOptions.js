const calledAPI = sendAPI()

document.addEventListener("DOMContentLoaded", async () =>{
        const response = await calledAPI
        const maxAmounts = response.max
        document.querySelectorAll(".enableOption input").forEach(item => {
            const checkboxTaskType = response["lookup"][item.id]["type"]
            if (!item.checked) maxAmounts[checkboxTaskType] --

            item.addEventListener("change", () =>{
                if (item.checked) {
                    maxAmounts[checkboxTaskType] ++
                    return
                }
                maxAmounts[checkboxTaskType] --
                const thisCounter = document.getElementById(checkboxTaskType).childNodes[5].childNodes[1]
                if (Number(thisCounter.textContent) > maxAmounts[checkboxTaskType]) thisCounter.textContent = maxAmounts[checkboxTaskType]
            })
        })

        document.querySelectorAll(".arrowIcon").forEach(item => {
            item.addEventListener("click", (event) => {
                if(event.target.classList.contains("mirrored")) {
                    const amount = Number(event.target.nextElementSibling.childNodes[1].textContent)
                    event.target.nextElementSibling.childNodes[1].textContent = (amount == 0 ? 0 : amount - 1)
                }else {
                    const amount = Number(event.target.previousElementSibling.childNodes[1].textContent)
                    const parentID = event.target.parentNode.id
                    event.target.previousElementSibling.childNodes[1].textContent = (amount < maxAmounts[parentID] ? amount + 1 : amount)
                }
            })
        })
})

window.addEventListener("beforeunload", changePreferences)


downloadBtn = document.getElementById("downloadBtn")
downloadBtn.addEventListener("click", (event) =>{
    if(!checkIfGameReady()) {
            event.preventDefault()
            downloadBtn.childNodes[1].style.borderColor = "#b53933"
            window.alert("Invalid Settigns!")
        }
})

async function requestOptions() {
    const settingsList = document.getElementById("settingsMenue")
    if(settingsList.classList.contains("show")) {
        changePreferences()
    }
    const qrBtn = document.getElementById("qrBtn")
    const startBtn = document.getElementById("startBtn")
    qrBtn.classList.toggle("hide")
    settingsList.classList.toggle("show")
    startBtn.classList.toggle("hide")
}

async function changePreferences() {
    checkIfGameReady(async (apicall) =>{
        const optionsSet = await fetch("/host/set-options", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apicall)
        })
        if (!optionsSet.ok)  {
            console.error("something went wrong when sending your prefrences...")
            return
        }
        downloadBtn.childNodes[1].style.borderColor = "#ffffff"
    }, () =>{
        console.log("Wrongly entered settings!")
        downloadBtn.childNodes[1].style.borderColor = "#b53933"
    })
}

async function sendAPI() {
    //console.log("API SENT")
    try {
        const response = await fetch("/host/get-options")
        if (!response.ok) throw new Error("FAIL");
        const responseProcessed = await response.json()
        return responseProcessed
    } catch (error) {
        console.log(error)
    }
}

function checkIfGameReady(cb, fail) {

    const taskAmounts = {}
    let taskAmountsCounter = 0
    document.querySelectorAll(".taskAmount").forEach(item => {
        taskAmounts[item.parentNode.parentNode.id] = Number(item.textContent)
        taskAmountsCounter = taskAmountsCounter + Number(item.textContent)
    })

    if (!taskAmountsCounter) {
        if(fail) fail()
        return false
    }
    const tasksMap = new Map()
    document.querySelectorAll(".enableOption input").forEach(item => {
        tasksMap.set(item.id, item.checked)
    })
    //This is currently redundand, but I left it in place to check for errors just in case
    calledAPI.then(value => {
        for (taskType in value.list) {
           if (value["list"][taskType].filter(task =>{
               return new Map(
                [...tasksMap]
                .filter(([k, v]) => v)
            ).has(task.name)
           }).length < taskAmounts[taskType]){
               if (fail) fail()
               return false
           }
        }
    if (cb) {
        cb({
            "enabled":Object.fromEntries(tasksMap),
            "current":taskAmounts
        })
    }
    return true
 }).catch(reason =>{
    console.log(reason)
 })
}

function playGame() {
    console.log("Tried hosting game", checkIfGameReady())
    if (checkIfGameReady()) window.location.href = "/host/game"
}