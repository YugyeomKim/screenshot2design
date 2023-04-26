// @ts-check

const express = require('express')
const cors = require('cors')
const authRouter = require('./routers/auth')
const runRouter = require('./routers/run')

const app = express()

const PORT = 3000
const origin = 'null'

app.use(
  cors({
    origin,
    optionsSuccessStatus: 200,
  })
)

app.use('/auth', authRouter)
app.use('/run', runRouter)

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on ${PORT}`)
})
