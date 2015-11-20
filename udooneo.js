var fs = require("fs");
var path = require("path");

var FILE_PATHS = {
    ROOT: "/sys/class/gpio",
    EXPORT_FILE: "export",
    UNEXPORT_FILE: "unexport"
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
        File.exists(FILE_PATHS.ROOT + path.sep + "gpio" + currentNum,
            function () {
                // already exported, do nothing
            },
            function () {
                File.write(currentNum.toString(), exportFilePath, function () {
                    if (callback) callback();
                }, "w");
            }
        );

    },
    unexport: function (callback) {
        var currentNum = this.currentGPIO();
        var exportFilePath = FILE_PATHS.ROOT + path.sep + FILE_PATHS.UNEXPORT_FILE;
        File.exists(FILE_PATHS.ROOT + path.sep + "gpio" + currentNum,
            function () {
                File.write(currentNum.toString(), exportFilePath, function () {
                    if (callback) callback();
                }, "w");
            },
            function () {
                // already unexported, do nothing
            }
        );
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
        var instance = this;
        File.exists(valuePath,
            function () {
                File.watch(valuePath, function () {
                    callback();
                });
            },
            function () {
                instance.export(function () {
                    File.watch(valuePath, function () {
                        callback();
                    });
                });
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
        console.log("trying to write " + data + " in " + filePath);
        if (!mode) mode = "w";
        try {
            var fd = fs.openSync(filePath, mode, function (err) {
                if (err) {
                    console.log("Could not write " + data + " in " + filePath + " | " + mode);
                    throw err;
                }
            });
            fs.writeSync(fd, data, "utf-8");
        } catch (err) {
            if ("EBUSY" === err.errno) {
                this.write(data, filePath, callback, mode);
            }
        }
        callback();
    }
};

module.exports = {
    gpios: GPIOReference.gpios,
    DIRECTION: GPIOReference.DIRECTION,
    VALUE: GPIOReference.VALUE,
    GPIO: GPIO
};
