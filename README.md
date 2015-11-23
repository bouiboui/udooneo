# udooneo

![](http://i.imgur.com/ef7aNZi.png)

## Introduction
This library makes it easy to control your UDOO Neo from node.

``var udooneo = require("./udooneo")`` and you have access to the GPIOs and motion sensors.

You can get started by running the test example: ``sudo node examples/test``

## GPIOs

### Get access to a GPIO
You can either get access to the GPIO from its Extended Pinout number (the white number on pink background in the illustration above) or from its real, internal number.

    # Most common case
    var gpio = new udooneo.GPIO().fromPin(pinNum);
    
    # For geeks only
    var gpio = new udooneo.GPIO(gpioNum);
    
### Read or change direction
Then you have to set the direction, either ``udooneo.DIRECTION.INPUT`` or ``udooneo.DIRECTION.OUTPUT``. Like most methods, ``setDirection(direction, callback)`` is asynchronous and takes a lambda function as a second parameter.

    gpio.setDirection(udooneo.DIRECTION.OUTPUT, function() {
    	console.log("The direction is set!");
    });
    
You can also get the current direction with ``getDirection(callback)``

    gpio.getDirection(function(direction) {
    	switch (direction) {
    		case udooneo.DIRECTION.INPUT:
    			console.log("Direction = input!");
    			break;
    		case udooneo.DIRECTION.OUTPUT:
    			console.log("Direction = output!");
    			break;
    	}
    });
    
### Read or change value
You can now either use ``gpio.getValue(callback)`` or ``gpio.setValue(value, callback)``

The ``callback`` function will be executed when the operation is done. In the case of ``getValue``, the first parameter of the callback function is fed the value of the GPIO.

    gpio.getValue(function(gpioValue) {
    	switch (gpioValue) {
    		case udooneo.VALUE.HIGH:
    			console.log("Value = High!");
    			break;
    		case udooneo.VALUE.LOW:
    			console.log("Value = Low!");
    			break;
    		default:
    			console.log("Value = " + gpioValue + "!");
    			break;
    	}
    });
    
    gpio.setValue(udooneo.VALUE.HIGH, function() {
    	console.log("The value is now high!");
    });
    
### Watch value changes
Another nice method to know and use is ``gpio.watchValue(callback)``. It works like an event listener, ``callback`` will be executed everytime the value of the GPIO changes, in real time.

    gpio.watchValue(function() {
    	gpio.getValue(function(gpioValue) {
    		console.log("The value has changed! The new value is " + gpioValue);
    	});
    });

###Realease the GPIO access when you're done
Though the access to the GPIO is abstracted by the library, it has to be undone manually by calling ``gpio.unexport(callback)`` when you're done with the GPIO. I don't know the implications of failing to do this, so I wouldn't risk it. Consider it a good practice. The callback parameter/function is not mandatory.

## Motion sensors

The 3 motion sensors (depending on your Neo version) are accessible via ``udooneo.Accelerometer``, ``udooneo.Magnetometer`` and ``udooneo.Gyroscope``.

### Enable or disable

This couldn't be more straightforward, just ``.enable(callback)`` or ``.disable(calback)`` the sensor. As usual, these methods are asynchronous and take an optional callback function as a parameter.

    udooneo.Accelerometer.enable();
    udooneo.Magnetometer.enable();
    udooneo.Gyroscope.enable(function() {
    	console.log("The Gyroscope is enabled!");
    	udooneo.Gyroscope.disable(function() {
    		console.log("The Gyroscope is disabled!");
    	});
    });
    
![](https://38.media.tumblr.com/tumblr_lkx3onuocM1qzvwy3.gif)

*I hope someone gets that joke.* 

### Get data

To get the current data for a motion sensor, use its ``.getData(callback)`` method.

    udooneo.Magnetometer.getData(function(data) {
    	console.log("Magnometer data: " + data);
    });
    
Due to the way the value is returned, there's no ``watchData(callback)`` method, you have to use a ``setInterval`` or ``setTimeout`` to know if the value of a motion sensor has changed (hint: it's changing constantly).

The data is returned in the form of a string, someting like: ``data = "1.0,1.0,1.0"``.
I decided to return this bluntly as a string and not to convert it to a special kind of object for the moment for performance purposes. It's up to you.


## License
MIT
