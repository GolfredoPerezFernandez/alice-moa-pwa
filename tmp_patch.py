from pathlib import Path
p = Path('src/routes/auth/index.tsx')
text = p.read_text()
marker = 'export const useLogout'
idx = text.index(marker)
pre = '''import { component$, useSignal, useVisibleTask$, useStyles$ } from '@builder.io/qwik';
import { server$, routeLoader$, routeAction$, Form } from '@builder.io/qwik-city';
import { Resend } from 'resend';
import { hashPassword, verifyPassword, setCookies, clearAuthCookies, getUserId } from '~/utils/auth';
import { tursoClient } from '~/utils/turso';
import { initAuthDatabase, checkDatabaseConnection } from '~/utils/init-db';
import {
  LuArrowLeft,
  LuUser,
  LuLock,
  LuMail,
  LuAlertCircle,
  LuCheckCircle,
  LuLoader,
  LuGraduationCap // Added for logo
} from '@qwikest/icons/lucide';

const generateResetToken = () => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

const hashToken = async (token: string) => {
  const data = new TextEncoder().encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('')
}

export const sendPasswordResetEmail = server$(async function (email: string) {
  const resendApiKey = this.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    throw new Error('Resend API key not configured')
  }

  const client = tursoClient(this)

  const userResult = await client.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email]
  })
  const user = userResult.rows[0]
  if (!user?.id) {
    console.log('[RESET] Email not found, returning success to avoid enumeration')
    return { success: true }
  }

  const resend = new Resend(resendApiKey)
  const origin = this.env.get('PUBLIC_APP_URL') || this.url.origin
  const senderEmail = this.env.get('SENDER_EMAIL') || 'onboarding@resend.dev'

  const resetToken = generateResetToken()
  const tokenHash = await hashToken(resetToken)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  await client.execute({
    sql: 'DELETE FROM password_reset_tokens WHERE user_id = ?',
    args: [user.id]
  })

  await client.execute({
    sql: 'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    args: [user.id, tokenHash, expiresAt]
  })

  const resetUrl = `${origin}/auth/reset-password?token=${resetToken}`

  const { data, error } = await resend.emails.send({
    from: senderEmail,
    to: email,
    subject: 'Recupera tu contrasena',
    html: `<p>Haz clic en el siguiente enlace para restablecer tu contrasena (valido por 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  })

  if (error) {
    console.error('Resend error:', error)
    throw new Error(error.message)
  }

  return { success: true, id: data?.id }
})

'''

p.write_text(pre + text[idx:])
