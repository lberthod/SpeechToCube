import { triageAgent } from './triage.js'
import { specificAgent } from './specific.js'

export async function processCommand(message) {
  try {
    // Appel de l'agent de triage pour déterminer la ou les actions
    const triageOutput = await triageAgent(message)
    // Si le triage renvoie un objet unique, on l'encapsule dans un tableau
    const commands = Array.isArray(triageOutput) ? triageOutput : [triageOutput]

    if (!commands.length) {
      return { error: "Aucune commande spécifiée par le triage." }
    }

    // Pour chaque commande, on appelle l'agent spécifique et on normalise le résultat en tableau
    const results = await Promise.all(
      commands.map(async (command) => {
        const selectedAgent = command.agent || "unknown"
        if (selectedAgent === "unknown") {
          return { error: "Agent non spécifié par le triage.", command }
        }
        try {
          const detailedOutput = await specificAgent(selectedAgent, message)
          // Si l'agent renvoie un objet unique, on le transforme en tableau
          return Array.isArray(detailedOutput) ? detailedOutput : [detailedOutput]
        } catch (err) {
          return { error: err.message, command }
        }
      })
    )

    // Aplatir le tableau de résultats (si chaque appel renvoie un tableau)
    return results.flat()
  } catch (err) {
    return { error: err.message }
  }
}
