var Stream = require('stream')

module.exports = normalize

function normalize(target){
  var stream = new Stream()
  stream.writable = true
  stream.readable = false

  target.on('data', function(data){
    if (data[0] >= 128 && data[0] < 128 + 16){
      // convert note off events to 0 velocity note on events
      data = [data[0]+16, data[1], 0]
    }
    stream.emit('data', data)
  })

  target.on('switch', stream.emit.bind(stream, 'switch'))
  target.on('end', stream.emit.bind(stream, 'end'))
  target.on('close', stream.emit.bind(stream, 'close'))

  stream.write = target.write.bind(target)
  return stream
}