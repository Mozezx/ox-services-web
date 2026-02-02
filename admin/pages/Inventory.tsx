import { useQuery } from '@tanstack/react-query'
import { api, TechnicianInventoryItem } from '../lib/api'

const Inventory = () => {
  const { data: technicians = [], isLoading } = useQuery<TechnicianInventoryItem[]>({
    queryKey: ['technician-inventory'],
    queryFn: () => api.getTechnicianInventory(),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Inventário dos técnicos</h1>
        <p className="text-white/80">
          Ferramentas que cada técnico possui (a partir dos pedidos aprovados). Use para evitar perdas.
        </p>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <span className="material-symbols-outlined text-4xl mb-4 block">engineering</span>
            <p>Nenhum técnico cadastrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-light">
                  <th className="pb-3 font-medium">Técnico</th>
                  <th className="pb-3 font-medium">Ferramentas</th>
                  <th className="pb-3 font-medium text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((item) => (
                  <tr key={item.technician_id} className="border-b border-border last:border-0">
                    <td className="py-4 font-medium">{item.technician_name}</td>
                    <td className="py-4 text-text-light text-sm">
                      {item.tools.length === 0 ? (
                        <span className="italic">Nenhuma ferramenta</span>
                      ) : (
                        <ul className="list-none space-y-0.5">
                          {item.tools.map((t) => (
                            <li key={t.tool_id}>
                              {t.tool_name} <span className="text-primary font-medium">× {t.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="py-4 text-right font-medium">{item.total_items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory
