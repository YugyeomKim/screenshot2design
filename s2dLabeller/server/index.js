const express = require('express')
const fs = require('fs')
const app = express()
const cors = require('cors')
const path = require('path')
const { v1: uuidv1 } = require('uuid')

app.use(cors())
app.use(express.json({ limit: '10GB' }))

const saveDir = './labeled-data/'
const labelFilePath = path.join(__dirname, saveDir, 'labels.csv')
let labelContent = 'image,label\n'

if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir)
}

if (fs.existsSync(labelFilePath)) {
  labelContent = fs.readFileSync(labelFilePath)
}

app.post('/', (req, res) => {
  const data = req.body

  if (!data.label || !data.bytes) {
    res.status(400).send('Invalid data received')
    return
  }

  const label = data.label
  const bytes = data.bytes

  const fileName = uuidv1()
  const filePath = path.join(__dirname, saveDir)

  // Save the split data
  labelContent = `${labelContent}${fileName},${label}\n`
  fs.writeFileSync(labelFilePath, labelContent)

  // Save the PNG blob and JSON data
  fs.writeFileSync(
    path.join(filePath, `${fileName}.jpg`),
    Buffer.from(bytes),
    'base64'
  )

  console.log(`${fileName} (${label}) saved`)
  res.send('Data saved successfully!')
})

app.listen(3000, () => {
  console.log('Server listening on port 3000')
})
