# Configuração PWA para Admin

## Contexto
O projeto principal já está configurado como PWA usando `vite-plugin-pwa`. O admin será parte do mesmo projeto (mesmo build) ou um build separado? Decisão: usar o mesmo build, pois o admin é uma seção do mesmo domínio (subdomínio). O subdomínio `obras.oxservices.org` servirá o mesmo aplicativo React, mas as rotas `/admin` serão protegidas.

## Configuração Existente
O `vite.config.ts` atual define um manifest com:
- name: `OX Services - Acompanhamento de Obras`
- short_name: `OX Obras`
- start_url: `/`
- scope: `/`

Para o admin, podemos manter o mesmo manifest, pois é o mesmo app. No entanto, podemos querer diferenciar o nome quando instalado como PWA. Opção: criar um manifest separado para o admin, mas isso requer múltiplos entry points.

## Abordagem Escolhida
Manter um único PWA, mas ajustar o manifest para refletir o propósito geral (admin + cliente). O nome atual já é adequado. O admin poderá usar os mesmos service workers e caching.

## Personalizações para Admin
- **Ícones**: usar os mesmos ícones (pwa-192x192.png, pwa-512x512.png)
- **Theme color**: pode ser diferente para diferenciar o contexto admin (ex: cor #0B242A)
- **Display**: `standalone`

## Service Worker e Caching
O workbox configurado já cacheia recursos estáticos e APIs. Para o admin, precisamos garantir que as rotas `/admin/*` também sejam cacheadas adequadamente para funcionamento offline.

### Estratégias de Cache
- **Páginas HTML**: NetworkFirst (já configurado para `/`)
- **API Admin**: NetworkFirst com timeout curto (já configurado para `/api/*`)
- **Imagens upload**: CacheFirst com expiration longa (já coberto por globPatterns)

## Offline Capabilities
O admin pode funcionar offline parcialmente (listar obras já baixadas, visualizar imagens cacheadas). Ações que requerem rede (upload, atualizações) devem falhar graciosamente e ser sincronizadas quando online.

## Passos de Implementação

### 1. Verificar Configuração Atual
O `vite.config.ts` já inclui `VitePWA`. Não é necessário modificar.

### 2. Garantir que o Service Worker Registre no Admin
O plugin registra automaticamente o service worker no escopo `/`. Como o admin está no mesmo escopo, será coberto.

### 3. Adicionar PWA Meta Tags no HTML
O plugin injeta automaticamente. Verificar se o `index.html` tem `link rel="manifest"`.

### 4. Testar Install Prompt
No Chrome DevTools, Application > Manifest, verificar se o manifest é detectado.

### 5. Offline Fallback Page
Configurar fallback para rotas desconhecidas (opcional). O plugin tem opção `navigateFallback`.

## Build e Deploy
O build do Vite gera os arquivos do service worker e manifest na pasta `dist`. O admin será servido a partir do mesmo build.

## Considerações de Segurança
- O service worker não deve cachear respostas de autenticação (token) sensíveis.
- O cache de API deve respeitar headers de autenticação (não cachear respostas 401).

## Verificação
Após deploy, testar:
- Instalação como PWA (Add to Home Screen)
- Funcionamento offline (carregar página sem internet)
- Atualização automática quando nova versão disponível

## Referências
- [Vite PWA Plugin Documentation](https://vite-pwa-org.netlify.app/)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)