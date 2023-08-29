const taskBlueprint = require("../taskobject.js")

const thisTask = new taskBlueprint("Sus Task", "Long",)

thisTask.code = () => {
    "do some code..."
}


thisTask.html = "read a html file and redirected it here (preferably with styles already included...) not required? still hava no clue how to structure the tasks"


module.exports = {...thisTask}