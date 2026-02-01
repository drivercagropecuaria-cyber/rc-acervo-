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
app.use(express.static(path.join(__dirname, 'public')));

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
    apiUrl: response.data.apiInfo.storageApi.apiUrl,
    downloadUrl: response.data.apiInfo.storageApi.downloadUrl,
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
// ROTAS
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

// Frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
