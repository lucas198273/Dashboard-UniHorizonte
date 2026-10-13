# Relatório de Limpeza — Painel de Gestão

**Data:** 2026-07-20  
**Etapa:** limpeza, preparação e otimização para auth + API

## 1. Resumo executivo

O repositório foi reduzido ao domínio do painel de gestão: blog, categorias de blog, produtos, categorias de produtos, autenticação preparada e dashboard. Foram removidos módulos de leads e landing categories, páginas públicas, formulários legados, serviços HTTP antigos e componentes de outras clonagens.

A implementação de CRUD, upload e login não foi preservada. API, hooks e providers foram reconstruídos como extensões tipadas, enquanto as páginas passaram a ser esqueletos visuais sem lógica de negócio.

A fundação usa um único cliente Supabase, `fetch` nativo, TanStack Query, React Router, TailwindCSS 4 pelo plugin Vite e contratos exatamente iguais aos contratos fornecidos do `backend-cm1.0`.

O ambiente foi saneado: `.env.development` foi removido, `.env.example` contém somente as três variáveis permitidas e o `.gitignore` preserva apenas o exemplo.

## 2. Arquivos removidos

### 2.1 Páginas

| Arquivo/pasta | Motivo |
|---|---|
| `src/pages/Login.tsx` | Login funcional fora do escopo desta etapa |
| `src/pages/admin/BlogPostsList.tsx` | CRUD funcional legado |
| `src/pages/admin/BlogPostForm.tsx` | Formulário funcional legado |
| `src/pages/admin/ProductsList.tsx` | CRUD funcional legado |
| `src/pages/admin/ProductFormPage.tsx` | Formulário funcional legado |
| `src/pages/admin/ProductCategoriesList.tsx` | CRUD funcional legado |
| `src/pages/admin/ProductCategoryFormPage.tsx` | Formulário funcional legado |
| `src/pages/blog/BlogPostDetail.tsx` | Blog público do `construbet` |

### 2.2 Componentes

| Arquivo/pasta | Motivo |
|---|---|
| `src/components/blog/**` | Componentes do blog público e CRUD legado |
| `src/components/product/**` | Componentes funcionais do CRUD legado |
| `src/components/Footer/**` | Conteúdo de outra clonagem |
| `src/components/ScrollTop/**` | Código público órfão |
| `src/components/ScrollToTopOnRouteChange/**` | Código público órfão |
| `src/components/PrivateRoute/**` | Substituído por guards tipados |
| `src/components/Layout/**` | Substituído pela estrutura alvo |

### 2.3 Hooks / Services / Contexts

| Caminho | Motivo |
|---|---|
| `src/hooks/**` (implementações antigas) | Substituídos por stubs sem chamadas reais |
| `src/services/**` | Clientes e endpoints legados; substituídos por `src/lib/http.ts` |
| `src/contexts/AuthContext.tsx` | Auth funcional e consulta à tabela `administradores` incompatível |
| `src/lib/supabase.ts` | Cliente Supabase duplicado |
| `src/utils/imageUrl.ts` | Dependia de bucket/upload fora do escopo |
| `src/utils/imageValidation.ts` | Upload fora do escopo |

### 2.4 Tipos

| Arquivo | Motivo |
|---|---|
| `src/types/productCategory.ts` | Substituído pelo contrato consolidado |
| `src/types/react-helmet.d.ts` | Dependência removida |
| Tipos antigos em blog/product | Divergentes dos contratos fornecidos; substituídos |

### 2.5 Assets / public

| Arquivo | Motivo |
|---|---|
| `public/assets/logo.webp` | Logo da Construbet |
| `public/vite.svg` | Asset do template Vite |
| `public/sitemap.xml` | URLs de outro projeto |
| `public/robots.txt` (conteúdo antigo) | Apontava para domínio alheio; substituído |

### 2.6 Configs

| Arquivo | Motivo |
|---|---|
| `webpack.config.js` | Build usa Vite |
| `tailwind.config.js` | Tailwind 4 é integrado pelo Vite |
| `postcss.config.js` | Pipeline PostCSS/Tailwind 3 legado |
| `public/.htaccess` | Configuração Apache não utilizada pelo Vite |

### 2.7 Outros

| Arquivo | Motivo |
|---|---|
| `.env.development` | URL Supabase real e variável de bucket legada |
| `src/App.css` | CSS não importado |
| `src/index.css` | Substituído por `src/styles/globals.css` |
| `docs/audit-report.md` | Relatório vazio/incompleto substituído pela documentação final |

## 3. Dependências removidas

