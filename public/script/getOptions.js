async function requestOptions () {

console.log("button Pressed!")

    const settingsList = document.getElementById("settingsMenue")
    if(!settingsList.classList.contains("show")) {
        const response = await sendAPI()
        const ul = document.getElementById("settingslist")
        try {
            //console.log(response)
            for (const item of response) {
                const posibleItem = document.getElementById(item.name)
                //console.log(posibleItem)
                if(posibleItem) continue;

                const li = document.createElement("li")
                optionsDiv = document.createElement("div")
                checkbox = document.createElement("input")
                checkbox.setAttribute("type", "checkbox")
                checkbox.setAttribute("id", item.name)
                checkbox.checked  = item.enabled
                textHeader = document.createElement("h3")
                textHeader.classList.toggle("text1")
                textHeader.textContent = (`Enable "${item.name}"`)
                optionsDiv.classList.toggle("enableOption")
                optionsDiv.appendChild(textHeader)
                optionsDiv.appendChild(checkbox)
                li.appendChild(optionsDiv)
                ul.appendChild(li)
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        changePreferences()
    }
    const qrBtn = document.getElementById("qrBtn")
    const startBtn = document.getElementById("startBtn")
    qrBtn.classList.toggle("hide")
    settingsList.classList.toggle("show")
    startBtn.classList.toggle("hide")
}
async function changePreferences() {
    let apicall = {}

    document.querySelectorAll(".enableOption input").forEach(item => {
        apicall[item.id] = item.checked
    })

    //const response = sendAPI()
    // for (const item of await response) {
    //     const posibleItem = document.getElementById(item.name)
    //     if (!posibleItem) {
    //         apicall[item.name] = item.enabled ? item.enabled : false
    //         continue
    //     }
    //     else {
    //         apicall[item.name] = posibleItem.checked
    //     }
    // }
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
    //console.log(await optionsSet.json)
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

window.addEventListener("beforeunload", (event) => {
    changePreferences()
} )