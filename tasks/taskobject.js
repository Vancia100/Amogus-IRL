const fs = require("fs")
const path = require("path")
const qrCode = require("qrcode")
class Task{
    constructor(inputName, type, source, file,){

        this.name =  inputName.toLowerCase().replace(/ /g, "-")
        this.file = file
        this.source = source
        this.options = {
            "name":checkName(inputName),
            "type":checkType(type),
        }
        if(!fs.existsSync(`${__dirname}/../public/tasks/${this.name}`))   copyFiles(source, this.name)
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
        fs.writeFileSync(`${this.source}/task.json`, 
        JSON.stringify(qrData))
        this.qrCode = qrData
        }
}


function copyFiles(source, thisName){
    const pathToTask = `${__dirname}/../public/tasks/${thisName}`
    if (!fs.existsSync(`${__dirname}/../public/tasks/`)) fs.mkdirSync(`${__dirname}/../public/tasks`)
    if (!fs.existsSync(pathToTask)) fs.mkdirSync(pathToTask)
    
    const tasksToCopy = fs.readdirSync(source).filter(item =>{
        if (fs.lstatSync(path.join(source, item)).isDirectory()) {

            copyFiles(path.join(source, item), path.join(thisName, item))
            return false
        }
        return !(item == "task.js" || item == "task.json" )
    })
    tasksToCopy.forEach(item =>{
        if (item.endsWith(".html")) {
            htmlData = fs.readFileSync(path.join(source, item), "utf-8")
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
module.exports = Task