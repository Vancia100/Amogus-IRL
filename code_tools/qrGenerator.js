const fs = require("fs")
const readTasks = require("./read_all_files")
const directory = (__dirname + "/../tasks/qr-codes.json")
const directoryTasks = (__dirname + "\\..\\tasks\\")
const qrCode = require("qrcode")
const { url } = require("inspector")

function readValues() {

}

async function generateNew () {
    const {taskList} = readTasks(directoryTasks)
    const jsonData = readQrSettings()
    var newTasksQr = {}
    for (const task of taskList) {
        if (jsonData[task.name]) {
            continue
        }
        const url = await qrCode.toDataURL(`/${task.name}`, {errorCorrectionLevel: "H"},)
        newTasksQr[task.name] = url
    }
    readQrSettings ({...newTasksQr, ...jsonData})
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
            //make callback to be able to handle async in future?
            console.log(error)
            return {}
        }
    }
}

module.exports = {readValues, generateNew}

generator.generateNew()