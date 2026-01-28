# Upload no Cloudinary

As imagens e vídeos da timeline das obras podem ser enviados diretamente para o **Cloudinary**. Se as variáveis do Cloudinary estiverem configuradas no `.env`, o backend usa o Cloudinary; caso contrário, grava em disco (`public/uploads/`).

## Chaves necessárias

No [Dashboard do Cloudinary](https://console.cloudinary.com/) → **Dashboard** você vê:

| Variável no .env | Onde pegar |
|------------------|------------|
| `CLOUDINARY_CLOUD_NAME` | Dashboard → **Cloud name** (ex.: `dxxxxxx`) |
| `CLOUDINARY_API_KEY` | Dashboard → **API Key** (ex.: `123456789012345`) |
| `CLOUDINARY_API_SECRET` | Dashboard → **API Secret** (clique em “Reveal”) |

## Configuração no `.env`

Adicione no `.env` do backend:

```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
```

**Importante:** a API Secret não deve aparecer no frontend nem em repositórios públicos.

## Comportamento

- **Com Cloudinary configurado:** o arquivo é enviado em memória para o Cloudinary; em `timeline_entries` ficam as URLs retornadas (ex.: `https://res.cloudinary.com/...`).
- **Sem Cloudinary:** o arquivo é salvo em `public/uploads/works/{work_id}/` e em `timeline_entries` ficam caminhos como `/uploads/works/...`.

Os arquivos no Cloudinary ficam na pasta `ox-uploads/obras/{work_id}/` (capas em `ox-uploads/covers/`). Para vídeos, é gerada uma URL de thumbnail (frame inicial em JPG).
