# Nexmosphere JavaScript SDK

This library implements Nexmosphere serial communication protocol and exposes it as a collection of easy to use classes.

## Requirements

Nexmosphere products communicate via UART and send/receive ASCII messages.

All the classes in this library expect an implementation of ISerialPort interface
that implements the low level communication with the Nexmosphere hardware.

A good option to implement the low level communication is to use [serialport](https://www.npmjs.com/package/serialport) module,
but you can implement however you like.

## Addressing

Nexmosphere X-Talk interface allows you to communicate with many sensors or actuators via a single interface.
It defines an addresing scheme that allows to reference a specific sensor/actuator.

The address is always a 3-digit number, for example 003 or 102.

**This library assumes that addresses are numbers, not strings, so 003 becomes 3, 040 becomes 40, etc.**

## Example usage

All the examples below assume you wrote your own implementation of ISerialPort interface.
In the examples it's returned by a function `createSerialPort()`.

### Button

Nexmosphere buttons controller can handle up to 4 buttons, and they're all referenced with the same address.
The controller numbers the buttons, starting from 1, so first button is no. 1, second button is no. 2, etc.

**Here we instead expect an index, starting from 0**, so first button is 0, second button is 1, etc.

```javascript
const serialPort = createSerialPort();
const address = 3; // this is equivalent to address 003
const index = 0; // button no. 1
const button = new Button(serialPort, address, index);

const isPressed = await button.isPressed();
if (isPressed) {
    console.log('button is pressed');
} else {
    console.log('button is not pressed');
}

button.on('pressed', () => console.log('button was pressed'));
button.on('released', () => console.log('button was released'));
```

### RFID Antenna

```javascript
const serialPort = createSerialPort();
const address = 50; // this is equivalent to address 050
const rfidAntenna = new RfidAntenna(serialPort, address);

const placedTags = await rfidAntenna.getPlacedTags();
console.log('placed tags: ' + placedTags.join(', '));

rfidAntenna.on('picked', (tag) => console.log(`tag ${tag} was picked`));
rfidAntenna.on('placed', (tag) => console.log(`tag ${tag} was placed`));
```
