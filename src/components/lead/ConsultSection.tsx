'use client'

import { Box, Container, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import ConsultForm from './ConsultForm'
import ConsultModal from './ConsultModal'
import type { ConsultSectionProps, ModalState } from './types'
import { isValidName, isValidPhone, normalizePhone, postLead } from './utils'

export default function ConsultSection({
  title = 'Потребуєте консультації?',
  subtitle = 'Залиште свої контакти — ми зв’яжемося з вами найближчим часом.',
  submitUrl = '/api/lead',
  onSuccess,
  onError
}: ConsultSectionProps) {
  const [sending, setSending] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)

  const russet = '#B75C36'
  const closeModal = () => setModal(null)

  // авто-закрытие и Esc
  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeModal()
    document.addEventListener('keydown', onKey)
    const id = setTimeout(closeModal, 2500)
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(id)
    }
  }, [modal])

  // возвращаем true/false — форма решает, очищать ли поля
  const handleSubmit = async (form: { name: string; phone: string; company?: string }) => {
    if (sending) return false // защита от даблкликов
    // honeypot — если заполнен, делаем вид, что всё ок, но ничего не отправляем
    if (form.company && form.company.trim().length > 0) return true

    const name = form.name.trim()
    const phone = normalizePhone(form.phone.trim())
    const valid = isValidName(name) && isValidPhone(phone)

    if (!valid) {
      setModal({ type: 'err', text: 'Заповніть коректно поля та повторіть спробу.' })
      return false
    }

    try {
      setSending(true)
      await postLead(submitUrl, { name, phone })
      setModal({ type: 'ok', text: 'Ми скоро з вами зв’яжемося.' })
      onSuccess?.({ name, phone })

      // window.gtag?.('event', 'lead_submit', { method: 'consult_section' })
      return true
    } catch (e) {
      setModal({ type: 'err', text: 'Сталася помилка. Спробуйте ще раз.' })
      onError?.(e)
      return false
    } finally {
      setSending(false)
    }
  }

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 10 },
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ textAlign: 'center' }}>
          <Typography
            component="h2"
            variant="h4"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.4,
              color: russet,
              fontSize: { xs: 22, sm: 26, md: 32 },
              lineHeight: { xs: 1.2, md: 1.15 }
            }}
          >
            {title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mx: 'auto', maxWidth: 560, fontSize: { xs: 14, sm: 15.5 } }}
          >
            {subtitle}
          </Typography>

          <ConsultForm sending={sending} onSubmit={handleSubmit} />
        </Stack>
      </Container>

      <ConsultModal modal={modal} onClose={closeModal} />
    </Box>
  )
}
