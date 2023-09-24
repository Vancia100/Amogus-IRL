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
        console.log(taskList)
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
    console.log(taskEnableJson.current)
    
    if (taskEnableJson.current.long >= 1 || taskEnableJson.current.short >= 1 || taskEnableJson.current.normal >= 1) {
    
    let longTask = []
    let shortTask = []
    let normalTask = []
    taskList.filter(item => {
        return item.enabled
    }).forEach(item => {
        switch (item.type){
            case ("normal"):
                normalTask.push(item)
                break
            case ("short"):
                shortTask.push(item)
                break
            case ("long"):
                longTask.push(item)
        }
    })


    randomTask(taskEnableJson.current.long, longTask)
    randomTask(taskEnableJson.current.short, shortTask)
    randomTask(taskEnableJson.current.normal ,normalTask)

    async function randomTask(amount, tasks) {
        for (let i = 0; i < amount; i++) {
            //console.log(`iteration number ${i} of ${amount}`, tasks.length)
            if (tasks.length == 0) {
                break
            }
            const index = Math.floor(Math.random() * tasks.length)
            const task = tasks[index]
            tasks.splice(index, 1)
            doc.addPage()
            doc.text(`This page will be the QR-Code to "${task.name}"`)



            doc.image(somethingQR, 50, 50, { width: 200, height: 200 })
        }
    }

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