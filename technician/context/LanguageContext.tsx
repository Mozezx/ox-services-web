import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type TechnicianLanguage = 'en' | 'es' | 'pt' | 'fr' | 'nl'

export interface TechnicianTranslations {
  login: {
    title: string
    email: string
    password: string
    submit: string
    error: string
  }
  dashboard: {
    title: string
    subtitle: string
    myWorks: string
    recentOrders: string
    noWorks: string
    noOrders: string
  }
  works: {
    title: string
    myWorks: string
    noWorks: string
    uploadPhoto: string
    viewDetail: string
  }
  shop: {
    title: string
    addToCart: string
    outOfStock: string
    noTools: string
  }
  cart: {
    title: string
    empty: string
    requestTools: string
    quantity: string
  }
  orders: {
    title: string
    status: string
    pending: string
    approved: string
    rejected: string
    requestedAt: string
    noOrders: string
  }
  common: {
    logout: string
    save: string
    cancel: string
    loading: string
    error: string
    back: string
    myWorksAndTools: string
  }
}

const translations: Record<TechnicianLanguage, TechnicianTranslations> = {
  en: {
    login: { title: 'OX Technician', email: 'Email', password: 'Password', submit: 'Sign in', error: 'Invalid email or password' },
    dashboard: { title: 'Dashboard', subtitle: 'Overview', myWorks: 'My works', recentOrders: 'Recent orders', noWorks: 'No works assigned', noOrders: 'No orders yet' },
    works: { title: 'My works', myWorks: 'My works', noWorks: 'No works assigned to you', uploadPhoto: 'Upload photo', viewDetail: 'View' },
    shop: { title: 'Tool shop', addToCart: 'Add to cart', outOfStock: 'Out of stock', noTools: 'No tools available' },
    cart: { title: 'Cart', empty: 'Your cart is empty', requestTools: 'Request tools', quantity: 'Qty' },
    orders: { title: 'My orders', status: 'Status', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', requestedAt: 'Requested', noOrders: 'No orders yet' },
    common: { logout: 'Log out', save: 'Save', cancel: 'Cancel', loading: 'Loading...', error: 'Error', back: 'Back', myWorksAndTools: 'My works & tools' },
  },
  es: {
    login: { title: 'OX Technician', email: 'Correo', password: 'Contraseña', submit: 'Entrar', error: 'Correo o contraseña incorrectos' },
    dashboard: { title: 'Panel', subtitle: 'Resumen', myWorks: 'Mis obras', recentOrders: 'Pedidos recientes', noWorks: 'Sin obras asignadas', noOrders: 'Sin pedidos aún' },
    works: { title: 'Mis obras', myWorks: 'Mis obras', noWorks: 'No tienes obras asignadas', uploadPhoto: 'Subir foto', viewDetail: 'Ver' },
    shop: { title: 'Tienda de herramientas', addToCart: 'Añadir al carrito', outOfStock: 'Agotado', noTools: 'No hay herramientas' },
    cart: { title: 'Carrito', empty: 'Tu carrito está vacío', requestTools: 'Solicitar herramientas', quantity: 'Cant' },
    orders: { title: 'Mis pedidos', status: 'Estado', pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', requestedAt: 'Solicitado', noOrders: 'Sin pedidos aún' },
    common: { logout: 'Cerrar sesión', save: 'Guardar', cancel: 'Cancelar', loading: 'Cargando...', error: 'Error', back: 'Volver', myWorksAndTools: 'Mis obras y herramientas' },
  },
  pt: {
    login: { title: 'OX Technician', email: 'E-mail', password: 'Senha', submit: 'Entrar', error: 'E-mail ou senha incorretos' },
    dashboard: { title: 'Painel', subtitle: 'Visão geral', myWorks: 'Minhas obras', recentOrders: 'Pedidos recentes', noWorks: 'Nenhuma obra atribuída', noOrders: 'Nenhum pedido ainda' },
    works: { title: 'Minhas obras', myWorks: 'Minhas obras', noWorks: 'Nenhuma obra atribuída a você', uploadPhoto: 'Enviar foto', viewDetail: 'Ver' },
    shop: { title: 'Loja de ferramentas', addToCart: 'Adicionar ao carrinho', outOfStock: 'Esgotado', noTools: 'Nenhuma ferramenta disponível' },
    cart: { title: 'Carrinho', empty: 'Seu carrinho está vazio', requestTools: 'Solicitar ferramentas', quantity: 'Qtd' },
    orders: { title: 'Meus pedidos', status: 'Status', pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado', requestedAt: 'Solicitado', noOrders: 'Nenhum pedido ainda' },
    common: { logout: 'Sair', save: 'Salvar', cancel: 'Cancelar', loading: 'Carregando...', error: 'Erro', back: 'Voltar', myWorksAndTools: 'Minhas obras e ferramentas' },
  },
  fr: {
    login: { title: 'OX Technician', email: 'E-mail', password: 'Mot de passe', submit: 'Connexion', error: 'E-mail ou mot de passe incorrect' },
    dashboard: { title: 'Tableau de bord', subtitle: 'Aperçu', myWorks: 'Mes chantiers', recentOrders: 'Commandes récentes', noWorks: 'Aucun chantier assigné', noOrders: 'Aucune commande' },
    works: { title: 'Mes chantiers', myWorks: 'Mes chantiers', noWorks: 'Aucun chantier ne vous est assigné', uploadPhoto: 'Envoyer une photo', viewDetail: 'Voir' },
    shop: { title: 'Boutique d\'outils', addToCart: 'Ajouter au panier', outOfStock: 'Rupture', noTools: 'Aucun outil disponible' },
    cart: { title: 'Panier', empty: 'Votre panier est vide', requestTools: 'Demander des outils', quantity: 'Qté' },
    orders: { title: 'Mes commandes', status: 'Statut', pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté', requestedAt: 'Demandé', noOrders: 'Aucune commande' },
    common: { logout: 'Déconnexion', save: 'Enregistrer', cancel: 'Annuler', loading: 'Chargement...', error: 'Erreur', back: 'Retour', myWorksAndTools: 'Mes chantiers et outils' },
  },
  nl: {
    login: { title: 'OX Technician', email: 'E-mail', password: 'Wachtwoord', submit: 'Inloggen', error: 'Ongeldige e-mail of wachtwoord' },
    dashboard: { title: 'Dashboard', subtitle: 'Overzicht', myWorks: 'Mijn werken', recentOrders: 'Recente bestellingen', noWorks: 'Geen werken toegewezen', noOrders: 'Nog geen bestellingen' },
    works: { title: 'Mijn werken', myWorks: 'Mijn werken', noWorks: 'Geen werken aan u toegewezen', uploadPhoto: 'Foto uploaden', viewDetail: 'Bekijken' },
    shop: { title: 'Gereedschapwinkel', addToCart: 'In winkelwagen', outOfStock: 'Uitverkocht', noTools: 'Geen gereedschap beschikbaar' },
    cart: { title: 'Winkelwagen', empty: 'Uw winkelwagen is leeg', requestTools: 'Gereedschap aanvragen', quantity: 'Aantal' },
    orders: { title: 'Mijn bestellingen', status: 'Status', pending: 'In behandeling', approved: 'Goedgekeurd', rejected: 'Afgewezen', requestedAt: 'Aangevraagd', noOrders: 'Nog geen bestellingen' },
    common: { logout: 'Uitloggen', save: 'Opslaan', cancel: 'Annuleren', loading: 'Laden...', error: 'Fout', back: 'Terug', myWorksAndTools: 'Mijn werken en gereedschap' },
  },
}

type LanguageContextType = {
  language: TechnicianLanguage
  setLanguage: (lang: TechnicianLanguage) => void
  t: TechnicianTranslations
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

const STORAGE_LANG = 'technician_lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<TechnicianLanguage>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = localStorage.getItem(STORAGE_LANG) as TechnicianLanguage | null
    if (stored && ['en', 'es', 'pt', 'fr', 'nl'].includes(stored)) return stored
    return 'en'
  })

  const setLanguage = useCallback((lang: TechnicianLanguage) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_LANG, lang)
  }, [])

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
