var MidiStream = require('midi-stream')
var Observ = require('observ')

module.exports = ObservAvailableMidiPorts
function ObservAvailableMidiPorts(){
  var obs = Observ([])
  // TODO: update on available ports change
  // can use new onConnect web-midi api when becomes available (and polling under node?)
  MidiStream.getPortNames(function(err, names){
    if (names){
      obs.set(names.sort())
    }
  })
  return obs
}