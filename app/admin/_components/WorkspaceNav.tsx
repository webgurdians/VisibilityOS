'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import styles from '../workspace.module.css';
const items=[['Overview','/admin'],['AI readiness audit','/admin/audit-preview'],['Research inbox','/admin/inbox'],['Events','/admin/events'],['Evidence','/admin/evidence'],['Sources','/admin/sources'],['Experiments','/admin/experiments'],['Research gaps','/admin/gaps']];
export default function WorkspaceNav(){const path=usePathname();return <aside className={styles.sidebar}><Link href="/admin" className={styles.brand}>Visibility<span>OS</span></Link><div className={styles.label}>Private workspace</div><nav className={styles.links} aria-label="Admin navigation">{items.map(([label,href])=><Link key={href} href={href} aria-current={(path===href||(href!=='/admin'&&path.startsWith(href+'/')))?'page':undefined}>{label}</Link>)}</nav><div className={styles.bottom}><Link href="/research" className={styles.signout}>Public website ↗</Link><form action="/login/logout" method="post"><button className={styles.signout}>Sign out</button></form></div></aside>}
