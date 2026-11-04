import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Atmosphere } from './components/Atmosphere';

// Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LessonPlayer } from './pages/student/LessonPlayer';
import { TakeQuizPage } from './pages/student/TakeQuizPage';
import { StudentGradesPage } from './pages/student/StudentGradesPage';

// Instructor Portal Pages
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { CourseWorkspace } from './pages/instructor/CourseWorkspace';

// Route Guards
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center font-mono text-xs text-zinc-500">
        Verifying cryptographic session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireInstructor({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Instructor') return <Navigate to="/student/dashboard" replace />;
  return children;
}

function RequireStudent({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Student') return <Navigate to="/instructor/dashboard" replace />;
  return children;
}

function NotFound() {
  return (
    <div className="min-h-screen pt-36 pb-24 text-center px-6">
      <div className="max-w-md mx-auto p-8 rounded-3xl glass-panel border border-white/10">
        <div className="text-4xl font-headline text-emerald-400 font-bold mb-2">404</div>
        <h1 className="font-headline text-2xl text-white mb-2">Endpoint Not Found</h1>
        <p className="text-xs text-zinc-400 mb-6">
          The requested route does not correspond to an active ClassCast system resource.
        </p>
        <a
          href="/"
          className="px-6 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400"
        >
          Return to Platform Home
        </a>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen flex flex-col bg-[#050505] text-[#EBEBEB]">
          {/* Ambient morphing glows */}
          <Atmosphere />

          {/* Fixed cyber navigation */}
          <Navbar />

          {/* Route views */}
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Student Portal */}
              <Route
                path="/student/dashboard"
                element={
                  <RequireStudent>
                    <StudentDashboard />
                  </RequireStudent>
                }
              />
              <Route
                path="/student/grades"
                element={
                  <RequireStudent>
                    <StudentGradesPage />
                  </RequireStudent>
                }
              />
              <Route
                path="/learn/:courseId"
                element={
                  <RequireAuth>
                    <LessonPlayer />
                  </RequireAuth>
                }
              />
              <Route
                path="/quiz/:quizId"
                element={
                  <RequireStudent>
                    <TakeQuizPage />
                  </RequireStudent>
                }
              />

              {/* Instructor Portal */}
              <Route
                path="/instructor/dashboard"
                element={
                  <RequireInstructor>
                    <InstructorDashboard />
                  </RequireInstructor>
                }
              />
              <Route
                path="/instructor/course/:courseId"
                element={
                  <RequireInstructor>
                    <CourseWorkspace />
                  </RequireInstructor>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Dark cyber footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
