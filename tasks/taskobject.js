
class Task{
    constructor(name, type, instance = 1){
        this.options = {
            "name":name,
            "parts":instance,
            "type":checkType(type),
        }
    }
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