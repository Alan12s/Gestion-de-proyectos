import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import GitHubConnect from '../../components/github/GitHubConnect';
import JiraConnect from '../../components/jira/JiraConnect';
import RepositoryCard from '../../components/github/RepositoryCard';
import RepositorySelector from '../../components/github/RepositorySelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getTrackedRepositories, removeRepository } from '../../api/integrations';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [githubConnected, setGithubConnected] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const githubParam = searchParams.get('github');
    const jiraParam = searchParams.get('jira');
    
    if (githubParam === 'connected') {
      setGithubConnected(true);
      loadRepositories();
    }
    
    if (jiraParam === 'connected') {
      alert('¡Jira conectado correctamente!');
    }
  }, [searchParams]);

  const loadRepositories = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await getTrackedRepositories(user.id);
      setRepositories(data.repositories || []);
    } catch (error) {
      console.error('Error cargando repositorios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRepo = async (repoId: string, repoName: string) => {
    if (!user?.id) return;
    if (!confirm(`¿Remover "${repoName}" del seguimiento?`)) return;

    try {
      await removeRepository(user.id, repoId);
      setRepositories(repos => repos.filter(r => r.id !== repoId));
    } catch (error) {
      console.error('Error removiendo repositorio:', error);
      alert('Error al remover repositorio');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleConnectionChange = (connected: boolean) => {
    setGithubConnected(connected);
    if (connected) {
      loadRepositories();
    } else {
      setRepositories([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Gestión de Proyectos</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hola, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Integraciones</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">GitHub</h3>
              <GitHubConnect onConnectionChange={handleConnectionChange} />
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Jira</h3>
              <JiraConnect />
            </div>
          </div>
        </div>

        {githubConnected && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Tus Repositorios
                <span className="ml-3 text-sm font-normal text-gray-500">
                  ({repositories.length} {repositories.length === 1 ? 'repositorio' : 'repositorios'})
                </span>
              </h2>
              <RepositorySelector onRepositoryAdded={loadRepositories} />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner size="large" />
              </div>
            ) : repositories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
                  <div key={repo.id} className="relative group">
                    <RepositoryCard repository={repo} />
                    <button
                      onClick={() => handleRemoveRepo(repo.id, repo.repoName)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      title="Remover repositorio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay repositorios agregados
                </h3>
                <p className="text-gray-500 mb-4">
                  Click en "Agregar Repositorio" para comenzar
                </p>
              </div>
            )}
          </div>
        )}

        {!githubConnected && (
          <div className="bg-white rounded-lg shadow p-12 text-center mt-8">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Conecta tus servicios
            </h3>
            <p className="text-gray-500">
              Conecta GitHub y Jira para comenzar a gestionar tus proyectos
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
