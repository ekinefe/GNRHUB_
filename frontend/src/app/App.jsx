import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import DashboardLayout from '@/shared/layout/DashboardLayout';
import ScrollToTop from '@/shared/layout/ScrollToTop';

// Auth Pages
import Login from '@/modules/auth/Login';
import Register from '@/modules/auth/Register';

// Legal Pages
import Privacy from '@/modules/legal/Privacy';
import Terms from '@/modules/legal/Terms';

// Pages
import Home from '@/modules/portfolio/Home';
import DesignSystem from '@/modules/portfolio/DesignSystem';
import AboutMe from '@/modules/portfolio/AboutMe';
import Projects from '@/modules/portfolio/Projects';
import BlogsMain from '@/modules/blog/BlogsMain';
import ToolsMain from '@/modules/tools/ToolsMain';
import BrandBookStart from '@/modules/brandbook/BrandbookStart';
import BrandBookEditor from '@/modules/brandbook/BrandBookEditor';

// Error Pages
import NotFound from '@/shared/errors/NotFound';
import Unauthorized from '@/shared/errors/Unauthorized';
import ServerError from '@/shared/errors/ServerError';

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