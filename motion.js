var udooneo = require("./udooneo");

var motionSensors = [
    {sensor: udooneo.Accelerometer, name: "Accelerometer"},
    {sensor: udooneo.Magnetometer, name: "Magnetometer"},
    {sensor: udooneo.Gyroscope, name: "Gyroscope"}
];

motionSensors.forEach(function (item) {
    var sensor = item.sensor;
    sensor.enable(function () {
        sensor.getData(function (data) {
            console.log(item.name + " data: " + data);
            sensor.disable();
        });
    });
});