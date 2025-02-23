import React, { useEffect } from 'react';
import Temp from "./src/app/Temp";
import { GlobalErrorBoundary } from "./src/components/ErrorFallback";
import { checkForUpdate } from './src/services/updateService'; 


export default function App() {

  useEffect(() => {
    checkForUpdate(); // Verifica atualizações ao abrir o app
  }, []);

  return <GlobalErrorBoundary>
    <Temp />
  </GlobalErrorBoundary>;
}
