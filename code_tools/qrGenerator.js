const fs = require("fs")
const readTasks = require("./read_all_files")
const directory = (__dirname + "/../tasks/qr-codes.json")
const qrCode = require("qrcode")
const { name } = require("ejs")


async function generateNew (redo = false) {
    const {taskList} = readTasks()
    const jsonData = readQrSettings()
    var newTasksQr = {}
    for (const task of taskList) {
        if (jsonData[task.name] && !redo) {
            continue
        }
        const url = await qrCode.toDataURL(`/${String(task.name).replaceAll(" ", "-")}`, {errorCorrectionLevel: "H"},)
        newTasksQr[task.name] = url
    }
    wrightTasks =!redo ? {...newTasksQr, ...jsonData} : newTasksQr
    //console.log(wrightTasks)
    readQrSettings (wrightTasks)
    }

function readQrSettings (wright = null) {
    if (wright) {
        try {
            fs.writeFileSync(directory, JSON.stringify(wright, null, 2), {flag:"w+"})
        } catch (error) {
            console.log(error)
        }
    }else{
        try {
        const jsonData = JSON.parse(fs.readFileSync(directory))
        return jsonData
        } catch (error) {
            console.log(error)
            return {}
        }
    }
}

function readQr (){
    //make more fancy? Perhaps a request for the specific tasks to use less memory?
    //reload atomaticly when information doesn't have the right data?
    const data = JSON.parse(fs.readFileSync(directory))
    //console.log(data)
    return data
}

module.exports = {generateNew, readQr}

generateNew()