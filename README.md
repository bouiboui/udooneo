# udooneo

![](http://i.imgur.com/ef7aNZi.png)

**Disclaimer**
This code has never been tested on an actual UDOO Neo, it was developed only from specs and on a local development environment, so run it with caution.

## Getting started
To get started, let's review the [test.js](https://github.com/bouiboui/udooneo/blob/master/test.js) source code.

To try it, clone the repo locally, open a terminal and type ``node test``.

First we require the *udooneo* library:

	var udooneo = require("./udooneo");
	
**The first part of the code will allow us to listen to all the GPIOs of the UDOO Neo, and to display the new value in the terminal everytime there is a change.**

``udoneo.gpios`` is an array which contains all the GPIO numbers available on the UDOO Neo (``[106,107,180,...]``). By looping on it we can access all the GPIOs at once.
	
	udooneo.gpios.forEach(function (gpioNum) {
	
We instantiate a new ``udooneo.GPIO`` object to manipulate it.
	
    	var gpio = new udooneo.GPIO(gpioNum);
    	
The ``watchValue`` function allows us to react to value changes on the GPIO, by passing a callback as a parameter.

    	gpio.watchValue(function () {
    	
``getValue`` is pretty straightforward. The value of the GPIO will be automatically passed as the first argument of the callback.

        	gpio.getValue(function (value) {

**The second part of the code will change the value of the pin 34 (A5) to LOW or HIGH every 2 seconds about 4 times.**
	
``udooneo.GPIO`` has a helper method ``fromPin`` so you don't have to know the corresponding GPIO number.

	var targetGpio = new udooneo.GPIO().fromPin(34);

Setting the direction is very simple, ``setDirectio``n has two parameters, the direction and a callback. The direction can be either ``udooneo.DIRECTION.INPUT`` or ``udooneo.DIRECTION.OUTPUT``.

	targetGpio.setDirection(udooneo.DIRECTION.OUTPUT, function () {
	
To set a GPIO value, just use the ``setValue`` function. The parameter must be either ``udooneo.VALUE.HIGH`` or ``udooneo.VALUE.LOW``.

        	targetGpio.setValue(x++ % 2 ? udooneo.VALUE.LOW : udooneo.VALUE.HIGH);
        	
## License
MIT
