import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Router>
        {/* COMPONENTES FIXOS (fora das rotas) */}
        <Navbar />
        {/* PÁGINAS COM ROTAS */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Settings" element={<Settings />} />
          </Routes>
        </main>
        <Footer />
        {/* COMPONENTES FIXOS (fora das rotas) */}
      </Router>
    </div>
  );
}

export default App;
