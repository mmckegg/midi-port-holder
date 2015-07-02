var nextTick = require('next-tick')
var Observ = require('observ')
var watch = require('observ/watch')
var Switcher = require('switch-stream')
var PortStack = require('./port-stack.js')
var Stream = require('stream')
var deepEqual = require('deep-equal')

var versionKey = 2
var cacheKey = "__MIDI_PORT_HOLDER_CACHE@" + versionKey
var getPort = document[cacheKey] = document[cacheKey] || PortStack()

module.exports = PortHolder

function PortHolder(options){
  var empty = new Stream()
  empty.write = function(){
    // evaporate!
  }

  function handleError(err){
    obs.stream.set(empty)
  }

  var obs = Observ()
  obs.stream = Switcher(empty)

  var lastValue = null
  var port = null

  obs.destroy = function(){
    if (port){
      if (port.grab) {
        port.close()
      } else {
        obs.stream.set(empty)
      }
    }
  }

  obs.grab = function(){
    if (port && port.grab){
      port.grab()
    }
  }

  function switchHandler(){
    obs.stream.emit('switch')
  }

  watch(obs, function(descriptor){
    if (descriptor !== lastValue){
      if (typeof descriptor === 'string'){
        nextTick(function(){
          getPort(descriptor, options, function(err, res){
            if (res){
              obs.stream.emit('switching')
              port = res
              obs.stream.set(port)
              obs.stream.emit('switch')
              port.on('switch', switchHandler)
            } else if (port) {
              obs.stream.emit('switching')
              port.removeListener('switch', switchHandler)
              obs.stream.set(empty)
              port = null
            }
          })
        })
      }
      lastValue = descriptor
    }
  })

  return obs
}