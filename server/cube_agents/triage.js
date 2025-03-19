import dotenv from 'dotenv'
dotenv.config()
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const TRIAGE_PROMPT = `Vous êtes un agent triage recevant une commande pour un jeu interactif multi-cube. 
Votre tâche est de déterminer quel agent spécifique doit traiter la commande. 
Les agents possibles sont : moveDirection, changeColor, rotateCube, scaleCube, resetCube, toggleVisibility, 
moveDepth, changeTexture, duplicateCube, removeCube, startAnimation, stopAnimation, flipCube, launchBall, glide, decline, trail. 
Si un numéro de cube est mentionné, incluez-le dans votre réponse. 
Répondez uniquement par un objet JSON contenant au moins la clé "agent". 
Par exemple :
{"agent": "moveDirection", "cube": 2}`

export async function triageAgent(message) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: TRIAGE_PROMPT },
        { role: 'user', content: message }
      ]
    })
    const resultStr = response.choices[0].message.content
    let resultObj
    try {
      resultObj = JSON.parse(resultStr)
    } catch (err) {
      console.error("Erreur lors du parsing de la réponse du triage :", err)
      resultObj = { agent: "unknown", cube: 1 }
    }
    return resultObj
  } catch (err) {
    console.error("Erreur dans triageAgent :", err)
    throw err
  }
}
