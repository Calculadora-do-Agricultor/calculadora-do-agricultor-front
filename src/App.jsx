import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Settings from "./pages/Settings/Settings";
import Calculator from "./pages/Calculator/Calculator";
import React from 'react';
import PrivateRoute from './components/PrivateRoute/privateRouter';
import PlantioPage from "./pages/Calculator/PlantioPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Router>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Register" element={<Register />} />

            <Route path="/Settings" element = {<PrivateRoute/>}>
            <Route index element={<Settings />} />
            </Route>
            <Route path="/Calculator" element = {<PrivateRoute/>}>
            <Route index element={<Calculator />} />
            <Route path="plantio" element={<PlantioPage/>} />
            </Route>

          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
