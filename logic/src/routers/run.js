// @ts-check

const express = require('express')
const fs = require('fs')

const runRouter = express.Router()

runRouter.post('/', (req, res) => {
  const image = req.body
  if (image.imageData) {
    console.log(image.size)
    const data = Buffer.from(image.imageData)
    fs.writeFileSync(`../../image/image.png`, data, 'binary')
    res.statusCode = 200
    res.send('Now connect the model.')
  } else {
    res.statusCode = 404
    res.send('No Image.')
  }
})

module.exports = runRouter
