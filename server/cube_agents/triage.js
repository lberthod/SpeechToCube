import dotenv from 'dotenv'
dotenv.config()
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const TRIAGE_PROMPT = `Vous êtes un agent triage recevant une commande pour un jeu interactif multi-cube. 
Votre tâche est de déterminer quel agent spécifique doit traiter la commande parmi les suivants :
moveDirection, changeColor, rotateCube, scaleCube, resetCube, toggleVisibility, moveDepth, changeTexture, createCube, removeCube, startAnimation, stopAnimation, flipCube, launchBall, glide, decline, trail, morphing, moveElementCloseToElement.
Si plusieurs actions doivent être effectuées, retournez-les dans un tableau JSON.
Répondez uniquement par un objet JSON ou un tableau d’objets JSON sans aucun texte supplémentaire.
Par exemple :
[{"agent": "moveDirection", "cube": 2}, {"agent": "flipCube", "cube": 2}]`;


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
    console.log("Réponse brute du triage : de " + message + "," +  resultStr);

    return resultObj
  } catch (err) {
    console.error("Erreur dans triageAgent :", err)
    throw err
  }
}
