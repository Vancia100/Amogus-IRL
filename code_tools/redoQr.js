const {getQRCodes} = require("./read_all_files")

const {taskList} = getQRCodes(true)


for (item in taskList) {
    try {
        taskList[item].redoQR() 
        console.log("redid", item)
    } catch (error) {
        console.error(`could not redo QR for ${item}`)
    }
}