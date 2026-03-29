import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  checkGitHubConnection,
  getGitHubConnectUrl,
  disconnectGitHub,
} from '../../api/integrations';

interface GitHubConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function GitHubConnect({ onConnectionChange }: GitHubConnectProps) {
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
      console.error('No user ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('Checking GitHub connection for user:', user.id);
      const data = await checkGitHubConnection(user.id);
      setConnected(data.connected);
      onConnectionChange?.(data.connected);
    } catch (error) {
      console.error('Error verificando conexión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!user?.id) {
      console.error('No user ID available');
      alert('Error: Usuario no identificado');
      return;
    }
    console.log('Connecting GitHub for user:', user.id);
    window.location.href = getGitHubConnectUrl(user.id);
  };

  const handleDisconnect = async () => {
    if (!user?.id) return;
    if (!confirm('¿Desconectar GitHub?')) return;

    try {
      await disconnectGitHub(user.id);
      setConnected(false);
      onConnectionChange?.(false);
    } catch (error) {
      console.error('Error desconectando GitHub:', error);
      alert('Error al desconectar GitHub');
    }
  };

  if (!user) {
    return (
      <div className="text-gray-500">
        Cargando información del usuario...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Verificando conexión...</span>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">GitHub Conectado</span>
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
      className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
      Conectar con GitHub
    </button>
  );
}
