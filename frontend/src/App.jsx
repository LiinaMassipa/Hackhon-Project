import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import ProjectDetails from "./pages/ProjectDetails";
import SubmitProject from "./pages/SubmitProject";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function App() {

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
    <Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/gallery" element={<Gallery />} />
  <Route path="/projects/:id" element={<ProjectDetails />} />
  <Route path="/leaderboard" element={<Leaderboard />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected route */}
  <Route
    path="/submit"
    element={
      <ProtectedRoute>
        <SubmitProject />
      </ProtectedRoute>
    }
  />

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>  
      </main>
      <Footer />
    </div>
  );
}