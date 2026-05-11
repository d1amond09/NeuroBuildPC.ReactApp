import axiosClient from './axiosClient';

// --- КАТАЛОГ (Чтение) ---
export const catalogApi = {
    getCpus: (params) => axiosClient.get('/api/cpus', { params }),
    getGpus: (params) => axiosClient.get('/api/gpus', { params }),
    getMotherboards: (params) => axiosClient.get('/api/motherboards', { params }),
    getRams: (params) => axiosClient.get('/api/rams', { params }),
    getPowerSupplies: (params) => axiosClient.get('/api/power-supplies', { params }),
    getCases: (params) => axiosClient.get('/api/cases', { params }),
    getStorages: (params) => axiosClient.get('/api/storages', { params }),
    getCoolers: (params) => axiosClient.get('/api/coolers', { params }),
};

// --- КОМПОНЕНТЫ (Админ: Создание, Редактирование, Удаление) ---
export const componentsApi = {
    getById: (id) => axiosClient.get(`/api/components/${id}`),
    create: (data) => axiosClient.post('/api/components', data),
    update: (id, data) => axiosClient.put(`/api/components/${id}`, data),
    delete: (id) => axiosClient.delete(`/api/components/${id}`),
};

// --- СПРАВОЧНИКИ (Админ: CRUD) ---
export const dictionariesApi = {
    getItems: (type) => axiosClient.get(`/api/dictionaries/${type}`),
    create: (type, data) => axiosClient.post(`/api/dictionaries/${type}`, data), // data = { name: "..." }
    update: (type, id, data) => axiosClient.put(`/api/dictionaries/${type}/${id}`, data),
    delete: (type, id) => axiosClient.delete(`/api/dictionaries/${type}/${id}`),
};

// --- СБОРКИ ПК ---
// --- СБОРКИ ПК ---
export const pcBuildsApi = {
    getAll: (params) => axiosClient.get('/api/pc-builds', { params }), // Получение списка
    getBuild: (id) => axiosClient.get(`/api/pc-builds/${id}`),
    createBuild: (data) => axiosClient.post('/api/pc-builds', data),
    updateBuildName: (id, name) => axiosClient.put(`/api/pc-builds/${id}`, { name }), // Обновление имени
    deleteBuild: (id) => axiosClient.delete(`/api/pc-builds/${id}`), // Удаление

    addComponent: (buildId, componentId) => axiosClient.post(`/api/pc-builds/${buildId}/components`, `"${componentId}"`, { headers: { 'Content-Type': 'application/json' } }),
    removeComponent: (buildId, componentType) => axiosClient.delete(`/api/pc-builds/${buildId}/components/${componentType}`),
    checkCompatibility: (buildId) => axiosClient.post(`/api/pc-builds/${buildId}/check-compatibility`),
};