// @ts-check

const express = require('express')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { v1: uuidv1 } = require('uuid')
const { getUsersCollection } = require('../mongo')

const runRouter = express.Router()

runRouter.use('/', async (req, res, next) => {
  const { apiKey } = req.body

  const users = await getUsersCollection()
  if (!users) {
    res.statusCode = 404
    res.send('MongoDB connection failed.')
  }

  const updateResult = await users.findOneAndUpdate(
    { apiKey },
    { $inc: { runCount: 1 } }
  )

  const updatedDocument = updateResult.value
  if (!updatedDocument) {
    res.statusCode = 404
    res.send('No user matches to the API Key.')
  } else if (!updatedDocument.runCount) {
    updatedDocument.runCount = 1
  }

  next()
})

runRouter.post('/', (req, res) => {
  const { width, height, bytes } = req.body

  if (!bytes) {
    res.statusCode = 404
    res.send('No Image.')
  } else {
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
    const imageBuf = Buffer.from(bytes)

    try {
      fs.writeFileSync(INPUT_PATH, imageBuf, 'binary')
    } catch (error) {
      req.log.info(error)
      res.status(500).send("Internal Server Error: Couldn't save the image.")
      res.end()
    }
    req.log.info(
      `${imageBuf.length} size (${width} X ${height}) file was saved.`
    )

    const modelProcess = spawn('python3', [MODEL_PATH, INPUT_PATH, OUTPUT_PATH])

    modelProcess.stdout.once('data', (result) => {
      res.status(200).json(result.toString())
    })

    modelProcess.stderr.once('data', (err) => {
      req.log.info(err.toString())
      res.status(500).send('Model crashed.')
    })
  }
})

module.exports = runRouter
