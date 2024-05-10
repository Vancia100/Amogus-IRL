const fs = require("fs")

function readTasks(directory = __dirname + "\\..\\tasks\\") {
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
    let taskList = {} //Could just do thease to const
    let long = []
    let short = []
    let normal = []

    for (let task of taskdirectory) {
        const taskDir = fs.readdirSync(directory + task).filter((thing) => thing.endsWith("task.js"))[0]
        const {...taskOptions} = require(directory + task + "\\" + taskDir)
        const options = taskOptions.options
        const taskEnabled = taskEnableJson["enabled"] && taskEnableJson["enabled"][options.name]? taskEnableJson["enabled"][options.name] : false
        if (taskList[options.name]) throw new Error(`All tasks need a unique name! \nThere are currently 2 tasks named ${options.name}`)
            const requiredTaskObject = require(directory + task + "\\" + taskDir)
            requiredTaskObject.enabled = taskEnabled
            taskList[options.name] = requiredTaskObject

        switch (options.type) {
            case "long":
                long.push({"enabled":taskEnabled, ...options})
                break;
            case "short":
                short.push({"enabled":taskEnabled, ...options})
                break;
            case "normal":
                normal.push({"enabled":taskEnabled, ...options})
                break
            default:
                break;
        }
    }
    const amounts = {
        short,
        normal,
        long,
    }
    return {taskList, amounts, taskEnableJson}
}
module.exports = readTasks
//console.log(readTasks())