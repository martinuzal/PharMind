import api from './api';

export interface PortfolioBEB {
  cdgMercado: string;
  mercadoNombre: string;
  mercadoAbrev?: string;
  productosBEB: number;
  prescripcionesBEB: number;
  medicosBEB: number;
  pX_BEB: number;
  productosTotales: number;
  prescripcionesTotales: number;
  medicosTotales: number;
  laboratoriosTotales: number;
  marketShareBEB: number;
  rankingBEB: number;
  esBEB?: number;
}

export interface MercadoOverview {
  cdgMercado: string;
  mercadoNombre: string;
  abreviatura?: string;
  totalPrescripciones: number;
  totalMedicos: number;
  totalProductos: number;
  totalLaboratorios: number;
  prescripcionesBEB: number;
  medicosBEB: number;
  productosBEB: number;
  marketShareBEB: number;
}

export interface LaboratorioPorMercado {
  ranking: number;
  laboratorio: string;
  esBEB: number;
  prescripciones: number;
  medicosUnicos: number;
  productosDelLab: number;
  totalPX: number;
  marketShare: number;
}

export interface ProductoPorMercado {
  ranking: number;
  cdG_RAIZ: string;
  codigO_PMIX: string;
  productoNombre: string;
  laboratorio: string;
  esBEB: number;
  prescripciones: number;
  medicosUnicos: number;
  totalPX: number;
  promedioPX_MER: number;
  marketShare: number;
}

export interface MedicoPorMercado {
  ranking: number;
  cdgmeD_REG: string;
  medicoNombre?: string;
  especialidad?: string;
  ciudad?: string;
  barrio?: string;
  totalPrescripciones: number;
  productosDistintos: number;
  laboratoriosDistintos: number;
  prescripcionesBEB: number;
  productosBEB: number;
  porcentajeBEB: number;
  categoriaMedico: 'SOLO_BEB' | 'CON_BEB' | 'SIN_BEB';
}

export interface Mercado {
  cdgMercado: string;
  nombre: string;
  abreviatura?: string;
  cdgUsuario?: string;
  edicion?: string;
}

export interface Periodo {
  codigo: string;
  descripcion?: string;
  blank?: string;
}

export interface PrescripcionPorCEP {
  cep: string;
  ciudad?: string;
  barrio?: string;
  totalMedicos: number;
  totalPrescripciones: number;
  productosDistintos: number;
  ranking: number;
}

export interface Ciudad {
  ciudad: string;
  codigosPostales: number;
  barrios: number;
  totalMedicos: number;
  totalPrescripciones: number;
  productosDistintos: number;
  ranking: number;
}

class AuditoriaService {
  private baseUrl = '/AuditoriaAnalisis';

  async getPortfolioBEB(periodo?: string): Promise<PortfolioBEB[]> {
    const params = periodo ? `?periodo=${periodo}` : '';
    const response = await api.get<PortfolioBEB[]>(`${this.baseUrl}/portfolio-beb${params}`);
    return response.data;
  }

  async getMercadoOverview(cdgMercado: string, periodo?: string): Promise<MercadoOverview> {
    const params = periodo ? `?periodo=${periodo}` : '';
    const response = await api.get<MercadoOverview>(`${this.baseUrl}/mercado-overview/${cdgMercado}${params}`);
    return response.data;
  }

  async getLaboratoriosPorMercado(
    cdgMercado: string,
    periodo?: string,
    topN?: number
  ): Promise<LaboratorioPorMercado[]> {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    if (topN) params.append('topN', topN.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/laboratorios/${cdgMercado}${queryString ? '?' + queryString : ''}`;

    const response = await api.get<LaboratorioPorMercado[]>(url);
    return response.data;
  }

  async getProductosPorMercado(
    cdgMercado: string,
    periodo?: string,
    laboratorio?: string,
    topN?: number
  ): Promise<ProductoPorMercado[]> {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    if (laboratorio) params.append('laboratorio', laboratorio);
    if (topN) params.append('topN', topN.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/productos/${cdgMercado}${queryString ? '?' + queryString : ''}`;

    const response = await api.get<ProductoPorMercado[]>(url);
    return response.data;
  }

  async getMedicosPorMercado(
    cdgMercado: string,
    periodo?: string,
    filtroLealtad?: 'SOLO_BEB' | 'CON_BEB' | 'SIN_BEB',
    topN: number = 100
  ): Promise<MedicoPorMercado[]> {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    if (filtroLealtad) params.append('filtroLealtad', filtroLealtad);
    params.append('topN', topN.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/medicos/${cdgMercado}?${queryString}`;

    const response = await api.get<MedicoPorMercado[]>(url);
    return response.data;
  }

  async getListaMercados(): Promise<Mercado[]> {
    const response = await api.get<Mercado[]>(`${this.baseUrl}/mercados`);
    return response.data;
  }

  async getListaPeriodos(): Promise<Periodo[]> {
    const response = await api.get<Periodo[]>(`${this.baseUrl}/periodos`);
    return response.data;
  }

  async getPrescripcionesPorCEP(
    periodo?: string,
    cdgMercado?: string,
    topN: number = 500
  ): Promise<PrescripcionPorCEP[]> {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    if (cdgMercado) params.append('cdgMercado', cdgMercado);
    params.append('topN', topN.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/geografico/por-cep${queryString ? '?' + queryString : ''}`;

    const response = await api.get<PrescripcionPorCEP[]>(url);
    return response.data;
  }

  async getTopCiudades(
    periodo?: string,
    cdgMercado?: string,
    topN: number = 50
  ): Promise<Ciudad[]> {
    const params = new URLSearchParams();
    if (periodo) params.append('periodo', periodo);
    if (cdgMercado) params.append('cdgMercado', cdgMercado);
    params.append('topN', topN.toString());

    const queryString = params.toString();
    const url = `${this.baseUrl}/geografico/top-ciudades${queryString ? '?' + queryString : ''}`;

    const response = await api.get<Ciudad[]>(url);
    return response.data;
  }
}

export default new AuditoriaService();
