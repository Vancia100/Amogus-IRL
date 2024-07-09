const express = require("express")
const router = express.Router()
const {loopTasks} = require("./../code_tools/read_all_files")
const fs = require("fs")
const taskLookup = {}
loopTasks(item =>{
    taskLookup[item.name] = `${__dirname}/../public/tasks/${item.name}/${item._internals.file}`
})

router.get("/", (req, res) =>{
    res.send("test")
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