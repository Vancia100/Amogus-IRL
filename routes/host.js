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
        const taskEnableJsonRaw = (fs.readFileSync(directory + "taskSettings.json", {
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
        var long = 0
        var short = 0
        var normal = 0

        for (let task of taskdirectory) {
            const taskDir = fs.readdirSync(directory + task).filter((thing) => thing.endsWith(".js"))[0]
            const {options} = require(directory + task + "\\" + taskDir)
            const taskEnabled = taskEnableJson["enabled"] && taskEnableJson["enabled"][options.name]? taskEnableJson["enabled"][options.name] : false
            
            switch (options.type) {
                case "long":
                    long++
                    break;
                case "short":
                    short++
                    break;
                case "normal":
                    normal++
                    break
                default:
                    break;
            }
            taskList.push({"name":options.name, "type":options.type, "enabled":taskEnabled}) 
        }

        const response = {
            "list": taskList,
            "max": {"short":short, "long": long, "normal": normal},
            "current": taskEnableJson["current"] ? taskEnableJson["current"] : {"short": 0, "long": 0, "normal": 0,}
            }
        res.json(response)
        //console.log(response)
    } catch (error) {
        res.status(500).json({"error":error})
        console.log(error)
    }
})

router.post("/set-options", (req, res) =>{
    const settings = req.body;
    //console.log(settings)
    const directory = (__dirname + "\\..\\tasks\\");
    fs.writeFileSync(directory + "taskSettings.json", JSON.stringify(settings, null, 4), { flag: 'w+', encoding: "utf-8" }, err => {
        if (err) console.error(err)
        return res.status(500).json({error: "Failed to save settings to file"})
    });
    
    res.json({message: "Settings saved"})
})

router.get("/game", (req, res) => {
    res.render("game")
})

module.exports = router