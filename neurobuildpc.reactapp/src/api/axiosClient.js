import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://neuro-build-pc-2026.runasp.net',
    headers: {
        'Content-Type': 'application/json',
    }
});

export default axiosClient;