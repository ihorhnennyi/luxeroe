'use client'

import { operatorPrefixes } from '@/constants/operatorPrefixes'
import { sendToTelegram } from '@/utils/telegram'
import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'

interface FeedbackFormProps {
	isMobile: boolean
}

const FeedbackForm = ({ isMobile }: FeedbackFormProps) => {
	const [form, setForm] = useState({ name: '', phone: '' })
	const [isSent, setIsSent] = useState(false)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await sendToTelegram(form.name, form.phone)
		setIsSent(true)
		setForm({ name: '', phone: '' })
	}

	return (
		<Box
			component='form'
			onSubmit={handleSubmit}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				width: isMobile ? '100%' : 300,
				textAlign: 'center',
			}}
		>
			<Typography variant='h6' sx={{ color: '#fff', fontWeight: 'bold' }}>
				Зворотній зв'язок
			</Typography>

			<TextField
				name='name'
				label="Ім'я"
				variant='outlined'
				size='small'
				value={form.name}
				onChange={handleChange}
				required
				fullWidth
				InputLabelProps={{ style: { color: '#ccc' } }}
				InputProps={{ style: { color: '#fff' } }}
			/>

			<TextField
				name='phone'
				label='Телефон'
				variant='outlined'
				size='small'
				value={form.phone}
				onChange={handleChange}
				required
				fullWidth
				inputProps={{
					pattern: `\\+380(${
						Array.isArray(operatorPrefixes) ? operatorPrefixes.join('|') : ''
					})\\d{7}`,
				}}
				InputLabelProps={{ style: { color: '#ccc' } }}
				InputProps={{ style: { color: '#fff' } }}
			/>

			<Button
				type='submit'
				variant='contained'
				sx={{ mt: 1, background: '#f03', '&:hover': { background: '#c02' } }}
				disabled={isSent}
			>
				{isSent ? 'Відправлено!' : 'Відправити'}
			</Button>
		</Box>
	)
}

export default FeedbackForm
