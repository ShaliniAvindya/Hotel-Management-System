const ApaleoConfig = require('../models/ApaleoConfig');

const IDENTITY_URL = 'https://identity.apaleo.com';
const API_URL = 'https://api.apaleo.com';

function getEnvCredentials() {
  const clientId = process.env.APALEO_CLIENT_ID;
  const clientSecret = process.env.APALEO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('APALEO_CLIENT_ID and APALEO_CLIENT_SECRET must be set in .env');
  }
  return { clientId, clientSecret };
}

async function getConfig() {
  let config = await ApaleoConfig.findOne();
  if (!config) config = new ApaleoConfig();
  return config;
}

async function fetchToken() {
  const { clientId, clientSecret } = getEnvCredentials();
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${IDENTITY_URL}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description || `Auth failed: ${response.status}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

async function ensureToken(config) {
  const bufferMs = 60 * 1000;
  if (config.accessToken && config.tokenExpiry && Date.now() < config.tokenExpiry.getTime() - bufferMs) {
    return config.accessToken;
  }
  const { accessToken, expiresIn } = await fetchToken();
  config.accessToken = accessToken;
  config.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
  await config.save();
  return accessToken;
}

async function apiCall(method, path, body = null, token) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const detail = errBody.message || (errBody.messages && errBody.messages.join(', ')) || '';
    throw new Error(`${detail || `API error: ${response.status}`}`);
  }
  return response.status === 204 ? { success: true } : response.json();
}

async function apiGet(path, token) {
  return apiCall('GET', path, null, token);
}

async function apiPost(path, body, token) {
  return apiCall('POST', path, body, token);
}

async function apiPut(path, body, token) {
  return apiCall('PUT', path, body, token);
}

async function apiDelete(path, token) {
  return apiCall('DELETE', path, null, token);
}

module.exports = {
  getConfig,
  fetchToken,
  ensureToken,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};
