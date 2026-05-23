export interface PageTemplate {
  id: string
  name: string
  icon: string
  description: string
  defaultTitle: string
  content: object
}

function p(text?: string) {
  return text
    ? { type: 'paragraph', content: [{ type: 'text', text }] }
    : { type: 'paragraph' }
}

function h2(text: string) {
  return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] }
}

function bullet(...items: string[]) {
  return {
    type: 'bulletList',
    content: items.map((text) => ({
      type: 'listItem',
      content: [p(text)],
    })),
  }
}

function tasks(...items: string[]) {
  return {
    type: 'taskList',
    content: items.map((text) => ({
      type: 'taskItem',
      attrs: { checked: false },
      content: [p(text)],
    })),
  }
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Em branco',
    icon: '📄',
    description: 'Página vazia para começar do zero',
    defaultTitle: '',
    content: { type: 'doc', content: [p()] },
  },
  {
    id: 'aula',
    name: 'Aula',
    icon: '🎓',
    description: 'Estrutura para anotar aulas e estudos',
    defaultTitle: 'Aula: ',
    content: {
      type: 'doc',
      content: [
        h2('🎯 Objetivos'),
        bullet('O que vou aprender hoje?'),
        p(),
        h2('📝 Anotações'),
        p('Conteúdo principal da aula…'),
        p(),
        h2('❓ Dúvidas'),
        bullet('Dúvida 1'),
        p(),
        h2('💡 Resumo'),
        p('Principais pontos aprendidos…'),
      ],
    },
  },
  {
    id: 'projeto',
    name: 'Projeto',
    icon: '🚀',
    description: 'Planejamento e documentação de projeto',
    defaultTitle: 'Projeto: ',
    content: {
      type: 'doc',
      content: [
        h2('📌 Descrição'),
        p('O que é este projeto e qual problema resolve?'),
        p(),
        h2('🛠️ Tecnologias'),
        bullet('Tecnologia 1', 'Tecnologia 2'),
        p(),
        h2('✅ Tarefas'),
        tasks('Tarefa 1', 'Tarefa 2', 'Tarefa 3'),
        p(),
        h2('🔗 Links úteis'),
        bullet('Documentação', 'Repositório'),
      ],
    },
  },
  {
    id: 'codigo',
    name: 'Estudo de Código',
    icon: '💻',
    description: 'Análise e aprendizado de conceitos técnicos',
    defaultTitle: 'Estudo: ',
    content: {
      type: 'doc',
      content: [
        h2('📖 Conceito'),
        p('O que é e para que serve?'),
        p(),
        h2('🧩 Como funciona'),
        p('Explicação do funcionamento…'),
        p(),
        h2('💡 Exemplo de uso'),
        { type: 'codeBlock', attrs: { language: 'typescript' }, content: [{ type: 'text', text: '// Exemplo aqui' }] },
        p(),
        h2('⚠️ Pontos de atenção'),
        bullet('Cuidado com…', 'Não esquecer de…'),
      ],
    },
  },
  {
    id: 'daily',
    name: 'Daily',
    icon: '📅',
    description: 'Registro diário de tarefas e aprendizados',
    defaultTitle: `Daily ${new Date().toLocaleDateString('pt-BR')}`,
    content: {
      type: 'doc',
      content: [
        h2('✅ Tarefas do dia'),
        tasks('Tarefa 1', 'Tarefa 2', 'Tarefa 3'),
        p(),
        h2('📝 Anotações'),
        p(),
        h2('🌱 Aprendi hoje'),
        bullet('Aprendizado 1'),
      ],
    },
  },
]
