import { Routes, Route } from "react-router";
import { AuthProvider } from './contexts/AuthContext';
import './styles/site.css';

import TopBar from "./components/top-bar/TopBar";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./components/home/Home";
import Catalog from "./components/catalog/Catalog";
import Details from "./components/details/Details";
import Create from "./components/create/Create";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import AuthGuard from "./components/guards/AuthGuard";
import GuestGuard from "./components/guards/GuestGuard";
import Edit from "./components/edit/Edit";
import Profile from "./components/profile/Profile";
import NotFound from "./components/not-found/NotFound";
import ScrollToTop from "./components/scroll-to-top/ScrollToTop";
import Glossary from "./components/glossary/Glossary";
import GlossaryDetails from "./components/glossary-details/GlossaryDetails";
import Bookmarks from "./components/bookmarks/Bookmarks";
import AuthorProfile from "./components/author-profile/AuthorProfile";
import MyArticles from "./components/my-articles/MyArticles";
import DcaCalculator from "./components/dca-calculator/DcaCalculator";
import MempoolVisualizer from "./components/mempool-visualizer/MempoolVisualizer";
import SearchPage from "./components/search-page/SearchPage";

function App() {
    return (
        <AuthProvider>
            <header className="app-chrome">
                <TopBar />
                <Navbar />
            </header>

            <div className="main-area">
                <ScrollToTop />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/articles" element={<Catalog />} />
                    <Route path="/articles/:articleId/details" element={<Details />} />
                    <Route path="/users/:userId" element={<AuthorProfile />} />
                    <Route path="/glossary" element={<Glossary />} />
                    <Route path="/glossary/:termId" element={<GlossaryDetails />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/dca" element={<DcaCalculator />} />
                    <Route path="/mempool" element={<MempoolVisualizer />} />

                    <Route element={<AuthGuard />}>
                        <Route path="/articles/create" element={<Create />} />
                        <Route path="/articles/:articleId/edit" element={<Edit />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/bookmarks" element={<Bookmarks />} />
                        <Route path="/my-articles" element={<MyArticles />} />
                    </Route>

                    <Route element={<GuestGuard />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>

                <Footer />
            </div>
        </AuthProvider>
    );
}

export default App;