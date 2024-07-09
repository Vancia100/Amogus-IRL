//TASKS CAN NOT USE 
//import somefunction from "./someother.js"

const finishEvent = new CustomEvent("taskComplete")

function finishGame() {
    console.log("click!")
    window.dispatchEvent(finishEvent)
}