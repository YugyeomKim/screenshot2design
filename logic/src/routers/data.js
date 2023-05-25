// @ts-check

const express = require('express')

const { getUsersCollection } = require('../mongo')

const dataRouter = express.Router()

dataRouter.post('/users', async (req, res) => {
  /**
   * @typedef {Object.<string, string>} Preference
   * @property {string} UiFormat
   * @property {string} UiPattern
   * @property {string} UiSource
   */

  /**
   * @typedef {Object.<string, string>} Survey
   * @property {string} PluginUsage
   * @property {string} ExpectedTimeSave
   */

  /** @type {{ apiKey: string, userData: Preference | Survey}} */
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

module.exports = dataRouter
