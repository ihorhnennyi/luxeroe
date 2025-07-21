export const scrollToElement = (id: string) => {
	const el = document.getElementById(id)
	if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export const scrollToAnchor = (id: string) => {
	const el = document.getElementById(id)
	if (el) el.scrollIntoView({ behavior: 'smooth' })
}
