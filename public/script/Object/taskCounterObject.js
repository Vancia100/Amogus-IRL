class taskCounterObject extends HTMLElement{
    constructor(id) {
        super()
        const element = document.getElementById(id)
        if (!element) throw "Wrongly entered id";
        Object.assign(this, element)
        this._maxTask = null
    }
    defineMaxTaskAmount(amount) {
        this._maxTask = amount
    }
    updateTaskCount() {
        //Updates task Count
    }
}

export default taskCounterObject