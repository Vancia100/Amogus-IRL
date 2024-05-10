const readFiles = require("./read_all_files")

const {taskList} = readFiles()


for (item in taskList) {
    try {
        taskList[item].redoQR() 
    } catch (error) {
        console.error(`could not redo QR for ${item}`)
    }
}