import Link from 'next/link';

const items = [
  ['Overview','/admin'], ['Inbox','/admin/inbox'], ['Events','/admin/events'],
  ['Evidence','/admin/evidence'], ['Sources','/admin/sources'], ['Experiments','/admin/experiments'],
  ['Research gaps','/admin/gaps'],
];

export default function AdminNav() {
  return <nav aria-label="Research Console" style={{display:'flex',gap:'.55rem',flexWrap:'wrap',margin:'0 0 2rem'}}>
    {items.map(([label,href]) => <Link key={href} href={href} className="pill">{label}</Link>)}
    <Link href="/research" className="pill">Public site ↗</Link>
  </nav>;
}
