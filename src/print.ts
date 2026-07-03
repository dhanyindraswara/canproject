// Lightweight "Export to PDF" helper. Rather than pulling in a PDF library
// (which would bloat the bundle), we open a clean, print-styled document in a
// new window and trigger the browser's native print dialog — the user picks
// "Save as PDF". Works fully offline / on GitHub Pages, no dependencies.

export interface PrintRow {
  label: string
  value: string
}

// Renders a simple branded document (letterhead + info rows + optional table)
// and opens the print dialog.
export function printDocument(opts: {
  title: string
  docNo: string
  company: string
  meta: PrintRow[]
  tableTitle?: string
  tableRows?: PrintRow[]
  footnote?: string
}): boolean {
  const win = window.open('', '_blank', 'width=820,height=900')
  if (!win) return false

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const metaHtml = opts.meta
    .map(
      (r) =>
        `<tr><td class="k">${esc(r.label)}</td><td class="v">${esc(r.value)}</td></tr>`,
    )
    .join('')

  const tableHtml = opts.tableRows && opts.tableRows.length
    ? `<h3>${esc(opts.tableTitle || 'Rincian')}</h3>
       <table class="lines"><tbody>${opts.tableRows
         .map((r) => `<tr><td>${esc(r.label)}</td><td class="num">${esc(r.value)}</td></tr>`)
         .join('')}</tbody></table>`
    : ''

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(opts.docNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1E3A8A; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 800; color: #1E3A8A; letter-spacing: -.5px; }
    .brand small { display: block; font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0; margin-top: 2px; }
    .doc { text-align: right; }
    .doc .t { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .doc .n { font-family: ui-monospace, monospace; font-size: 13px; color: #475569; margin-top: 4px; }
    table.meta { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    table.meta td { padding: 8px 0; font-size: 13.5px; border-bottom: 1px solid #eef2f6; }
    td.k { color: #64748b; width: 40%; }
    td.v { font-weight: 700; text-align: right; }
    h3 { font-size: 14px; margin: 26px 0 10px; }
    table.lines { width: 100%; border-collapse: collapse; }
    table.lines td { padding: 10px 12px; font-size: 13.5px; border-bottom: 1px solid #eef2f6; }
    table.lines td.num { text-align: right; font-weight: 700; }
    .foot { margin-top: 40px; font-size: 11.5px; color: #94a3b8; border-top: 1px solid #eef2f6; padding-top: 12px; }
    .sign { margin-top: 60px; display: flex; justify-content: flex-end; }
    .sign .box { text-align: center; font-size: 12.5px; color: #475569; }
    .sign .line { margin-top: 60px; border-top: 1px solid #94a3b8; padding-top: 6px; min-width: 200px; }
    @media print { body { padding: 24px; } .noprint { display: none; } }
  </style></head><body>
    <div class="head">
      <div class="brand">HoldingOS<small>${esc(opts.company)}</small></div>
      <div class="doc"><div class="t">${esc(opts.title)}</div><div class="n">${esc(opts.docNo)}</div></div>
    </div>
    <table class="meta"><tbody>${metaHtml}</tbody></table>
    ${tableHtml}
    <div class="sign"><div class="box">Hormat kami,<div class="line">${esc(opts.company)}</div></div></div>
    <div class="foot">${esc(opts.footnote || 'Dokumen ini dibuat otomatis oleh HoldingOS.')}</div>
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };<\/script>
  </body></html>`)
  win.document.close()
  return true
}
