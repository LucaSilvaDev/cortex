export interface DevTip {
  category: string
  color: string
  tip: string
  code?: string
}

export const DEV_TIPS: DevTip[] = [
  // ── Git ──────────────────────────────────────────────────────────────
  {
    category: 'Git',
    color: '#f97316',
    tip: 'Use `git stash` para guardar mudanças temporariamente sem fazer commit. Depois `git stash pop` para restaurar.',
    code: 'git stash\ngit stash pop',
  },
  {
    category: 'Git',
    color: '#f97316',
    tip: '`git log --oneline --graph` exibe o histórico de commits em forma de grafo visual direto no terminal.',
    code: 'git log --oneline --graph --all',
  },
  {
    category: 'Git',
    color: '#f97316',
    tip: 'Para desfazer o último commit sem perder as alterações, use `git reset --soft HEAD~1`.',
    code: 'git reset --soft HEAD~1',
  },
  {
    category: 'Git',
    color: '#f97316',
    tip: '`git bisect` usa busca binária para encontrar qual commit introduziu um bug.',
    code: 'git bisect start\ngit bisect bad\ngit bisect good <commit>',
  },
  {
    category: 'Git',
    color: '#f97316',
    tip: 'Configure aliases no Git para comandos frequentes. `git st` ao invés de `git status` economiza tempo.',
    code: 'git config --global alias.st status\ngit config --global alias.lg "log --oneline --graph"',
  },
  {
    category: 'Git',
    color: '#f97316',
    tip: '`git cherry-pick <hash>` aplica um commit específico de outra branch na branch atual.',
    code: 'git cherry-pick a1b2c3d',
  },

  // ── JavaScript ───────────────────────────────────────────────────────
  {
    category: 'JavaScript',
    color: '#eab308',
    tip: 'Use optional chaining `?.` para acessar propriedades de objetos que podem ser null ou undefined sem erros.',
    code: 'const city = user?.address?.city ?? "Desconhecida"',
  },
  {
    category: 'JavaScript',
    color: '#eab308',
    tip: '`structuredClone()` é a forma nativa de fazer deep copy de objetos em JavaScript moderno.',
    code: 'const copy = structuredClone(originalObject)',
  },
  {
    category: 'JavaScript',
    color: '#eab308',
    tip: 'Use `Promise.allSettled()` quando quiser esperar todas as promises, mesmo as que falharem.',
    code: 'const results = await Promise.allSettled([p1, p2, p3])',
  },
  {
    category: 'JavaScript',
    color: '#eab308',
    tip: 'O método `Array.at(-1)` acessa o último elemento de um array sem precisar de `.length - 1`.',
    code: 'const last = arr.at(-1)',
  },
  {
    category: 'JavaScript',
    color: '#eab308',
    tip: 'Use `Object.groupBy()` para agrupar arrays por uma chave — substitui várias linhas de reduce.',
    code: 'const byStatus = Object.groupBy(tasks, t => t.status)',
  },
  {
    category: 'JavaScript',
    color: '#eab308',
    tip: 'Debounce evita que uma função seja chamada excessivamente — fundamental para inputs de busca.',
    code: 'const search = debounce((q) => fetch(q), 300)',
  },

  // ── TypeScript ───────────────────────────────────────────────────────
  {
    category: 'TypeScript',
    color: '#3b82f6',
    tip: 'Use `satisfies` para validar o tipo sem perder a inferência — melhor que anotação direta em objetos literais.',
    code: 'const config = {\n  port: 3000,\n  host: "localhost"\n} satisfies ServerConfig',
  },
  {
    category: 'TypeScript',
    color: '#3b82f6',
    tip: '`Record<K, V>` é o tipo ideal para dicionários com chaves dinâmicas.',
    code: 'const scores: Record<string, number> = {}',
  },
  {
    category: 'TypeScript',
    color: '#3b82f6',
    tip: 'Use `Partial<T>` para tornar todas as propriedades opcionais — útil em funções de update.',
    code: 'function update(id: string, data: Partial<User>) {}',
  },
  {
    category: 'TypeScript',
    color: '#3b82f6',
    tip: 'Template literal types permitem criar tipos de string dinâmicos e seguros.',
    code: 'type EventName = `on${Capitalize<string>}`',
  },
  {
    category: 'TypeScript',
    color: '#3b82f6',
    tip: 'Use `unknown` ao invés de `any` — força você a fazer a verificação de tipo antes de usar.',
    code: 'function parse(data: unknown) {\n  if (typeof data === "string") return data\n}',
  },

  // ── CSS ──────────────────────────────────────────────────────────────
  {
    category: 'CSS',
    color: '#06b6d4',
    tip: '`clamp(min, ideal, max)` é a forma moderna de criar tamanhos responsivos sem media queries.',
    code: 'font-size: clamp(1rem, 2.5vw, 2rem);',
  },
  {
    category: 'CSS',
    color: '#06b6d4',
    tip: 'CSS Grid com `auto-fill` e `minmax` cria layouts responsivos em uma linha.',
    code: 'grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));',
  },
  {
    category: 'CSS',
    color: '#06b6d4',
    tip: '`scroll-behavior: smooth` e `scroll-margin-top` melhoram muito a navegação por âncoras.',
    code: 'html { scroll-behavior: smooth; }\nh2 { scroll-margin-top: 80px; }',
  },
  {
    category: 'CSS',
    color: '#06b6d4',
    tip: 'Use variáveis CSS (`--var`) para temas dinâmicos — muito mais flexível do que Sass.',
    code: ':root { --primary: #3b82f6; }\n.btn { color: var(--primary); }',
  },
  {
    category: 'CSS',
    color: '#06b6d4',
    tip: '`aspect-ratio` elimina o antigo hack de padding-top para manter proporções.',
    code: '.thumbnail { aspect-ratio: 16 / 9; }',
  },

  // ── Terminal / Bash ───────────────────────────────────────────────────
  {
    category: 'Terminal',
    color: '#22c55e',
    tip: '`Ctrl+R` no bash/zsh abre busca reversa no histórico de comandos.',
  },
  {
    category: 'Terminal',
    color: '#22c55e',
    tip: '`!!` repete o último comando. `sudo !!` é útil quando você esqueceu o sudo.',
    code: 'sudo !!',
  },
  {
    category: 'Terminal',
    color: '#22c55e',
    tip: 'Use `&&` para encadear comandos que só rodam se o anterior der certo.',
    code: 'npm install && npm run build && npm start',
  },
  {
    category: 'Terminal',
    color: '#22c55e',
    tip: '`grep -r "texto" .` busca recursivamente em todos os arquivos da pasta atual.',
    code: 'grep -r "TODO" . --include="*.ts"',
  },
  {
    category: 'Terminal',
    color: '#22c55e',
    tip: '`curl -I <url>` faz um HEAD request e mostra só os headers HTTP — útil para debug.',
    code: 'curl -I https://api.exemplo.com/health',
  },
  {
    category: 'Terminal',
    color: '#22c55e',
    tip: 'Redirecione stdout e stderr para arquivo com `2>&1` para capturar todos os logs.',
    code: 'npm run build > build.log 2>&1',
  },

  // ── HTTP / APIs ───────────────────────────────────────────────────────
  {
    category: 'HTTP',
    color: '#a855f7',
    tip: 'Códigos 2xx = sucesso, 3xx = redirecionamento, 4xx = erro do cliente, 5xx = erro do servidor.',
  },
  {
    category: 'HTTP',
    color: '#a855f7',
    tip: 'Use `ETag` e `Cache-Control` nos headers para reduzir requests desnecessários ao servidor.',
    code: 'Cache-Control: max-age=3600\nETag: "abc123"',
  },
  {
    category: 'HTTP',
    color: '#a855f7',
    tip: 'Idempotência: GET, PUT e DELETE devem produzir o mesmo resultado se chamados múltiplas vezes.',
  },
  {
    category: 'HTTP',
    color: '#a855f7',
    tip: 'Rate limiting protege sua API de abuso. Retorne 429 (Too Many Requests) com `Retry-After`.',
    code: 'HTTP/1.1 429 Too Many Requests\nRetry-After: 60',
  },

  // ── SQL ───────────────────────────────────────────────────────────────
  {
    category: 'SQL',
    color: '#f43f5e',
    tip: 'Use `EXPLAIN ANALYZE` antes de uma query para entender o plano de execução e identificar gargalos.',
    code: 'EXPLAIN ANALYZE\nSELECT * FROM orders WHERE user_id = 1;',
  },
  {
    category: 'SQL',
    color: '#f43f5e',
    tip: 'Índices aceleram leituras mas tornam escritas mais lentas. Crie apenas nos campos realmente consultados.',
    code: 'CREATE INDEX idx_orders_user ON orders(user_id);',
  },
  {
    category: 'SQL',
    color: '#f43f5e',
    tip: '`COALESCE(a, b, c)` retorna o primeiro valor não-nulo — muito útil em JOINs com campos opcionais.',
    code: 'SELECT COALESCE(nickname, name, "Anônimo") FROM users;',
  },

  // ── Segurança ─────────────────────────────────────────────────────────
  {
    category: 'Segurança',
    color: '#ef4444',
    tip: 'Nunca armazene senhas em texto puro. Use bcrypt, argon2 ou scrypt com salt único por usuário.',
  },
  {
    category: 'Segurança',
    color: '#ef4444',
    tip: 'Valide e sanitize toda entrada do usuário. Nunca confie em dados vindos do cliente.',
  },
  {
    category: 'Segurança',
    color: '#ef4444',
    tip: 'Variáveis de ambiente nunca devem ir para o repositório. Use `.env` no `.gitignore` e documente no `.env.example`.',
    code: '# .env.example\nDATABASE_URL=\nAPI_SECRET=',
  },
  {
    category: 'Segurança',
    color: '#ef4444',
    tip: 'Use HTTPS em produção sempre. Certifícados gratuitos via Let\'s Encrypt / Cloudflare.',
  },

  // ── Performance ───────────────────────────────────────────────────────
  {
    category: 'Performance',
    color: '#10b981',
    tip: 'Imagens são a maior causa de lentidão em sites. Use WebP, defina `width` e `height`, e carregue com `loading="lazy"`.',
    code: '<img src="foto.webp" loading="lazy" width="800" height="600">',
  },
  {
    category: 'Performance',
    color: '#10b981',
    tip: 'Lighthouse no Chrome DevTools gera um relatório completo de performance, acessibilidade e SEO em segundos.',
  },
  {
    category: 'Performance',
    color: '#10b981',
    tip: 'Memoize funções puras caras com `useMemo` (React) ou caches simples para evitar recalcular o mesmo resultado.',
  },

  // ── VS Code ───────────────────────────────────────────────────────────
  {
    category: 'VS Code',
    color: '#0ea5e9',
    tip: '`Ctrl+P` abre qualquer arquivo. `Ctrl+Shift+P` abre a paleta de comandos. São os dois atalhos mais importantes.',
  },
  {
    category: 'VS Code',
    color: '#0ea5e9',
    tip: '`Alt+Click` cria múltiplos cursores. `Ctrl+D` seleciona a próxima ocorrência da seleção atual.',
  },
  {
    category: 'VS Code',
    color: '#0ea5e9',
    tip: '`Ctrl+Shift+L` seleciona todas as ocorrências do texto selecionado de uma vez.',
  },
  {
    category: 'VS Code',
    color: '#0ea5e9',
    tip: 'Extensões essenciais: Prettier, ESLint, GitLens, Error Lens, Path Intellisense, Thunder Client.',
  },

  // ── Redes / DNS ──────────────────────────────────────────────────────
  {
    category: 'Redes',
    color: '#8b5cf6',
    tip: 'DNS converte nomes (google.com) em IPs. `nslookup google.com` mostra a resolução no terminal.',
    code: 'nslookup google.com\ndig google.com A',
  },
  {
    category: 'Redes',
    color: '#8b5cf6',
    tip: 'Portas comuns: 80 HTTP, 443 HTTPS, 22 SSH, 5432 PostgreSQL, 3306 MySQL, 6379 Redis, 27017 MongoDB.',
  },

  // ── Docker ────────────────────────────────────────────────────────────
  {
    category: 'Docker',
    color: '#2563eb',
    tip: '`docker compose up -d` sobe todos os serviços em background. `docker compose logs -f` acompanha os logs.',
    code: 'docker compose up -d\ndocker compose logs -f api',
  },
  {
    category: 'Docker',
    color: '#2563eb',
    tip: 'Use `.dockerignore` para excluir `node_modules` e `.git` da imagem — reduz o tamanho drasticamente.',
    code: '# .dockerignore\nnode_modules\n.git\n.env',
  },

  // ── Boas práticas ─────────────────────────────────────────────────────
  {
    category: 'Boas práticas',
    color: '#64748b',
    tip: 'Código bom é aquele que outro desenvolvedor (ou você daqui 6 meses) consegue entender sem perguntar.',
  },
  {
    category: 'Boas práticas',
    color: '#64748b',
    tip: 'Regra do escoteiro: deixe o código um pouco melhor do que você encontrou.',
  },
  {
    category: 'Boas práticas',
    color: '#64748b',
    tip: 'Nomes de variáveis devem revelar intenção. `d` é ruim, `daysSinceLastLogin` é bom.',
  },
  {
    category: 'Boas práticas',
    color: '#64748b',
    tip: 'Funções devem fazer uma coisa só e fazê-la bem. Se precisar de "e" no nome, considere dividir.',
  },
  {
    category: 'Boas práticas',
    color: '#64748b',
    tip: 'Commit pequenos e frequentes são melhores que commits grandes e raros. Facilita review e rollback.',
  },
  {
    category: 'Boas práticas',
    color: '#64748b',
    tip: 'DRY (Don\'t Repeat Yourself) mas sem exagerar — duplicação é melhor que abstração errada.',
  },
  // ── Go ────────────────────────────────────────────────────────────────
  {
    category: 'Go',
    color: '#00add8',
    tip: 'Em Go, erros são valores retornados explicitamente — sempre verifique o erro retornado por uma função.',
    code: 'f, err := os.Open("arquivo.txt")\nif err != nil {\n    log.Fatal(err)\n}',
  },
  {
    category: 'Go',
    color: '#00add8',
    tip: '`defer` executa uma função ao final do escopo atual — ideal para fechar arquivos, conexões e locks.',
    code: 'f, _ := os.Open("arquivo.txt")\ndefer f.Close()\n// f é fechado automaticamente ao fim da função',
  },
  {
    category: 'Go',
    color: '#00add8',
    tip: 'Goroutines são leves e baratas — você pode criar milhares delas. Use `go func()` para concorrência simples.',
    code: 'go func() {\n    fmt.Println("rodando em paralelo")\n}()',
  },
  {
    category: 'Go',
    color: '#00add8',
    tip: 'Channels são a forma idiomática de comunicar goroutines. "Don\'t communicate by sharing memory; share memory by communicating."',
    code: 'ch := make(chan int)\ngo func() { ch <- 42 }()\nresult := <-ch',
  },
  {
    category: 'Go',
    color: '#00add8',
    tip: '`go test ./...` roda todos os testes do projeto. Adicione `-race` para detectar race conditions.',
    code: 'go test ./... -race -cover',
  },
  {
    category: 'Go',
    color: '#00add8',
    tip: 'Interfaces em Go são implementadas implicitamente — basta ter os métodos, sem declarar `implements`.',
    code: 'type Animal interface {\n    Falar() string\n}\n// Cachorro implementa Animal automaticamente\nfunc (c Cachorro) Falar() string { return "Au" }',
  },
  {
    category: 'Go',
    color: '#00add8',
    tip: '`gofmt` formata seu código automaticamente seguindo o padrão oficial. Configure o editor para rodar ao salvar.',
    code: 'gofmt -w .',
  },
  {
    category: 'Go',
    color: '#00add8',
    tip: 'Use `context.Context` para propagar cancelamento e timeout entre goroutines e chamadas de API.',
    code: 'ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\ndefer cancel()\nreq, _ := http.NewRequestWithContext(ctx, "GET", url, nil)',
  },
]

export function getTipOfDay(): DevTip {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return DEV_TIPS[dayIndex % DEV_TIPS.length]
}
