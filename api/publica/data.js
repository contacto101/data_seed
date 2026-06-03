const tenders = [
  {
    id: '1023-44-LQ26',
    industry: 'ti',
    region: 'Metropolitana',
    title: 'Servicio de desarrollo y mantención de plataforma web institucional',
    organization: 'Servicio público central',
    budget: 420000000,
    close: '7 días',
    score: 94,
    keywords: ['software', 'mantención', 'web'],
    prices: [84, 92, 105, 119, 136, 148],
    summary: 'Alta compatibilidad para empresas de software con experiencia en mantención evolutiva y soporte SLA.'
  },
  {
    id: '887-19-LP26',
    industry: 'ti',
    region: 'Valparaíso',
    title: 'Licenciamiento y soporte de analítica de datos',
    organization: 'Universidad estatal',
    budget: 180000000,
    close: '11 días',
    score: 86,
    keywords: ['BI', 'analítica', 'licencias'],
    prices: [42, 49, 55, 61, 63, 72],
    summary: 'Oportunidad orientada a BI, visualización y soporte técnico con foco institucional.'
  },
  {
    id: '558-72-LR26',
    industry: 'salud',
    region: 'Biobío',
    title: 'Suministro de insumos clínicos para red hospitalaria',
    organization: 'Servicio de salud regional',
    budget: 760000000,
    close: '5 días',
    score: 91,
    keywords: ['insumos', 'hospital', 'clínico'],
    prices: [120, 132, 141, 155, 149, 168],
    summary: 'Demanda recurrente con fuerte historial regional. Requiere revisar bases y capacidad logística.'
  },
  {
    id: '441-08-LQ26',
    industry: 'construccion',
    region: 'Los Lagos',
    title: 'Conservación de infraestructura municipal y obras menores',
    organization: 'Municipalidad del sur',
    budget: 520000000,
    close: '14 días',
    score: 82,
    keywords: ['obras', 'mantención', 'infraestructura'],
    prices: [90, 104, 99, 132, 141, 150],
    summary: 'Competencia fragmentada. Buen caso para analizar adjudicaciones previas por comuna.'
  },
  {
    id: '713-22-LE26',
    industry: 'educacion',
    region: 'Metropolitana',
    title: 'Equipamiento tecnológico para salas híbridas',
    organization: 'Corporación educacional',
    budget: 95000000,
    close: '9 días',
    score: 88,
    keywords: ['educación', 'equipamiento', 'tecnología'],
    prices: [21, 24, 31, 35, 39, 42],
    summary: 'Cruce entre educación y TI. Conviene preparar oferta con referencias de precios unitarios.'
  }
];

const competitors = [
  { supplier: 'TecnoSur SpA', industry: 'Tecnología', awards: 18, estimatedAmount: '$2.4B', frequentBuyer: 'Ministerios' },
  { supplier: 'Salud Integral Ltda.', industry: 'Salud', awards: 31, estimatedAmount: '$5.1B', frequentBuyer: 'Servicios de salud' },
  { supplier: 'Constructora Austral', industry: 'Construcción', awards: 14, estimatedAmount: '$3.8B', frequentBuyer: 'Municipios' },
  { supplier: 'Aula Digital SpA', industry: 'Educación', awards: 22, estimatedAmount: '$1.2B', frequentBuyer: 'Universidades' },
  { supplier: 'DataGov Chile', industry: 'Tecnología', awards: 11, estimatedAmount: '$980M', frequentBuyer: 'Gobiernos regionales' }
];

const industryLabels = {
  ti: 'Tecnología / Software',
  salud: 'Salud',
  construccion: 'Construcción',
  educacion: 'Educación'
};

function normalizeText(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function filterOpportunities({ industry = 'ti', region = 'all', keyword = '' } = {}) {
  const normalizedKeyword = normalizeText(keyword);
  let list = tenders.filter((tender) => {
    const matchesIndustry = tender.industry === industry;
    const matchesRegion = region === 'all' || tender.region === region;
    const text = normalizeText([tender.title, tender.organization, ...tender.keywords].join(' '));
    const matchesKeyword = !normalizedKeyword || text.includes(normalizedKeyword);
    return matchesIndustry && matchesRegion && matchesKeyword;
  });

  if (!list.length) {
    list = tenders.filter((tender) => tender.industry === industry);
  }

  return list.sort((a, b) => b.score - a.score);
}

function getTenderById(id) {
  return tenders.find((tender) => tender.id === id) || tenders[0];
}

function buildAgentAnswer(tender, question = '') {
  const q = normalizeText(question);
  const minPrice = Math.min(...tender.prices);
  const maxPrice = Math.max(...tender.prices);
  const focus = q.includes('compet')
    ? 'Competencia: cruza proveedores recurrentes, organismo comprador y frecuencia histórica antes de ofertar.'
    : q.includes('precio')
      ? `Precio: usa rango histórico comparable ${minPrice}M–${maxPrice}M como referencia para precio objetivo y alertas de outliers.`
      : 'Recomendación: revisar bases, requisitos administrativos, plazo de cierre y capacidad operacional antes de postular.';

  return {
    answer: `Diagnóstico: ${tender.summary}\n\n${focus}\n\nPróximo paso: validar bases y comparar contra adjudicaciones históricas antes de preparar oferta.`,
    sources: [
      { label: 'Dataset demo Pública', type: 'demo' },
      { label: 'API Mercado Público ChileCompra — pendiente ticket productivo', type: 'planned_connector' }
    ]
  };
}

module.exports = {
  tenders,
  competitors,
  industryLabels,
  filterOpportunities,
  getTenderById,
  buildAgentAnswer
};
