import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { Field } from './ui/Field'
import { Spinner } from './ui/Spinner'

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<boolean>
  onSignUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; needsVerification: boolean }>
  error: string | null
  onClearError: () => void
}

type Mode = 'signin' | 'signup'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

export function AuthForm({ onSignIn, onSignUp, error, onClearError }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setFieldErrors({})
    setFormError(null)
    onClearError()
    setVerificationEmail(null)
  }

  function validate(): boolean {
    const next: FieldErrors = {}
    if (mode === 'signup' && !name.trim()) next.name = 'Tell us what to call you.'
    if (!email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'That email looks off.'
    }
    if (!password) {
      next.password = 'Password is required.'
    } else if (mode === 'signup' && password.length < 8) {
      next.password = 'Use at least 8 characters.'
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  function clearErrors() {
    if (formError) setFormError(null)
    onClearError()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    onClearError()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      if (mode === 'signin') {
        await onSignIn(email.trim(), password)
      } else {
        const result = await onSignUp(name.trim(), email.trim(), password)
        if (result.ok && result.needsVerification) {
          setVerificationEmail(email.trim())
          setPassword('')
        }
      }
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (verificationEmail) {
    return (
      <div className="animate-pop rounded-[2rem] border-2 border-ink bg-surface p-6 shadow-hard-lg sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border-2 border-ink bg-lime text-ink shadow-hard-sm">
          <Mail className="size-6" />
        </div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm text-muted">
          We sent a verification link to{' '}
          <span className="font-semibold text-ink">{verificationEmail}</span>. Verify it, then come
          back and sign in.
        </p>
        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={() => {
            setVerificationEmail(null)
            switchMode('signin')
          }}
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border-2 border-ink bg-surface p-5 shadow-hard-lg sm:p-7">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Make an account'}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {mode === 'signin'
            ? 'Sign in to start gulping links.'
            : 'One account, endless tiny links.'}
        </p>
      </div>

      <div
        className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border-2 border-ink bg-paper p-1"
        role="tablist"
        aria-label="Authentication mode"
      >
        <button
          type="button"
          role="tab"
          id="auth-tab-signin"
          aria-controls="auth-panel"
          aria-selected={mode === 'signin'}
          onClick={() => switchMode('signin')}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-semibold transition',
            mode === 'signin' ? 'bg-ink text-paper shadow-hard-sm' : 'text-muted hover:text-ink',
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          id="auth-tab-signup"
          aria-controls="auth-panel"
          aria-selected={mode === 'signup'}
          onClick={() => switchMode('signup')}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-semibold transition',
            mode === 'signup' ? 'bg-ink text-paper shadow-hard-sm' : 'text-muted hover:text-ink',
          )}
        >
          Sign up
        </button>
      </div>

      <form
        id="auth-panel"
        role="tabpanel"
        aria-labelledby={mode === 'signin' ? 'auth-tab-signin' : 'auth-tab-signup'}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        {mode === 'signup' && (
          <Field
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              clearErrors()
              if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: undefined }))
            }}
            icon={<UserRound className="size-4" />}
            error={fieldErrors.name}
          />
        )}

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            clearErrors()
            if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined }))
          }}
          icon={<Mail className="size-4" />}
          error={fieldErrors.email}
        />

        <Field
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder={mode === 'signin' ? 'Your password' : 'At least 8 characters'}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            clearErrors()
            if (fieldErrors.password) {
              setFieldErrors((current) => ({ ...current, password: undefined }))
            }
          }}
          icon={<Lock className="size-4" />}
          error={fieldErrors.password}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        {(formError ?? error) && (
          <p
            role="alert"
            className="animate-shake rounded-xl border-2 border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
          >
            {formError ?? error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner className="size-4" />
              {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
            </>
          ) : mode === 'signin' ? (
            'Sign in'
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </div>
  )
}
