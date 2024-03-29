const express = require("express")
const router = express.Router() 
const fs = require("fs")
const bodyParser = require('body-parser');
const readTasks = require("../code_tools/read_all_files")

router.use(bodyParser.json())
const directory = (__dirname + "\\..\\tasks\\")
router.get("/", (req, res) => {
    res.render("host")
})

router.get("/get-options", (req, res) =>{

    try {
        //console.log(taskEnableJson)

        const {taskList, amounts, taskEnableJson} = readTasks(directory)
        const response = {
            "list": taskList,
            "max": {"short":amounts.short, "long": amounts.long, "normal": amounts.normal},
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
    const PDFKit = require('pdfkit')
    const doc = new PDFKit({autoFirstPage:false, size:"A4"})
    const {taskList, amounts, taskEnableJson} = readTasks(directory)
    const {readQr} = require("../code_tools/qrGenerator")

    //console.log(taskEnableJson.current)
    
    if (taskEnableJson.current.long >= 1 || taskEnableJson.current.short >= 1 || taskEnableJson.current.normal >= 1) {

    const QrCodes = readQr()
    taskList.filter(item => {
        return item.enabled
    }).forEach(item => {
        doc.addPage()
        doc.text(`This page will be the QR-Code to "${item.name}"`)
        doc.image(QrCodes[item.name], {width: 400, height: 400})
    })

    doc.pipe(res)
    doc.end()
    }else{
        //responde with invallid settings?
        //still tries to download, don't know what to do.
        doc.addPage()
        doc.text("Must have at least one task!")
        doc.pipe(res)
        doc.end()
        //res.status(400).json({error: "Must have at least one task!"})
    }

})

router.get("/game", (req, res) => {
    res.render("game")
})

module.exports = router