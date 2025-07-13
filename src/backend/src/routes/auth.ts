import { Router } from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../lib/supabase.js';

const router = Router();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255)
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const body = signUpSchema.parse(req.body);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: body.email,
        name: body.name
      });

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    res.status(201).json({
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: body.name
        },
        session: authData.session
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const body = signInSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      throw error;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', data.user.id)
      .single();

    res.json({
      data: {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.name || ''
        },
        session: data.session
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.signOut();
    }

    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Failed to sign out' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email!,
          name: profile?.name || '',
          avatar_url: profile?.avatar_url
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;