var udooneo = require("../udooneo");

udooneo.gpioNumbers.forEach(function (gpioNum) {
    var gpio = new udooneo.GPIO(gpioNum);
    gpio.unexport(function () {
        console.log("GPIO " + gpioNum + " unexported.");
    });
});