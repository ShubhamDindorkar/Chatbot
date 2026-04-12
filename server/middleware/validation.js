// Input validation middleware
export function validateChatRequest(req, res, next) {
  const { message, sessionId, persona: selectedPersona, context } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  // Sanitize and validate message
  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return res.status(400).json({ error: 'message cannot be empty' });
  }
  if (trimmedMessage.length > 2000) {
    return res.status(400).json({ error: 'message is too long (max 2000 characters)' });
  }

  // Validate sessionId format if provided (UUID format)
  if (sessionId && typeof sessionId === 'string') {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return res.status(400).json({ error: 'Invalid sessionId format' });
    }
  }

  // Validate persona if provided
  if (selectedPersona && !['consultant', 'expert', 'peer'].includes(selectedPersona)) {
    return res.status(400).json({ error: 'Invalid persona value' });
  }

  // Validate context if provided
  if (context && !Array.isArray(context)) {
    return res.status(400).json({ error: 'context must be an array' });
  }

  // Attach sanitized message to request
  req.sanitizedMessage = trimmedMessage;
  next();
}

export function validateLeadRequest(req, res, next) {
  const { name, email, phone, query } = req.body || {};

  // Server-side validation
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Validation failed', fields: ['name'] });
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 80) {
    return res.status(400).json({ error: 'Name must be between 2 and 80 characters' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Validation failed', fields: ['email'] });
  }

  const trimmedEmail = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Optional field validation
  if (phone && typeof phone === 'string') {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
  }

  if (query && typeof query === 'string' && query.length > 500) {
    return res.status(400).json({ error: 'Query is too long (max 500 characters)' });
  }

  // Attach sanitized data to request
  req.sanitizedData = {
    name: trimmedName,
    email: trimmedEmail,
    phone: phone ? phone.trim() : null,
    query: query ? query.trim() : null,
  };
  
  next();
}
