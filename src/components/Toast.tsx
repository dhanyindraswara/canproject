// Transient bottom-center toast for demo actions (Buat BAPP, Stock In/Out, …).

import { useApp } from '../store'

export default function Toast() {
  const { state } = useApp()
  if (!state.toast) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#0F172A',
        color: '#fff',
        padding: '13px 20px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 20px 50px -15px rgba(2,6,23,.5)',
        zIndex: 60,
        animation: 'slideDown .2s ease',
      }}
    >
      {state.toast}
    </div>
  )
}
