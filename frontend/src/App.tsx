import { Suspense, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/home";
import TourDetailPage from "./pages/TourDetailPage";
import Attractions from "./pages/Attractions";
import AuthForms from "./components/AuthForms";
import AdminPage from "./pages/AdminPage";
import routes from "tempo-routes";
import { initializeAuth } from "./utils/auth";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import api from "@/utils/api";

function App() {
  useEffect(() => {
    initializeAuth();
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route
              path="/tours"
              element={<div>Экскурсии (в разработке)</div>}
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<AuthForms />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
