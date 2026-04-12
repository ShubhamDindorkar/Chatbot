// Prompt generation service
class PromptService {
  constructor(promptsConfig) {
    this.promptsConfig = promptsConfig;
  }

  getPersonaSystemPrompt(persona, userName = null, isReturningUser = false, previousInterests = []) {
    const baseInstructions = this.promptsConfig.baseInstructions;
    
    let personaSpecific = [];
    
    if (this.promptsConfig.personas[persona]) {
      personaSpecific = this.promptsConfig.personas[persona].additionalInstructions;
    } else if (this.promptsConfig.specialPersonas[persona]) {
      // Special personas return their full prompt directly
      let greeting = '';
      if (userName) {
        if (isReturningUser) {
          greeting = `Welcome back, ${userName}! `;
        } else {
          greeting = `Hi ${userName}! `;
        }
      }
      if (previousInterests.length > 0) {
        greeting += `I remember you were interested in ${previousInterests.join(', ')}. `;
      }
      return greeting + this.promptsConfig.specialPersonas[persona].systemPrompt;
    }

    let greeting = '';
    if (userName) {
      if (isReturningUser) {
        greeting = `Welcome back, ${userName}! `;
      } else {
        greeting = `Hi ${userName}! `;
      }
    }

    if (previousInterests.length > 0) {
      greeting += `I remember you were interested in ${previousInterests.join(', ')}. `;
    }

    return `${greeting}${[...baseInstructions, ...personaSpecific].join(' ')}`;
  }
}

export default PromptService;
