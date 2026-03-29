import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getRepositoryDetails, syncRepository } from '../../api/integrations';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RepositoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'prs' | 'issues'>('commits');

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    if (!user?.id || !id) return;

    setLoading(true);
    try {
      const response = await getRepositoryDetails(user.id, id);
      setData(response);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      alert('Error al cargar detalles del repositorio');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id || !id) return;

    setSyncing(true);
    try {
      await syncRepository(user.id, id);
      await loadDetails();
      alert('Repositorio sincronizado correctamente');
    } catch (error) {
      console.error('Error sincronizando:', error);
      alert('Error al sincronizar repositorio');
    } finally {
      setSyncing(false);
    }
  };

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-500',
      Python: 'bg-blue-600',
      Java: 'bg-red-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-600',
      PHP: 'bg-purple-500',
      Ruby: 'bg-red-600',
      Vue: 'bg-green-500',
    };
    return colors[language || ''] || 'bg-gray-400';
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} minutos`;
    if (diffHours < 24) return `hace ${diffHours} horas`;
    return `hace ${diffDays} días`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar el repositorio</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const { repository, issues, statistics } = data;
  const openPRs = repository.pullRequests?.filter((pr: any) => pr.state === 'open') || [];
  const openIssues = issues?.filter((issue: any) => issue.state === 'open') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al dashboard
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{repository.repoName}</h1>
              <p className="text-gray-600 mt-2">{repository.description || 'Sin descripción'}</p>
              
              <div className="flex items-center gap-4 mt-4">
                {repository.language && (
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`}></span>
                    <span className="text-sm text-gray-700">{repository.language}</span>
                  </div>
                )}
                {repository.isPrivate && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Privado
                  </span>
                )}
                <div className="flex items-center gap-1 text-yellow-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-700">{repository.stars}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={repository.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Ver en GitHub
              </a>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center gap-2"
              >
                {syncing ? (
                  <>
                    <LoadingSpinner size="small" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sincronizar
                  </>
                )}
              </button>
            </div>
          </div>

          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Commits</p>
                <p className="text-2xl font-bold text-gray-900">{repository.commits?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">PRs Abiertos</p>
                <p className="text-2xl font-bold text-green-600">{openPRs.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Issues Abiertos</p>
                <p className="text-2xl font-bold text-orange-600">{openIssues.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Forks</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.forks}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Watchers</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.watchers}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('commits')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'commits'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Commits ({repository.commits?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('prs')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'prs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Pull Requests ({repository.pullRequests?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'issues'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Issues ({issues?.length || 0})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'commits' && (
          <div className="space-y-4">
            {repository.commits && repository.commits.length > 0 ? (
              repository.commits.map((commit: any) => (
                <div key={commit.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{commit.commitMessage}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{commit.authorName}</span>
                        <span>{getTimeAgo(commit.committedAt)}</span>
                      </div>
                    </div>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {commit.commitSha.substring(0, 7)}
                    </code>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No hay commits sincronizados
              </div>
            )}
          </div>
        )}

        {activeTab === 'prs' && (
          <div className="space-y-4">
            {repository.pullRequests && repository.pullRequests.length > 0 ? (
              repository.pullRequests.map((pr: any) => (
                <div key={pr.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pr.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {pr.state === 'open' ? 'Abierto' : 'Cerrado'}
                        </span>
                        <p className="font-medium text-gray-900">{pr.title}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>#{pr.prNumber}</span>
                        <span>por {pr.authorUsername}</span>
                        <span>{getTimeAgo(pr.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No hay pull requests
              </div>
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-4">
            {issues && issues.length > 0 ? (
              issues.map((issue: any) => (
                <div key={issue.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          issue.state === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.state === 'open' ? 'Abierto' : 'Cerrado'}
                        </span>
                        <p className="font-medium text-gray-900">{issue.title}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>#{issue.number}</span>
                        <span>por {issue.user?.login}</span>
                        <span>{getTimeAgo(issue.created_at)}</span>
                      </div>
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {issue.labels.map((label: any) => (
                            <span
                              key={label.id}
                              className="text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: `#${label.color}20`, color: `#${label.color}` }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No hay issues
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
