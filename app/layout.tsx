import './globals.css';
import Link from 'next/link';
import { site } from '@/lib/config';

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  },
  openGraph: { title: site.name, description: site.description, type: 'website', url: site.url, siteName: site.name },
  twitter: { card: 'summary', title: site.name, description: site.description },
  robots: { index: true, follow: true },
  verification: {
    google: 'jofjI846k09NoUuJSxJhukAE5lFXNgHzFxf58rlb4z4'
  }
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="nav"><div className="shell navin"><Link className="brand" href="/">Visibility<span>OS</span></Link><nav className="navlinks" aria-label="Primary navigation"><Link href="/timeline">Timeline</Link><Link href="/topics">Topics</Link><Link href="/evidence">Evidence</Link><Link href="/research">Research</Link><Link href="/search">Search</Link></nav></div></header>
    {children}
    <footer className="footer"><div className="shell">Visibility OS is a living, evidence-backed reference system for AI discovery. Facts, interpretation and uncertainty are kept separate.</div></footer>
  </body></html>
}
