// @ts-check

require('dotenv').config()
const https = require('https')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const createError = require('http-errors')
// @ts-ignore
const pino = require('pino-http')()

const authRouter = require('./routers/auth')
const runRouter = require('./routers/run')

const app = express()

const PORT = 3000
const origin = 'null'
const PayloadTooLargeError = createError.PayloadTooLarge

app.use(express.json({ limit: '10MB' }))
app.use(
  cors({
    origin,
    optionsSuccessStatus: 200,
  })
)
app.use(pino)

// @ts-ignore
app.use((err, req, res, next) => {
  if (err instanceof PayloadTooLargeError) {
    res.status(413).send('Payload Too Large')
  } else {
    next(err)
  }
})

app.use('/auth', authRouter)
app.use('/run', runRouter)

if (process.env.NODE_ENV === 'production') {
  const { SSL_CERT_PATH, SSL_KEY_PATH } = process.env
  if (!SSL_CERT_PATH || !SSL_KEY_PATH) {
    throw new Error('No ssl certificate loaded.')
  }

  const sslOptions = {
    cert: fs.readFileSync(SSL_CERT_PATH),
    key: fs.readFileSync(SSL_KEY_PATH),
  }

  https.createServer(sslOptions, app).listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`listening on ${PORT}`)
  })
} else {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`listening on ${PORT}`)
  })
}
