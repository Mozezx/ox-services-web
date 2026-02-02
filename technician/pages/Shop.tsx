import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'

const Shop = () => {
  const { t } = useLanguage()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['technician-tools'],
    queryFn: () => api.getTools(),
  })

  const handleAddToCart = (toolId: string, name: string) => {
    addItem(toolId, 1, name)
    addToast('success', t.shop.addToCart)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{t.shop.title}</h1>
        <p className="text-white/80">Request tools for your work</p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <span className="material-symbols-outlined text-4xl mb-4 block">build</span>
            <p>{t.shop.noTools}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="mb-3">
                  {tool.image_url ? (
                    <img
                      src={tool.image_url}
                      alt={tool.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-border flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-text-light">build</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-text">{tool.name}</h3>
                {tool.description && (
                  <p className="text-sm text-text-light mt-1 line-clamp-2">{tool.description}</p>
                )}
                <button
                  type="button"
                  onClick={() => handleAddToCart(tool.id, tool.name)}
                  className="mt-4 btn btn-primary w-full text-white"
                >
                  <span className="material-symbols-outlined text-sm text-white">add_shopping_cart</span>
                  <span className="text-white">{t.shop.addToCart}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
