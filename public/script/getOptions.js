async function requestOptions () {
    try {
        const response = await fetch("/host/get-options")
            if (!response.ok) throw new Error("FAIL");
        console.log(await response.json())
    } catch (error) {
        
    }
}