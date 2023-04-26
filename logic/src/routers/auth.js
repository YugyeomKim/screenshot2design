// @ts-check

const express = require('express')
const { v1: uuidv1 } = require('uuid')

const { getUsersCollection } = require('../mongo')

const authRouter = express.Router()

authRouter.post('/enroll', async (req, res) => {
  const userInfo = req.body
  if (!userInfo) {
    res.statusCode = 404
    res.send('User Information missing.')
  }

  const apiKey = uuidv1()

  const users = await getUsersCollection()
  if (!users) {
    res.statusCode = 404
    res.send('MongoDB connection failed.')
  }

  const insertResult = await users.insertOne({
    apiKey,
    userInfo,
    activated: false,
  })

  const { acknowledged, insertedId } = insertResult
  if (acknowledged && insertedId) {
    res.statusCode = 200
    res.send(apiKey)
  } else {
    res.statusCode = 404
    res.send('Insertion to DB failed.')
  }
})

authRouter.post('/activate', async (req, res) => {
  const apiKey = req.headers.apikey
  if (!apiKey) {
    res.statusCode = 404
    res.send('API Key missing.')
  }

  const users = await getUsersCollection()
  if (!users) {
    res.statusCode = 404
    res.send('MongoDB connection failed.')
  }

  const updateResult = await users.updateOne(
    {
      apiKey,
    },
    {
      $set: { activated: true },
    }
  )

  const { acknowledged, matchedCount, upsertedId } = updateResult
  if (acknowledged && matchedCount > 0) {
    res.statusCode = 200
    res.send(upsertedId)
  } else if (acknowledged) {
    res.statusCode = 401
    res.send('No user matches to the API Key.')
  } else {
    res.statusCode = 400
    res.send('Bad request.')
  }
})

authRouter.get('/check', async (req, res) => {
  const apiKey = req.headers.apikey
  if (!apiKey) {
    res.statusCode = 404
    res.send('API Key missing.')
  }

  const users = await getUsersCollection()
  if (!users) {
    res.statusCode = 423
    res.send('MongoDB connection failed.')
  }

  const user = await users.findOne({
    apiKey,
  })
  if (user) {
    res.statusCode = 200
    res.send()
  } else {
    res.statusCode = 401
    res.send('No user matches to the API Key.')
  }
})

module.exports = authRouter
