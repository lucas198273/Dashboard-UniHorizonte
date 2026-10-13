# Arquitetura — Painel de Gestão

## Objetivo

Base white-label para gestão de blog e catálogo, preparada para Supabase Auth e rotas autenticadas do `backend-cm1.0`. Esta etapa contém somente fundação, contratos e esqueletos.

## Camadas

- `config`: validação de ambiente e único cliente Supabase.
- `providers`: composição de QueryClient e AuthProvider stub.
- `lib`: infraestrutura compartilhada, incluindo `apiRequest<T>` com JWT.
- `types`: contratos compartilhados exatamente definidos pelo backend.
- `api`: pontos de extensão tipados para blog, produtos e usuário atual.
- `hooks`: assinaturas preparadas para queries e mutations futuras.
- `router`: rotas do painel e guards stub.
- `pages`: esqueletos visuais sem CRUD ou submit.
- `components`: componentes básicos e layout administrativo.

## Segurança HTTP

`src/lib/http.ts` usa apenas `fetch`. Por padrão, obtém a sessão pelo Supabase e injeta `Authorization: Bearer <token>` quando disponível. Não envia `X-Tenant-Slug`: `tenant_id` e `role` devem vir do JWT validado pelo backend. Respostas seguem `ApiResponse<T>`; payload inválido ou `success: false` geram `ApiError`. Uma resposta não autorizada também encerra a sessão local.

## Estado

TanStack Query será o único servidor state. O `queryClient` central já possui política inicial conservadora. Auth e estado efêmero local serão implementados pelos providers e componentes da próxima etapa.

## Rotas planejadas

- `/login`
- `/admin/dashboard`
- `/admin/blog/posts`
- `/admin/blog/categories`
- `/admin/products`
- `/admin/products/categories`
- página de erro
- fallback 404

## Convenções

- Entidades seguem `snake_case`.
- Query params futuro preservam o camelCase definido pelo backend, como `commercialType`.
- Componentes são escritos em TypeScript strict sem `any` explícito.
- Imports usam ESNext sem extensão.
- UI usa TailwindCSS 4 por `@tailwindcss/vite`; não há configuração Tailwind 3 ou Webpack.

## Próxima etapa

1. Implementar sessão Supabase no `AuthProvider`.
2. Mapear `app_metadata.tenant_id` e `app_metadata.role` para `AuthUser` via `/api/users/me`.
3. Liberar guards conforme sessão e role.
4. Implementar `src/api/**` e hooks com TanStack Query.
5. Substituir esqueletos por telas e CRUD.
