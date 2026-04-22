import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './components/AppRoutes';
import './i18n';

export default function App() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-xl font-bold text-slate-500">Yükleniyor...</div>}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main style={{ flex: 1 }}>
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Suspense>
  );
}
