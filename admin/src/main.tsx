import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from '../components/Toast'
import { api } from '../lib/api'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
})

// Clerk publishable key (produção: pk_live_... do dashboard.clerk.com)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_dG9sZXJhbnQtcXVldHphbC0zMi5jbGVyay5hY2NvdW50cy5kZXYk'

// ========== PUSH NOTIFICATIONS SETUP ==========

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Register push service worker and subscribe
async function setupPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[Push] Push notifications not supported')
    return
  }

  try {
    // Get VAPID public key from server
    const vapidPublicKey = await api.getVapidPublicKey()
    if (!vapidPublicKey) {
      console.log('[Push] VAPID key not available')
      return
    }

    // Register push service worker
    const registration = await navigator.serviceWorker.register('/sw-push.js', {
      scope: '/'
    })
    console.log('[Push] Service worker registered:', registration.scope)

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready
    console.log('[Push] Service worker is ready')

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('[Push] Notification permission denied')
        return
      }

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })
      console.log('[Push] New subscription created')
    } else {
      console.log('[Push] Existing subscription found')
    }

    // Send subscription to server
    await api.subscribePush(subscription)
    console.log('[Push] Subscription sent to server')

  } catch (error) {
    console.error('[Push] Error setting up push notifications:', error)
  }
}

// Initialize push notifications after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Delay to not block initial render
    setTimeout(setupPushNotifications, 2000)
  })
}

// Export for manual triggering
;(window as any).setupPushNotifications = setupPushNotifications

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>,
)