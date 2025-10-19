'use client'
import dynamic from 'next/dynamic'

const InstagramSectionNoSSR = dynamic(() => import('./InstagramSection'), { ssr: false })

export default InstagramSectionNoSSR
