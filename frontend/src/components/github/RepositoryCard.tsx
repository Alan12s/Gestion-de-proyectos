import { useNavigate } from 'react-router-dom';

interface Repository {
  id: string;
  repoName: string;
  repoFullName: string;
  description: string | null;
  language: string | null;
  isPrivate: boolean;
  stars: number;
  updatedAt: string;
  commits?: any[];
  pullRequests?: any[];
}

interface RepositoryCardProps {
  repository: Repository;
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
  const navigate = useNavigate();

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

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) return `Actualizado hace ${diffHours}h`;
    return `Actualizado hace ${diffDays}d`;
  };

  const openPRs = repository.pullRequests?.filter((pr) => pr.state === 'open').length || 0;
  const recentCommits = repository.commits?.length || 0;

  return (
    <div
      onClick={() => navigate(`/repository/${repository.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-blue-400 p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">
          {repository.repoName}
        </h3>
        {repository.isPrivate && (
          <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded shrink-0">
            Privado
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
        {repository.description || 'Sin descripción'}
      </p>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        {repository.language && (
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`}></span>
            <span>{repository.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-yellow-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-gray-700">{repository.stars}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
        <span className="text-gray-500">{getTimeAgo(repository.updatedAt)}</span>
        <div className="flex gap-3">
          {recentCommits > 0 && (
            <span className="text-gray-600">
              {recentCommits} commits
            </span>
          )}
          {openPRs > 0 && (
            <span className="text-green-600 font-medium">
              {openPRs} PR{openPRs !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
