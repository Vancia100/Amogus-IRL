const taskBlueprint = require("../taskobject.js")
const thisTask = new taskBlueprint("Sus Task", "normal", __dirname, "/taskfiles/index.html")

//console.log(thisTask.source)
module.exports = thisTask