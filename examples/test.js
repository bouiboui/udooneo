var neo = require("../udooneo");

neo.gpios.each(function (gpio) {
    console.log("GPIO " + gpio.num() + " value = " + gpio.val());
    gpio.watch(function () {
        console.log("GPIO " + gpio.num() + " new value = " + gpio.val());
    });
});

var gpio = new neo.GPIO(34).out();

var x = 0;
setInterval(function () {

    gpio.val(x++ % 2 ? neo.VALUE.LOW : neo.VALUE.HIGH);

}, 1000);