var fs = require("fs");
var path = require("path");

var FILE_PATHS = {
    GPIO_ROOT: "/sys/class/gpio",
    ACCELEROMETER_ROOT: "/sys/class/misc/FreescaleAccelerometer",
    MAGNETOMETER_ROOT: "/sys/class/misc/FreescaleMagnetometer",
    GYROSCOPE_ROOT: "/sys/class/misc/FreescaleGyroscope",
    EXPORT_FILE: "export",
    UNEXPORT_FILE: "unexport"
};
var Ref = {

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
        return Ref.gpios[pinNumber - 16];
    },
    isValid: function (gpioNumber) {
        return Ref.gpios.indexOf(gpioNumber) > -1;
    }

};

function GPIO(num) {
    if (num) return this.fromPin(num);
}

GPIO.prototype = {

    currentGpioNumber: null,
    currentGPIO: function () {
        if (!this.currentGpioNumber) throw new Error("Missing GPIO number.");
        return this.currentGpioNumber;
    },

    fromPin: function (num) {
        this.currentGpioNumber = Ref.fromPin(num);
        return this;
    },
    fromGpio: function (gpioNumber) {
        if (!Ref.isValid(gpioNumber)) throw new Error("GPIO number (" + gpioNumber + ") is out of range.");
        this.currentGpioNumber = gpioNumber;
        return this;
    },


    _paths: function () {
        var gpioPath = FILE_PATHS.GPIO_ROOT + path.sep + "gpio" + this.currentGPIO();
        return {
            value: gpioPath + path.sep + "value",
            direction: gpioPath + path.sep + "direction"
        }
    },

    _export: function (yes) {
        var currentNum = this.currentGPIO().toString();
        var rootPath = FILE_PATHS.GPIO_ROOT + path.sep;

        var gpioFileExists = File.exists(rootPath + "gpio" + currentNum);
        
        if (yes && gpioFileExists) return; // Already exported
        if (!yes && !gpioFileExists) return; // Already unexported

        File.write(currentNum, rootPath + (yes ? FILE_PATHS.EXPORT_FILE : FILE_PATHS.UNEXPORT_FILE));

    },
    export: function () {
        this._export(true);
    },
    unexport: function () {
        this._export(false);
    },

    setDirection: function (direction) {
        if ([Ref.DIRECTION.INPUT, Ref.DIRECTION.OUTPUT].indexOf(direction) < 0) throw new Error("Invalid direction.");
        this.export();
        File.write(direction, this._paths().direction);
        return this;
    },
    setValue: function (value) {
        this.export();
        File.write(value.toString(), this._paths().value);
        return this;
    },
    getDirection: function () {
        this.export();
        return File.read(this._paths().direction);
    },
    getValue: function () {
        this.export();
        return File.read(this._paths().value);
    },
    watchValue: function (callback) {
        this.export();
        File.watch(this._paths().value, function () {
            callback();
        });
    },

    // Shorthands
    in: function () {
        return this.setDirection(Ref.DIRECTION.INPUT);
    },
    out: function () {
        return this.setDirection(Ref.DIRECTION.OUTPUT);
    },
    dir: function (d) {
        if (!d) return this.getDirection();
        this.setDirection(d);
    },
    val: function (v) {
        if (!v) return this.getValue();
        this.setValue(v);
    },
    num: function () {
        return this.currentGPIO();
    },
    watch: function (cb) {
        this.watchValue(cb);
    }
};

function MotionSensor(path) {
    this.path = path;
}
MotionSensor.prototype = {
    _enable: function (y) {
        File.write((y ? 1 : 0).toString(),
            this.path + path.sep + (y ? "enable" : "disable")
        );
    },
    enable: function () {
        this._enable(true);
        return this;
    },
    disable: function () {
        this._enable(false);
        return this;
    },
    getData: function () {
        return File.readSync(this.path + path.sep + "data");
    },

    // Shorthands
    on: function () {
        return this.enable();
    },
    off: function () {
        return this.disable();
    },
    data: function () {
        return this.getData();
    }
};

var File = {
    exists: function (path) {
        try {
            fs.accessSync(path);
            return true;
        } catch (e) {
            return false;
        }
    },
    read: function (filePath) {
        return fs.readFileSync(filePath, "utf-8");
    },
    watch: function (filePath, callback) {
        fs.watch(filePath, function (event) {
            if ("change" === event) callback();
        });
    },
    write: function (data, filePath) {
        try {
            var fd = fs.openSync(filePath, "w", function (err) {
                if (err) {
                    console.log("Could not write " + data + " in " + filePath);
                    throw err;
                }
            });
            return fs.writeSync(fd, data, "utf-8");
        } catch (err) {
            if ("EBUSY" === err.errno) {
                return this.write(data, filePath);
            }
        }
    }
};

module.exports = {
    GPIO: GPIO,

    DIRECTION: Ref.DIRECTION,
    VALUE: Ref.VALUE,

    gpioNumbers: Ref.gpios,
    gpios: {
        each: function (callback) {
            var num = Ref.gpios;
            while (num--) callback(new GPIO.fromGpio(num));
        }
    },
    sensors: {
        Accelerometer: new MotionSensor(FILE_PATHS.ACCELEROMETER_ROOT),
        Magnetometer: new MotionSensor(FILE_PATHS.MAGNETOMETER_ROOT),
        Gyroscope: new MotionSensor(FILE_PATHS.GYROSCOPE_ROOT)
    }
};