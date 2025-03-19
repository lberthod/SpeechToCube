import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { processCommand } from './cube_agents/processor.js'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  const { message } = req.body
  if (!message) {
    return res.status(400).json({ error: "Le message est requis." })
  }

  try {
    const result = await processCommand(message)
    res.json({ reply: result })
  } catch (err) {
    console.error("Erreur serveur:", err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`)
})
