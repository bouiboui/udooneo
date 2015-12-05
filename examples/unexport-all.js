var neo = require("../udooneo");

neo.gpios.each(function (gpio) {
    gpio.unexport();
    console.log(gpio.num() + " unexported.");
});