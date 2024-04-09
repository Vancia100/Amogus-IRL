const calledAPI = sendAPI()

window.addEventListener("beforeunload", () => {
    changePreferences()
})

document.addEventListener("DOMContentLoaded", async () =>{
        const response = await calledAPI
        
        document.querySelectorAll(".arrowIcon").forEach(item => {
            item.addEventListener("click", (event) => {
                if(event.target.classList.contains("mirrored")) {
                    const amount = Number(event.target.nextElementSibling.childNodes[1].textContent)
                    event.target.nextElementSibling.childNodes[1].textContent = (amount == 0 ? 0 : amount - 1)
                }else {
                    const amount = Number(event.target.previousElementSibling.childNodes[1].textContent)
                    const parentID = event.target.parentNode.id
                    event.target.previousElementSibling.childNodes[1].textContent = (amount <response["max"][parentID] ? amount + 1 : amount)
                    console.log(parentID)
                }
            })
        })
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

function loadPreferences(){
    let apicall = {enabled: {}, current: {}}

    document.querySelectorAll(".enableOption input").forEach(item => {
        //console.log(item)
        apicall["enabled"][item.id] = item.checked
    })
    document.querySelectorAll(".taskAmount").forEach(item => {
        apicall["current"][item.parentNode.parentNode.id] = Number(item.textContent)
    })
    //console.log(apicall)
    return(apicall)
}

async function changePreferences() {
    checkIfGameReady(async (apicall) =>{
        const downloadBtn = document.getElementById("downloadBtn")
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
downloadBtn = document.getElementById("downloadBtn")
downloadBtn.addEventListener("click", (event) =>{
    //console.log(checkIfGameReady())
    if(!checkIfGameReady()) {
            event.preventDefault()
            downloadBtn.childNodes[1].style.borderColor = "#b53933"
            //window.alert("Invalid Settigns!")
        }
})

//change structure of the API to make sure this works properly?
function checkIfGameReady(cb, fail) {
 const prefrences = loadPreferences()
for (const key in prefrences.enabled) {
    if (prefrences.enabled[key]) {
        if (cb) cb(prefrences);
        return true
    }
}
if (fail) fail();
return false
}

function playGame() {
    console.log("Tried hosting game", checkIfGameReady())
    if (checkIfGameReady()) window.location.href = "/host/game"
}