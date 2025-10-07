import { Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav";
import MainPage from "./pages/MainPage";
import ConfigPage from "./pages/ConfigPage";
import ProfilesPage from "./pages/ProfilesPage";
import UserPage from "./pages/UserPage";

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-black to-neutral-900 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/user/:uid" element={<UserPage />} />
        </Routes>
      </main>
    </div>
  );
}
