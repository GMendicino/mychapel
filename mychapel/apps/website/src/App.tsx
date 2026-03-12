import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Layout } from './components/Layout'; 

import { Main } from "./pages/Main";
import { Info } from './pages/Info'; 
import { HelpPage } from './pages/help'; 
// import { Panorama } from './pages/TempPanorama'; 
import { PanoramaViewer } from './pages/PanoramaViewer';

const App: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Main /></Layout>} />
          <Route path="/tour/:id" element={<Layout><Info /></Layout>} />
          <Route path="/panorama/:id" element={ <PanoramaViewer /> } />
          <Route path="/help" element={ <Layout><HelpPage /></Layout> } />
        </Routes>
      </Router>
  );
}

export default App;