import React from 'react'
import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./assets/Components/Navbar";
import Footer from "./assets/Components/Footer";
import './assets/Components/Footer.css';


import './App.css'

const Home = lazy(() => import("./assets/Pages/Home"));
const Services = lazy(() => import("./assets/Pages/Services"));
const Signup = lazy(() => import("./assets/Pages/Signup"));
const Contact = lazy(() => import("./assets/Pages/Contact"));
const Login = lazy(() => import("./assets/Pages/Login"));
const About = lazy(() => import("./assets/Pages/About"));
const Howitworks = lazy(() => import("./assets/Pages/Howitworks"));
const Blog = lazy(() => import("./assets/Pages/Blog"));
const Mybooking = lazy(() => import("./assets/Pages/Mybooking"));
const HomeCleaning = lazy(() => import("./assets/Pages/HomeCleaning"));
const Plumbing = lazy(() => import("./assets/Pages/Plumbing"));
const Painting = lazy(() => import("./assets/Pages/Painting"));
const Tutoring = lazy(() => import("./assets/Pages/Tutoring"));
const Electrician = lazy(() => import("./assets/Pages/Electrician"));
const Profile = lazy(() => import("./assets/Pages/Profile"));
const Settings = lazy(() => import("./assets/Pages/Settings"));
const ProfessionalDashboard = lazy(() => import("./assets/Pages/ProfessionalDashboard"));
const PrivacyPolicy = lazy(() => import("./assets/Pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./assets/Pages/TermsOfService"));
const SitemapPage = lazy(() => import("./assets/Pages/SitemapPage"));
const FAQPage = lazy(() => import("./assets/Pages/FAQPage"));
const ForgotPassword = lazy(() => import("./assets/Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./assets/Pages/ResetPassword"));
const ChatModule = lazy(() => import("./assets/Pages/ChatModule"));
const ChatInbox = lazy(() => import("./assets/Pages/ChatInbox"));
const AdminLogin = lazy(() => import("./assets/Pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./assets/Pages/AdminDashboard"));

const SITE_NAME = "KaryON";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://karyon.app";
const SITE_IMAGE = `${SITE_URL}/titleImage.png`;

const routeMeta = {
  "/": {
    title: "KaryON | Trusted Home Services Platform",
    description: "Book verified professionals on KaryON for cleaning, plumbing, electrical, and more. Fast bookings, trusted experts, and reliable support.",
    keywords: "KaryON, home services, cleaning services, plumbing, electricians, home maintenance"
  },
  "/services": {
    title: "Services | KaryON",
    description: "Explore KaryON services including home cleaning, plumbing, electrical repairs, painting, and more from trusted professionals.",
    keywords: "KaryON services, home cleaning, plumbing service, electrician service"
  },
  "/signup": {
    title: "Sign Up | KaryON",
    description: "Create your KaryON account to book home services faster, manage bookings, and get personalized offers.",
    keywords: "KaryON signup, create account, book home services"
  },
  "/contact": {
    title: "Contact Us | KaryON",
    description: "Contact KaryON support for service inquiries, booking help, and customer assistance.",
    keywords: "KaryON contact, customer support, help center"
  },
  "/login": {
    title: "Login | KaryON",
    description: "Login to your KaryON account to manage bookings, saved services, and profile settings.",
    keywords: "KaryON login, account access"
  },
  "/about": {
    title: "About Us | KaryON",
    description: "Learn about KaryON, our mission, team, and commitment to trusted, high-quality home services.",
    keywords: "about KaryON, KaryON team, home services platform"
  },
  "/howitworks": {
    title: "How It Works | KaryON",
    description: "See how KaryON works in simple steps: choose a service, book a professional, and get quality service at your doorstep.",
    keywords: "how KaryON works, service booking process"
  },
  "/blog": {
    title: "Blog | KaryON",
    description: "Read home care tips, maintenance guides, and expert advice on the KaryON blog.",
    keywords: "KaryON blog, home care tips, DIY guides"
  },
  "/bookings": {
    title: "My Bookings | KaryON",
    description: "Track, manage, and review your service bookings with KaryON.",
    keywords: "KaryON bookings, manage appointments"
  },
  "/cleaning": {
    title: "Home Cleaning | KaryON",
    description: "Book professional home cleaning services on KaryON with verified experts and transparent pricing.",
    keywords: "KaryON cleaning, home cleaning service"
  },
  "/professional": {
    title: "Professional Dashboard | KaryON",
    description: "View and manage your assigned service jobs as a KaryON professional.",
    keywords: "KaryON professional, service jobs, work dashboard"
  },
  "/profile": {
    title: "My Profile | KaryON",
    description: "Manage your KaryON account profile and personal information.",
    keywords: "KaryON profile, account settings"
  },
  "/settings": {
    title: "Settings | KaryON",
    description: "Manage your KaryON account settings and preferences.",
    keywords: "KaryON settings, account preferences"
  },
  "/privacy": {
    title: "Privacy Policy | KaryON",
    description: "Learn how KaryON collects, uses, and protects your personal information.",
    keywords: "KaryON privacy policy, data protection, personal information"
  },
  "/terms": {
    title: "Terms of Service | KaryON",
    description: "Read the terms and conditions governing your use of the KaryON platform.",
    keywords: "KaryON terms of service, terms and conditions, user agreement"
  },
  "/sitemap": {
    title: "Sitemap | KaryON",
    description: "Full directory of all pages on the KaryON platform.",
    keywords: "KaryON sitemap, site map, page directory"
  },
  "/faq": {
    title: "FAQ | KaryON",
    description: "Frequently asked questions about KaryON services, bookings, payments, and accounts.",
    keywords: "KaryON FAQ, frequently asked questions, help center"
  },
  "/admin-login": {
    title: "Admin Login | KaryON",
    description: "Secure access to KaryON administration panel.",
    keywords: "KaryON admin login, operations dashboard"
  },
  "/admin": {
    title: "Admin Panel | KaryON",
    description: "Manage bookings, reports, users, and platform operations.",
    keywords: "KaryON admin panel, manage bookings, moderation"
  },
  "/forgot-password": {
    title: "Forgot Password | KaryON",
    description: "Reset your KaryON account password securely via email.",
    keywords: "KaryON forgot password, reset password, account recovery"
  },
  "/reset-password": {
    title: "Reset Password | KaryON",
    description: "Create a new password for your KaryON account.",
    keywords: "KaryON reset password, new password, account security"
  },
  "/chat-inbox": {
    title: "Messages | KaryON",
    description: "View all your customer and professional conversations in one inbox.",
    keywords: "KaryON chat inbox, service chat, booking messages"
  }
};

