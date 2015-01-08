var MidiStream = require('midi-stream')
var Switcher = require('switch-stream')
var Stream = require('stream')

module.exports = PortStack

function PortStack(){

  var empty = new Stream()
  empty.write = function(){
    // evaporate!
  }

  empty.end = function noop(){}

  var portNames = null
  var stacks = {}
  var lookup = {}

  var queue = []
  var initialized = false

  // cache port names
  MidiStream.getPortNames(function(err, names){
    portNames = names || []
    initialized = true
    queue.forEach(function(args){
      getPort.apply(this, args)
    })
  })

  function getRawPort(name){
    return lookup[name] = lookup[name] || MidiStream(name)
  }

  function grab(){
    var port = this
    var stack = stacks[port.name] = stacks[port.name] || []
    var index = stack.indexOf(port)
    if (!stack.length || index < stack.length - 1){
      
      if (stack.length){
        stack[stack.length-1].set(empty)
      }

      if (~index){
        stack.splice(index, 1)
      }
      stack.push(port)

      port.set(getRawPort(port.name))
      port.emit('switch')
    }
  }

  function close(){
    var port = this
    var stack = stacks[port.name]

    if (stack && stack.length){
      var index = stack.indexOf(port)
      if (index === stack.length-1){
        stack.pop()
        if (stack.length){
          stack[stack.length-1].set(getRawPort(port.name))
          stack[stack.length-1].emit('switch')
        }
      }
    }

    port.set(empty)
    port.end()
  }

  function getPort(name, cb){
    if (~portNames.indexOf(name)){
      var port = Switcher(empty)
      port.name = name
      port.grab = grab
      port.close = close
      port.grab()
      cb(null, port)
    } else {
      cb(null, null)
    }
  }

  return function(name, cb){
    if (!initialized){
      queue.push([name, cb])
    } else {
      getPort(name, cb)
    }
  }

}