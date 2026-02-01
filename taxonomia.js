/**
 * RC AGROPECUÁRIA - TAXONOMIA COMPLETA DO SISTEMA DE ACERVO
 * Total: 530+ elementos classificatórios
 * @version 2.0
 */

const TAXONOMIA = {
  // 2.1 ÁREAS E FAZENDAS (13 unidades)
  areasFazendas: [
    { id: "VILACAN", nome: "Vila Canabrava", descricao: "Unidade central e símbolo do sistema produtivo, cultura e legado da RC Agropecuária." },
    { id: "OLHOSAG", nome: "Olhos d'Água", descricao: "Unidade de captação e produção com rotinas intensas de manejo, água e pastagens." },
    { id: "SANTAMA", nome: "Santa Maria", descricao: "Unidade vinculada a operações de cria, manejo e rotina de campo (filmagens recorrentes)." },
    { id: "JEQUITA", nome: "Jequitaí", descricao: "Unidade de produção e captações do ciclo anual; logística e rotina de fazenda." },
    { id: "TERRANO", nome: "Terra Nova", descricao: "Unidade de operações e captações; integra manejo, infraestrutura e produtividade." },
    { id: "UNIAOXX", nome: "União", descricao: "Unidade estratégica de produção; forte uso em rotinas de reprodução e manejo." },
    { id: "RETUNIA", nome: "Retiro União", descricao: "Núcleo de trabalho de campo (apartações, protocolos, marcos operacionais)." },
    { id: "BHESCRI", nome: "Belo Horizonte (Escritório)", descricao: "Centro de gestão, planejamento, reuniões, estratégia, comunicação e marca." },
    { id: "ROTAEST", nome: "Rotas e Estradas (Deslocamentos)", descricao: "Registros de deslocamento, logística, bastidores e narrativa de caminho." },
    { id: "LOCALEX", nome: "Locais Externos (Eventos e Parceiros)", descricao: "Feiras, congressos, visitas técnicas, reuniões externas e representatividade." },
    { id: "TATEREC", nome: "Tatersal / Recinto de Leilão", descricao: "Espaço de eventos de comercialização, recepção e narrativa pública do rebanho." },
    { id: "EXPOMIN", nome: "Expominas (Belo Horizonte)", descricao: "Marco de representatividade e posicionamento institucional (congressos e palestras)." },
    { id: "CURVELO", nome: "Curvelo (Marco Histórico)", descricao: "Referência territorial e histórica na trajetória do fundador e do início do legado." }
  ],

  // 2.2 PONTOS DE CAPTAÇÃO (25 locais)
  pontos: [
    { id: "CURRMAN", nome: "Curral de Manejo", descricao: "Local de apartação, contenção, manejo sanitário, pesagem e procedimentos." },
    { id: "BALANCA", nome: "Balança", descricao: "Ponto de pesagem, conferência, dados zootécnicos e padronização de controle." },
    { id: "MATERNI", nome: "Maternidade", descricao: "Pasto e área voltada a partos, recém-nascidos, cuidado materno e observação." },
    { id: "PASTOXX", nome: "Pasto", descricao: "Área de produção a pasto, manejo de lotes, observação e rotina do gado." },
    { id: "CONFINA", nome: "Confinamento", descricao: "Infraestrutura de dieta controlada, loteamento, engorda estratégica e eficiência." },
    { id: "SILOXXX", nome: "Silo", descricao: "Armazenamento de silagem, abastecimento e segurança nutricional." },
    { id: "LA VOURA", nome: "Lavoura", descricao: "Área agrícola (milho para silagem, rotação, preparo e colheita)." },
    { id: "PIVOCEN", nome: "Pivô Central de Irrigação", descricao: "Infraestrutura de irrigação e produtividade; água como tecnologia e estratégia." },
    { id: "FABRBIO", nome: "Fábrica de Bioinsumos", descricao: "Núcleo de inovação para controle biológico, fertilidade e sustentabilidade." },
    { id: "CURVNIV", nome: "Curvas de Nível / Conservação do Solo", descricao: "Obras e práticas de contenção, infiltração de água e proteção do solo." },
    { id: "BEBEDOU", nome: "Bebedouro", descricao: "Ponto de água do rebanho; qualidade e distribuição hídrica." },
    { id: "BARRAGE", nome: "Barragem / Represa", descricao: "Reserva hídrica e base de irrigação e segurança do sistema." },
    { id: "NASCENT", nome: "Nascente / Vereda", descricao: "Origem de água; preservação, território e sustentabilidade." },
    { id: "EMBDESM", nome: "Área de Embarque e Desembarque", descricao: "Logística de transporte, comercialização e movimentação de lotes." },
    { id: "ESTPORT", nome: "Estradas Internas e Porteiras", descricao: "Logística operacional, rotas de serviço, mobilidade e acesso a lotes." },
    { id: "OFICINA", nome: "Oficina / Manutenção", descricao: "Reparo de máquinas, implementos, frota e prontidão operacional." },
    { id: "ALMOXAR", nome: "Almoxarifado / Estoque", descricao: "Controle de insumos, materiais, peças, equipamentos e organização." },
    { id: "GARAGEM", nome: "Garagem / Frota", descricao: "Base de veículos e máquinas; manutenção e logística diária." },
    { id: "ALOJAME", nome: "Alojamentos / Moradias (Vila)", descricao: "Vida comunitária, cultura interna, história das famílias e pertencimento." },
    { id: "REFEITO", nome: "Refeitório / Cozinha", descricao: "Rotina humana, cuidado com pessoas e cultura interna." },
    { id: "SEDECAS", nome: "Sede / Casa Principal", descricao: "Recepção, marcos simbólicos, entrevistas e narrativa institucional." },
    { id: "ESCFAZA", nome: "Escritório (Fazenda)", descricao: "Gestão local, registros, decisões e alinhamento operacional." },
    { id: "SALAREU", nome: "Sala de Reunião", descricao: "Planejamento, governança, metas e alinhamento de liderança." },
    { id: "IGREJAX", nome: "Igreja / Capela / Procissão (quando houver)", descricao: "Dimensão espiritual, rito, tradição e cultura local." },
    { id: "VISITEC", nome: "Área de Visitas Técnicas", descricao: "Recepção de especialistas, parceiros, clientes e validação do sistema." }
  ],

  // 2.3 TIPOS DE PROJETO DE CAPTAÇÃO (15 tipos)
  tiposProjeto: [
    { id: "DOCLONG", nome: "Documentário (capítulo longo)", descricao: "Narrativa longa com arco, capítulos e construção de legado." },
    { id: "SERIEPD", nome: "Série (episódios curtos recorrentes)", descricao: "Episódios contínuos, rotina e repetição estratégica de temas." },
    { id: "ROTICAM", nome: "Rotina de Campo (dia a dia)", descricao: "Registro operacional diário com valor de método e cultura." },
    { id: "MANIFIN", nome: "Manifesto institucional (posicionamento)", descricao: "Peça de visão, valores e defesa do propósito." },
    { id: "MARCAIN", nome: "Marca e Institucional (branding)", descricao: "Conteúdo de identidade, reputação e consistência pública." },
    { id: "EVENTCO", nome: "Evento (cobertura)", descricao: "Cobertura de marcos públicos, recepção e movimento de mercado." },
    { id: "PERFIPD", nome: "Perfil e Personagem (pessoas e histórias)", descricao: "Histórias de pessoas, funções, cultura e heróis do cotidiano." },
    { id: "MANUTRE", nome: "Manual e Treinamento (procedimentos)", descricao: "Padronização técnica e capacitação (como fazer, passo a passo)." },
    { id: "ACERVRE", nome: "Acervo e Registro (memória e arquivo)", descricao: "Registro canônico para Casa de Memória: guardar, catalogar e ensinar." },
    { id: "CIENCTEC", nome: "Ciência e Tecnologia (dados, genética, sistemas)", descricao: "Conteúdo técnico, dados, inovação e método aplicado." },
    { id: "COMERCI", nome: "Comercial (chamada de venda)", descricao: "Peças de oferta, convite, leilão e conversão." },
    { id: "ENTREVI", nome: "Entrevista (depoimento guiado)", descricao: "Depoimento com roteiro: visão, técnica, história e posicionamento." },
    { id: "PAISCLI", nome: "Paisagem e Clima (chuva, seca, natureza)", descricao: "Conteúdo simbólico do território, clima e ciclos." },
    { id: "RELATHI", nome: "Relato histórico (memória e marcos)", descricao: "Marcos, cronologia, origem e construção de legado." },
    { id: "BASTIDE", nome: "Bastidores (making of e processos)", descricao: "Processo por trás da entrega: equipe, gravação, método e rotina." }
  ],

  // 2.4 NÚCLEOS DA PECUÁRIA COM SUBNÚCLEOS (30 núcleos)
  nucleosPecuaria: {
    "Cria": ["Nascimento e maternidade", "Desmama", "Formação de lote"],
    "Recria": ["Desenvolvimento a pasto"],
    "Engorda": ["Terminação"],
    "Reprodução": ["Inseminação artificial em tempo fixo", "Inseminação artificial", "Transferência de embriões", "Diagnóstico de gestação"],
    "Genética e Melhoramento": ["Seleção de reprodutores", "Guzerá puro de origem", "Nelore puro de origem", "Cruzamento Zebu x Zebu (Guzonel)", "Heterose e vigor híbrido"],
    "Sanidade": ["Vacinação", "Controle parasitário", "Bem-estar animal"],
    "Nutrição": ["Pasto e suplementação", "Silagem", "Ração proteica e balanceamento"],
    "Manejo": ["Apartação", "Pesagem e conferência", "Marcação e identificação", "Andrológico e avaliação de touros"],
    "Confinamento": ["Entrada e adaptação", "Rodada e saída"],
    "Logística Pecuária": ["Transporte e embarques"],
    "Qualidade Total (Controle)": ["Medir, anotar, avaliar e apartar", "Sistemas e dados de campo"],
    "Comercialização": ["Leilões e oferta pública"]
  },

  // 2.5 NÚCLEOS DO AGRO (TERRA E ÁGUA) (21 núcleos)
  nucleosAgro: {
    "Agricultura": ["Plantio", "Colheita", "Insumos e adubação", "Armazenamento"],
    "Solo": ["Conservação", "Curvas de nível", "Recuperação"],
    "Pastagens": ["Manejo rotacionado", "Adubação e correção"],
    "Água": ["Nascentes e veredas", "Barragens e represas", "Distribuição e bebedouros"],
    "Irrigação": ["Pivô central"],
    "Silagem": ["Lavoura de milho", "Produção e ensilagem"],
    "Bioinsumos": ["Fabricação", "Controle biológico"],
    "Meio Ambiente": ["Preservação de áreas", "Conformidade e boas práticas"],
    "Clima": ["Seca e transição", "Chegada das chuvas"]
  },

  // 2.6 OPERAÇÕES INTERNAS (18 núcleos)
  operacoes: {
    "Infraestrutura": ["Cercas e porteiras", "Estradas internas", "Instalações de curral", "Armazéns, silos e depósitos"],
    "Máquinas e Implementos": ["Manutenção e oficina", "Operação de campo"],
    "Frota": ["Logística interna"],
    "Logística": ["Combustível e abastecimento"],
    "Compras e Estoque": ["Almoxarifado"],
    "Segurança do Trabalho": ["Equipamentos e procedimentos"],
    "Pessoas e Treinamento": ["Capacitação", "Cultura e ambiente"],
    "Dados e Sistemas": ["Registro de campo", "Gestão zootécnica"],
    "Comunicação Interna": ["Alinhamento e rotinas"],
    "Manutenção Predial": ["Sede, casas e alojamentos"],
    "Energia e Recursos": ["Controle e eficiência"],
    "Qualidade e Conformidade": ["Rotinas e regras"]
  },

  // 2.7 MARCA E VALORIZAÇÃO (12 núcleos)
  marca: {
    "Posicionamento": ["Manifesto e narrativa"],
    "Educação e Cultura": ["Conteúdo educativo"],
    "Produtos e Projetos": ["Qualidade Total"],
    "Mercado e Comercial": ["Relacionamento com clientes"],
    "Representatividade": ["Setor e classe"],
    "Genética como Marca": ["Guzonel e seleção"],
    "Casa de Memória e Futuro": ["Acervo e legado"],
    "Mídia e Conteúdo": ["Instagram, YouTube, documentários"],
    "Eventos e Institucional": ["Congressos e leilões"],
    "Sustentabilidade como Marca": ["Água, solo, boas práticas"],
    "Reputação e Confiança": ["Normas e condutas"],
    "Comunidade e Pessoas": ["Histórias e cultura interna"]
  },

  // 2.8 TEMAS PRINCIPAIS (50 temas)
  temasPrincipais: [
    "Terra e Sertão", "Origem e Propósito", "Legado", "Fé e Espiritualidade",
    "Rotina do Campo", "O Vaqueiro", "O Cavalo", "Bem-estar Animal",
    "Cria", "Maternidade", "Desmama", "Manejo e Apartação",
    "Pesagem e Controle", "Sanidade", "Nutrição", "Silagem",
    "Confinamento", "Reprodução", "Inseminação em Tempo Fixo",
    "Diagnóstico de Gestação", "Andrológico de Touros", "Genética e Seleção",
    "Guzerá Puro de Origem", "Nelore Puro de Origem",
    "Cruzamento Zebu x Zebu (Guzonel)", "Heterose e Eficiência",
    "Qualidade Total", "Gestão e Planejamento", "Sistemas e Dados",
    "Água", "Veredas e Nascentes", "Barragens e Reservas", "Irrigação",
    "Solo e Conservação", "Curvas de Nível", "Pastagens",
    "Agricultura do Sistema", "Bioinsumos", "Sustentabilidade",
    "Logística e Embarques", "Leilão", "Clientes e Relacionamento",
    "Representatividade", "Congressos e Palestras", "Cultura Interna",
    "Treinamento e Disciplina", "Comunicação e Mídia",
    "Documentário e Filme", "Casa de Memória e Futuro", "Futuro do Agro"
  ],

  // 2.9 TEMAS SECUNDÁRIOS (100+ temas)
  temasSecundarios: {
    "Terra e Sertão": ["Horizonte e paisagem", "Seca e resistência"],
    "Origem e Propósito": ["Decisão fundadora", "Visão de longo prazo"],
    "Legado": ["Tradição que continua", "Responsabilidade sobre o amanhã"],
    "Fé e Espiritualidade": ["Oração por chuvas", "Gratidão pelo trabalho"],
    "Rotina do Campo": ["Amanhecer na fazenda", "Toada do trabalho"],
    "O Vaqueiro": ["Honra do serviço", "Heróis silenciosos"],
    "O Cavalo": ["Respeito ao animal de serviço", "Rodízio e cuidado"],
    "Bem-estar Animal": ["Manejo calmo", "Infraestrutura adequada"],
    "Cria": ["Primeiros cuidados", "Organização de lotes"],
    "Maternidade": ["Habilidade materna", "Vida nascendo"],
    "Desmama": ["Transição com método", "Reorganização pós-desmama"],
    "Manejo e Apartação": ["Critério e destino", "Trabalho em equipe"],
    "Pesagem e Controle": ["Dados zootécnicos", "Disciplina de rotina"],
    "Sanidade": ["Calendário sanitário", "Controle parasitário"],
    "Nutrição": ["Suplementação estratégica", "Volumoso de qualidade"],
    "Silagem": ["Plantio para silagem", "Ensilagem e armazenamento"],
    "Confinamento": ["Adaptação de dieta", "Transição seca-águas"],
    "Reprodução": ["Eficiência reprodutiva", "Planejamento de estação"],
    "Inseminação em Tempo Fixo": ["Dia do protocolo", "Escala e padronização"],
    "Diagnóstico de Gestação": ["Controle de prenhez", "Ajuste de estratégia"],
    "Andrológico de Touros": ["Avaliação reprodutiva", "Seleção e descarte"],
    "Genética e Seleção": ["Acasalamento dirigido", "Registro de desempenho"],
    "Guzerá Puro de Origem": ["Rusticidade do sertão", "Habilidade materna"],
    "Nelore Puro de Origem": ["Precocidade", "Padrão de carcaça"],
    "Cruzamento Zebu x Zebu (Guzonel)": ["Vigor híbrido", "Simplicidade de manejo"],
    "Heterose e Eficiência": ["Ganho à desmama", "Consistência de desempenho"],
    "Qualidade Total": ["Medir", "Anotar", "Avaliar", "Apartar"],
    "Gestão e Planejamento": ["Rotina organizada", "Metas e indicadores"],
    "Sistemas e Dados": ["Registro de campo", "Decisão baseada em evidência"],
    "Água": ["Distribuição para o rebanho", "Qualidade e segurança hídrica"],
    "Veredas e Nascentes": ["Preservação e respeito", "Educação ambiental aplicada"],
    "Barragens e Reservas": ["Reserva estratégica", "Integração com irrigação"],
    "Irrigação": ["Pivô central como tecnologia", "Eficiência no uso da água"],
    "Solo e Conservação": ["Proteção contra erosão", "Melhoria contínua do solo"],
    "Curvas de Nível": ["Infiltração e retenção", "Pasto mais produtivo"],
    "Pastagens": ["Rotação de lotes", "Recuperação de áreas"],
    "Agricultura do Sistema": ["Milho como base nutricional", "Tecnologia agrícola"],
    "Bioinsumos": ["Controle natural", "Inovação interna"],
    "Sustentabilidade": ["Boas práticas e conformidade", "Responsabilidade socioambiental"],
    "Logística e Embarques": ["Estrada afora", "Organização de transporte"],
    "Leilão": ["Preparação de lotes", "Recepção e experiência do cliente"],
    "Clientes e Relacionamento": ["Confiança construída", "Pós-venda e proximidade"],
    "Representatividade": ["Voz do produtor", "Organização do setor"],
    "Congressos e Palestras": ["Conteúdo e influência", "Reputação institucional"],
    "Cultura Interna": ["Respeito e ambiente", "Reconhecimento de pessoas"],
    "Treinamento e Disciplina": ["Capacitação contínua", "Normas e condutas"],
    "Comunicação e Mídia": ["Conteúdo como registro", "Educar e posicionar"],
    "Documentário e Filme": ["Capítulos do legado", "Vozes e personagens"],
    "Casa de Memória e Futuro": ["Acervo canônico", "História oral"],
    "Futuro do Agro": ["Inovação com raízes", "Continuidade geracional"]
  },

  // 2.10 EVENTOS PRINCIPAIS (30 eventos)
  eventos: [
    { id: 1, nome: "Abertura do Ano e Planejamento", funcao: "Futuro" },
    { id: 2, nome: "Estação de Monta (Início)", funcao: "Técnica" },
    { id: 3, nome: "Protocolos de Inseminação em Tempo Fixo", funcao: "Técnica" },
    { id: 4, nome: "Diagnóstico de Gestação", funcao: "Processo produtivo" },
    { id: 5, nome: "Exame Andrológico de Touros", funcao: "Técnica" },
    { id: 6, nome: "Nascimentos na Maternidade", funcao: "Pessoas" },
    { id: 7, nome: "Rotina do Vaqueiro", funcao: "Rito e tradição" },
    { id: 8, nome: "Apartação Estratégica", funcao: "Processo produtivo" },
    { id: 9, nome: "Pesagem e Conferência", funcao: "Processo produtivo" },
    { id: 10, nome: "Marcação e Identificação", funcao: "Técnica" },
    { id: 11, nome: "Vacinação do Rebanho", funcao: "Sustentabilidade" },
    { id: 12, nome: "Controle Parasitário", funcao: "Sustentabilidade" },
    { id: 13, nome: "Manejo de Pastagens", funcao: "Sustentabilidade" },
    { id: 14, nome: "Conservação do Solo (Curvas de Nível)", funcao: "Sustentabilidade" },
    { id: 15, nome: "Gestão da Água (Nascentes e Veredas)", funcao: "Sustentabilidade" },
    { id: 16, nome: "Gestão da Água (Barragens e Represas)", funcao: "Sustentabilidade" },
    { id: 17, nome: "Irrigação (Pivô Central)", funcao: "Técnica" },
    { id: 18, nome: "Plantio de Milho para Silagem", funcao: "Processo produtivo" },
    { id: 19, nome: "Colheita e Produção de Silagem", funcao: "Processo produtivo" },
    { id: 20, nome: "Produção de Bioinsumos", funcao: "Futuro" },
    { id: 21, nome: "Transição Seca para Águas", funcao: "Sustentabilidade" },
    { id: 22, nome: "Entrada no Confinamento", funcao: "Processo produtivo" },
    { id: 23, nome: "Rodada e Saída do Confinamento", funcao: "Logística e mercado" },
    { id: 24, nome: "Embarques e Logística de Lotes", funcao: "Logística e mercado" },
    { id: 25, nome: "Seleção e Padronização de Lotes para Leilão", funcao: "Mercado" },
    { id: 26, nome: "Leilão Qualidade Total (Marco Anual)", funcao: "Mercado" },
    { id: 27, nome: "Visita Técnica e Consultorias", funcao: "Técnica" },
    { id: 28, nome: "Congresso e Palestras (Representatividade)", funcao: "Mercado" },
    { id: 29, nome: "Dia do Fazendeiro", funcao: "Origem e rito" },
    { id: 30, nome: "Lançamento e Atualizações da Casa de Memória", funcao: "Futuro" }
  ],

  // 2.11 FUNÇÕES HISTÓRICAS (8 funções)
  funcoesHistoricas: [
    { id: 1, nome: "Origem e Fundação", descricao: "Marcos de início, trajetória e propósito do fundador." },
    { id: 2, nome: "Rito e Tradição", descricao: "Cultura viva: toadas, rotinas, símbolos, fé e pertencimento." },
    { id: 3, nome: "Técnica e Ciência", descricao: "Métodos, protocolos, genética, dados e tecnologia aplicada." },
    { id: 4, nome: "Processo Produtivo", descricao: "Cronologia real do trabalho: do nascimento ao resultado." },
    { id: 5, nome: "Pessoas e Cultura", descricao: "Heróis do cotidiano: equipe, famílias, histórias orais." },
    { id: 6, nome: "Sustentabilidade e Território", descricao: "Água, solo, clima, preservação e boas práticas." },
    { id: 7, nome: "Mercado e Representatividade", descricao: "Leilões, eventos, fala pública, reputação e classe." },
    { id: 8, nome: "Futuro e Inovação", descricao: "Projetos, visão, modernização, legado e continuidade." }
  ],

  // 2.12 STATUS DO MATERIAL (9 status)
  status: [
    { id: "ENT", nome: "Entrada (Bruto)", descricao: "Material recém-chegado, ainda sem triagem e sem catalogação." },
    { id: "TRI", nome: "Em triagem", descricao: "Seleção inicial: identificar o que presta e o que precisa de descarte." },
    { id: "CAT", nome: "Catalogado", descricao: "ID criado, pasta canônica criada e linha registrada no Catálogo." },
    { id: "SEL", nome: "Selecionado para produção", descricao: "Material confirmado para virar entrega (reels, episódio, filme, etc.)." },
    { id: "PRO", nome: "Em produção", descricao: "Edição/roteiro/arte em andamento." },
    { id: "APR", nome: "Em aprovação", descricao: "Aguardando validação final (corte, revisão, ajustes)." },
    { id: "APO", nome: "Aprovado", descricao: "Autorizado para publicar." },
    { id: "PUB", nome: "Publicado", descricao: "Publicado na plataforma definida, com link registrado." },
    { id: "ARQ", nome: "Arquivado", descricao: "Final guardado na biblioteca e com rastreabilidade completa." }
  ],

  // 2.13 CAPÍTULOS DO FILME (13 capítulos)
  capitulos: [
    { id: "DEF", nome: "A definir", descricao: "Usar quando ainda não existe capítulo atribuído." },
    { id: "C01", nome: "Capítulo 01", descricao: "Origem e propósito." },
    { id: "C02", nome: "Capítulo 02", descricao: "Terra, sertão e território." },
    { id: "C03", nome: "Capítulo 03", descricao: "Rotina do campo e disciplina." },
    { id: "C04", nome: "Capítulo 04", descricao: "O vaqueiro e as pessoas." },
    { id: "C05", nome: "Capítulo 05", descricao: "Cria e nascimento." },
    { id: "C06", nome: "Capítulo 06", descricao: "Reprodução e método." },
    { id: "C07", nome: "Capítulo 07", descricao: "Genética e seleção." },
    { id: "C08", nome: "Capítulo 08", descricao: "Nutrição, silagem e eficiência." },
    { id: "C09", nome: "Capítulo 09", descricao: "Água, solo e sustentabilidade." },
    { id: "C10", nome: "Capítulo 10", descricao: "Mercado, leilão e representatividade." },
    { id: "C11", nome: "Capítulo 11", descricao: "Casa de Memória e legado." },
    { id: "C12", nome: "Capítulo 12", descricao: "Futuro e continuidade." }
  ]
};

