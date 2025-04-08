import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        {/* COMPONENTES FIXOS (fora das rotas) */}
        <Navbar />
        {/* PÁGINAS COM ROTAS */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
        {/* COMPONENTES FIXOS (fora das rotas) */}

      </Router>
    </div>
  );
}

export default App;
