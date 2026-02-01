# RC Acervo v2

Sistema de Biblioteca de Fotos e Vídeos da RC Agropecuária

## Deploy no Render

### 1. Criar Repositório no GitHub

```bash
# Crie um novo repositório: rc-acervo
# Envie estes arquivos:
# - package.json
# - server.js
# - public/index.html
# - .env (com suas credenciais)
```

### 2. Configurar no Render

1. Acesse https://dashboard.render.com
2. Clique **"New +"** → **"Web Service"**
3. Conecte o repositório `rc-acervo`
4. Configure:
   - **Name**: `rc-acervo`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Variáveis de Ambiente

Adicione no Render:

```
NODE_ENV=production
PORT=10000
B2_ACCOUNT_ID=0052cfa9b6df80a0000000001
B2_APPLICATION_KEY=K005zrrojM9dxyA/grTSocR1mu7aFpc
B2_BUCKET_NAME=Drive-mkt-RC
B2_BUCKET_ID=c2dc2ffa190b166d9fc8001a
```

### 4. Deploy

Clique **"Create Web Service"**

## Funcionalidades

- ✅ Upload direto para Backblaze B2
- ✅ Nomenclatura automática padronizada
- ✅ Organização por pastas (ANO/MES/DIA)
- ✅ Catálogo com filtros
- ✅ Dashboard com estatísticas

## API Endpoints

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/health` | Status do servidor |
| `POST /api/upload/presigned` | Gera URL de upload |
| `POST /api/upload/complete` | Confirma upload |
| `GET /api/upload/test` | Testa conexão B2 |
| `GET /api/media` | Lista mídias |
| `GET /api/media/stats` | Estatísticas |
| `GET /api/folders` | Lista pastas |

## Estrutura de Pastas no B2

```
Drive-mkt-RC/
├── 00_ENTRADA/
├── 01_CATALOGADO/2025/02/01/
├── 02_PRODUCAO/
├── 03_PUBLICADO/
└── 04_ARQUIVADO/
```

## Nomenclatura

```
ANO_MES_DIA_AREA_NUCLEO_TEMA_STATUS_UUID.EXT

Exemplo:
2025_02_01_VILACANABRAVA_CRIA_TERRASERTAO_CATALOGADO_A1B2C3D4.jpg
```
