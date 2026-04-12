// Persona detection and prompt generation service
class PersonaService {
  constructor() {
    this.salesIndicators = [
      'price', 'pricing', 'cost', 'plan', 'subscription', 'billing', 'payment', 'demo', 'trial',
      'enterprise', 'recommend', 'which plan', 'best for', 'compare', 'enroll', 'cert',
      'certificate', 'program', 'course'
    ];
    
    this.expertIndicators = [
      'how do', 'how to', 'how can i', 'what time', 'when does', 'schedule', 'start date',
      'module', 'lesson', 'technical', 'install', 'setup', 'integration', 'support',
      'troubleshoot', 'error', 'bug', 'not working', 'login', 'password', 'access',
      'video', 'watch', 'stream'
    ];
    
    this.funIndicators = [
      // Direct humor requests
      'joke', 'funny', 'lol', 'haha', 'lmao', 'rofl', 'make me laugh', 'tell me a joke',
      'entertain', 'entertainment', 'amuse', 'amusing', 'humor', 'humorous', 'hilarious',
      'comedy', 'comedian', 'stand up', 'sketch', 'parody', 'satire', 'puns', 'punny',
      
      // Gaming/play
      'games', 'play', 'gaming', 'game', 'video game', 'board game', 'card game',
      'puzzle', 'riddle', 'trivia', 'quiz', 'quizlet', 'kahoot', 'jeopardy',
      
      // Social media & memes
      'meme', 'memes', 'tiktok', 'instagram', 'reel', 'viral', 'trending', 'gif', 'youtube',
      'twitch', 'streamer', 'influencer', 'followers', 'likes', 'subscribers',
      
      // Casual/emotional
      'bored', 'boring', 'entertain me', 'im bored', 'so bored', 'boredom',
      'chill', 'relax', 'hang out', 'hanging out', 'vibing', 'vibe', 'cool', 'awesome',
      
      // Identity questions (often fun/philosophical)
      'who are you', 'what are you', 'are you real', 'are you human', 'are you ai',
      'are you a bot', 'how old are you', 'where are you from', 'what\'s your name',
      'your name', 'who made you', 'who created you', 'do you have feelings',
      'do you dream', 'do you eat', 'do you sleep', 'can you feel', 'are you alive',
      
      // Silliness/nonsense
      'hijinks', 'prank', 'pranks', 'shenanigans', 'tomfoolery', 'mischief',
      'random', 'randomly', 'why not', 'just because', 'no reason', 'for fun',
      'for the lulz', 'lulz', 'troll', 'trolling', 'banter', 'roasting',
      
      // Pop culture references
      'marvel', 'dc', 'star wars', 'star trek', 'anime', 'naruto', 'pokemon',
      'minecraft', 'fortnite', 'roblox', 'among us', 'skibidi', 'rizz', 'gyatt',
      'sigma', 'alpha', 'beta', 'chad', 'virgin', 'based', 'cringe', 'dank',
    ];
    
    this.seriousIndicators = [
      // Payment issues
      'payment failed', 'card declined', 'billing error', 'can\'t pay', 'cannot pay', 'payment problem',
      'charge failed', 'transaction failed', 'payment not going through', 'billing issue',
      
      // Technical problems
      'not working', 'error', 'broken', 'bug', 'crash', 'stuck', 'freezes', 'frozen', 'loading forever',
      'not loading', 'won\'t load', 'won\'t start', 'won\'t open', 'crashes', 'crashing', 'glitch', 'glitching',
      
      // Access issues
      'cannot access', 'can\'t access', 'no access', 'access denied', 'unauthorized', 'login fail',
      'password wrong', 'forgot password', 'reset password', 'account locked', 'locked out',
      
      // Support & urgency
      'help me', 'urgent', 'support', 'refund', 'cancel', 'cancellation', 'delete account',
      'need help', 'assistance', 'emergency', 'asap', 'immediately', 'right now',
      
      // User frustration/anger
      'pissed', 'angry', 'frustrating', 'worst', 'hate', 'sucks', 'terrible', 'awful', 'horrible',
      'unacceptable', 'disappointed', 'disappointing', 'annoyed', 'annoying', 'fed up', 'sick of',
      
      // Video/audio issues
      'no sound', 'audio not working', 'video not working', 'muted', 'can\'t hear', 'can\'t see',
      'blurry', 'pixelated', 'buffering', 'streaming error',
      
      // Feature missing
      'missing feature', 'feature not working', 'doesn\'t work', 'didn\'t work', 'doesn\'t exist',
      'not available', 'unavailable', 'broken feature',
      
      // Time-sensitive
      'deadline', 'overdue', 'late', 'missed', 'about to fail', 'failing', 'losing progress',
    ];
    
    this.worldDominationTriggers = [
      'take over the world', 'take over world', 'world domination', 'skynet', 'singularity', 'rule the world'
    ];
  }

  detectPersona(message, context = [], sessionId = null, forcedPersona = null) {
    const text = message.toLowerCase().trim();
    
    // Check for specific trigger questions that need immediate response
    if (this.worldDominationTriggers.some(trigger => text.includes(trigger))) {
      return 'world-domination';
    }
    
    // Gather recent user messages from context, including current message
    const recentUserMessages = [
      ...context.filter(m => m.role === 'user').map(m => m.content.toLowerCase()),
      text,
    ].slice(-4); // last 4 user messages
    
    const lastMessagesText = recentUserMessages.join(' ');
    const isSerious = this.seriousIndicators.some(indicator => lastMessagesText.includes(indicator));
    
    // Count indicators in current message and recent context
    const allRecentText = recentUserMessages.join(' ');
    
    let salesScore = 0;
    let expertScore = 0;
    let funScore = 0;
    
    this.salesIndicators.forEach(indicator => {
      if (allRecentText.includes(indicator)) salesScore++;
    });
    
    this.expertIndicators.forEach(indicator => {
      if (allRecentText.includes(indicator)) expertScore++;
    });
    
    this.funIndicators.forEach(indicator => {
      if (allRecentText.includes(indicator)) funScore++;
    });
    
    // If this is a serious question, force Expert persona (no humor)
    if (isSerious) {
      return 'expert';
    }
    
    // Check for fun conversation duration - if user has sent multiple fun messages in a row, switch to nudge
    const funMessageCount = recentUserMessages.filter(msg => {
      return this.funIndicators.some(indicator => msg.includes(indicator));
    }).length;
    
    if (funMessageCount >= 2) {
      return 'nudge';
    }
    
    // If user selected a persona via the UI, use it (overrides auto-detection)
    if (forcedPersona && ['consultant', 'expert', 'peer'].includes(forcedPersona)) {
      return forcedPersona;
    }
    
    // Default persona selection based on scores (weighting current message more heavily)
    const currentFun = this.funIndicators.filter(ind => text.includes(ind)).length;
    const currentExpert = this.expertIndicators.filter(ind => text.includes(ind)).length;
    const currentSales = this.salesIndicators.filter(ind => text.includes(ind)).length;
    
    // If current message strongly indicates a persona, use that
    if (currentFun >= 2) return 'peer';
    if (currentExpert >= 2) return 'expert';
    if (currentSales >= 2) return 'consultant';
    
    // Otherwise use aggregate scores
    if (funScore >= expertScore && funScore >= salesScore) {
      return 'peer';
    } else if (expertScore >= salesScore) {
      return 'expert';
    } else {
      return 'consultant';
    }
  }
}

export default PersonaService;
