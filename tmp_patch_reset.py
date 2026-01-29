from pathlib import Path
p = Path('src/routes/auth/reset-password.tsx')
new = '''import { component$, useSignal } from '@builder.io/qwik';
import { routeAction$, useLocation } from '@builder.io/qwik-city';
import { hashPassword } from '~/utils/auth';
import { tursoClient } from '~/utils/turso';

const hashToken = async (token: string) => {
  const data = new TextEncoder().encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('')
}

export const useResetPassword = routeAction$(async (data, requestEvent) => {
  const { token, password } = data as { token: string; password: string }
  if (!token || !password) {
    return { success: false, error: 'Token o contrasena faltante.' }
  }

  const client = tursoClient(requestEvent)
  const tokenHash = await hashToken(token)

  const result = await client.execute({
    sql: 'SELECT user_id, expires_at FROM password_reset_tokens WHERE token_hash = ?',
    args: [tokenHash],
  })

  const row = result.rows[0] as { user_id?: number; expires_at?: string } | undefined
  if (!row?.user_id || !row.expires_at) {
    return { success: false, error: 'Token invalido o expirado.' }
  }

  const now = new Date()
  const expiresAt = new Date(row.expires_at)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
    await client.execute({ sql: 'DELETE FROM password_reset_tokens WHERE token_hash = ?', args: [tokenHash] })
    return { success: false, error: 'Token invalido o expirado.' }
  }

  const newHash = await hashPassword(password)
  await client.execute({
    sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
    args: [newHash, row.user_id],
  })

  await client.execute({
    sql: 'DELETE FROM password_reset_tokens WHERE user_id = ?',
    args: [row.user_id],
  })

  return { success: true }
})

export default component$(() => {
  const resetAction = useResetPassword()
  const password = useSignal('')
  const confirm = useSignal('')
  const error = useSignal('')
  const success = useSignal(false)
  const loc = useLocation()

  const token = loc.url.searchParams.get('token') || ''

  return (
    <div class="min-h-screen flex items-center justify-center">
      <form class="space-y-6 max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        preventdefault:submit
        onSubmit$={async (e) => {
          e.preventDefault()
          error.value = ''
          if (!password.value || password.value.length < 6) {
            error.value = 'La contrasena debe tener al menos 6 caracteres.'
            return
          }
          if (password.value !== confirm.value) {
            error.value = 'Las contrasenas no coinciden.'
            return
          }
          await resetAction.submit({ token, password: password.value })
          if (resetAction.value?.success) {
            success.value = true
          } else {
            error.value = resetAction.value?.error || 'No se pudo cambiar la contrasena.'
          }
        }}>
        <h2 class="text-2xl font-bold mb-4">Restablecer contrasena</h2>
        <input type="hidden" name="token" value={token} />
        <div>
          <label class="block text-sm font-medium mb-1">Nueva contrasena</label>
          <input type="password" class="w-full rounded-lg border px-4 py-3" value={password.value} onInput$={e => password.value = (e.target as HTMLInputElement).value} required minLength={6} />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Confirmar contrasena</label>
          <input type="password" class="w-full rounded-lg border px-4 py-3" value={confirm.value} onInput$={e => confirm.value = (e.target as HTMLInputElement).value} required minLength={6} />
        </div>
        {error.value && <div class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error.value}</div>}
        {success.value && <div class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl">Contrasena cambiada con exito!</div>}
        <button type="submit" class="w-full py-3 rounded-lg bg-teal-600 text-white font-semibold mt-4">Cambiar contrasena</button>
      </form>
    </div>
  )
})
'''
p.write_text(new)
