import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App.jsx'

import Home from "./pages/Home";
import CoursePage from "./pages/CoursePage";
import ProfilePage from "./pages/ProfilePage";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/course/:id" element={<CoursePage />} />
          <Route path="/profilepage" element={<ProfilePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/Admin" element={<Admin />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
