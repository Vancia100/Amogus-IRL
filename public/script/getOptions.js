async function requestOptions () {
    const settingsList = document.getElementById("settingsMenue")
    if(!settingsList.classList.contains("show")) {
        try {
            const response = await fetch("/host/get-options")
                if (!response.ok) throw new Error("FAIL");
            console.log(await response.json())
        } catch (error) {
            console.log(error)
        }
    }
    const qrBtn = document.getElementById("qrBtn")
    const startBtn = document.getElementById("startBtn")
    qrBtn.classList.toggle("hide")
    settingsList.classList.toggle("show")
    startBtn.classList.toggle("hide")
}