| Pacote | Motivo | Substituído por |
|---|---|---|
| Chakra UI, Emotion | Tailwind é o padrão | TailwindCSS 4 |
| Axios | Duplicava `fetch` | `fetch` nativo |
| GSAP, AOS, Embla, Framer Motion | UI/animação fora do painel | CSS/Tailwind |
| Prismic | CMS de outro projeto | Nenhum |
| Express, MySQL, PDFKit | Bibliotecas de backend | Nenhum |
| React Helmet | SEO irrelevante no painel | Nenhum |
| React Toastify | Duplicava toasts | `react-hot-toast` |
| React Icons | Duplicava ícones | `lucide-react` |
| Analytics, DOMPurify | Resquícios sem uso | Nenhum |
| PostCSS/Webpack packages | Build obsoleto | `@tailwindcss/vite` |
| Plugins Tailwind 3 | Incompatíveis com Tailwind 4 adotado | Nenhum |
| `supabase-js` placeholder | Pacote de segurança não usado | `@supabase/supabase-js` |

## 4. Dependências adicionadas

| Pacote | Motivo |
|---|---|
| `@tanstack/react-query` | Server state da próxima etapa |
| `clsx` | Composição de classes |
| `tailwind-merge` | Resolução de classes Tailwind |

## 5. Dependências mantidas (com motivo)

| Pacote | Motivo |
|---|---|
| React 18 | Stack-alvo aprovada |
| React Router DOM | Rotas do painel |
| Supabase JS | Autenticação da próxima etapa |
| Lucide React | Único sistema de ícones |
| React Hot Toast | Único sistema de notificações |
| Vite, TypeScript, Tailwind 4, ESLint | Toolchain da aplicação |

## 6. Arquivos preservados (domínio)

| Arquivo/área | Módulo | Status |
|---|---|---|
| `src/types/blog.ts` | Blog | Contrato fornecido |
| `src/types/product.ts` | Produtos | Contrato fornecido |
| `src/types/auth.ts` | Auth | Contrato fornecido |
| `src/types/api.ts` | API | Envelope e paginação fornecidos |
| `src/config/supabase.ts` | Auth | Fundação única |
| `src/lib/http.ts` | API | Extensão pronta para chamadas futuras |
| `src/providers/AppProviders.tsx` | App/server state | QueryClient + Auth stub |
| `src/router/**` | Dashboard/Auth | Rotas preparadas |

## 7. Arquivos marcados como "❓ precisa decisão humana"

Nenhum. As decisões aprovadas foram aplicadas integralmente. A implementação de guards ainda redireciona sempre para login porque a sessão real pertence à próxima etapa.

## 8. Estrutura final

```text
src/
├── api/                 blog, products, users (stubs)
├── components/
│   ├── common/          estados básicos
│   ├── layout/          AdminLayout, Header, Sidebar, UserMenu
│   └── ui/              Button, Input, Card, Badge, Spinner
├── config/              env, supabase
├── hooks/               seis hooks stub
├── lib/                 http, errors, queryClient, format, cn
├── pages/               oito esqueletos
├── providers/           AuthProvider, AppProviders
├── router/              index, guards, routes
├── styles/              globals.css
├── types/               api, auth, blog, product, index
├── App.tsx
└── main.tsx
```

## 9. Compatibilidade com backend

- Tipos criados: `ApiResponse<T>`, `PaginatedMeta`, `PaginatedData<T>`, `Role`, `AuthUser`, `PostStatus`, `BlogCategory`, `BlogPost`, `ProductStatus`, `CommercialType`, `ProductCategory`, `ProductImage`, `Product`.
- Contratos espelhados: **sim**, conforme os blocos fornecidos no documento da missão.
- Env vars alinhadas: **sim**, somente as três permitidas.
- Tenant: nenhuma request automática envia `X-Tenant-Slug`; o token do SupabaseLevará tenant no JWT.

**Divergência documentada:** `CategoryStatus` é declarado nos contratos de blog e produto com o mesmo valor. Para permitir o barrel `src/types/index.ts` sem conflito, `index.ts` reexporta explicitamente as entidades e status não ambíguos do blog. Os campos de ambos os contratos permanecem inalterados.

## 10. Verificação

- `npm run typecheck`: ✅
- `npm run build`: ✅
- `npm run lint`: ✅
- Imports quebrados: nenhum
- Build de produção: 101 módulos transformados

Observação da instalação: o npm reportou 16 vulnerabilidades transitivas (1 baixa, 3 moderadas, 12 altas). Nenhuma atualização adicional foi executada porque a missão proíbe alterar versões fora das autorizadas.

## 11. Próximo passo

Implementar Supabase Auth real no `AuthProvider`, consentir a sessão, derivar `tenant_id` e `role` do JWT, completar guards e criar as queries/API dos endpoints `/api/users/me`, blog e produtos.
