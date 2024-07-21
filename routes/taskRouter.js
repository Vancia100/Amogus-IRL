const express = require("express")
const router = express.Router()
const {loopTasks} = require("./../code_tools/read_all_files")
const redoTasks = require("./../code_tools/redoTasks")
const fs = require("fs")
const taskLookup = {}
const taskEnableJson = loopTasks(item =>{
    taskLookup[item.name] = `${__dirname}/../public/tasks/${item.name}/${item._internals.file}`
})
const taskList = taskEnableJson.enabled
console.log(taskList)
router.get("/", async (req, res) =>{
    await redoTasks()
    res.render("testTask", {taskList})
})

router.get("/:id", (req, res) =>{
    try {
        if (taskLookup[req.params.id]) {
            res.setHeader("Content-Type", "text/html")
            fs.createReadStream(taskLookup[req.params.id])
            .pipe(res)
            //res.send(fs.readFileSync(taskLookup[req.params.id]))
        } else {
            res.status(404).send("Task not found")
        }
    } catch (error) {
        console.error(error)
        res.status(500)
    }
})

module.exports = router