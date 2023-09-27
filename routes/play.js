const express = require("express")
const router = express.Router() 

router.get("/", (req, res) => {
    res.render("play")
})

router.get('//:id', function(req , res){
    const loadFiles = require("../code_tools/read_all_files")
    const {taskList} = loadFiles()
    if (taskList.forEach(item => {
        return item.options.name == (String(req.params.id).replaceAll("-", " "))
    })) {
        console.log("That task exists.")
    }
  });

module.exports = router