import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

function App() {
  return (
    <Router>
      {/* COMPONENTES FIXOS (fora das rotas) */}
      <Navbar/>
      {/* PÁGINAS COM ROTAS */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
        <Footer/>
      {/* COMPONENTES FIXOS (fora das rotas) */}

    </Router>
  );
}

export default App;
