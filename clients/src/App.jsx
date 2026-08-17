import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Squad from "./pages/Squad";
import PlayerDetail from "./pages/PlayerDetail";
import Fixtures from "./pages/Fixtures";
import Results from "./pages/Results";
import About from "./pages/About";

import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import ChangePassword from "./pages/admin/ChangePassword";
import Dashboard from "./pages/admin/Dashboard";
import PlayersManage from "./pages/admin/PlayersManage";
import FixturesManage from "./pages/admin/FixturesManage";

export default function App() {
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/squad" element={<Squad />} />
                    <Route path="/squad/:id" element={<PlayerDetail />} />
                    <Route path="/fixtures" element={<Fixtures />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/about" element={<About />} />

                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                    <Route path="/admin/reset-password" element={<ResetPassword />} />
                    <Route path="/admin" element={<RequireAuth><Dashboard /></RequireAuth>} />
                    <Route path="/admin/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
                    <Route path="/admin/players" element={<RequireAuth><PlayersManage /></RequireAuth>} />
                    <Route path="/admin/fixtures" element={<RequireAuth><FixturesManage /></RequireAuth>} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

function NotFound() {
    return (
        <section style={{ padding: "120px 0", textAlign: "center" }}>
            <div className="wrap">
                <h2 style={{ fontSize: 32, marginBottom: 12 }}>Page not found</h2>
                <p style={{ color: "var(--ash)" }}>The page you're looking for doesn't exist.</p>
            </div>
        </section>
    );
}
