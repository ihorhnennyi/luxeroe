export type ModalState = { type: 'ok' | 'err'; text: string } | null

export type ConsultSectionProps = {
  title?: string
  subtitle?: string
  submitUrl?: string
  onSuccess?: (payload: { name: string; phone: string }) => void
  onError?: (error?: unknown) => void
}

export type LeadPayload = {
  name: string
  phone: string
  company?: string
}
