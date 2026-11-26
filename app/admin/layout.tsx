import WorkspaceNav from './_components/WorkspaceNav';
import styles from './workspace.module.css';
export const metadata={robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <div className={styles.frame}><WorkspaceNav/><div className={styles.content}>{children}</div></div>}
