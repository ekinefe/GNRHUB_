import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import DashboardLayout from '@/shared/layout/DashboardLayout';
import AccountMenu from '@/modules/auth/AccountMenu';
import { features } from '@/shared/config/features';
import ScrollToTop from '@/shared/layout/ScrollToTop';
import ErrorBoundary from '@/shared/errors/ErrorBoundary';
import { ListSkeleton } from '@/shared/ui/Skeleton';

// Auth Pages

// Legal Pages

// Pages
import Home from '@/modules/portfolio/Home';

// Every page except Home loads on demand, so the first visit downloads only what it shows.
// (BrandBookEditor pulls in html2pdf, which now only loads on the editor route.)
const Login = lazy(() => import('@/modules/auth/Login'));
const Register = lazy(() => import('@/modules/auth/Register'));
const Privacy = lazy(() => import('@/modules/legal/Privacy'));
const Terms = lazy(() => import('@/modules/legal/Terms'));
const DesignSystem = lazy(() => import('@/modules/portfolio/DesignSystem'));
const AboutMe = lazy(() => import('@/modules/portfolio/AboutMe'));
const Projects = lazy(() => import('@/modules/portfolio/Projects'));
const BlogsMain = lazy(() => import('@/modules/blog/BlogsMain'));
const ToolsMain = lazy(() => import('@/modules/tools/ToolsMain'));
const BrandBookStart = lazy(() => import('@/modules/brandbook/BrandbookStart'));
const BrandBookEditor = lazy(() => import('@/modules/brandbook/BrandBookEditor'));
const Colophon = lazy(() => import('@/modules/colophon/Colophon'));
const Contact = lazy(() => import('@/modules/contact/Contact'));

// Error Pages
import NotFound from '@/shared/errors/NotFound';
import Unauthorized from '@/shared/errors/Unauthorized';
import ServerError from '@/shared/errors/ServerError';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-cyber-black p-12"><ListSkeleton /></div>}>
      <Routes>

        {/* === AUTH ROUTES === */}
        {features.account && <Route path="/login" element={<Login />} />}
        {features.account && <Route path="/register" element={<Register />} />}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* === PUBLIC LAYOUT ROUTES (With Header) === */}
        <Route element={<DashboardLayout account={features.account ? <AccountMenu /> : null} />}>
          <Route path="/" element={<Home />} />
          <Route path="/design" element={<DesignSystem />} />

          {/* Unfinished areas: flagged off, they fall through to the 404 route (see shared/config/features.js) */}
          {features.blogs && <Route path="/blogs" element={<BlogsMain />} />}
          {features.tools && <Route path="/tools" element={<ToolsMain />} />}
          {features.tools && <Route path="/tools/brandbook" element={<BrandBookStart />} />}
          {features.tools && <Route path="/tools/brandbook/workspace" element={<BrandBookEditor />} />}
          <Route path="/about" element={<AboutMe />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/colophon" element={<Colophon />} />
        </Route>

        {/* === ERROR ROUTES (No Header, Full Screen) === */}
        <Route path="/403" element={<Unauthorized />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
      </ErrorBoundary>

    </Router>
  );
}

export default App;