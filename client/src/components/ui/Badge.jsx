/**
 * Badge.jsx — Status / category badge component
 */

export const STATUS_MAP = {
  Pending:          { className: 'badge--pending',      label: 'Pending'          },
  'Out for delivery':{ className: 'badge--out_delivery', label: 'Out for Delivery' },
  Delivered:        { className: 'badge--delivered',    label: 'Delivered'        },
  Indoor:           { className: 'badge--indoor',       label: 'Indoor'           },
  Outdoor:          { className: 'badge--outdoor',      label: 'Outdoor'          },
}

export default function Badge({ status }) {
  const config = STATUS_MAP[status] ?? { className: '', label: status }
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  )
}
