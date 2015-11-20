var udooneo = require("./udooneo");

udooneo.gpios.forEach(function (gpioNum) {
    var gpio = new udooneo.GPIO(gpioNum);
    gpio.unexport(function () {
        console.log("GPIO " + gpioNum + " unexported.");
    });
});