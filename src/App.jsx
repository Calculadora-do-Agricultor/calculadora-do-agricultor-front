import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer, PrivateRoute, ProtectedRoute } from "@/components";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Settings from "./pages/Settings/Settings";
import Calculator from "./pages/Calculator/Calculator.jsx";
import React from "react";
import CreateCalculationPage from "./pages/CreateCalculationPage/CreateCalculationPage.jsx";
import EditCalculationPage from "./pages/EditCalculationPage/EditCalculationPage.jsx";
import LogsManagement from "./pages/LogsManagement";

function App() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Router>
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
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
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
