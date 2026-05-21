/**
 * StudentLayout.jsx — Shell for all student-facing pages
 */

import StudentNavbar from './StudentNavbar'

export default function StudentLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)' }}>
      <StudentNavbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        {children}
      </main>
    </div>
  )
}
