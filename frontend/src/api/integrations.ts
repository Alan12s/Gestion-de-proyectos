import api from './axios.config';

const INTEGRATIONS_URL = 'http://localhost:3003';

export const checkGitHubConnection = async (userId: string) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/status?userId=${userId}`
  );
  return response.json();
};

export const getGitHubConnectUrl = (userId: string): string => {
  return `${INTEGRATIONS_URL}/api/integrations/github/connect?userId=${userId}`;
};

export const getAvailableRepositories = async (userId: string) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/available?userId=${userId}`
  );
  return response.json();
};

export const getTrackedRepositories = async (userId: string) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/repositories?userId=${userId}`
  );
  return response.json();
};

export const addRepository = async (userId: string, repoId: number) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/repositories/add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, repoId }),
    }
  );
  return response.json();
};

export const removeRepository = async (userId: string, repoId: string) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/repositories/remove`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, repoId }),
    }
  );
  return response.json();
};

export const disconnectGitHub = async (userId: string) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/disconnect?userId=${userId}`
  );
  return response.json();
};

/**
 * Obtener detalles completos de un repositorio
 */
export const getRepositoryDetails = async (userId: string, repoId: string) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/repositories/${repoId}?userId=${userId}`
  );
  return response.json();
};

/**
 * Sincronizar un repositorio específico
 */
export const syncRepository = async (userId: string, repoId: string) => {
  const response = await fetch(
    `${INTEGRATIONS_URL}/api/integrations/github/repositories/${repoId}/sync`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }
  );
  return response.json();
};
