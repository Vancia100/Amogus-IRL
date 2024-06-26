const express = require("express")
const router = express.Router() 
const fs = require("fs")
const bodyParser = require('body-parser');
const readTasks = require("../code_tools/read_all_files")
const directory = (__dirname + "\\..\\tasks\\")


router.use(bodyParser.json())

router.get("/", (req, res) => {
    const {taskList, amounts, taskEnableJson} = readTasks(directory)
    res.render("host", {taskList, amounts, taskEnableJson})
})


router.get("/get-options", (req, res) =>{
    const {taskList, amounts, taskEnableJson} = readTasks(directory)
    try {
        //console.log(taskEnableJson)

        const response = {
            "list": amounts,
            "lookup":taskList,
            "max": {"short":amounts.short.length, "long": amounts.long.length, "normal": amounts.normal.length},
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
    fs.writeFileSync(directory + "taskSettings.json", JSON.stringify(settings, null, 4), { flag: 'w+', encoding: "utf-8" }, err => {
        if (err) console.error(err)
        return res.status(500).json({error: "Failed to save settings to file"})
    });
    
    res.json({message: "Settings saved"})
})

router.get("/get-QR", (req, res) => {
    const {taskEnableJson, taskList} = readTasks(directory)
    const PDFKit = require('pdfkit')
    const doc = new PDFKit({autoFirstPage:false, size:"A4"})
    const {readQr} = require("../code_tools/qrGenerator")
    
    if (taskEnableJson.current.long + taskEnableJson.current.short + taskEnableJson.current.normal) {
    const QrCodes = readQr()
    for (item in taskList) {
        if (!taskEnableJson["enabled"][item]) {
            console.log("continuing", item)
            continue
        }

        doc.addPage()
        doc.text(`This page will be the QR-Code to "${item}"`)
        doc.image(QrCodes[item], {width: 400, height: 400})
    }

    doc.pipe(res)
    doc.end()
    }else{
        doc.addPage()
        doc.text("Must have at least one task!")
        doc.pipe(res)
        doc.end()
    }
})

router.get("/game", (req, res) => {
    res.render("game")
})

module.exports = router