# Ícone da notificação push (barra do celular)

O ícone que aparece **à esquerda** na notificação "Novo Agendamento!" (igual ao do Instagram) usa o ficheiro **`notification-icon.png`**.

## Para ficar como o Instagram (bem visível)

No Android, o ícone na barra é **monocromático**: o sistema usa só o **alfa** (transparência) e pinta numa cor. Se o PNG tiver muitas cores ou fundo escuro, pode ficar um quadrado cinzento.

1. Use **logo OX em branco** sobre **fundo transparente** (sem fundo escuro).
2. Tamanho: **192×192** ou **256×256** px.
3. Formato: PNG com transparência.
4. Substitua `notification-icon.png` por esse ficheiro e faça novo build do admin.

O backend envia o ícone em **URL absoluta** (`https://obras.oxservices.org/notification-icon.png`). Se alterar o domínio do admin, configure `ADMIN_APP_URL` no `.env` do backend.
