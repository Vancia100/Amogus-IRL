
class Task{
    constructor(name, type, instance = 1){
        this.options = {
            "name":name,
            "parts":instance,
            "type":type,
        }
    }
}

module.exports = Task