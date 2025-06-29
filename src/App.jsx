import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer, PrivateRoute, ProtectedRoute } from "@/components";
import { useIntelligentPreload } from "./utils/preloadRoutes";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./services/firebaseConfig";
import { ToastProvider, useToast } from "./context/ToastContext";
import { setToastInstance } from "./services/firebaseWrapper";
import { useCalculationHistoryCleanup } from "./hooks/useCalculationHistoryCleanup";


// Lazy loading das páginas para reduzir bundle inicial
const Home = React.lazy(() => import("./pages/Home/Home"));
const Login = React.lazy(() => import("./pages/Login/Login"));
const Register = React.lazy(() => import("./pages/Register/Register"));
const Settings = React.lazy(() => import("./pages/Settings/Settings"));
const Calculator = React.lazy(() => import("./pages/Calculator/Calculator.jsx"));
const CreateCalculationPage = React.lazy(() => import("./pages/CreateCalculationPage/CreateCalculationPage.jsx"));
const EditCalculationPage = React.lazy(() => import("./pages/EditCalculationPage/EditCalculationPage.jsx"));
const LogsManagement = React.lazy(() => import("./pages/LogsManagement"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const GlossarioPage = React.lazy(() => import("./pages/Glossario"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const DataIntegrityPage = React.lazy(() => import("./pages/DataIntegrityPage"));



// Componente de loading otimizado
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);


// Componente para inicializar o sistema de notificações
const ToastInitializer = () => {
  const toast = useToast();
  React.useEffect(() => {
    setToastInstance(toast);
  }, [toast]);
  return null;
};

function App() {
  const [user] = useAuthState(auth);
  
  // Hook para preload inteligente de rotas baseado no contexto do usuário
  useIntelligentPreload(user, user?.email?.includes('admin') || false);
  
  // Hook para limpeza automática do histórico de cálculos (90 dias)
  useCalculationHistoryCleanup(90, true);
  
  return (
    <Router>
      <ToastProvider>
          <ToastInitializer />
          <div className="flex min-h-screen w-full flex-col">
            <Navbar />
            <main className="flex-grow pt-20">
              <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/glossario" element={<GlossarioPage />} />
              <Route path="/faq" element={<FAQ />} />
              
              <Route
                path="/login"
                element={<PrivateRoute requiresAuth={false} />}
              >
                <Route index element={<Login />} />
              </Route>
              <Route
                path="/Register"
                element={<PrivateRoute requiresAuth={false} />}
              >
                <Route index element={<Register />} />
              </Route>

              <Route
                path="/settings"
                element={<PrivateRoute requiresAuth={true} />}
              >
                <Route index element={<Settings />} />
              </Route>
              <Route
                path="/calculator"
                element={<PrivateRoute requiresAuth={true} />}
              >
                <Route index element={<Calculator />} />
              </Route>
              <Route
                path="/admin/criar-calculo"
                element={
                  <ProtectedRoute adminOnly={true} redirectTo="/calculator">
                    <CreateCalculationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-calculation/:id"
                element={
                  <ProtectedRoute adminOnly={true} redirectTo="/calculator">
                    <EditCalculationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute adminOnly={true} redirectTo="/">
                    <LogsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly={true} redirectTo="/">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly={true} redirectTo="/">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/data-integrity"
                element={
                  <ProtectedRoute adminOnly={true} redirectTo="/">
                    <DataIntegrityPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            </Suspense>
            </main>
            <Footer />
          </div>
      </ToastProvider>
    </Router>
    );
}

export default App;
