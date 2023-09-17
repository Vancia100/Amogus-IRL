async function requestOptions () {
//console.log("button Pressed!")

    const settingsList = document.getElementById("settingsMenue")
    if(!settingsList.classList.contains("show")) {
        const response = await sendAPI()
        const ul = document.getElementById("settingslist")
        try {
            for (const item of response.list) {
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

        document.querySelectorAll(".settingsOption").forEach(item => {
            if (!(item.childElementCount > 2)) {
                textBox = document.createElement("h3")
                textBox.classList.toggle("text1")
                textBox.textContent = (`amount of ${item.id} tasks:`)
                amount = document.createElement("h3")
                amount.classList.toggle("text1")
                amount.classList.toggle("taskAmount")
                span = document.createElement("span")
                span.classList.toggle("taskSpan")
                span.appendChild(amount)
                //console.log(item.id)
                
                item.insertBefore(textBox, item.children[0])
                item.insertBefore(span, item.children[2])

                amount.textContent = (response["current"][item.id] || 0)
                //refresh  when it already exists?

                //make it so that you can't have more tasks of each type then settings enabled.
            }
            else {

            }
        })
        document.querySelectorAll(".arrowIcon").forEach(item => {
            item.addEventListener("click", () => {
                if (item.classList.length > 1) {
                    const sibeling = Number(item.nextElementSibling.childNodes[0].textContent)
                    if (sibeling > 0){
                        item.nextElementSibling.childNodes[0].textContent = sibeling -1
                    }
                    //do something to alarm that nothing bellow 0 is avalible?
                }
                else{
                    const sibeling = Number(item.previousSibling.childNodes[0].textContent)
                    if (sibeling < response["max"][item.parentElement.id]) {
                        item.previousSibling.childNodes[0].textContent = sibeling +1
                    }
                    //notify that no more tasks exist?
                }
        
        
                //console.log(item.parentElement.id)
            })
        })
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
    let apicall = {enabled: {}, current: {}}

    document.querySelectorAll(".enableOption input").forEach(item => {
        apicall["enabled"][item.id] = item.checked
    })
    document.querySelectorAll(".taskAmount").forEach(item => {
        apicall["current"][item.parentNode.parentNode.id] = Number(item.textContent)
    })

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