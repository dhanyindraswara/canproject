// Small reusable presentational primitives shared across screens, styled to
// match the HoldingOS prototype exactly.

import type { CSSProperties, ReactNode } from 'react'
import { co, stt } from '../theme'

// Stroked line icon — pass one or more SVG path `d` strings.
export function Icon({
  d,
  size = 20,
  stroke = 'currentColor',
  width = 1.8,
  style,
}: {
  d: string | string[]
  size?: number
  stroke?: string
  width?: number
  style?: CSSProperties
}) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

// Small colored company code chip (e.g. KPS / MSN / BCK).
export function CompanyBadge({
  companyId,
  fontSize = 10,
  onClick,
}: {
  companyId: string
  fontSize?: number
  onClick?: () => void
}) {
  const c = co(companyId)
  const style: CSSProperties = {
    fontSize,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 6,
    background: c.bg,
    color: c.color,
    whiteSpace: 'nowrap',
  }
  if (onClick) {
    return (
      <button onClick={onClick} style={{ ...style, cursor: 'pointer' }}>
        {c.short}
      </button>
    )
  }
  return <span style={style}>{c.short}</span>
}

// Rounded status pill using the shared status color map.
export function StatusBadge({ status }: { status: string }) {
  const s = stt(status)
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 20,
        background: s.bg,
        color: s.c,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  )
}

// Eyebrow label + page title used at the top of most screens.
export function PageHeading({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string
  title: ReactNode
  right?: ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#1E3A8A',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
          }}
        >
          {eyebrow}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>
          {title}
        </h1>
      </div>
      {right}
    </div>
  )
}

// Thin progress bar (used in tables and detail panels).
export function ProgressBar({
  value,
  height = 7,
  showLabel = true,
  track = '#EEF2F6',
  fill = '#1E3A8A',
  flex,
}: {
  value: number
  height?: number
  showLabel?: boolean
  track?: string
  fill?: string
  flex?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex }}>
      <div
        style={{
          flex: 1,
          height,
          background: track,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${value}%`, height: '100%', background: fill, borderRadius: 6 }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 800, color: '#334155' }}>{value}%</span>
      )}
    </div>
  )
}

// Reusable underline tab strip.
export interface TabDef {
  key: string
  label: string
}

export function Tabs({
  tabs,
  active,
  onChange,
  wrap = false,
  fontSize = 13.5,
  padding = '11px 16px',
  marginBottom,
}: {
  tabs: TabDef[]
  active: string
  onChange: (key: string) => void
  wrap?: boolean
  fontSize?: number
  padding?: string
  marginBottom?: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        borderBottom: '1px solid #E2E8F0',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        marginBottom,
      }}
    >
      {tabs.map((t) => {
        const on = active === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              padding,
              fontSize,
              fontWeight: on ? 700 : 600,
              color: on ? '#1E3A8A' : '#64748B',
              borderBottom: `2px solid ${on ? '#1E3A8A' : 'transparent'}`,
              background: 'none',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// Search input used in table toolbars.
export function SearchInput({
  value,
  onChange,
  placeholder,
  width = 280,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  width?: number | string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 12px',
        background: '#F1F5F9',
        borderRadius: 10,
        width,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#0F172A' }}
      />
    </div>
  )
}
