import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const INTEGRATIONS_URL = 'http://localhost:3003';

export default function JiraConnect() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.id) {
      checkConnection();
    }
  }, [user?.id]);

  const checkConnection = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${INTEGRATIONS_URL}/api/integrations/jira/status?userId=${user.id}`);
      const data = await response.json();
      setConnected(data.connected);
    } catch (error) {
      console.error('Error verificando conexión Jira:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!user?.id) return;
    window.location.href = `${INTEGRATIONS_URL}/api/integrations/jira/connect?userId=${user.id}`;
  };

  const handleDisconnect = async () => {
    if (!user?.id || !confirm('¿Desconectar Jira?')) return;

    try {
      await fetch(`${INTEGRATIONS_URL}/api/integrations/jira/disconnect?userId=${user.id}`);
      setConnected(false);
    } catch (error) {
      console.error('Error desconectando Jira:', error);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Verificando Jira...</span>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="font-medium">Jira Conectado</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.5 2L5.5 8l6 6 6-6-6-6zm0 3.83L9.33 8l2.17 2.17L13.67 8 11.5 5.83zm6.5 5.17l-6 6 6 6 6-6-6-6zm0 3.83L15.83 17l2.17 2.17L20.17 17 18 14.83z"/>
      </svg>
      Conectar con Jira
    </button>
  );
}
