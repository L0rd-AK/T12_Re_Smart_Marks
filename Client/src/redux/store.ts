import { configureStore } from '@reduxjs/toolkit'
import { 
  persistStore, 
  persistReducer, 
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './features/authSlice'
import type { AuthState } from './features/authSlice'
import sectionInformationReducer from './features/sectionInformationSlice'
import { baseApi } from './api/baseApi'

// Persist config for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'], // Only persist these fields
  transforms: [
    // Transform to ensure isInitialized starts as false after rehydration
    {
      in: (inboundState: AuthState) => {
        return inboundState;
      },
      out: (outboundState: AuthState) => {
        // When saving to storage, don't save isInitialized
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isInitialized, ...rest } = outboundState;
        return rest;
      }
    }
  ]
}

// Create persisted auth reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer)

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        sectionInformation: sectionInformationReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }).concat(baseApi.middleware),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch