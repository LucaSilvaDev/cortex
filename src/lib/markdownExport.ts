import type { JSONContent } from '@tiptap/core'

function marks(text: string, nodeMarks?: JSONContent['marks']): string {
  if (!nodeMarks?.length) return text
  let out = text
  for (const m of nodeMarks) {
    if (m.type === 'bold') out = `**${out}**`
    if (m.type === 'italic') out = `_${out}_`
    if (m.type === 'code') out = `\`${out}\``
    if (m.type === 'strike') out = `~~${out}~~`
    if (m.type === 'link') out = `[${out}](${m.attrs?.href ?? ''})`
  }
  return out
}

function inlineContent(nodes?: JSONContent[]): string {
  if (!nodes?.length) return ''
  return nodes
    .map((n) => {
      if (n.type === 'text') return marks(n.text ?? '', n.marks)
      if (n.type === 'hardBreak') return '  \n'
      if (n.type === 'wikiLink') return `[[${n.attrs?.label ?? ''}]]`
      return ''
    })
    .join('')
}

function listItem(node: JSONContent, prefix: string): string {
  const lines = (node.content ?? []).flatMap((child) => {
    if (child.type === 'paragraph') return [prefix + inlineContent(child.content)]
    if (child.type === 'bulletList') return toMd(child).split('\n').map((l) => '  ' + l)
    if (child.type === 'orderedList') return toMd(child).split('\n').map((l) => '  ' + l)
    return [prefix + toMd(child)]
  })
  return lines.join('\n')
}

export function toMd(node: JSONContent): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(toMd).filter(Boolean).join('\n\n')

    case 'paragraph':
      return inlineContent(node.content)

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1
      return '#'.repeat(level) + ' ' + inlineContent(node.content)
    }

    case 'bulletList':
      return (node.content ?? []).map((item) => listItem(item, '- ')).join('\n')

    case 'orderedList':
      return (node.content ?? [])
        .map((item, i) => listItem(item, `${i + 1}. `))
        .join('\n')

    case 'taskList':
      return (node.content ?? [])
        .map((item) => listItem(item, item.attrs?.checked ? '- [x] ' : '- [ ] '))
        .join('\n')

    case 'blockquote':
      return (node.content ?? [])
        .map(toMd)
        .join('\n')
        .split('\n')
        .map((l) => '> ' + l)
        .join('\n')

    case 'horizontalRule':
      return '---'

    case 'codeBlock':
      return '```' + (node.attrs?.language ?? '') + '\n' + (node.attrs?.code ?? '') + '\n```'

    case 'mermaidBlock':
      return '```mermaid\n' + (node.attrs?.code ?? '') + '\n```'

    case 'imageBlock': {
      const alt = (node.attrs?.alt as string) ?? ''
      const src = (node.attrs?.src as string) ?? ''
      return `![${alt}](${src})`
    }

    case 'callout': {
      const type = ((node.attrs?.type as string) ?? 'info').toUpperCase()
      const body = (node.content ?? []).map(toMd).join('\n')
      return `> [!${type}]\n` + body.split('\n').map((l) => '> ' + l).join('\n')
    }

    case 'flashcardBlock':
      return (
        `> **Flashcard**\n` +
        `> **Q:** ${node.attrs?.front ?? ''}\n` +
        `> **A:** ${node.attrs?.back ?? ''}`
      )

    default:
      return inlineContent(node.content)
  }
}

export function exportAsMarkdown(title: string, contentJson: string) {
  let doc: JSONContent
  try {
    doc = JSON.parse(contentJson) as JSONContent
  } catch {
    doc = { type: 'doc', content: [] }
  }

  const body = toMd(doc)
  const md = `# ${title}\n\n${body}`

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-zA-Z0-9À-ÿ ]/g, '').trim() || 'nota'}.md`
  a.click()
  URL.revokeObjectURL(url)
}
