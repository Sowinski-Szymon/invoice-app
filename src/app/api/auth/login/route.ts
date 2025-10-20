import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simple in-memory user store. In production, use a database.
const users = [
  {
    username: 'admin',
    password: '$2b$10$afTeuHoakNY41529F1YtleqT9wwAK5UY/sFLdw3IyyuhBE61yak9e', // bcrypt hash for 'password'
  },
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    return NextResponse.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}