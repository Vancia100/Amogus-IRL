console.log("TASKSCRIPT WORKS!")
rightAmount = 0

//Klick left bar
document.querySelectorAll(".wireTab").forEach(tab =>{
  const clickSomewhereFunction = (e) =>{
    window.removeEventListener("mouseup", clickSomewhereFunction)
    if(e.target.classList.value == "wireClose"){
      console.log("sticks!")
      if(e.target.id.endsWith(tab.id)) {
        rightAmount ++
        e.target._right = true
        console.log("right!")
      }
      done()
      //Elements are linked
      e.target._stuckTo = tab
      tab._stuckTo = e.target
    }else{
      console.log("goes back")
    }
  }

  tab.addEventListener("mousedown", (e) =>{
    console.log("click!", e.target.id)
    if (e.target._stuckTo) {
      console.log("removing connections")
      if (e.target._right) {
        rightAmount --
      }
      e.target._stuckTo._stuckTo = null
      e.target._stuckTo = null
    }
    window.addEventListener("mouseup", clickSomewhereFunction)
    //This colour follows the cursor
  })
})

//Klick right bar
const colours = ["Purple", "Red", "Blue", "Yellow"]
document.querySelectorAll(".wireClose").forEach(end => {
  //Random.clr
  end.id = `end-${colours.splice(Math.floor(Math.random() * colours.length), 1)[0]}`
  end.textContent = end.id
  const releaseClickFunction = (e) =>{
    window.removeEventListener("mouseup", releaseClickFunction)
    console.log("StuckBack")

    //New relationship
    if (e.target.classList.value == "wireClose" ) {
      end._stuckTo._stuckTo = e.target
      e.target.id.endsWith(end._stuckTo.id) && rightAmount ++
    } else {
      end._stuckTo._stuckTo = null
    }
    end != e.target && (end._stuckTo = null)
  }
  end.addEventListener("mousedown", e =>{
    if (e.target._stuckTo) {
      console.log("Released!")
      if (e._right) {
        rightAmount --
      }
      console.log(e.target._stuckTo.id)
      window.addEventListener("mouseup", releaseClickFunction)
    }
  })
})

function done() {
  if (rightAmount == 4){
    console.log("Done!")
  }
}