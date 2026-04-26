import axios from 'axios';

const API_URL = '/api/inventory';

export const getItems = () => axios.get(`${API_URL}/items`).then(res => res.data);
export const createItem = (item) => axios.post(`${API_URL}/items`, item).then(res => res.data);
export const updateItem = (id, item) => axios.put(`${API_URL}/items/${id}`, item).then(res => res.data);
export const deleteItem = (id) => axios.delete(`${API_URL}/items/${id}`).then(res => res.data);

export const addStock = (data) => axios.post(`${API_URL}/stock/in`, data).then(res => res.data);
export const removeStock = (data) => axios.post(`${API_URL}/stock/out`, data).then(res => res.data);
export const getStockHistory = () => axios.get(`${API_URL}/stock/history`).then(res => res.data);

export const getSuppliers = () => axios.get(`${API_URL}/suppliers`).then(res => res.data);
export const createSupplier = (supplier) => axios.post(`${API_URL}/suppliers`, supplier).then(res => res.data);

export const getPurchaseOrders = () => axios.get(`${API_URL}/purchase-orders`).then(res => res.data);
export const createPurchaseOrder = (po) => axios.post(`${API_URL}/purchase-orders`, po).then(res => res.data);
