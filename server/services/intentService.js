// Intent matching service
class IntentService {
  constructor(knowledgeBase) {
    this.knowledgeBase = knowledgeBase;
  }

  matchIntent(message) {
    const text = message.toLowerCase().trim();
    const words = text.split(/\s+/);

    // Score each intent by how many tags match – pick the best
    let bestIntent = null;
    let bestScore = 0;

    for (const intent of this.knowledgeBase.intents) {
      let score = 0;
      for (const tag of intent.tags) {
        // For multi-word tags, use word boundary matching for better accuracy
        if (tag.includes(' ')) {
          const tagWords = tag.split(' ');
          let allMatch = true;
          let wordIndex = 0;
          for (const tagWord of tagWords) {
            const idx = words.indexOf(tagWord, wordIndex);
            if (idx === -1) {
              allMatch = false;
              break;
            }
            wordIndex = idx + 1;
          }
          if (allMatch) score += 3; // Higher score for multi-word matches
        } else {
          // Single word tag - check word boundary
          const wordIndex = words.indexOf(tag);
          if (wordIndex !== -1) score += 1;
        }
      }
      // Normalize score by tag count to avoid bias towards intents with many tags
      const normalizedScore = intent.tags.length > 0 ? score / intent.tags.length : 0;
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestIntent = intent;
      }
    }

    // Only return if we have a reasonable match (at least 30% of tags matched)
    return bestScore >= 0.3 ? bestIntent : null;
  }

  requiresLeadFromIntent(intentId) {
    const intent = this.knowledgeBase.intents.find(i => i.id === intentId);
    return intent?.requiresLead || false;
  }
}

export default IntentService;
