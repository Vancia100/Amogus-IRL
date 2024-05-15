const fs = require("fs")
const path = require("path")
const qrCode = require("qrcode")
const ejs = require("ejs")

class Task{
    constructor(inputName, type, source, file, ejsSettings = {}){

        this.name =  inputName.toLowerCase().replace(/ /g, "-")
        this._internals = {
            file,
            source,
            ejsSettings: ejsSettings
        }
        this.options = {
            "name":checkName(inputName),
            "type":checkType(type),
        }
        if(!fs.existsSync(`${__dirname}/../public/tasks/${this.name}`))   copyFiles(source, this.name, ejsSettings)
        if(!fs.existsSync(`${source}/task.json`)) {
            qrCode.toDataURL(this.name, {errorCorrectionLevel: "H"},).then(value =>{
                fs.writeFileSync(`${source}/task.json`, 
                JSON.stringify(value),)
                this.qrCode = value
            })
        }else{
            this.qrCode = JSON.parse(fs.readFileSync(`${source}/task.json`))
        }
    }
    async redoQR() {
        const qrData = await qrCode.toDataURL(this.name, {errorCorrectionLevel: "H"},)
        fs.writeFileSync(`${this._internals.source}/task.json`, 
        JSON.stringify(qrData))
        this.qrCode = qrData
        }
    
    redoPublic() {
        if(fs.existsSync(`${__dirname}/../public/tasks/${this.name}`))   removeEntireDirectory(`${__dirname}/../public/tasks/${this.name}`)

        copyFiles(this._internals.source, this.name, this._internals.ejsSettings)
    }
}


function copyFiles(source, thisName, ejsSettings){
    const pathToTask = `${__dirname}/../public/tasks/${thisName}`
    if (!fs.existsSync(`${__dirname}/../public/tasks/`)) fs.mkdirSync(`${__dirname}/../public/tasks`)
    if (!fs.existsSync(pathToTask))    fs.mkdirSync(pathToTask)
    console.log(ejsSettings, thisName)
    const tasksToCopy = fs.readdirSync(source).filter(item =>{
        if (fs.lstatSync(path.join(source, item)).isDirectory()) {
            copyFiles(path.join(source, item), path.join(thisName, item), ejsSettings)
            return false
        }
        return !(item == "task.js" || item == "task.json" )
    })
    tasksToCopy.forEach(item =>{
        if (item.endsWith(".html") | item.endsWith(".ejs")) {
            let htmlData = fs.readFileSync(path.join(source, item), "utf-8")

            if (item.endsWith(".ejs")) {
                try {
                    htmlData = ejs.render(htmlData, ejsSettings[item]) 
                } catch (error) {
                    console.log(ejsSettings, error)
                }
            }

            //chat GPT code, no clue how it works but it does
            const bodyContent = htmlData.substring(htmlData.indexOf('<body>') + 6, htmlData.indexOf('</body>'));

            const modifiedHTML = bodyContent.replace(/(src="|href=")([^"]+)/g, (match, p1, p2) => {
                // Add the taskName prefix to URLs
                return `${p1}/tasks/${thisName}/${p2}`;
            });

            fs.writeFile(path.join(pathToTask, item), modifiedHTML, "utf-8", err =>{
                if (err) console.log(err)
            })
            return
        }
        fs.cp(path.join(source, item), path.join(pathToTask, item), (err) =>{
            if (err) throw (err)
        })
    })
}


function checkName(nameCheck){
    const forbidden = ["pictures", "script", "styles", "tasks"]
    if (forbidden.indexOf(this.name) != -1) {
        throw new Error(`The taskname ${nameCheck} is not a valid name!`)
    }
    return nameCheck
}
function checkType(typeCheck){
    const newtype = typeCheck.toLowerCase()
    const allowed = ["short", "normal", "long"]
    if (allowed.indexOf(newtype) != -1) {
        return newtype;
    }else {
        throw new Error('The supled task type did not equal "normal", "short", or "long"!');
    }
}
function removeEntireDirectory(directory) {
    //console.log("removing direcrory", directory)
    const tasks = fs.readdirSync(directory).filter(item =>{
        if(fs.statSync(path.join(directory, item)).isDirectory()) {
            removeEntireDirectory(path.join(directory, item))
            return false
        }
        return true
    })
    tasks.forEach(item =>{
        fs.rmSync(path.join(directory, item))
    })
    fs.rmdirSync(directory)
}
module.exports = Task