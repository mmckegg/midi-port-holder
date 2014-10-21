midi-port-holder
===

Bind to midi port by name and expose switchable duplex stream.

When running in Node, uses [midi-stream](https://github.com/mmckegg/midi-stream) and when running in browser (via browserify) uses [web-midi](https://github.com/mmckegg/web-midi).

Follows the [observ](https://github.com/raynos/observ) pattern.

## Install via [npm](https://npmjs.org/package/midi-port-holder)

```js
$ npm install midi-port-holder
```

## API

```js
var PortHolder = require('midi-port-holder')
```

### var portHolder = PortHolder()

Returns an extended observ instance.

### portHolder.set(portName)

Switch `portHolder.stream` to observe chosen `portName`

### portHolder()

Returns the name of the current port.

### portHolder(func(val))

`func` is called with the new `portName` any time it is changed.

### portHolder.stream

A duplex stream that is connected to the midi port specified by `set`. If the specified port doesn't exist, written data is thrown away.

Emits `'switch'` whenever the port is changed, and also `'connect'` if the port exists.

### portHolder.destroy

Disconnect from current midi port.

## Computed Port Names helper

```js
var computedPortNames = require('midi-port-holder/computed-port-names')
var watch = require('observ/watch')
watch(computedPortNames, function(names){
  console.log(names)
})
```

## Example

```
var PortHolder = require('midi-port-holder')
var portHolder = PortHolder()
var duplexStream = portHolder.stream

duplexStream.on('switch', function(){
  duplexStream.write([176,0,0]) // turn off all lights on switch
})

portHolder.set('Launchpad Mini')
duplexStream.write([144,0,127]) // turn on light at [0,0]

portHolder.set('Launchpad Mini 2') // this will trigger 'switch' event on stream



``` 