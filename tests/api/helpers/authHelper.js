"use strict";

import envConfig from '../../helpers/envConfig.js';
const { API_URL, BOOKER_USERNAME, BOOKER_PASSWORD } = envConfig;

async function _fetch(...args) {
    if (typeof fetch === 'function') return fetch(...args);
    const { default: nodeFetch } = await import('node-fetch');
    return nodeFetch(...args);
}

async function getAuthToken() {
    const url = `${API_URL}/auth`;
    const payload = { username: BOOKER_USERNAME, password: BOOKER_PASSWORD };
    const res = await _fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const body = await res.json();
    return body.token;
}

export default { getAuthToken };
