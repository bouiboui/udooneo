var udooneo = require("./udooneo");

udooneo.gpios.forEach(function (gpioNum) {
    var gpio = new udooneo.GPIO(gpioNum);
    gpio.getValue(function (value) {
        console.log("GPIO " + gpioNum + " current value: " + value);
    });
    gpio.watchValue(function () {
        gpio.getValue(function (value) {
            console.log("GPIO " + gpioNum + " change - new value: " + value);
        });
    });
});

var x = 0;
var targetGpio = new udooneo.GPIO().fromPin(34);
targetGpio.setDirection(udooneo.DIRECTION.OUTPUT, function () {
    var int = setInterval(function () {
        if (x > 4) clearInterval(int);
        targetGpio.setValue(x++ % 2 ? udooneo.VALUE.LOW : udooneo.VALUE.HIGH);
    }, 2000);
});

process.stdin.resume();//so the program will not close instantly

function exitHandler() {
    udooneo.gpios.forEach(function (gpioNum) {
        var gpio = new udooneo.GPIO(gpioNum);
        gpio.unexport(function () {
            console.log("GPIO " + gpioNum + " unexported.");
        });
    });
}

//do something when app is closing
process.on('exit', function () {
    exitHandler();
});

//catches ctrl+c event
process.on('SIGINT', function () {
    exitHandler();
});