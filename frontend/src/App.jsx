import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Legal Pages
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';

// Pages
import Home from './pages/Home';
import DesignSystem from './pages/DesignSystem';
import AboutMe from './pages/aboutMe/AboutMe';
import Projects from './pages/aboutMe/Projects';
import BlogsMain from './pages/BlogsMain';
import ToolsMain from './pages/ToolsMain';
import BrandBookStart from './pages/tools/brandbook/BrandbookStart';
import BrandBookEditor from './pages/tools/brandbook/BrandBookEditor';

// Error Pages
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';
import ServerError from './pages/errors/ServerError';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>

        {/* === AUTH ROUTES === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* === PUBLIC LAYOUT ROUTES (With Header) === */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/design" element={<DesignSystem />} />

          {/* Placeholders for future pages */}
          <Route path="/dashboard" element={<div className="p-12">Dashboard Coming Soon</div>} />
          <Route path="/blogs" element={<BlogsMain />} />
          <Route path="/tools" element={<ToolsMain />} />
          <Route path="/tools/brandbook" element={<BrandBookStart />} />
          <Route path="/tools/brandbook/workspace" element={<BrandBookEditor />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/projects" element={<Projects />} />
        </Route>

        {/* === ERROR ROUTES (No Header, Full Screen) === */}
        <Route path="/403" element={<Unauthorized />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />

      </Routes>

    </Router>
  );
}

export default App;