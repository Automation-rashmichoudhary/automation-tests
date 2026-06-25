"use strict";

import envConfig from '../../helpers/envConfig.js';
const { API_URL } = envConfig;

async function _fetch(...args) {
    if (typeof fetch === 'function') return fetch(...args);
    const { default: nodeFetch } = await import('node-fetch');
    return nodeFetch(...args);
}

async function createBooking(payload) {
    const url = `${API_URL}/booking`;
    const res = await _fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const body = await res.json();
    return { status: res.status, body };
}

async function getBooking(id) {
    const url = `${API_URL}/booking/${id}`;
    const res = await _fetch(url, { method: 'GET' });
    if (res.status === 404) return { status: res.status, body: null };
    const body = await res.json();
    return { status: res.status, body };
}

async function updateBooking(id, payload, token) {
    const url = `${API_URL}/booking/${id}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Cookie'] = `token=${token}`;
    const res = await _fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
    });
    const body = await res.json();
    return { status: res.status, body };
}

async function deleteBooking(id, token) {
    const url = `${API_URL}/booking/${id}`;
    const headers = {};
    if (token) headers['Cookie'] = `token=${token}`;
    const res = await _fetch(url, {
        method: 'DELETE',
        headers,
    });
    return { status: res.status };
}

export default { createBooking, getBooking, updateBooking, deleteBooking };
