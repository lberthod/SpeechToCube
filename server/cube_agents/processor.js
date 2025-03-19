import { triageAgent } from './triage.js'
import { specificAgent } from './specific.js'

export async function processCommand(message) {
  // Appel de l'agent de triage pour déterminer l'agent spécifique
  const triageOutput = await triageAgent(message)
  const selectedAgent = triageOutput.agent || "unknown"
  if (!selectedAgent) {
    return { error: "Agent non spécifié par le triage." }
  }
  
  // Appel de l'agent spécifique
  try {
    const detailedOutput = await specificAgent(selectedAgent, message)
    return detailedOutput
  } catch (err) {
    return { error: err.message }
  }
}
