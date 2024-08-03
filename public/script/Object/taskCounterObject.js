class taskCounterObject extends HTMLElement{
    constructor(id) {
        super()
        const baseElement = document.getElementById(id)
        if (!baseElement) throw "Wrongly entered id";
        this.currentTaskCount = 0
        this._baseElement = baseElement
        
        // return new Proxy(this, {
        //     get: (target, prop, receiver) => {
        //         if (prop in target) {
        //             return Reflect.get(target, prop, receiver);
        //         }
        //         return Reflect.get(target._element, prop, receiver);
        //     },
        //     set: (target, prop, value, receiver) => {
        //         if (prop in target) {
        //             return Reflect.set(target, prop, value, receiver);
        //         }
        //         return Reflect.set(target._element, prop, value, receiver);
        //     }
        // });
    }

    defineMaxTaskAmount(amount, timerCount, cb = null) {
        this.maxTask = amount
        this.timerCount = timerCount
        const progressBar = document.createElement("div")
        progressBar.id = "taskProgressBar"
        const baseHolder = document.createElement("div")
        this._timer = document.createElement("div")
        this.startTimer(cb)
        applyStyles(this._baseElement, {
            "backgroundColor": "#2c2d33",
            "width": "100%",
            "borderRadius": "10px",
            "border": "2px solid #3d3d45",
            "display": "flex",
            "alignItems": "center",
            "boxShadow": "-2px -2px 6px 2px #1e213b",
        });
        applyStyles(baseHolder, {
            "flexGrow":"1",
            "display": "flex"
        });
        applyStyles(this._timer, {
            "fontFamily": "Seven-Segment",
            "color": "#030f07",
            "fontSize": "7vh",
            "width": "120px",
            "height": "30px",
            "borderRadius": "10px",
            "border": "2px solid #3d3d45",
            "display": "flex",
            "justifyContent": "center",
            "alignItems": "center"
        });
        applyStyles(progressBar, {
            "height": "30px",
            "backgroundColor": "green",
            "width": "1%",
            "borderRadius": "10px",
            "transition": "0.5s width ease"
        });
        baseHolder.appendChild(progressBar)
        this._baseElement.appendChild(baseHolder)
        this._baseElement.appendChild(this._timer)
    }

    updateTaskCount(amount = 1) {
        this.currentTaskCount += amount
        document.getElementById("taskProgressBar").style.width = 
        `${this.currentTaskCount * 100/this.maxTask}%`
        if(this.currentTaskCount == this.maxTask) {
            this._timerCallback && this._timerCallback()
        }
    }
    stopTimer(){
        clearInterval(this._timerFunction)
    }
    startTimer(cb = null){
        if (cb) this._timerCallback = cb
        this._timerFunction = setInterval(() =>{
            if (this._timerCallback && this.timerCount === 0) {
                this._timerCallback()
                this.stopTimer()
            }
            this._timer.textContent = `
            ${Math.floor(this.timerCount/60)}:${makeTwoZeros(this.timerCount % 60)}
            `
            this.timerCount --
        }, 1000)
    }

    get classList() {
        return this._baseElement.classList
    }
}

function makeTwoZeros(num) {
    return Math.floor(num/10) ? num : "0" + num
}

function applyStyles(element, styles) {
    for (const property in styles) {
        if (styles.hasOwnProperty(property)) {
            element.style[property] = styles[property];
        }
    }
}
export default taskCounterObject
//Beta framework looking ass