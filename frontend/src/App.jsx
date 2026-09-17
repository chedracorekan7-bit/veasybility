import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RouterScroll from './components/RouterScroll';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import FooterReveal from './components/FooterReveal';
import FirstForm from './components/FirstForm';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Contact from './pages/Contact';
import { useTheme } from './hooks/useTheme';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-bg text-foreground font-sans overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetails />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      
      {isHome && <FirstForm />}
      <Footer />
      <FooterReveal />
      <MobileBottomNav />
      <Chatbot />
    </div>
  );
}

function App() {
  useTheme();

  return (
    <Router>
      <RouterScroll />
      <AppContent />
    </Router>
  );
}

export default App;
