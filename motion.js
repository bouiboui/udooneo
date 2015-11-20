var udooneo = require("./udooneo");

udooneo.Accelerometer.enable();
udooneo.Magnetometer.enable();
udooneo.Gyroscope.enable();

var values = [{}, {}, {}];

setTimeout(function () {

    var int = setInterval(function () {

        udooneo.Accelerometer.getData(function (data) {
            values[0] = data;
        });
        udooneo.Magnetometer.getData(function (data) {
            values[1] = data;
        });
        udooneo.Gyroscope.getData(function (data) {
            values[2] = data;
        });

        process.stdout.write('\033c');
        console.log(values);

    }, 100);

    setTimeout(function () {
        clearInterval(int);
        udooneo.Accelerometer.disable();
        udooneo.Magnetometer.disable();
        udooneo.Gyroscope.disable();
    }, 5000);

}, 1000);




