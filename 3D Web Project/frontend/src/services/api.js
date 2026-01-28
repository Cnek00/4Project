import axios from 'axios';

// Backend adresini buraya sabitliyoruz
const API_URL = 'http://127.0.0.1:8000/api';

export const getProducts = () => axios.get(`${API_URL}/store/products/`);
export const getCategories = () => axios.get(`${API_URL}/store/categories/`);

export const getProductDetail = (id) => axios.get(`${API_URL}/store/products/${id}/`);