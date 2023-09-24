const fs = require("fs")

function readTasks(directory) {
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
        taskList.push({"enabled":taskEnabled, ...options}) 
    }
    const amounts = {
        "long": long,
        "short": short,
        "normal": normal
    }
    return {taskList, amounts, taskEnableJson}
}

module.exports = readTasks