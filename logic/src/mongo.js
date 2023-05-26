// @ts-check
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')

const { MONGO_PASSWORD, MONGO_HOST, MONGO_USER, MONGO_DBNAME } = process.env
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

let didConnect = false

/**
 * @param {string} name
 */
async function getCollection(name) {
  if (!didConnect) {
    await client.connect()
    didConnect = true
  }
  return client.db(MONGO_DBNAME).collection(name)
}

async function getUsersCollection() {
  return getCollection('users')
}

async function getStatCollection() {
  return getCollection('stat')
}

module.exports = {
  getUsersCollection,
  getStatCollection,
}
