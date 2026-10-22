import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import DashboardLayout from '@/shared/layout/DashboardLayout';
import ScrollToTop from '@/shared/layout/ScrollToTop';
import CommandPalette from '@/shared/layout/CommandPalette';
import ErrorBoundary from '@/shared/errors/ErrorBoundary';
import { ListSkeleton } from '@/shared/ui/Skeleton';

// Pages
import Home from '@/modules/portfolio/Home';

// Every page except Home loads on demand, so the first visit downloads only what it shows.
const Privacy = lazy(() => import('@/modules/legal/Privacy'));
const Terms = lazy(() => import('@/modules/legal/Terms'));
const DesignSystem = lazy(() => import('@/modules/portfolio/DesignSystem'));
const AboutMe = lazy(() => import('@/modules/portfolio/AboutMe'));
const Projects = lazy(() => import('@/modules/portfolio/Projects'));
const AdminApp = lazy(() => import('@/modules/admin/AdminApp'));
const BlogList = lazy(() => import('@/modules/blog/BlogList'));
const BlogPost = lazy(() => import('@/modules/blog/BlogPost'));
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
      <CommandPalette />
      <ErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-cyber-black p-12"><ListSkeleton /></div>}>
      <Routes>

        {/* === LEGAL (no header) === */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* === PUBLIC LAYOUT ROUTES (With Header) === */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/design" element={<DesignSystem />} />

          <Route path="/about" element={<AboutMe />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/colophon" element={<Colophon />} />
          {/* Not linked anywhere and not in the sitemap; the page asks the server who you are. */}
          <Route path="/admin/*" element={<AdminApp />} />
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