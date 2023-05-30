// @ts-check

const express = require('express')

const { getUsersCollection, getStatCollection } = require('../mongo')

const dataRouter = express.Router()

dataRouter.post('/users', async (req, res) => {
  /** @type {{ apiKey: string, userData: Object.<string, string>}} */
  const { apiKey, userData } = req.body
  if (!apiKey || !userData) {
    res.statusCode = 404
    res.send('User Information missing.')
  }

  const users = await getUsersCollection()
  if (!users) {
    res.statusCode = 404
    res.send('MongoDB connection failed.')
  }

  /** @type {Object.<string, Object<string, string>>} */
  const update = { $set: {} }
  Object.keys(userData).forEach((key) => {
    update.$set[`userInfo.${key}`] = userData[key]
  })

  const updateResult = await users.updateOne(
    {
      apiKey,
    },
    update
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

dataRouter.post('/stat', async (req, res) => {
  const { type, payload } = req.body

  if (!type) {
    res.statusCode = 404
    res.send('Request data missing.')
  }
  const stat = await getStatCollection()
  if (!stat) {
    res.statusCode = 404
    res.send('MongoDB connection failed.')
  }

  /** @type {import('mongodb').UpdateResult<Document>} */
  let updateResult
  switch (type) {
    case 'increment': {
      const { metric } = payload

      updateResult = await stat.updateOne(
        { metric },
        {
          $inc: {
            count: 1,
          },
        }
      )
      break
    }

    case 'decrement': {
      const { metric } = payload

      updateResult = await stat.updateOne(
        { metric },
        {
          $inc: {
            count: -1,
          },
        }
      )
      break
    }

    case 'subfield-increment': {
      const { metric, subfield } = payload

      updateResult = await stat.updateOne(
        { metric },
        {
          $inc: {
            [subfield]: 1,
          },
        }
      )
      break
    }

    case 'subfield-decrement': {
      const { metric, subfield } = payload

      updateResult = await stat.updateOne(
        { metric },
        {
          $inc: {
            [subfield]: -1,
          },
        }
      )
      break
    }

    default:
      res.status(404).send('Unknown type')
      return
  }

  const { acknowledged, matchedCount, upsertedId } = updateResult
  if (acknowledged && matchedCount > 0) {
    res.statusCode = 200
    res.send(upsertedId)
  } else if (acknowledged) {
    res.statusCode = 401
    res.send('No metric matches to the API Key.')
  } else {
    res.statusCode = 400
    res.send('Bad request.')
  }
})

module.exports = dataRouter
