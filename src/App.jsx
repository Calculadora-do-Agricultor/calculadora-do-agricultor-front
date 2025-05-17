import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Settings from "./pages/Settings/Settings";
import Calculator from "./pages/Calculator/Calculator.jsx";
import React from 'react';
import PrivateRoute from './components/PrivateRoute/privateRouter'
import ProtectedRoute from './components/ProtectedRoute'
import CreateCalculationPage from "./pages/CreateCalculationPage/CreateCalculationPage.jsx";
import EditCalculationPage from "./pages/EditCalculationPage/EditCalculationPage.jsx";

function App() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Router>
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PrivateRoute requiresAuth={false} />}>
              <Route index element={<Login />} />
            </Route>
            <Route path="/Register" element={<PrivateRoute requiresAuth={false} />}>
              <Route index element={<Register />} />
            </Route>

            <Route path="/settings" element={<PrivateRoute requiresAuth={true} />}>
              <Route index element={<Settings />} />
            </Route>
            <Route path="/calculator" element={<PrivateRoute requiresAuth={true} />}>
              <Route index element={<Calculator />} />
            </Route>
            <Route path="/admin/criar-calculo" element={
              <ProtectedRoute adminOnly={true} redirectTo="/calculator">
                <CreateCalculationPage />
              </ProtectedRoute>
            } />
            <Route path="/edit-calculation/:id" element={
              <ProtectedRoute adminOnly={true} redirectTo="/calculator">
                <EditCalculationPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
