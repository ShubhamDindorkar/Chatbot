// Chat routes
export function createChatRoutes(app, services) {
  const { storageService, personaService, intentService, promptService, logger, openai } = services;

  const NUDGE_MESSAGES = [
    'Anyway, enough fun - want to check out our programs that actually help you pass?',
    "Alright, let's channel that energy into something productive. Which program interests you?",
    'Fun times! But seriously, ready to level up your education?',
  ];

  const getNudgeMessage = () => {
    return NUDGE_MESSAGES[Math.floor(Math.random() * NUDGE_MESSAGES.length)];
  };

  const getConversationContext = (context) => {
    if (!Array.isArray(context) || context.length === 0) {
      return [];
    }
    return context.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));
  };

  app.post('/api/chat', async (req, res) => {
    const { sessionId, userName, persona: selectedPersona, context } = req.body || {};
    const message = req.sanitizedMessage;

    // Look up existing session
    let existingSession = null;
    if (sessionId) {
      existingSession = storageService.getSession(sessionId);
    }

    // Resolve user's name: priority (1) from this request, (2) from stored session, (3) from context extraction
    let resolvedUserName = userName || existingSession?.name || null;

    // Attempt to extract name from message if not yet known
    if (!resolvedUserName) {
      const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch) {
        resolvedUserName = nameMatch[1];
      }
    }

    // Store/update session if we have a sessionId
    if (sessionId) {
      storageService.setSession(sessionId, {
        name: resolvedUserName,
        messageCount: (existingSession?.messageCount || 0) + 1,
        lastSeen: Date.now(),
      });
    }

    // Determine if this is a returning user (existing session that existed BEFORE this request)
    const isReturningUser = !!existingSession;

    let reply = '';
    let intentId = '';

    // Detect persona, respecting user selection if provided
    const persona = personaService.detectPersona(message, context, sessionId, selectedPersona);

    const matched = intentService.matchIntent(message);

    if (matched) {
      // For matched FAQs, use the answer but adapt tone slightly based on persona
      reply = matched.answer;
      intentId = matched.id;

      // Apply nudge if persona indicates user is in a fun loop (for non-serious intents)
      if (persona === 'nudge' && !['thanks', 'goodbye', 'greeting', 'world_domination'].includes(intentId)) {
        reply = reply + '\n\n' + getNudgeMessage();
      } else if (persona === 'peer' && !['thanks', 'goodbye', 'joke_request'].includes(intentId)) {
        // Peer persona: slightly more casual but still helpful
        reply = reply.replace(/!/g, ' 😄').replace(/\.$/, '. Hit me up if you need anything else!');
      }
    } else if (openai) {
      // Fall back to OpenAI for unmatched queries
      const systemPrompt = promptService.getPersonaSystemPrompt(
        persona,
        resolvedUserName,
        isReturningUser,
        existingSession?.previousInterests || []
      );

      const conversationHistory = getConversationContext(context);

      const kbText = intentService.knowledgeBase.intents
        .map((i) => `Q: ${i.question}\nA: ${i.answer}`)
        .join('\n\n');

      const messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'system',
          content: `Knowledge Base (use this first when applicable):\n${kbText}`,
        },
        ...conversationHistory,
        { role: 'user', content: message },
      ];

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: persona === 'peer' ? 0.85 : 0.7,
          max_tokens: 300,
        });

        reply =
          completion.choices[0]?.message?.content?.trim() ||
          intentService.knowledgeBase.fallback ||
          'I am not sure about that. Let me connect you to our team.';
        intentId = 'llm_answer';
      } catch (error) {
        logger.error('OpenAI API error', { error: error.message, stack: error.stack });
        reply =
          intentService.knowledgeBase.fallback ||
          'I am not sure about that. Let me connect you to our team.';
        intentId = 'fallback';
      }
    } else {
      reply =
        intentService.knowledgeBase.fallback ||
        'I am not sure about that. Let me connect you to our team.';
      intentId = 'fallback';
    }

    const requiresLead = intentService.requiresLeadFromIntent(intentId);

    return res.json({
      reply,
      intent: intentId,
      requiresLead,
      sessionId: sessionId || null,
    });
  });
}
