# Teste de Integração

## Objetivo
Validar que todas as partes do sistema (frontend admin, backend, banco de dados, autenticação Clerk, upload de imagens) funcionam em conjunto corretamente.

## Cenários de Teste

### 1. Autenticação Clerk
- **Cenário**: Usuário não autenticado tenta acessar `/admin`
  - Esperado: Redirecionamento para login Clerk
- **Cenário**: Usuário autenticado (com role admin) acessa `/admin`
  - Esperado: Página admin carrega com sidebar e conteúdo
- **Cenário**: Token JWT inválido enviado ao backend
  - Esperado: Resposta 401 Unauthorized

### 2. CRUD de Obras
- **Criar obra**: Preencher formulário e submeter
  - Esperado: Obra aparece na lista, token gerado
  - Verificar se os campos foram salvos corretamente no Supabase
- **Listar obras**: Acessar `/admin/works`
  - Esperado: Tabela com obras existentes
- **Editar obra**: Alterar nome, status, datas
  - Esperado: Alterações refletidas na lista e no banco
- **Excluir obra**: Clicar em excluir e confirmar
  - Esperado: Obra some da lista, entrada removida do banco

### 3. Upload de Imagens
- **Upload de imagem** (JPEG/PNG) para uma obra
  - Esperado: Arquivo salvo em `public/uploads/works/<id>/`
  - Entrada criada na tabela `timeline_entries`
  - Imagem exibida na timeline
- **Upload de vídeo** (MP4)
  - Esperado: Arquivo salvo, entrada criada com tipo `video`
- **Arquivo inválido** (exe, txt)
  - Esperado: Erro 400 com mensagem adequada
- **Tamanho excedido** (>100 MB)
  - Esperado: Erro 413

### 4. Gerenciamento de Timeline
- **Listar entradas**: Acessar timeline de uma obra
  - Esperado: Exibir entradas ordenadas por `order`
- **Excluir entrada**: Clicar em excluir
  - Esperado: Entrada removida da lista e do banco (arquivo físico pode permanecer)
- **Reordenar arrastando**: Alterar ordem via drag‑and‑drop
  - Esperado: Ordem persistida após refresh
- **Editar entrada**: Alterar título/descrição
  - Esperado: Atualização refletida

### 5. PWA Funcionalidades
- **Instalação**: No Chrome, trigger "Add to Home Screen"
  - Esperado: App instalado com ícone
- **Offline**: Desligar rede, acessar app
  - Esperado: Página carrega (cache do service worker)
  - Lista de obras offline (se já carregada)
- **Atualização**: Fazer deploy de nova versão
  - Esperado: Service worker atualiza e reload propõe nova versão

### 6. Integração com Cliente (Obra Pública)
- **Token de acesso**: Copiar token da obra e acessar `/{token}` (página pública)
  - Esperado: Timeline pública exibe as entradas (apenas aprovadas?)
- **Comentários**: Cliente posta comentário, admin aprova
  - Esperado: Comentário aparece na página pública

## Ferramentas de Teste
- **Frontend**: Testes manuais no browser (Chrome DevTools)
- **Backend**: Postman/Insomnia para endpoints
- **Banco de Dados**: Consultar Supabase Dashboard para verificar dados
- **Logs**: Console do backend (Node) e console do frontend

## Checklist de Teste
### Pré‑requisitos
- [ ] Banco de dados com tabelas criadas (works, timeline_entries, comments)
- [ ] Clerk application configurada com usuário admin
- [ ] Variáveis de ambiente configuradas (`.env` no backend, `.env.local` no frontend)
- [ ] Servidor backend rodando (`npm run dev` no diretório backend)
- [ ] Frontend admin rodando (`npm run dev`)

### Execução
1. **Autenticação**
   - [ ] Acessar `http://localhost:3000/admin` redireciona para Clerk
   - [ ] Login com credenciais Clerk
   - [ ] Após login, página admin carrega

2. **Obras**
   - [ ] Criar nova obra (preencher formulário)
   - [ ] Verificar se obra aparece na lista
   - [ ] Editar obra (mudar status)
   - [ ] Excluir obra

3. **Upload**
   - [ ] Selecionar arquivo de imagem e fazer upload
   - [ ] Verificar se arquivo aparece na timeline da obra
   - [ ] Verificar se arquivo existe no sistema de arquivos
   - [ ] Excluir entrada

4. **Timeline**
   - [ ] Arrastar entrada para reordenar
   - [ ] Recarregar página e verificar ordem persistida

5. **PWA**
   - [ ] No Chrome DevTools, Application > Service Workers, verificar registro
   - [ ] Simular offline (Network tab → Offline)
   - [ ] Recarregar página e verificar conteúdo cacheado

6. **Erros**
   - [ ] Testar upload com arquivo grande (deve falhar)
   - [ ] Testar acesso a endpoint sem token (deve retornar 401)

## Correção de Problemas
- **CORS**: Se houver erro de CORS, verificar configuração no backend (`cors` middleware)
- **Autenticação Clerk**: Verificar secret key, token extraction
- **Supabase Connection**: Verificar URL e chave de service role
- **Upload Path**: Verificar permissões de escrita na pasta `public/uploads`

## Ambiente de Produção
Após testes locais, repetir no ambiente de produção (subdomínio `obras.oxservices.org`):
- [ ] Deploy do backend (Node.js + PM2)
- [ ] Build do frontend e servir via Nginx
- [ ] Configurar SSL (HTTPS)
- [ ] Testar fluxo completo em produção

## Automatização Futura
Considerar escrever testes automatizados com:
- **Jest + Supertest** para endpoints backend
- **Cypress** para fluxos frontend
- **GitHub Actions** para CI/CD