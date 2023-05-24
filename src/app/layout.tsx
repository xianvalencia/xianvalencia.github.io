import { Montserrat, Mulish } from 'next/font/google'
import './globals.scss'

const montserrat = Montserrat({
  weight: ['400', '500', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})
const mulish = Mulish({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mulish',
})

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${mulish.variable}`}>
      <body className="bg-slate-700">{children}</body>
    </html>
  )
}
