import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import UserContextProvider from './components/context/userContext';
import './index.css';
import App from './App';
import ContentContextProvider from './components/context/counterCounter';
import TokenContextProvider from './components/context/TokenContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TokenContextProvider>
      <UserContextProvider>
        <ContentContextProvider>
          <App />
        </ContentContextProvider>
      </UserContextProvider>
    </TokenContextProvider>
  </StrictMode>,
);
