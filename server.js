/**
 * RC Acervo - Servidor Principal
 * Sistema de Biblioteca de Fotos e Vídeos
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração
const B2_CONFIG = {
  accountId: process.env.B2_ACCOUNT_ID || '',
  applicationKey: process.env.B2_APPLICATION_KEY || '',
  bucketId: process.env.B2_BUCKET_ID || '',
  bucketName: process.env.B2_BUCKET_NAME || '',
  apiUrl: 'https://api005.backblazeb2.com',
};

const FOLDER_STRUCTURE = {
  ENTRADA: '00_ENTRADA',
  CATALOGADO: '01_CATALOGADO',
  PRODUCAO: '02_PRODUCAO',
  PUBLICADO: '03_PUBLICADO',
  ARQUIVADO: '04_ARQUIVADO',
};

// Banco de dados (arquivo JSON)
const DB_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/rc-acervo-data'
  : path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'media-metadata.json');

// Cache de autenticação B2
let authCache = null;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// BANCO DE DADOS
// ============================================

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getAllMetadata() {
  try {
    ensureDir();
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[DB] Erro ao ler:', error);
    return [];
  }
}

function saveMetadata(metadata) {
  try {
    ensureDir();
    const all = getAllMetadata();
    const index = all.findIndex(m => m.id === metadata.id);
    if (index >= 0) {
      all[index] = metadata;
    } else {
      all.push(metadata);
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(all, null, 2));
    return true;
  } catch (error) {
    console.error('[DB] Erro ao salvar:', error);
    return false;
  }
}

function getMetadataById(id) {
  return getAllMetadata().find(m => m.id === id) || null;
}

function deleteMetadata(id) {
  try {
    const all = getAllMetadata().filter(m => m.id !== id);
    fs.writeFileSync(DB_FILE, JSON.stringify(all, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

function getEstatisticas() {
  const all = getAllMetadata();
  const stats = {
    totalItens: all.length,
    totalImagens: 0,
    totalVideos: 0,
    porStatus: {},
    porArea: {},
    porTema: {},
    porNucleo: {},
  };
  
  all.forEach(m => {
    const ext = m.extensao?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      stats.totalImagens++;
    } else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
      stats.totalVideos++;
    }
    
    stats.porStatus[m.status] = (stats.porStatus[m.status] || 0) + 1;
    stats.porArea[m.area] = (stats.porArea[m.area] || 0) + 1;
    stats.porTema[m.tema] = (stats.porTema[m.tema] || 0) + 1;
    if (m.nucleo) {
      stats.porNucleo[m.nucleo] = (stats.porNucleo[m.nucleo] || 0) + 1;
    }
  });
  
  return stats;
}

// ============================================
// BACKBLAZE B2
// ============================================

async function authorizeB2() {
  if (authCache && authCache.expiresAt > Date.now()) {
    return authCache;
  }
  
  const authString = Buffer.from(`${B2_CONFIG.accountId}:${B2_CONFIG.applicationKey}`).toString('base64');
  const response = await axios.get(`${B2_CONFIG.apiUrl}/b2api/v2/b2_authorize_account`, {
    headers: { Authorization: `Basic ${authString}` },
  });
  
   authCache = {
    token: response.data.authorizationToken,
    apiUrl: response.data.apiUrl,
    downloadUrl: response.data.downloadUrl,
    expiresAt: Date.now() + (23 * 60 * 60 * 1000),
  };
  
  return authCache;
}

async function getUploadUrl() {
  const auth = await authorizeB2();
  const response = await axios.post(
    `${auth.apiUrl}/b2api/v2/b2_get_upload_url`,
    { bucketId: B2_CONFIG.bucketId },
    { headers: { Authorization: auth.token } }
  );
  return {
    uploadUrl: response.data.uploadUrl,
    authorizationToken: response.data.authorizationToken,
  };
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .substring(0, 15);
}

function generateFileName(originalName, metadata) {
  const now = new Date();
  const ano = now.getFullYear().toString();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  const extensao = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  const areaSlug = slugify(metadata.area) || 'GERAL';
  const nucleoSlug = metadata.nucleo ? slugify(metadata.nucleo) : 'GERAL';
  const temaSlug = slugify(metadata.tema) || 'GERAL';
  const statusSlug = slugify(metadata.status) || 'ENTRADA';
  
  const fileName = `${ano}_${mes}_${dia}_${areaSlug}_${nucleoSlug}_${temaSlug}_${statusSlug}_${uuid}.${extensao}`;
  
  let baseFolder = FOLDER_STRUCTURE.ENTRADA;
  if (metadata.status === 'Catalogado') baseFolder = FOLDER_STRUCTURE.CATALOGADO;
  else if (metadata.status === 'Em produção') baseFolder = FOLDER_STRUCTURE.PRODUCAO;
  else if (metadata.status === 'Publicado') baseFolder = FOLDER_STRUCTURE.PUBLICADO;
  else if (metadata.status === 'Arquivado') baseFolder = FOLDER_STRUCTURE.ARQUIVADO;
  
  const folderPath = `${baseFolder}/${ano}/${mes}/${dia}`;
  const fullPath = `${folderPath}/${fileName}`;
  
  return { fileName, folderPath, fullPath, ano, mes, dia, uuid, extensao };
}

// ============================================
// ROTAS API
// ============================================

// Health
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Upload - Presigned URL
app.post('/api/upload/presigned', async (req, res) => {
  try {
    const { filename, contentType, size, metadata } = req.body;
    
    if (!filename || !metadata?.area || !metadata?.tema) {
      return res.status(400).json({ success: false, error: 'Dados incompletos' });
    }
    
    const fileData = generateFileName(filename, metadata);
    const uploadData = await getUploadUrl();
    
    res.json({
      success: true,
      data: {
        presignedUrl: uploadData.uploadUrl,
        authorizationToken: uploadData.authorizationToken,
        fileName: fileData.fileName,
        filePath: fileData.fullPath,
        folderPath: fileData.folderPath,
        headers: {
          'Authorization': uploadData.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(fileData.fullPath),
          'Content-Type': contentType || 'application/octet-stream',
          'X-Bz-Content-Sha1': 'do_not_verify',
        }
      }
    });
  } catch (error) {
    console.error('[Upload] Erro:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload - Complete
app.post('/api/upload/complete', async (req, res) => {
  try {
    const { filePath, metadata } = req.body;
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    const nameParts = fileName.split('_');
    
    const mediaMetadata = {
      id: fileName.replace(/\./g, '_'),
      fileName,
      filePath,
      size: metadata?.size || 0,
      contentType: metadata?.contentType || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      url: `https://f005.backblazeb2.com/file/${B2_CONFIG.bucketName}/${filePath}`,
      thumbnailUrl: `https://f005.backblazeb2.com/file/${B2_CONFIG.bucketName}/${filePath}`,
      area: metadata?.area || 'GERAL',
      nucleo: metadata?.nucleo,
      tema: metadata?.tema || 'GERAL',
      status: metadata?.status || 'Entrada (Bruto)',
      ponto: metadata?.ponto,
      tipoProjeto: metadata?.tipoProjeto,
      funcaoHistorica: metadata?.funcaoHistorica,
      evento: metadata?.evento,
      ano: nameParts[0] || '',
      mes: nameParts[1] || '',
      dia: nameParts[2] || '',
      uuid: nameParts[7]?.split('.')[0] || '',
      extensao: nameParts[7]?.split('.')[1] || '',
    };
    
    saveMetadata(mediaMetadata);
    
    res.json({
      success: true,
      data: {
        message: 'Upload confirmado',
        id: mediaMetadata.id,
        url: mediaMetadata.url,
      }
    });
  } catch (error) {
    console.error('[Complete] Erro:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload - Test
app.get('/api/upload/test', async (req, res) => {
  try {
    const auth = await authorizeB2();
    res.json({
      success: true,
      message: 'Conexão OK',
      data: { apiUrl: auth.apiUrl, bucket: B2_CONFIG.bucketName }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Media - List
app.get('/api/media', (req, res) => {
  try {
    let medias = getAllMetadata();
    
    // Filtros
    const { area, nucleo, tema, status, search } = req.query;
    if (area) medias = medias.filter(m => m.area === area);
    if (nucleo) medias = medias.filter(m => m.nucleo === nucleo);
    if (tema) medias = medias.filter(m => m.tema === tema);
    if (status) medias = medias.filter(m => m.status === status);
    if (search) {
      const q = search.toLowerCase();
      medias = medias.filter(m => 
        m.fileName.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q) ||
        m.tema.toLowerCase().includes(q)
      );
    }
    
    // Ordena por data (mais recente primeiro)
    medias.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    // Adiciona tipo
    const result = medias.map(m => ({
      ...m,
      tipo: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(m.extensao?.toLowerCase()) ? 'imagem' : 'video'
    }));
    
    res.json({ success: true, data: result, total: result.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Media - Stats
app.get('/api/media/stats', (req, res) => {
  try {
    const stats = getEstatisticas();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Media - Get by ID
app.get('/api/media/:id', (req, res) => {
  try {
    const media = getMetadataById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, error: 'Não encontrado' });
    }
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Media - Delete
app.delete('/api/media/:id', (req, res) => {
  try {
    const success = deleteMetadata(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Não encontrado' });
    }
    res.json({ success: true, message: 'Deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Folders - List
app.get('/api/folders', (req, res) => {
  try {
    const all = getAllMetadata();
    const counts = {};
    
    all.forEach(m => {
      const base = m.filePath.split('/')[0];
      counts[base] = (counts[base] || 0) + 1;
    });
    
    const folders = [
      { id: 'entrada', name: '00 - Entrada (Bruto)', slug: FOLDER_STRUCTURE.ENTRADA, count: counts[FOLDER_STRUCTURE.ENTRADA] || 0 },
      { id: 'catalogado', name: '01 - Catalogado', slug: FOLDER_STRUCTURE.CATALOGADO, count: counts[FOLDER_STRUCTURE.CATALOGADO] || 0 },
      { id: 'producao', name: '02 - Em Produção', slug: FOLDER_STRUCTURE.PRODUCAO, count: counts[FOLDER_STRUCTURE.PRODUCAO] || 0 },
      { id: 'publicado', name: '03 - Publicado', slug: FOLDER_STRUCTURE.PUBLICADO, count: counts[FOLDER_STRUCTURE.PUBLICADO] || 0 },
      { id: 'arquivado', name: '04 - Arquivado', slug: FOLDER_STRUCTURE.ARQUIVADO, count: counts[FOLDER_STRUCTURE.ARQUIVADO] || 0 },
    ];
    
    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// FRONTEND - HTML INLINE
// ============================================

const HTML_FRONTEND = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RC Acervo - Biblioteca de Fotos</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --rc-dark: #0d2b1f; --rc-green: #1a4d3a; --rc-gold: #d4a574; --rc-cream: #f5f0e6; }
    body { font-family: 'Inter', sans-serif; background: var(--rc-dark); color: var(--rc-cream); min-height: 100vh; }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    header { background: rgba(26, 77, 58, 0.5); border-bottom: 1px solid rgba(212, 165, 116, 0.2); padding: 20px 0; margin-bottom: 30px; }
    .header-content { display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 15px; }
    .logo-icon { width: 50px; height: 50px; background: var(--rc-gold); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .logo-text h1 { color: var(--rc-gold); font-size: 24px; font-weight: 700; }
    .logo-text p { color: rgba(245, 240, 230, 0.6); font-size: 14px; }
    .server-status { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(0, 0, 0, 0.3); border-radius: 20px; font-size: 14px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 2s infinite; }
    .status-online { background: #4ade80; }
    .status-offline { background: #ef4444; }
    .status-checking { background: #fbbf24; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    nav { display: flex; gap: 10px; margin-bottom: 30px; }
    .nav-btn { padding: 12px 24px; background: transparent; border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; color: var(--rc-cream); cursor: pointer; transition: all 0.2s; font-size: 14px; }
    .nav-btn:hover { background: rgba(212, 165, 116, 0.1); border-color: rgba(212, 165, 116, 0.5); }
    .nav-btn.active { background: var(--rc-gold); color: var(--rc-dark); border-color: var(--rc-gold); font-weight: 600; }
    .upload-btn { padding: 12px 24px; background: var(--rc-gold); color: var(--rc-dark); border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
    .upload-btn:hover { background: #c49a6a; }
    .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: rgba(26, 77, 58, 0.3); border: 1px solid rgba(212, 165, 116, 0.2); border-radius: 12px; padding: 20px; }
    .stat-card h3 { font-size: 14px; color: rgba(245, 240, 230, 0.6); margin-bottom: 8px; }
    .stat-card .value { font-size: 32px; font-weight: 700; color: var(--rc-cream); }
    .filters { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; padding: 20px; background: rgba(26, 77, 58, 0.3); border-radius: 12px; }
    .filter-group { flex: 1; min-width: 200px; }
    .filter-group label { display: block; font-size: 12px; color: rgba(245, 240, 230, 0.6); margin-bottom: 5px; }
    .filter-group select, .filter-group input { width: 100%; padding: 10px 15px; background: var(--rc-dark); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; color: var(--rc-cream); font-size: 14px; }
    .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .media-card { background: rgba(26, 77, 58, 0.3); border: 1px solid rgba(212, 165, 116, 0.2); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
    .media-card:hover { border-color: rgba(212, 165, 116, 0.5); transform: translateY(-2px); }
    .media-preview { aspect-ratio: 4/3; background: rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; position: relative; }
    .media-preview img { width: 100%; height: 100%; object-fit: cover; }
    .media-preview .icon { font-size: 48px; }
    .media-status { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-entrada { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    .status-catalogado { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
    .media-info { padding: 15px; }
    .media-info h4 { font-size: 14px; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .media-info p { font-size: 12px; color: rgba(245, 240, 230, 0.6); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal-overlay.active { display: flex; }
    .modal { background: var(--rc-dark); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow: auto; }
    .modal-header { padding: 20px; border-bottom: 1px solid rgba(212, 165, 116, 0.2); display: flex; align-items: center; justify-content: space-between; }
    .modal-header h2 { color: var(--rc-gold); }
    .modal-close { background: none; border: none; color: var(--rc-cream); font-size: 24px; cursor: pointer; }
    .modal-body { padding: 20px; }
    .drop-zone { border: 2px dashed rgba(212, 165, 116, 0.3); border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .drop-zone:hover { border-color: rgba(212, 165, 116, 0.6); background: rgba(212, 165, 116, 0.05); }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
    .form-group label { display: block; font-size: 12px; color: rgba(245, 240, 230, 0.6); margin-bottom: 5px; }
    .form-group select { width: 100%; padding: 10px 15px; background: var(--rc-dark); border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; color: var(--rc-cream); }
    .file-list { margin-top: 20px; }
    .file-item { display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; margin-bottom: 10px; }
    .file-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
    .file-item .info { flex: 1; }
    .progress-bar { height: 4px; background: rgba(0, 0, 0, 0.3); border-radius: 2px; overflow: hidden; margin-top: 8px; }
    .progress-fill { height: 100%; background: var(--rc-gold); transition: width 0.3s; }
    .modal-footer { padding: 20px; border-top: 1px solid rgba(212, 165, 116, 0.2); display: flex; justify-content: flex-end; gap: 10px; }
    .btn-secondary { padding: 12px 24px; background: transparent; border: 1px solid rgba(212, 165, 116, 0.3); border-radius: 8px; color: var(--rc-cream); cursor: pointer; }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-state .icon { font-size: 64px; margin-bottom: 20px; opacity: 0.5; }
    .loading { display: flex; align-items: center; justify-content: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(212, 165, 116, 0.3); border-top-color: var(--rc-gold); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <header>
    <div class="container header-content">
      <div class="logo">
        <div class="logo-icon">📷</div>
        <div class="logo-text">
          <h1>RC Acervo</h1>
          <p>Biblioteca de Fotos</p>
        </div>
      </div>
      <div class="server-status">
        <span class="status-dot status-checking" id="status-dot"></span>
        <span id="status-text">Verificando...</span>
      </div>
    </div>
  </header>

  <main class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
      <nav>
        <button class="nav-btn active" onclick="showView('dashboard')">Dashboard</button>
        <button class="nav-btn" onclick="showView('catalogo')">Catálogo</button>
      </nav>
      <button class="upload-btn" id="upload-btn" onclick="openUploadModal()" disabled>
        📤 Novo Upload
      </button>
    </div>

    <div id="view-dashboard">
      <div class="stats-grid" id="stats-grid">
        <div class="stat-card"><h3>Total de Itens</h3><div class="value" id="stat-total">-</div></div>
        <div class="stat-card"><h3>Imagens</h3><div class="value" id="stat-imagens">-</div></div>
        <div class="stat-card"><h3>Vídeos</h3><div class="value" id="stat-videos">-</div></div>
      </div>
    </div>

    <div id="view-catalogo" class="hidden">
      <div class="filters">
        <div class="filter-group">
          <label>Buscar</label>
          <input type="text" id="search-input" placeholder="Nome, área, tema..." oninput="filterMedias()">
        </div>
        <div class="filter-group">
          <label>Área</label>
          <select id="filter-area" onchange="filterMedias()"><option value="">Todas</option></select>
        </div>
        <div class="filter-group">
          <label>Tema</label>
          <select id="filter-tema" onchange="filterMedias()"><option value="">Todos</option></select>
        </div>
        <div class="filter-group">
          <label>Status</label>
          <select id="filter-status" onchange="filterMedias()"><option value="">Todos</option></select>
        </div>
      </div>
      <div id="media-count" style="margin-bottom: 20px; color: rgba(245, 240, 230, 0.6);"></div>
      <div class="media-grid" id="media-grid"><div class="loading"><div class="spinner"></div></div></div>
    </div>
  </main>

  <div class="modal-overlay" id="upload-modal">
    <div class="modal">
      <div class="modal-header">
        <h2>Upload de Arquivos</h2>
        <button class="modal-close" onclick="closeUploadModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="drop-zone" id="drop-zone" onclick="document.getElementById('file-input').click()">
          <div style="font-size: 48px; margin-bottom: 15px;">📁</div>
          <p style="font-size: 16px; margin-bottom: 10px;">Arraste arquivos aqui ou clique para selecionar</p>
          <p style="font-size: 14px; color: rgba(245, 240, 230, 0.5);">Imagens (JPG, PNG) e Vídeos (MP4, MOV)</p>
          <input type="file" id="file-input" multiple accept="image/*,video/*" style="display: none;" onchange="handleFiles(this.files)">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Área / Fazenda *</label>
            <select id="upload-area" required><option value="">Selecione...</option></select>
          </div>
          <div class="form-group">
            <label>Núcleo</label>
            <select id="upload-nucleo"><option value="">Selecione...</option></select>
          </div>
          <div class="form-group">
            <label>Tema Principal *</label>
            <select id="upload-tema" required><option value="">Selecione...</option></select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="upload-status">
              <option value="Entrada (Bruto)">Entrada (Bruto)</option>
              <option value="Catalogado">Catalogado</option>
              <option value="Em produção">Em produção</option>
              <option value="Publicado">Publicado</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </div>
        </div>
        <div class="file-list" id="file-list"></div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeUploadModal()">Cancelar</button>
        <button class="upload-btn" id="btn-start-upload" onclick="startUpload()" disabled>Enviar Arquivos</button>
      </div>
    </div>
  </div>

  <script>
    const AREAS = ['Vila Canabrava', "Olhos d'Água", 'Boa Vista', 'São João', 'Santa Maria', 'Outra'];
    const NUCLEOS_PECUARIA = ['Cria', 'Recria', 'Engorda', 'Maternidade', 'Curral', 'Outro'];
    const NUCLEOS_AGRO = ['Agricultura', 'Silvicultura', 'Irrigação', 'Outro'];
    const TEMAS = ['Terra e Sertão', 'Tradição', 'Inovação', 'Sustentabilidade', 'Família', 'História', 'Outro'];
    const STATUS = ['Entrada (Bruto)', 'Catalogado', 'Em produção', 'Publicado', 'Arquivado'];
    
    let allMedias = [];
    let uploadFiles = [];
    
    document.addEventListener('DOMContentLoaded', () => {
      populateSelects();
      checkHealth();
      loadData();
      setupDragDrop();
    });
    
    function populateSelects() {
      ['filter-area', 'upload-area'].forEach(id => {
        const select = document.getElementById(id);
        AREAS.forEach(a => { const opt = document.createElement('option'); opt.value = a; opt.textContent = a; select.appendChild(opt); });
      });
      
      const nucleoSelect = document.getElementById('upload-nucleo');
      const optGroupPec = document.createElement('optgroup'); optGroupPec.label = 'Pecuária';
      NUCLEOS_PECUARIA.forEach(n => { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; optGroupPec.appendChild(opt); });
      nucleoSelect.appendChild(optGroupPec);
      const optGroupAgro = document.createElement('optgroup'); optGroupAgro.label = 'Agro';
      NUCLEOS_AGRO.forEach(n => { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; optGroupAgro.appendChild(opt); });
      nucleoSelect.appendChild(optGroupAgro);
      
      ['filter-tema', 'upload-tema'].forEach(id => {
        const select = document.getElementById(id);
        TEMAS.forEach(t => { const opt = document.createElement('option'); opt.value = t; opt.textContent = t; select.appendChild(opt); });
      });
      
      const statusSelect = document.getElementById('filter-status');
      STATUS.forEach(s => { const opt = document.createElement('option'); opt.value = s; opt.textContent = s; statusSelect.appendChild(opt); });
    }
    
    async function checkHealth() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
       setServerStatus(data.success && data.status === 'ok' ? 'online' : 'offline');
      } catch { setServerStatus('offline'); }
    }
    
    function setServerStatus(status) {
      document.getElementById('status-dot').className = 'status-dot status-' + status;
      document.getElementById('status-text').textContent = status === 'online' ? 'Servidor Online' : 'Servidor Offline';
      document.getElementById('upload-btn').disabled = status !== 'online';
    }
    
    async function loadData() {
      try {
        const [mediasRes, statsRes] = await Promise.all([fetch('/api/media'), fetch('/api/media/stats')]);
        const mediasData = await mediasRes.json();
        const statsData = await statsRes.json();
        if (mediasData.success) { allMedias = mediasData.data || []; renderMedias(allMedias); }
        if (statsData.success) { renderStats(statsData.data); }
      } catch (error) { console.error('Erro:', error); }
    }
    
    function renderStats(stats) {
      document.getElementById('stat-total').textContent = stats?.totalItens || 0;
      document.getElementById('stat-imagens').textContent = stats?.totalImagens || 0;
      document.getElementById('stat-videos').textContent = stats?.totalVideos || 0;
    }
    
    function renderMedias(medias) {
      const grid = document.getElementById('media-grid');
      document.getElementById('media-count').textContent = medias.length + ' arquivo(s)';
      if (medias.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><div class="icon">📁</div><h3>Nenhum arquivo encontrado</h3><p>Faça upload de arquivos para começar</p></div>';
        return;
      }
      grid.innerHTML = medias.map(m => \`
        <div class="media-card" onclick="window.open('\${m.url}', '_blank')">
          <div class="media-preview">
            \${m.tipo === 'imagem' ? \`<img src="\${m.thumbnailUrl}" alt="\${m.fileName}" loading="lazy">\` : '<div class="icon">🎥</div>'}
            <span class="media-status status-\${m.status.toLowerCase().replace(/[^a-z]/g, '')}">\${m.status}</span>
          </div>
          <div class="media-info">
            <h4>\${m.area}\${m.nucleo ? ' - ' + m.nucleo : ''}</h4>
            <p>\${m.tema}</p>
            <p style="margin-top: 5px; font-size: 11px;">\${new Date(m.uploadedAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      \`).join('');
    }
    
    function filterMedias() {
      const search = document.getElementById('search-input').value.toLowerCase();
      const area = document.getElementById('filter-area').value;
      const tema = document.getElementById('filter-tema').value;
      const status = document.getElementById('filter-status').value;
      const filtered = allMedias.filter(m => {
        if (search && !m.fileName.toLowerCase().includes(search) && !m.area.toLowerCase().includes(search) && !m.tema.toLowerCase().includes(search)) return false;
        if (area && m.area !== area) return false;
        if (tema && m.tema !== tema) return false;
        if (status && m.status !== status) return false;
        return true;
      });
      renderMedias(filtered);
    }
    
    function showView(view) {
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('view-dashboard').classList.toggle('hidden', view !== 'dashboard');
      document.getElementById('view-catalogo').classList.toggle('hidden', view !== 'catalogo');
      if (view === 'catalogo') renderMedias(allMedias);
    }
    
    function openUploadModal() { document.getElementById('upload-modal').classList.add('active'); uploadFiles = []; renderFileList(); }
    function closeUploadModal() { document.getElementById('upload-modal').classList.remove('active'); uploadFiles = []; }
    
    function setupDragDrop() {
      const dropZone = document.getElementById('drop-zone');
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--rc-gold)'; });
      dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
      dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.style.borderColor = ''; handleFiles(e.dataTransfer.files); });
    }
    
    function handleFiles(files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadFiles.push({ file, preview: file.type.startsWith('image/') ? e.target.result : null, progress: 0, status: 'pending' });
          renderFileList();
        };
        if (file.type.startsWith('image/')) reader.readAsDataURL(file);
        else { uploadFiles.push({ file, preview: null, progress: 0, status: 'pending' }); renderFileList(); }
      });
    }
    
    function renderFileList() {
      const list = document.getElementById('file-list');
      const btn = document.getElementById('btn-start-upload');
      btn.disabled = uploadFiles.length === 0 || !document.getElementById('upload-area').value || !document.getElementById('upload-tema').value;
      if (uploadFiles.length === 0) { list.innerHTML = ''; return; }
      list.innerHTML = uploadFiles.map((f, i) => \`
        <div class="file-item">
          \${f.preview ? \`<img src="\${f.preview}">\` : '<div style="width: 50px; height: 50px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📄</div>'}
          <div class="info">
            <h4>\${f.file.name}</h4>
            <p>\${(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
            \${f.status === 'uploading' ? '<div class="progress-bar"><div class="progress-fill" style="width: ' + f.progress + '%"></div></div>' : ''}
          </div>
          <button onclick="uploadFiles.splice(\${i}, 1); renderFileList();" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 20px;">&times;</button>
        </div>
      \`).join('');
    }
    
    async function startUpload() {
      const area = document.getElementById('upload-area').value;
      const nucleo = document.getElementById('upload-nucleo').value;
      const tema = document.getElementById('upload-tema').value;
      const status = document.getElementById('upload-status').value;
      
      if (!area || !tema) { alert('Preencha Área e Tema'); return; }
      
      const btn = document.getElementById('btn-start-upload');
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      
      for (let i = 0; i < uploadFiles.length; i++) {
        const fileData = uploadFiles[i];
        fileData.status = 'uploading';
        renderFileList();
        
        try {
          const presignedRes = await fetch('/api/upload/presigned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: fileData.file.name, contentType: fileData.file.type, size: fileData.file.size, metadata: { area, nucleo, tema, status } })
          });
          const presignedData = await presignedRes.json();
          if (!presignedData.success) throw new Error(presignedData.error);
          
          await fetch(presignedData.data.presignedUrl, {
            method: 'PUT',
            headers: presignedData.data.headers,
            body: fileData.file
          });
          
          await fetch('/api/upload/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: presignedData.data.filePath, metadata: { size: fileData.file.size, contentType: fileData.file.type, area, nucleo, tema, status } })
          });
          
          fileData.status = 'done';
          fileData.progress = 100;
        } catch (error) {
          console.error('Erro:', error);
          fileData.status = 'error';
        }
        renderFileList();
      }
      
      btn.textContent = 'Concluído!';
      setTimeout(() => { closeUploadModal(); loadData(); }, 1500);
    }
  </script>
</body>
</html>`;

// Rota principal - serve o frontend
app.get('/', (req, res) => {
  res.send(HTML_FRONTEND);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ success: false, error: 'Erro interno' });
});

// Start
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          RC ACERVO v2 - Servidor Iniciado                  ║');
  console.log(`║  Porta: ${PORT.toString().padEnd(54)} ║`);
  console.log(`║  Bucket: ${B2_CONFIG.bucketName.padEnd(53)} ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
});
