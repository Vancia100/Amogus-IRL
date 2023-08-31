async function requestOptions () {
    try {
        const response = await fetch("/host/get-options")
            if (!response.ok) throw new Error("FAIL");
    } catch (error) {
        
    }
    const settingsList = document.getElementById("settingsMenue")
    settingsList.classList.toggle("show")
    console.log(settingsList.classList)
}