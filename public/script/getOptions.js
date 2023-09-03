async function requestOptions () {
    const settingsList = document.getElementById("settingsMenue")
    const ul = document.getElementById("settingslist")
    if(!settingsList.classList.contains("show")) {
        try {
            const response = await sendAPI()
            //console.log(response)
            for (let item of response) {
                const posibleItem = document.getElementById(item.name)
                //console.log(posibleItem)
                if(posibleItem) continue;
                const addInString = '<add html ig? with process things?>'
                const li = document.createElement("li")
                li.setAttribute("id", item.name)
                ul.appendChild(li)
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        /*
        find the settings and save it as a variable?
        how do we make it send this on when a new site is loaded? save as a json that will be loaded by qr-code script?
        Do we do this every time a button is pressed?
        more advanced or use more process power?

       current plan: send a json with the tasks enabled and dissabled to server that there gets saved as a .json files to presist betwean loads.
       This api also sends back the enabled/dissabled to make it reflected in the settings
        */
    }
    const qrBtn = document.getElementById("qrBtn")
    const startBtn = document.getElementById("startBtn")
    qrBtn.classList.toggle("hide")
    settingsList.classList.toggle("show")
    startBtn.classList.toggle("hide")
}

async function sendAPI() {
    try {
        const response = await fetch("/host/get-options")
        if (!response.ok) throw new Error("FAIL");
        const responseProcessed = await response.json()
        return responseProcessed
    } catch (error) {
        console.log(error)
    }
}