const setMetaTag = (selector, attribute, value) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, selector.includes("property=") ? selector.match(/property="([^"]+)"/)[1] : selector.match(/name="([^"]+)"/)[1]);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
};

const SEOManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force each route change to open from the top instead of preserving footer scroll.
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0 });
    root.style.scrollBehavior = previousScrollBehavior;

    const currentMeta = routeMeta[pathname] || {
      title: "KaryON | Trusted Home Services Platform",
      description: "KaryON helps you book trusted professionals for your home service needs.",
      keywords: "KaryON, home services"
    };

    document.title = currentMeta.title;

    setMetaTag('meta[name="description"]', "name", currentMeta.description);
    setMetaTag('meta[name="keywords"]', "name", currentMeta.keywords);
    setMetaTag('meta[name="robots"]', "name", "index, follow");
    setMetaTag('meta[property="og:site_name"]', "property", SITE_NAME);
    setMetaTag('meta[property="og:type"]', "property", "website");
    setMetaTag('meta[property="og:title"]', "property", currentMeta.title);
    setMetaTag('meta[property="og:description"]', "property", currentMeta.description);
    setMetaTag('meta[property="og:url"]', "property", `${SITE_URL}${pathname}`);
    setMetaTag('meta[property="og:image"]', "property", SITE_IMAGE);
    setMetaTag('meta[name="twitter:card"]', "name", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", currentMeta.title);
    setMetaTag('meta[name="twitter:description"]', "name", currentMeta.description);
    setMetaTag('meta[name="twitter:image"]', "name", SITE_IMAGE);

    let canonicalTag = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute("href", `${SITE_URL}${pathname}`);
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@karyon.app').toLowerCase();

  if (!token || !userRaw) {
    return <Navigate to="/admin-login" replace />;
  }

  try {
    const user = JSON.parse(userRaw);
    const normalizedEmail = String(user?.email || '').toLowerCase();
    const isAdmin = user?.role === 'admin' || user?.isAdmin === true || normalizedEmail === adminEmail;
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

function App() {
  
  return (
    <>
      <div className="app">
      <SEOManager />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/howitworks" element={<Howitworks />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/bookings" element={<ProtectedRoute><Mybooking /></ProtectedRoute>} />
            <Route path="/cleaning" element={<HomeCleaning />} />
            <Route path="/plumbing" element={<Plumbing />} />
            <Route path="/painting" element={<Painting />} />
            <Route path="/tutoring" element={<Tutoring />} />
            <Route path="/electrician" element={<Electrician />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="/professional" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/faq" element={<FAQPage />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/chat/:bookingId" element={<ProtectedRoute><ChatModule /></ProtectedRoute>} />
                      <Route path="/chat-inbox" element={<ProtectedRoute><ChatInbox /></ProtectedRoute>} />
                      <Route path="/admin-login" element={<AdminLogin />} />
                      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
    </>
  )
}

export default App
