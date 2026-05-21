/**
 * StatCard.jsx — Dashboard KPI card
 */

export default function StatCard({ label, value, icon: Icon, color = 'var(--clr-primary)' }) {
  return (
    <div className="glass-card stat-card slide-up">
      <div className="stat-card__icon" style={{ background: `${color}22` }}>
        <Icon size={20} color={color} />
      </div>
      <div className="stat-card__value">{value ?? '—'}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}
