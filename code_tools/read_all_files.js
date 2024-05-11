const fs = require("fs")
const directory = __dirname + "\\..\\tasks\\"

function readTasks(directory = __dirname + "\\..\\tasks\\") {
    const taskList = {}
    const amounts = {
        short:[],
        normal:[],
        long:[]
    }
    const taskEnableJson = loopTasks(item =>{
        const options = item.options
        if (taskList[options.name]) throw new Error(`All tasks need a unique name! \nThere are currently 2 tasks named ${options.name}`)

        taskList[options.name] = options

        amounts[options.type].push(options)
    })
    return {taskList, amounts, taskEnableJson}
}

function getQRCodes(inlcudeEverything = false) {
    const taskList = {}
    const taskEnableJson = loopTasks((item) =>{
        if (item.options.enabled || inlcudeEverything) {
            taskList[item.options.name] = item
        }
    })
    return {taskList, taskEnableJson}
}

function loopTasks(cb) {
    try {
        const taskEnableJsonRaw = (fs.readFileSync(directory + "taskSettings.json", {
            encoding: "utf-8", flag: "r"
        }))
            var taskEnableJson = JSON.parse(taskEnableJsonRaw)
        } catch (error) {
            var taskEnableJson = {}
        }
        const taskdirectory = fs.readdirSync(directory).filter( (thing) => {
            return(fs.statSync(`${directory}/${thing}`).isDirectory());
        })
        for (let task of taskdirectory) {
            const taskOptions = require(directory + task + "\\task.js")
            const taskEnabled = taskEnableJson["enabled"] && taskEnableJson["enabled"][taskOptions.options.name]? taskEnableJson["enabled"][taskOptions.options.name] : false
            taskOptions.options.enabled = taskEnabled
            cb(taskOptions)
        }
        return taskEnableJson
}
module.exports = {readTasks, getQRCodes}
//console.log(getQRCodes())