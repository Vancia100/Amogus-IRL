const { error } = require("console")
const express = require("express")
const router = express.Router() 
const fs = require("fs")
const bodyParser = require('body-parser');


router.use(bodyParser.json())

router.get("/", (req, res) => {
    res.render("host")
})

router.get("/get-options", (req, res) =>{
    try {
        const directory = (__dirname + "\\..\\tasks\\")
        try {
        const taskEnableJsonRaw = (fs.readFileSync(directory + "enabledTasks.json", {
            encoding: "utf-8", flag: "r"
        }))
            var taskEnableJson = JSON.parse(taskEnableJsonRaw)
        } catch (error) {
            var taskEnableJson = {}
        }
        //console.log(taskEnableJson)
        const taskdirectory = fs.readdirSync(directory).filter( (thing) => {
            return(fs.statSync(`${directory}/${thing}`).isDirectory());
        })
        let taskList = []
        for (let task of taskdirectory) {
            const taskDir = fs.readdirSync(directory + task).filter((thing) => thing.endsWith(".js"))[0]
            const {options} = require(directory + task + "\\" + taskDir)
            const taskEnabled = taskEnableJson[options.name] ? taskEnableJson[options.name] : false
            
            taskList.push({"name":options.name, "type":options.type, "enabled":taskEnabled}) 
        }
        res.json(taskList)
        //console.log(taskList)
    } catch (error) {
        res.status(500).json({"error":error})
        console.log(error)
    }
})

router.post("/set-options", (req, res) =>{
    const settings = req.body;
    //console.log(settings)
    const directory = (__dirname + "\\..\\tasks\\");
    fs.writeFileSync(directory + "enabledTasks.json", JSON.stringify(settings, null, 4), { flag: 'w+', encoding: "utf-8" }, err => {
        if (err) console.error(err)
        return res.status(500).json({error: "Failed to save settings to file"})
    });
    
    res.json({message: "Settings saved"})
})

router.get("/game", (req, res) => {
    res.render("game")
})

module.exports = router