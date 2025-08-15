import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { router } from './router/Router.tsx';
import { store, persistor } from './redux/store'
import LoadingSpinner from './components/LoadingSpinner'


// Ensure Google Client ID is set in environment variables
// This should be defined in your .env file as VITE_GOOGLE_CLIENT_ID
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <RouterProvider router={router} />
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
