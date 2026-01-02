'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import styles from './ClientLayout.module.css';

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Pages where sidebar should NOT appear
const EXCLUDE_SIDEBAR_PATHS = ['/', '/login', '/signup', '/teacher'];

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Check if we should show sidebar
  const showSidebar = !EXCLUDE_SIDEBAR_PATHS.includes(pathname);

  return (
    <div className={styles.layoutWrapper}>
      {showSidebar && <Sidebar />}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
