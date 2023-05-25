// @ts-check

const express = require('express')
const { v1: uuidv1 } = require('uuid')

const { getUsersCollection } = require('../mongo')

const authRouter = express.Router()

function nowTime() {
  const date = new Date()
  const year = date.getFullYear()
  const month = `0${date.getMonth() + 1}`
  const day = `0${date.getDate()}`
  const hour = `0${date.getHours()}`
  const minute = `0${date.getMinutes()}`
  const second = `0${date.getSeconds()}`
  return `${year}-${month.slice(-2)}-${day.slice(-2)} ${hour.slice(
    -2
  )}:${minute.slice(-2)}:${second.slice(-2)}`
}

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
    date: nowTime(),
    apiKey,
    userInfo,
    credit: 0,
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

authRouter.use('/credit', async (req, res) => {
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

  const user = await users.findOne({
    apiKey,
  })
  if (!user) {
    res.statusCode = 401
    res.send('No user matches to the API Key.')
  }

  // @ts-ignore
  const { credit } = user
  const updateResult = await users.updateOne(
    {
      apiKey,
    },
    {
      $set: { credit: credit + 1 },
    }
  )

  const { acknowledged, matchedCount, upsertedId } = updateResult
  if (acknowledged && matchedCount > 0) {
    res.statusCode = 200
    res.send(upsertedId)
  } else {
    res.statusCode = 400
    res.send('Bad request.')
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
