// Lead routes
export function createLeadRoutes(app, services) {
  const { storageService, logger } = services;

  app.post('/api/leads', async (req, res) => {
    const { sessionId, timestamp, sourceUrl } = req.body || {};
    const { name, email, phone, query } = req.sanitizedData;

    try {
      const leadId = storageService.addLead({
        name,
        email,
        phone,
        query,
        session_id: sessionId || null,
        source_url: sourceUrl || null,
        created_at: timestamp || new Date().toISOString(),
      });

      // Store user's name in session store for future personalization
      if (sessionId && name) {
        storageService.setSession(sessionId, {
          name: name.trim(),
          createdAt: Date.now(),
          lastSeen: Date.now(),
        });
      }

      return res.status(201).json({ success: true, leadId });
    } catch (error) {
      logger.error('Lead insert error', { error: error.message, stack: error.stack });
      return res.status(500).json({ error: 'Lead insert failed' });
    }
  });
}
