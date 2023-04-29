// @ts-check

const express = require('express')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { v1: uuidv1 } = require('uuid')

const runRouter = express.Router()

runRouter.post('/', (req, res) => {
  const image = req.body
  if (image.bytes) {
    const INSTANCE_ID = `p${uuidv1()}`
    const MODEL_PATH = path.resolve(__dirname, `../../model/UIED/run_single.py`)
    const INPUT_PATH = path.resolve(
      __dirname,
      `../../buffer/input/${INSTANCE_ID}.jpg`
    )
    const OUTPUT_PATH = path.resolve(
      __dirname,
      `../../buffer/output/${INSTANCE_ID}`
    )

    const imageBuf = Buffer.from(image.bytes)
    try {
      fs.writeFileSync(INPUT_PATH, imageBuf, 'binary')
    } catch (error) {
      req.log.info(error)
      res.status(500).send("Internal Server Error: Couldn't save the image.")
    }
    req.log.info(
      `${imageBuf.length} size (${image.width} X ${image.height}) file was saved.`
    )

    const modelProcess = spawn('python3', [MODEL_PATH, INPUT_PATH, OUTPUT_PATH])

    modelProcess.stdout.on('data', (result) => {
      res.status(200).json(result.toString())
    })

    modelProcess.stderr.on('data', (err) => {
      req.log.info(err.toString())
      res.status(500).send('Model crashed.')
    })
  } else {
    res.statusCode = 404
    res.send('No Image.')
  }
})

module.exports = runRouter
