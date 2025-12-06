import { Routes, Route } from "react-router";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./components/home/Home";
import Catalog from "./components/catalog/Catalog";
import Details from "./components/details/Details";
import Create from "./components/create/Create";
import Login from "./components/login/Login";

function App() {
    return (
        <>
            <Header />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/articles" element={<Catalog /> } />
                <Route path="/articles/:articleId/details" element={<Details />} />
                <Route path="/articles/create" element={<Create />} />
                <Route path="/login" element={<Login />} />
            </Routes>

            <Footer />
        </>
    );
}

export default App
