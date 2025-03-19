import dotenv from 'dotenv'
dotenv.config()
import OpenAI from 'openai'
import dico from '../dico.json' assert { type: "json" }
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function specificAgent(agentName, message) {
  if (!dico.hasOwnProperty(agentName)) {
    throw new Error(`Agent inconnu: ${agentName}`)
  }
  
  const agentDef = dico[agentName]
  const prompt = `${agentDef.definition} 
Format attendu : 
${agentDef.formatAttendu} 
${agentDef.consigne}`
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message }
      ]
    })
    const resultStr = response.choices[0].message.content
    let resultObj
    try {
      resultObj = JSON.parse(resultStr)
    } catch (err) {
      console.error("Erreur lors du parsing dans specificAgent :", err)
      resultObj = { error: "JSON invalide" }
    }
    return resultObj
  } catch (err) {
    console.error("Erreur dans specificAgent :", err)
    throw err
  }
}
