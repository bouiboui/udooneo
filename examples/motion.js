var sensors = require("../udooneo").sensors;

var acc = sensors.Accelerometer.enable();
var mag = sensors.Magnetometer.enable();
var gyr = sensors.Gyroscope.enable();

var int = setInterval(function () {

    // Write values
    process.stdout.write('\033c');
    console.log([

        "Accelerometer: " + acc.data(),
        "Magnetometer: " + mag.data(),
        "Gyroscope: " + gyr.data()

    ].join("\r\n"));

}, 100);

// Disable to preserve battery
setTimeout(function () {
    clearInterval(int);

    acc.disable();
    mag.disable();
    gyr.disable();

}, 10000);