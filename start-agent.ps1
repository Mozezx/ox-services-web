# ==========================================
# Antigravity Loader: MODO COMPATIBILIDADE
# ==========================================

# 1. Use uma CHAVE NOVA (delete a antiga no site por segurança!)
$minha_chave = "sk-75fac9d4384b43e0b94fec36b6b78201"

# 2. Configurações para o DeepSeek se passar por Anthropic (O "pulo do gato")
$env:ANTHROPIC_API_KEY = $minha_chave
$env:ANTHROPIC_BASE_URL = "https://api.deepseek.com/anthropic"

# 3. Configurações padrão OpenAI (para garantir)
$env:OPENAI_API_KEY = $minha_chave
$env:OPENAI_API_BASE = "https://api.deepseek.com/v1"

Write-Host "--- SELECIONE O MODELO ---" -ForegroundColor Yellow
Write-Host "1. DeepSeek-V3 (Chat)"
Write-Host "2. DeepSeek-R1 (Reasoner)"
$escolha = Read-Host "Digite 1 ou 2"

if ($escolha -eq "2") { $env:MODEL = "deepseek-reasoner" } 
else { $env:MODEL = "deepseek-chat" }

Write-Host "🚀 Abrindo Antigravity... Procure as configurações de API na janela que abrir!" -ForegroundColor Cyan

# Rodamos apenas o comando, sem flags, pois as variáveis de ambiente já estão prontas
antigravity