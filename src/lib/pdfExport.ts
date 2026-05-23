export function exportAsPdf(title: string, html: string) {
  const win = window.open('', '_blank')
  if (!win) return

  const safeTitle = title || 'Sem título'

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 15px;
      line-height: 1.8;
      color: #1c1917;
      max-width: 720px;
      margin: 48px auto;
      padding: 0 24px;
    }
    h1.page-title {
      font-size: 2.2rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 2rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e2e8f0;
    }
    h1, h2, h3 { font-family: ui-sans-serif, system-ui, sans-serif; font-weight: 600; }
    h1 { font-size: 1.8rem; margin-top: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; margin-top: 1.75rem; margin-bottom: 0.4rem; }
    h3 { font-size: 1.15rem; margin-top: 1.5rem; margin-bottom: 0.3rem; }
    p { margin: 0.6rem 0; }
    ul, ol { padding-left: 1.75rem; margin: 0.5rem 0; }
    li { margin: 0.2rem 0; }
    li > p { margin: 0; }
    ul[data-type="taskList"] { list-style: none; padding-left: 0; }
    ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
    ul[data-type="taskList"] li > label { flex-shrink: 0; }
    ul[data-type="taskList"] li[data-checked="true"] > div { text-decoration: line-through; opacity: 0.5; }
    blockquote {
      border-left: 3px solid #0891b2;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #78716c;
      font-style: italic;
    }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.75rem 0; }
    code {
      font-family: ui-monospace, 'Cascadia Code', monospace;
      font-size: 0.875em;
      background: #f1f5f9;
      color: #0891b2;
      padding: 0.15em 0.4em;
      border-radius: 4px;
    }
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1.25rem 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    pre code { background: none; color: inherit; padding: 0; }
    a { color: #0891b2; text-decoration: underline; text-underline-offset: 2px; }
    img { max-width: 100%; border-radius: 6px; margin: 0.75rem 0; }
    [data-type="callout"] {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      background: #f8fafc;
    }
    @media print {
      body { margin: 0; padding: 0; }
      @page { margin: 2.5cm 2cm; size: A4; }
      h1, h2, h3 { page-break-after: avoid; }
      pre, blockquote, img { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1 class="page-title">${safeTitle}</h1>
  ${html}
  <script>window.onload = () => { window.focus(); window.print(); }<\/script>
</body>
</html>`)

  win.document.close()
}
