// src/components/cart/CartCheckout.tsx
'use client'

import { fbqTrack } from '@/lib/fb' // ⬅️ fbq утилита
import { useCart } from '@/store/cart'
import { lineTotalFor } from '@/utils/cartPricing'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export default function CartCheckout({ onSuccess }: { onSuccess?: () => void }) {
  const { items, clear } = useCart()
  const subtotal = useMemo(() => items.reduce((s, it) => s + lineTotalFor(it), 0), [items])

  const [firstName, setFirst] = useState('')
  const [lastName, setLast] = useState('')
  const [phone, setPhone] = useState('+380')
  const [city, setCity] = useState('')
  const [branch, setBranch] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<null | 'ok' | 'err'>(null)

  const checkout = async () => {
    const valid =
      firstName.trim() &&
      lastName.trim() &&
      city.trim() &&
      branch.trim() &&
      /^\+?\d[\d\s-]{8,}$/.test(phone.trim())
    if (!valid) {
      setSent('err')
      return
    }

    try {
      setSending(true)

      // ⬇️ fbq: InitiateCheckout — фиксируем начало оформления
      fbqTrack('InitiateCheckout', {
        num_items: items.reduce((n, it) => n + it.qty, 0),
        value: subtotal,
        currency: 'UAH',
        contents: items.map(it => ({
          id: it.id,
          quantity: it.qty,
          item_price: lineTotalFor(it) / Math.max(1, it.qty)
        })),
        content_type: 'product'
      })

      const payloadItems = items.map(it => ({
        id: it.id,
        title: it.title,
        qty: it.qty,
        lineTotal: lineTotalFor(it),
        image: it.image,
        variant: it.variant,
        type: it.type
      }))

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
          source: typeof window !== 'undefined' ? window.location.href : undefined
        })
      })

      if (!res.ok) throw new Error('bad')

      // ⬇️ fbq: Purchase — отправляем после успешного ответа API
      fbqTrack('Purchase', {
        value: subtotal,
        currency: 'UAH',
        contents: items.map(it => ({
          id: it.id,
          quantity: it.qty,
          item_price: lineTotalFor(it) / Math.max(1, it.qty)
        })),
        content_type: 'product'
      })

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
      if (sent !== 'ok') setTimeout(() => setSent(null), 1800)
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
            component={Link}
            href="/"
            sx={{
              order: { xs: 2, sm: 1 },
              alignSelf: { xs: 'stretch', sm: 'auto' }
            }}
          >
            Продовжити покупки
          </Button>
          <Button
            variant="contained"
            onClick={checkout}
            disabled={items.length === 0 || sending}
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
          >
            Оформити
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
