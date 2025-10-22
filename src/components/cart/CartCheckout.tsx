// src/components/cart/CartCheckout.tsx
'use client'

import { fbqTrack } from '@/lib/fb'
import { useCart } from '@/store/cart'
import { lineTotalFor } from '@/utils/cartPricing'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

/* ───────── constants & helpers ───────── */
const PAYMENT_METHOD = 'cod' as const

const genEventId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`

const phoneOk = (raw: string) => /^\+?\d[\d\s-]{8,}$/.test(raw.trim())

async function safeJsonPost(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin'
  })
  if (!res.ok) {
    let details = ''
    try {
      details = await res.text()
    } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${details ? ` — ${details}` : ''}`)
  }
  try {
    return await res.json()
  } catch {
    return null
  }
}

type Stage = 'idle' | 'sending' | 'done' | 'error'

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: any) => void
      reset?: (widgetId?: string) => void
    }
  }
}

function genNonce() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

/* ───────── component ───────── */
export default function CartCheckout({ onSuccess }: { onSuccess?: () => void }) {
  const searchParams = useSearchParams()
  const { items, clear } = useCart()

  const [firstName, setFirst] = useState('')
  const [lastName, setLast] = useState('')
  const [phone, setPhone] = useState('+380')
  const [city, setCity] = useState('')
  const [branch, setBranch] = useState('')
  const [note, setNote] = useState('')

  // honeypot — невидимое поле (боты часто его заполняют)
  const [hpCompany, setHpCompany] = useState('')

  // Turnstile token (если подключён скрипт + есть sitekey)
  const [cfToken, setCfToken] = useState<string | null>(null)
  const turnstileHostRef = useRef<HTMLDivElement | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY

  // стадия и ошибки
  const [stage, setStage] = useState<Stage>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  // чтобы не отправили повторно «двойным» кликом/тапом
  const sendingRef = useRef(false)

  // таймер заполнения формы — включается при первом вводе
  const formStartRef = useRef<number | null>(null)
  const touchForm = () => {
    if (!formStartRef.current) formStartRef.current = Date.now()
  }

  const subtotal = useMemo(() => items.reduce((s, it) => s + lineTotalFor(it), 0), [items])

  const pixelContents = useMemo(
    () =>
      items.map(it => {
        const qty = Math.max(1, it.qty)
        const unit = lineTotalFor(it) / qty
        return { id: it.id, quantity: qty, item_price: unit }
      }),
    [items]
  )

  // демо-режим: /cart?demo=ok
  useEffect(() => {
    if (searchParams?.get('demo') === 'ok') setStage('done')
  }, [searchParams])

  // Рендер Turnstile (если ключ задан и скрипт подключён в layout)
  useEffect(() => {
    if (!siteKey) return
    const mount = () => {
      if (window.turnstile && turnstileHostRef.current) {
        window.turnstile.render(turnstileHostRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setCfToken(token),
          'error-callback': () => setCfToken(null),
          'expired-callback': () => setCfToken(null),
          size: 'invisible'
        })
      }
    }
    mount()
  }, [siteKey])

  const disabled = stage === 'sending'
  const canSubmit =
    !disabled &&
    items.length > 0 &&
    firstName.trim() &&
    lastName.trim() &&
    city.trim() &&
    branch.trim() &&
    phoneOk(phone)

  const normalize = (str: string) => str.replace(/\s+/g, ' ').trim()

  const submit = async () => {
    if (!canSubmit || sendingRef.current) return
    setErrMsg(null)

    // простейшая антибот-логика: если honeypot заполнен — откажем локально
    if (hpCompany.trim()) {
      setErrMsg('Помилка оформлення. Спробуйте ще раз.')
      setStage('error')
      return
    }

    try {
      sendingRef.current = true
      setStage('sending')

      const eventId = genEventId()

      // pixel: InitiateCheckout
      try {
        fbqTrack('InitiateCheckout', {
          event_id: eventId,
          value: subtotal,
          currency: 'UAH',
          num_items: items.reduce((n, it) => n + it.qty, 0),
          contents: pixelContents,
          content_type: 'product'
        })
      } catch {}

      const payloadItems = items.map(it => ({
        id: it.id,
        title: it.title,
        qty: it.qty,
        lineTotal: lineTotalFor(it),
        image: it.image,
        variant: it.variant,
        type: it.type
      }))

      const formMs =
        typeof window !== 'undefined' && formStartRef.current
          ? Date.now() - formStartRef.current
          : undefined

      // одноразовый nonce (double-submit cookie)
      const nonce = genNonce()
      document.cookie = `lr_nonce=${nonce}; Max-Age=600; Path=/; SameSite=Lax; Secure`

      await safeJsonPost('/api/order', {
        customer: {
          firstName: normalize(firstName),
          lastName: normalize(lastName),
          phone: phone.trim(),
          city: normalize(city),
          branch: normalize(branch)
        },
        paymentMethod: PAYMENT_METHOD,
        note: note.trim() || undefined,
        items: payloadItems,
        subtotal,
        source: typeof window !== 'undefined' ? window.location.href : undefined,
        eventId,
        antiSpam: {
          hpCompany,
          formMs,
          nonce,
          cfToken: cfToken || undefined
        }
      })

      // pixel: Purchase (анти-дубль по eventId)
      try {
        const key = 'fb:last_purchase_id'
        const last = sessionStorage.getItem(key)
        if (last !== eventId) {
          fbqTrack('Purchase', {
            event_id: eventId,
            value: subtotal,
            currency: 'UAH',
            contents: pixelContents,
            content_type: 'product'
          })
          sessionStorage.setItem(key, eventId)
        }
      } catch {}

      // успех
      onSuccess?.()
      clear()
      setFirst('')
      setLast('')
      setPhone('+380')
      setCity('')
      setBranch('')
      setNote('')
      setHpCompany('')
      setCfToken(null)
      formStartRef.current = null
      setStage('done')
    } catch (e: any) {
      setErrMsg('Помилка оформлення. Перевірте поля та спробуйте ще раз.')
      setStage('error')
    } finally {
      sendingRef.current = false
    }
  }

  const onKeyDownSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit) {
      e.preventDefault()
      submit()
    }
  }

  /* ───────── UI ───────── */

  if (stage === 'done') {
    return (
      <Box
        sx={{
          mt: 3,
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          textAlign: 'center'
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 48, color: '#2DAF92', mb: 1 }} />
        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
          Замовлення прийнято!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Дякуємо, що обрали <b>LuxeRoe</b>! 💛 Ваше замовлення успішно оформлене і вже передане в
          обробку. Наш менеджер зв’яжеться з вами найближчим часом для підтвердження деталей
          доставки. <br /> Оплата — <b>накладений платіж</b>. Після відправки ви отримаєте SMS/Viber
          з номером ТТН. Відправлення — щодня до 15:00.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
          <Button component={Link as any} href="/" variant="contained">
            На головну
          </Button>
          <Button component={Link as any} href="/" sx={{ fontWeight: 700 }}>
            Продовжити покупки
          </Button>
        </Stack>
      </Box>
    )
  }

  const cta = stage === 'sending' ? 'Надсилання…' : 'Оформити'

  return (
    <Box
      sx={{
        mt: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        opacity: stage === 'sending' ? 0.95 : 1,
        position: 'relative'
      }}
      onKeyDown={onKeyDownSubmit}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
        <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 15 } }}>
          Разом
        </Typography>
        <Typography fontWeight={900} sx={{ fontSize: { xs: 18, sm: 20 } }}>
          {subtotal.toLocaleString('uk-UA')} ₴
        </Typography>
      </Stack>

      <Alert
        icon={false}
        severity="success"
        sx={{ mb: 2, fontWeight: 700, '& .MuiAlert-message': { width: '100%' } }}
      >
        Оплата: <b>Накладений платіж</b> — сплачуєте при отриманні на Новій пошті.
      </Alert>

      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            label="Ім’я"
            value={firstName}
            onChange={e => {
              touchForm()
              setFirst(e.target.value)
            }}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ autoComplete: 'given-name', name: 'firstName' }}
            disabled={disabled}
          />
          <TextField
            label="Прізвище"
            value={lastName}
            onChange={e => {
              touchForm()
              setLast(e.target.value)
            }}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ autoComplete: 'family-name', name: 'lastName' }}
            disabled={disabled}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            label="Телефон"
            value={phone}
            onChange={e => {
              touchForm()
              setPhone(e.target.value)
            }}
            inputMode="tel"
            placeholder="+380"
            fullWidth
            size="small"
            required
            error={!!phone && !phoneOk(phone)}
            helperText={!!phone && !phoneOk(phone) ? 'Перевірте формат телефону' : ' '}
            FormHelperTextProps={{ sx: { m: 0 } }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ autoComplete: 'tel', enterKeyHint: 'next', name: 'phone' }}
            disabled={disabled}
          />
          <TextField
            label="Місто"
            value={city}
            onChange={e => {
              touchForm()
              setCity(e.target.value)
            }}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ autoComplete: 'address-level2', name: 'city' }}
            disabled={disabled}
          />
        </Stack>

        <TextField
          label="Відділення Нової пошти"
          value={branch}
          onChange={e => {
            touchForm()
            setBranch(e.target.value)
          }}
          placeholder="Наприклад: Відділення №6"
          fullWidth
          size="small"
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ name: 'branch' }}
          disabled={disabled}
        />

        <TextField
          label="Коментар до замовлення (необов’язково)"
          value={note}
          onChange={e => {
            touchForm()
            setNote(e.target.value)
          }}
          multiline
          minRows={2}
          InputLabelProps={{ shrink: true }}
          inputProps={{ name: 'note' }}
          disabled={disabled}
        />

        {/* Honeypot — полностью невидимое поле для ботов */}
        <TextField
          label="Компанія"
          value={hpCompany}
          onChange={e => setHpCompany(e.target.value)}
          inputProps={{
            name: 'company',
            autoComplete: 'off',
            tabIndex: -1,
            'aria-hidden': 'true'
          }}
          sx={{
            position: 'absolute',
            left: -99999,
            top: 'auto',
            width: 1,
            height: 1,
            p: 0,
            m: 0,
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden'
          }}
        />

        {/* Turnstile контейнер (невидимый, если используется) */}
        {siteKey ? (
          <div
            ref={turnstileHostRef}
            id="cf-turnstile"
            style={{ position: 'absolute', left: -99999, width: 1, height: 1, overflow: 'hidden' }}
            aria-hidden="true"
          />
        ) : null}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          sx={{ pt: 0.5 }}
        >
          <Button
            component={Link as any}
            href="/"
            sx={{ order: { xs: 2, sm: 1 }, alignSelf: { xs: 'stretch', sm: 'auto' } }}
            disabled={disabled}
          >
            Продовжити покупки
          </Button>

          <Button
            variant="contained"
            onClick={submit}
            disabled={!canSubmit}
            sx={{
              order: { xs: 1, sm: 2 },
              fontWeight: 900,
              borderRadius: 2,
              py: { xs: 1, sm: 1.1 },
              background: 'linear-gradient(180deg, #F2C14E 0%, #E08E45 55%, #B75C36 100%)',
              '&:hover': {
                background: 'linear-gradient(180deg, #EFB547 0%, #DB7F3F 55%, #A6512F 100%)'
              }
            }}
            fullWidth
            aria-busy={disabled ? 'true' : undefined}
          >
            {cta}
          </Button>
        </Stack>

        {(stage === 'error' || errMsg) && (
          <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
            {errMsg || 'Помилка оформлення. Спробуйте ще раз.'}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
