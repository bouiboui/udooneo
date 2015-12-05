var neo = require("../udooneo");

var gpio = new neo.GPIO(37).out();

var x = 0;
setInterval(function () {
    gpio.val(x++ % 2 ? neo.VALUE.LOW : neo.VALUE.HIGH);
}, 1000);