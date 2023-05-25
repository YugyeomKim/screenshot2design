// @ts-check

const express = require('express')
const cors = require('cors')
const createError = require('http-errors')
// @ts-ignore
const pino = require('pino-http')()

const authRouter = require('./routers/auth')
const runRouter = require('./routers/run')
const dataRouter = require('./routers/data')

const app = express()

const PORT = 3000
const PayloadTooLargeError = createError.PayloadTooLarge

app.use(express.json({ limit: '10MB' }))

app.use(cors())
app.use(['/auth', '/run', '/data', '/test'], pino)

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
app.use('/data', dataRouter)
app.use('/health-check', (req, res) => {
  res.status(200).send()
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on ${PORT}`)
})
