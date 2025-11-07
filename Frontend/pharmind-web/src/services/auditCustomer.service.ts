import api from './api';

export interface AuditCustomer {
  id: number;
  cdgmeD_REG?: string;  // Backend serializa CDGMED_REG como cdgmeD_REG
  crm?: string;
  nome?: string;
  blank?: string;
  cdgesp1?: string;
  cdgesp2?: string;
  cdgreG_PMIX?: string;  // Backend serializa CDGREG_PMIX como cdgreG_PMIX
  local?: string;
  bairro?: string;
  cep?: string;
  cdgmeD_VIS?: string;  // Backend serializa CDGMED_VIS as cdgmeD_VIS
  rawData?: string;
}

export interface AuditCustomerResponse {
  items: AuditCustomer[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface AuditCustomerEstadisticas {
  totalMedicos: number;
  medicosConCRM: number;
  medicosConEspecialidad1: number;
  medicosConEspecialidad2: number;
}

export const auditCustomerService = {
  // Obtener todos los médicos con paginación y filtros
  getAll: async (page: number = 1, pageSize: number = 50, searchName?: string, searchOther?: string): Promise<AuditCustomerResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (searchName) {
      params.append('searchName', searchName);
    }
    if (searchOther) {
      params.append('searchOther', searchOther);
    }

    const response = await api.get(`/AuditCustomer?${params.toString()}`);
    return response.data;
  },

  // Obtener un médico por ID
  getById: async (id: number): Promise<AuditCustomer> => {
    const response = await api.get(`/AuditCustomer/${id}`);
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async (): Promise<AuditCustomerEstadisticas> => {
    const response = await api.get('/AuditCustomer/estadisticas');
    return response.data;
  }
};

export default auditCustomerService;
