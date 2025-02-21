import React from "react";
import Temp from "./src/app/Temp";
import { GlobalErrorBoundary } from "./src/components/ErrorFallback"; 


export default function App() {
  return <GlobalErrorBoundary>
    <Temp />
  </GlobalErrorBoundary>;
}
