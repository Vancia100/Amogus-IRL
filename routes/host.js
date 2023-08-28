const express = require("express")
const router = express.Router() 
const fs = require("fs")

router.get("/", (req, res) => {
    res.render("host")
})

router.get("/get-options", (req, res) =>{
    try {
        const directory = (__dirname + "\\..\\tasks\\")
        const taskdirectory = fs.readdirSync(directory)
        let taskList = []
        for (let task of taskdirectory) {
            const taskDir = fs.readdirSync(directory + task).filter((thing) => thing.endsWith(".js"))[0]
            const {id} = require(directory + task + "\\" + taskDir) 
            taskList.push({"name":taskDir, "id":id}) 
        }
        res.json(taskList)
    } catch (error) {
        res-status(500).json({"error":error})
    }
})

router.get("/game", (req, res) => {
    res.render("game")
})

module.exports = router