// Funções utilitárias
const TaxonomiaUtils = {
  getAreas: () => TAXONOMIA.areasFazendas,
  getPontos: () => TAXONOMIA.pontos,
  getTiposProjeto: () => TAXONOMIA.tiposProjeto,
  getNucleosPecuaria: () => Object.keys(TAXONOMIA.nucleosPecuaria),
  getSubnucleosPecuaria: (nucleo) => TAXONOMIA.nucleosPecuaria[nucleo] || [],
  getNucleosAgro: () => Object.keys(TAXONOMIA.nucleosAgro),
  getSubnucleosAgro: (nucleo) => TAXONOMIA.nucleosAgro[nucleo] || [],
  getOperacoes: () => Object.keys(TAXONOMIA.operacoes),
  getSuboperacoes: (operacao) => TAXONOMIA.operacoes[operacao] || [],
  getMarcas: () => Object.keys(TAXONOMIA.marca),
  getSubmarcas: (marca) => TAXONOMIA.marca[marca] || [],
  getTemasPrincipais: () => TAXONOMIA.temasPrincipais,
  getTemasSecundarios: (tema) => TAXONOMIA.temasSecundarios[tema] || [],
  getEventos: () => TAXONOMIA.eventos,
  getFuncoesHistoricas: () => TAXONOMIA.funcoesHistoricas,
  getStatus: () => TAXONOMIA.status,
  getCapitulos: () => TAXONOMIA.capitulos,
  getCompleta: () => TAXONOMIA
};

module.exports = { TAXONOMIA, TaxonomiaUtils };
