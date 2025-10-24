'use client'

import { fbqTrack } from '@/lib/fb'
import { useCart } from '@/store/cart'
import { lineTotalFor } from '@/utils/cartPricing'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { Alert, Box, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import ContactFields from './checkout/ContactFields'
import DeliveryFields from './checkout/DeliveryFields'
import HoneypotField from './checkout/HoneypotField'
import NotesField from './checkout/NotesField'
import SubmitBar from './checkout/SubmitBar'
import SummaryRow from './checkout/SummaryRow'

const PAYMENT_METHOD = 'cod' as const
const phoneOk = (raw: string) => /^\+?\d[\d\s-]{8,}$/.test(raw.trim())

async function safeJsonPost(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin'
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  try {
    return await res.json()
  } catch {
    return null
  }
}
const genEventId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`

type Stage = 'idle' | 'sending' | 'done' | 'error'

export default function CartCheckout({ onSuccess }: { onSuccess?: () => void }) {
  const searchParams = useSearchParams()
  const { items, clear } = useCart()

  const [firstName, setFirst] = useState('')
  const [lastName, setLast] = useState('')
  const [phone, setPhone] = useState('+380')
  const [city, setCity] = useState('')
  const [branch, setBranch] = useState('')
  const [note, setNote] = useState('')

  const [hpCompany, setHpCompany] = useState('')

  const [stage, setStage] = useState<Stage>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const sendingRef = useRef(false)

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

  useEffect(() => {
    if (searchParams?.get('demo') === 'ok') setStage('done')
  }, [searchParams])

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
        antiSpam: { hpCompany }
      })

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

      onSuccess?.()
      clear()
      setFirst('')
      setLast('')
      setPhone('+380')
      setCity('')
      setBranch('')
      setNote('')
      setHpCompany('')
      formStartRef.current = null
      setStage('done')
    } catch {
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
          Дякуємо, що обрали <b>LuxeRoe</b>! 💛 Наш менеджер зв’яжеться для підтвердження. Оплата —{' '}
          <b>накладений платіж</b>. Після відправки буде SMS/Viber з ТТН.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
          <Link href="/" passHref legacyBehavior>
            <a className="MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root">
              На головну
            </a>
          </Link>
          <Link href="/" passHref legacyBehavior>
            <a
              className="MuiButton-root MuiButton-text MuiButton-sizeMedium MuiButton-textSizeMedium MuiButtonBase-root"
              style={{ fontWeight: 700 }}
            >
              Продовжити покупки
            </a>
          </Link>
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
      <SummaryRow subtotal={subtotal} />

      <Alert
        icon={false}
        severity="success"
        sx={{ mb: 2, fontWeight: 700, '& .MuiAlert-message': { width: '100%' } }}
      >
        Оплата: <b>Накладений платіж</b> — сплачуєте при отриманні на Новій пошті.
      </Alert>

      <Stack spacing={1.25}>
        <ContactFields
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          setFirst={setFirst}
          setLast={setLast}
          setPhone={setPhone}
          disabled={stage === 'sending'}
          phoneOk={phoneOk}
          touchForm={touchForm}
        />

        <DeliveryFields
          city={city}
          branch={branch}
          setCity={setCity}
          setBranch={setBranch}
          disabled={stage === 'sending'}
          touchForm={touchForm}
        />

        <NotesField
          note={note}
          setNote={setNote}
          disabled={stage === 'sending'}
          touchForm={touchForm}
        />

        <HoneypotField hpCompany={hpCompany} setHpCompany={setHpCompany} />

        <SubmitBar
          canSubmit={!!canSubmit}
          disabled={stage === 'sending'}
          onSubmit={submit}
          cta={cta}
        />

        {(stage === 'error' || errMsg) && (
          <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
            {errMsg || 'Помилка оформлення. Спробуйте ще раз.'}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
