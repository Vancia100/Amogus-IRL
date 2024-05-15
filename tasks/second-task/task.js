const Task = require("../taskobject.js")

//Can do whatever fetch API you want to get this
const ejsSettings = {"index.ejs": {name: "Not as sus task"}} 
/**
 * Structure:
 * {
 *  FileName: {
 *      Settings:atribute
 *      }
 * }
 */

ThisTask = new Task("Not as sus task", 
"short",
 __dirname, 
 "/taskfiles/index.ejs", 
 ejsSettings)

module.exports = ThisTask
