import axios from 'axios';

const STORE_API = 'https://neuro-build-pc-2026.runasp.net/api';
const AUTH_API = 'https://d1amond-user-management.runasp.net/api';

const storeClient = axios.create({ baseURL: STORE_API });
const authClient = axios.create({ baseURL: AUTH_API });

const attachToken = (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
};

storeClient.interceptors.request.use(attachToken);
authClient.interceptors.request.use(attachToken);

export const authApi = {
    login: (data) => authClient.post('/auth/login', data),
    register: (data) => authClient.post('/auth/register', data),
    google: (token) => authClient.post('/auth/google', { idToken: token }),
    forgotPassword: (data) => authClient.post('/auth/forgot-password', data),
    resetPassword: (data) => authClient.post('/auth/reset-password', data),
};

export const usersApi = {
    getMe: () => authClient.get('/users/me'),
    updateMe: (data) => authClient.put('/users/me', data),
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return authClient.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    getAll: (params) => authClient.get('/users', { params }),
    updateStatus: (id, action) => authClient.patch(`/users/${id}/status`, { action }),
    delete: (id) => authClient.delete(`/users/${id}`),
    addRole: (id, roleName) => authClient.post(`/users/${id}/roles`, { roleName }),
    removeRole: (id, roleName) => authClient.delete(`/users/${id}/roles/${roleName}`),
};

export const ordersApi = {
    create: (data) => storeClient.post('/orders', data),
    pay: (id, data) => storeClient.post(`/orders/${id}/pay`, data),
    initPayment: (id) => storeClient.post(`/orders/${id}/init-payment`),
    getByUser: (userId) => storeClient.get(`/orders/user/${userId}`),
    getAll: () => storeClient.get('/orders'),
    updateStatus: (id, data) => storeClient.put(`/orders/${id}/status`, data),
    forceSyncLocal: (id) => storeClient.get(`/orders/${id}/force-sync-local`),
    delete: (id) => storeClient.delete(`/orders/${id}`),
};

export const settingsApi = {
    get: () => storeClient.get('/settings'),
    update: (data) => storeClient.post('/settings', data),
};

export const catalogApi = {
    getCpus: (p) => storeClient.get('/cpus', { params: p }),
    getGpus: (p) => storeClient.get('/gpus', { params: p }),
    getMotherboards: (p) => storeClient.get('/motherboards', { params: p }),
    getRams: (p) => storeClient.get('/rams', { params: p }),
    getPowerSupplies: (p) => storeClient.get('/power-supplies', { params: p }),
    getCases: (p) => storeClient.get('/cases', { params: p }),
    getStorages: (p) => storeClient.get('/storages', { params: p }),
    getCoolers: (p) => storeClient.get('/coolers', { params: p }),
};

export const pcBuildsApi = {
    getAll: (p) => storeClient.get('/pc-builds', { params: p }),
    getBuild: (id) => storeClient.get(`/pc-builds/${id}`),
    createBuild: (data) => storeClient.post('/pc-builds', data),
    updateBuildName: (id, name) => storeClient.put(`/pc-builds/${id}`, { name }),
    deleteBuild: (id) => storeClient.delete(`/pc-builds/${id}`),
    addComponent: (buildId, componentId) => storeClient.post(`/pc-builds/${buildId}/components`, JSON.stringify(componentId), { headers: { 'Content-Type': 'application/json' } }),
    removeComponent: (buildId, type, compId = null) => {
        const url = compId ? `/pc-builds/${buildId}/components/${type}/${compId}` : `/pc-builds/${buildId}/components/${type}`;
        return storeClient.delete(url);
    },
    removeStorage: (buildId, storageId) => storeClient.delete(`/pc-builds/${buildId}/components/storages/${storageId}`),
    checkCompatibility: (buildId) => storeClient.post(`/pc-builds/${buildId}/check-compatibility`),
};

export const componentsApi = {
    getAll: (p) => storeClient.get('/components', { params: p }),
    getById: (id) => storeClient.get(`/components/${id}`),
    create: (data) => storeClient.post('/components', data),
    update: (id, data) => storeClient.put(`/components/${id}`, data),
    delete: (id) => storeClient.delete(`/components/${id}`),
    uploadImage: (file) => {
        const fd = new FormData();
        fd.append('file', file);
        return storeClient.post('/components/upload-image', fd);
    }
};

export const dictionariesApi = {
    getItems: (type) => storeClient.get(`/dictionaries/${type}`),
    create: (type, data) => storeClient.post(`/dictionaries/${type}`, data),
    update: (type, id, data) => storeClient.put(`/dictionaries/${type}/${id}`, data),
    delete: (type, id) => storeClient.delete(`/dictionaries/${type}/${id}`),
};