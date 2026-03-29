import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getAvailableRepositories, addRepository } from '../../api/integrations';
import LoadingSpinner from '../common/LoadingSpinner';

interface AvailableRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  private: boolean;
  stargazers_count: number;
  html_url: string;
}

interface RepositorySelectorProps {
  onRepositoryAdded: () => void;
}

export default function RepositorySelector({ onRepositoryAdded }: RepositorySelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [repos, setRepos] = useState<AvailableRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state) => state.user);

  const loadAvailableRepos = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await getAvailableRepositories(user.id);
      setRepos(data.repositories || []);
    } catch (error) {
      console.error('Error cargando repositorios:', error);
      alert('Error al cargar repositorios de GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRepo = async (repoId: number) => {
    if (!user?.id) return;

    setAdding(repoId);
    try {
      await addRepository(user.id, repoId);
      alert('Repositorio agregado correctamente');
      setShowModal(false);
      onRepositoryAdded();
    } catch (error) {
      console.error('Error agregando repositorio:', error);
      alert('Error al agregar repositorio');
    } finally {
      setAdding(null);
    }
  };

  const filteredRepos = repos.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          loadAvailableRepos();
        }}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Agregar Repositorio
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Seleccionar Repositorio
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input
                type="text"
                placeholder="Buscar repositorio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="large" />
                </div>
              ) : filteredRepos.length > 0 ? (
                <div className="space-y-3">
                  {filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {repo.full_name}
                            {repo.private && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Privado
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {repo.description || 'Sin descripción'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {repo.stargazers_count}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddRepo(repo.id)}
                          disabled={adding === repo.id}
                          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition flex items-center gap-2"
                        >
                          {adding === repo.id ? (
                            <>
                              <LoadingSpinner size="small" />
                              <span>Agregando...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Agregar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron repositorios</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
