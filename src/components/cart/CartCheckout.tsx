// src/components/cart/CartCheckout.tsx
'use client'

import { fbqTrack } from '@/lib/fb'
import { useCart } from '@/store/cart'
import { lineTotalFor } from '@/utils/cartPricing'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useMemo, useState } from 'react'

/** Стабильный event_id для дедупликации пиксель ↔ CAPI */
const genEventId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`

export default function CartCheckout({ onSuccess }: { onSuccess?: () => void }) {
  const { items, clear } = useCart()

  const subtotal = useMemo(() => items.reduce((s, it) => s + lineTotalFor(it), 0), [items])

  /** contents для пикселя (id, количество и unit price) */
  const pixelContents = useMemo(
    () =>
      items.map(it => {
        const qty = Math.max(1, it.qty)
        const unit = lineTotalFor(it) / qty
        return { id: it.id, quantity: qty, item_price: unit }
      }),
    [items]
  )

  const [firstName, setFirst] = useState('')
  const [lastName, setLast] = useState('')
  const [phone, setPhone] = useState('+380')
  const [city, setCity] = useState('')
  const [branch, setBranch] = useState('')
  const [note, setNote] = useState('')

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<null | 'ok' | 'err'>(null)

  const phoneOk = /^\+?\d[\d\s-]{8,}$/.test(phone.trim())
  const canSubmit =
    !sending &&
    items.length > 0 &&
    firstName.trim() &&
    lastName.trim() &&
    city.trim() &&
    branch.trim() &&
    phoneOk

  const checkout = async () => {
    if (!canSubmit) {
      setSent('err')
      return
    }

    try {
      setSending(true)
      const eventId = genEventId()

      // 1) InitiateCheckout — надёжная точка, до вызова API
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

      // 2) Подготовка полезной нагрузки
      const payloadItems = items.map(it => ({
        id: it.id,
        title: it.title,
        qty: it.qty,
        lineTotal: lineTotalFor(it),
        image: it.image,
        variant: it.variant,
        type: it.type
      }))

      // 3) Вызов API. Пробрасываем eventId (для CAPI дедупликации на сервере).
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            branch: branch.trim()
          },
          note: note.trim() || undefined,
          items: payloadItems,
          subtotal,
          source: typeof window !== 'undefined' ? window.location.href : undefined,
          eventId
        })
      })

      if (!res.ok) throw new Error('Bad response')

      // 4) Purchase — только после успешного ответа сервера
      try {
        fbqTrack('Purchase', {
          event_id: eventId,
          value: subtotal,
          currency: 'UAH',
          contents: pixelContents,
          content_type: 'product'
        })
        // Помечаем покупку, чтобы при перезагрузке не было повторного Purchase
        sessionStorage.setItem('fb:last_purchase_id', eventId)
      } catch {}

      // 5) Очистка и уведомление интерфейса
      onSuccess?.()
      clear()
      setFirst('')
      setLast('')
      setPhone('+380')
      setCity('')
      setBranch('')
      setNote('')
      setSent('ok')
    } catch {
      setSent('err')
    } finally {
      setSending(false)
      // аккуратно скрываем статус через небольшую паузу
      setTimeout(() => setSent(null), 1800)
    }
  }

  return (
    <Box
      sx={{
        mt: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        p: { xs: 2, md: 3 }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
        <Typography color="text.secondary" sx={{ fontSize: { xs: 14, sm: 15 } }}>
          Разом
        </Typography>
        <Typography fontWeight={900} sx={{ fontSize: { xs: 18, sm: 20 } }}>
          {subtotal.toLocaleString('uk-UA')} ₴
        </Typography>
      </Stack>

      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            label="Ім’я"
            value={firstName}
            onChange={e => setFirst(e.target.value)}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ autoComplete: 'given-name', name: 'firstName' }}
          />
          <TextField
            label="Прізвище"
            value={lastName}
            onChange={e => setLast(e.target.value)}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ autoComplete: 'family-name', name: 'lastName' }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            label="Телефон"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="+380"
            fullWidth
            size="small"
            required
            error={!!phone && !phoneOk}
            helperText={!!phone && !phoneOk ? 'Перевірте формат телефону' : ' '}
            FormHelperTextProps={{ sx: { m: 0 } }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              autoComplete: 'tel',
              enterKeyHint: 'next',
              name: 'phone'
            }}
          />
          <TextField
            label="Місто"
            value={city}
            onChange={e => setCity(e.target.value)}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{ autoComplete: 'address-level2', name: 'city' }}
          />
        </Stack>

        <TextField
          label="Відділення Нової пошти"
          value={branch}
          onChange={e => setBranch(e.target.value)}
          placeholder="Наприклад: Відділення №6"
          fullWidth
          size="small"
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ name: 'branch' }}
        />

        <TextField
          label="Коментар до замовлення (необов’язково)"
          value={note}
          onChange={e => setNote(e.target.value)}
          multiline
          minRows={2}
          InputLabelProps={{ shrink: true }}
          inputProps={{ name: 'note' }}
        />

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
          >
            Продовжити покупки
          </Button>

          <Button
            variant="contained"
            onClick={checkout}
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
            aria-busy={sending ? 'true' : undefined}
          >
            {sending ? 'Надсилання…' : 'Оформити'}
          </Button>
        </Stack>

        {sent === 'err' && (
          <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
            Перевірте поля та спробуйте ще раз.
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
