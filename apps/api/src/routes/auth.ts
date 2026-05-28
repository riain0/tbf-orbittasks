import { Router } from 'express';
import { registerUser, loginUser, getUserById } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

// Current user for a valid token. The web client calls this on load to turn
// a stored token back into a real user.
authRouter.get('/me', requireAuth, (req, res) => {
  const user = req.userId ? getUserById(req.userId) : undefined;
  if (!user) {
    res.status(401).json({ error: 'invalid token' });
    return;
  }
  res.json(user);
});

authRouter.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: (e as Error).message });
  }
});
