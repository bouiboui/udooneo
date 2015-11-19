var udooneo = require("./udooneo");

udooneo.gpios.forEach(function (gpioNum) {
    var gpio = new udooneo.GPIO(gpioNum);
    console.log("Watching GPIO " + gpioNum);
    gpio.watchValue(function () {
        console.log("GPIO " + gpioNum + " change");
        gpio.getValue(function (value) {
            console.log("GPIO " + gpioNum + " new value: " + value);
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