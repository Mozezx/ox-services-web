import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, Work } from '../lib/api'

const Dashboard = () => {
  // Fetch real works data
  const { data: works = [], isLoading } = useQuery<Work[]>({
    queryKey: ['works'],
    queryFn: () => api.getWorks(),
  })

  // Calculate stats from real data
  const stats = [
    { 
      label: 'Total de Obras', 
      value: works.length.toString(), 
      icon: 'construction', 
      color: 'bg-blue-500',
      description: 'Cadastradas no sistema'
    },
    { 
      label: 'Em Andamento', 
      value: works.filter(w => w.status === 'in_progress').length.toString(), 
      icon: 'engineering', 
      color: 'bg-amber-500',
      description: 'Obras ativas'
    },
    { 
      label: 'Concluídas', 
      value: works.filter(w => w.status === 'completed').length.toString(), 
      icon: 'check_circle', 
      color: 'bg-green-500',
      description: 'Finalizadas'
    },
    { 
      label: 'Planejadas', 
      value: works.filter(w => w.status === 'planned').length.toString(), 
      icon: 'calendar_month', 
      color: 'bg-purple-500',
      description: 'Aguardando início'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-amber-100 text-amber-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Planejado'
      case 'in_progress': return 'Em andamento'
      case 'completed': return 'Concluído'
      case 'on_hold': return 'Pausado'
      default: return status
    }
  }
  
  // Get recent works (last 5)
  const recentWorks = works.slice(0, 5)
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/80">Visão geral do seu painel administrativo</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-light truncate">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? '-' : stat.value}
                </p>
                <p className="text-xs mt-1 text-text-light">{stat.description}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <span className="material-symbols-outlined text-white">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Works & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Works */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Obras Recentes</h2>
              <Link to="/works" className="text-sm text-primary hover:underline font-medium">
                Ver todas
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-border rounded-lg animate-skeleton" />
                ))}
              </div>
            ) : recentWorks.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-text-light mb-2">construction</span>
                <p className="text-text-light">Nenhuma obra cadastrada ainda</p>
                <Link to="/works?action=create" className="btn btn-primary mt-4">
                  Criar Primeira Obra
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorks.map((work) => (
                  <div 
                    key={work.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-background/50 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{work.name}</h3>
                      <p className="text-sm text-text-light truncate">{work.client_name || 'Cliente não informado'}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(work.status)}`}>
                        {getStatusText(work.status)}
                      </span>
                      <Link 
                        to={`/works/${work.id}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            
            <div className="space-y-3">
              <Link
                to="/works?action=create"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-background transition-colors group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">add</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">Criar Nova Obra</h3>
                  <p className="text-sm text-text-light truncate">Adicione uma nova obra ao sistema</p>
                </div>
              </Link>
              
              <Link
                to="/works"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-background transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <span className="material-symbols-outlined text-green-600">photo_library</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">Gerenciar Timeline</h3>
                  <p className="text-sm text-text-light truncate">Adicione fotos e vídeos às obras</p>
                </div>
              </Link>
              
              <Link
                to="/works"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-background transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <span className="material-symbols-outlined text-amber-600">link</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">Links de Acesso</h3>
                  <p className="text-sm text-text-light truncate">Compartilhe obras com clientes</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* System Status */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Status do Sistema</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Backend API</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Banco de Dados</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">Supabase</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Autenticação</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">JWT</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-text-light">
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
