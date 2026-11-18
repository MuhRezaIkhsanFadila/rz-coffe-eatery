// Helper autentikasi + response JSON (dengan CORS).
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
}

function json(statusCode, data, extraHeaders) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...CORS,
      ...(extraHeaders || {}),
    },
    body: JSON.stringify(data),
  }
}

function noContent() {
  return { statusCode: 204, headers: CORS, body: '' }
}

async function hashPassword(pw) {
  return bcrypt.hash(pw, 10)
}

async function comparePassword(pw, hash) {
  return bcrypt.compare(pw, hash)
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  )
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

function getUser(event) {
  const header =
    (event.headers &&
      (event.headers.authorization || event.headers.Authorization)) ||
    ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const payload = verifyToken(m[1])
  if (!payload) return null
  return { id: payload.sub, email: payload.email, role: payload.role }
}

module.exports = {
  json,
  noContent,
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  getUser,
  CORS,
}
