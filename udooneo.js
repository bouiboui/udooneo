var fs = require("fs");
var path = require("path");

var FILE_PATHS = {
    ROOT: "/sys/class/gpio",
    EXPORT_FILE: "export"
};
var GPIOReference = {

    gpios: [
        106, 107, 180, 181, 172, 173, 182, 124,
        25, 22, 14, 15, 16, 17, 18, 19,
        20, 21, 203, 202, 177, 176, 175, 174,
        119, 124, 127, 116, 7, 6, 5, 4
    ],

    DIRECTION: {
        INPUT: "in",
        OUTPUT: "out"
    },
    VALUE: {
        HIGH: "1",
        LOW: "0"
    },

    fromPin: function (pinNumber) {
        if (16 > pinNumber || pinNumber > 47) throw new Error("Invalid pin number.");
        return GPIOReference.gpios[pinNumber - 16];
    },
    isValid: function (gpioNumber) {
        return GPIOReference.gpios.indexOf(gpioNumber) > -1;
    }

};

function GPIO(num) {
    if (num) {
        this.fromGpio(num);
    }
}

GPIO.prototype = {

    currentGpioNumber: null,
    currentGPIO: function () {
        if (!this.currentGpioNumber) throw new Error("Missing GPIO number.");
        return this.currentGpioNumber;
    },

    fromPin: function (num) {
        this.currentGpioNumber = GPIOReference.fromPin(num);
        return this;
    },
    fromGpio: function (gpioNumber) {
        if (!GPIOReference.isValid(gpioNumber)) throw new Error("GPIO number (" + gpioNumber + ") is out of range.");
        this.currentGpioNumber = gpioNumber;
        return this;
    },

    export: function (callback) {
        var currentNum = this.currentGPIO();
        var exportFilePath = FILE_PATHS.ROOT + path.sep + FILE_PATHS.EXPORT_FILE;
        File.write(currentNum.toString(), exportFilePath, function () {
            if (callback) callback();
        }, "w");
    },
    setDirection: function (direction, callback) {
        if ([GPIOReference.DIRECTION.INPUT, GPIOReference.DIRECTION.OUTPUT].indexOf(direction) < 0) throw new Error("Invalid direction.");
        var currentGPIO = this.currentGPIO();
        this.export(function () {
            File.createDir(FILE_PATHS.ROOT + path.sep + "gpio" + currentGPIO, function () {
                var directionPath = FILE_PATHS.ROOT + path.sep + "gpio" + currentGPIO + path.sep + "direction";
                File.write(direction, directionPath, function () {
                    if (callback) callback();
                });
            });
        });
    },
    getDirection: function (callback) {
        var currentNum = this.currentGPIO();
        this.export(function () {
            var directionPath = FILE_PATHS.ROOT + path.sep + "gpio" + currentNum + path.sep + "direction";
            File.read(directionPath, function (data) {
                callback(data);
            });
        });
    },
    setValue: function (value, callback) {
        if ([GPIOReference.VALUE.HIGH, GPIOReference.VALUE.LOW].indexOf(value) < 0) throw new Error("Invalid value.");
        var currentNum = this.currentGPIO();
        this.export(function () {
            File.createDir(FILE_PATHS.ROOT + path.sep + "gpio" + currentNum, function () {
                var valuePath = FILE_PATHS.ROOT + path.sep + "gpio" + currentNum + path.sep + "value";
                File.write(value, valuePath, function () {
                    if (callback) callback();
                });
            });
        });
    },
    getValue: function (callback) {
        var currentNum = this.currentGPIO();
        var valuePath = FILE_PATHS.ROOT + path.sep + "gpio" + currentNum + path.sep + "value";
        this.export(function () {
            File.read(valuePath, function (data) {
                callback(data);
            });
        });
    },
    watchValue: function (callback) {
        var currentNum = this.currentGPIO();
        var valuePath = FILE_PATHS.ROOT + path.sep + "gpio" + currentNum + path.sep + "value";
        File.exists(valuePath,
            function () {
                File.watch(valuePath, function () {
                    callback();
                });
            },
            function () {
                console.log(currentNum + " value unreachable.");
            }
        )

    }
};

var File = {
    createDir: function (path, callback) {
        fs.mkdir(path, function () {
            callback();
        })
    },
    exists: function (path, success, failure) {
        fs.access(path, function (err) {
            if (!err) success(); else failure();
        });
    },
    read: function (filename, callback) {
        fs.readFile(filename, "utf-8", function (err, data) {
            if (err) throw err;
            callback(data);
        });
    },
    watch: function (filename, callback) {
        fs.watch(filename, function (event, filename) {
            if ("change" === event) callback();
        });
    },
    write: function (data, filePath, callback, mode) {
        if (!mode) mode = "w";
        fs.open(filePath, mode, function (err, fd) {
            if (err) {
                console.log("Could not write " + data + " in " + filePath + " | " + mode);
                throw err;
            }
            fs.write(fd, data, "utf-8", function (err) {
                if (err) throw err;
                callback();
            });
        });
    }
};

module.exports = {
    gpios: GPIOReference.gpios,
    DIRECTION: GPIOReference.DIRECTION,
    VALUE: GPIOReference.VALUE,
    GPIO: GPIO
};
