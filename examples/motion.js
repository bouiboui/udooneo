var udooneo = require("./udooneo");

udooneo.Accelerometer.enable();
udooneo.Magnetometer.enable();
udooneo.Gyroscope.enable();

var values = {
    Accelerometer: "",
    Magnetometer: "",
    Gyroscope: ""
};

setTimeout(function () {

    var int = setInterval(function () {

        udooneo.Accelerometer.getData(function (data) {
            values.Accelerometer = data;
        });
        udooneo.Magnetometer.getData(function (data) {
            values.Magnetometer = data;
        });
        udooneo.Gyroscope.getData(function (data) {
            values.Gyroscope = data;
        });

        process.stdout.write('\033c');
        console.log([
            "Accelerometer: " + values.Accelerometer,
            "Magnetometer: " + values.Magnetometer,
            "Gyroscope: " + values.Gyroscope,
        ].join("\r\n"));

    }, 100);

    setTimeout(function () {
        clearInterval(int);
        udooneo.Accelerometer.disable();
        udooneo.Magnetometer.disable();
        udooneo.Gyroscope.disable();
    }, 10000);

}, 500);