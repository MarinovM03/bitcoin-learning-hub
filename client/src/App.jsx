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
import AdminGuard from "./components/guards/AdminGuard";
import Edit from "./components/edit/Edit";
import Profile from "./components/profile/Profile";
import NotFound from "./components/not-found/NotFound";
import ScrollToTop from "./components/scroll-to-top/ScrollToTop";
import ScrollReset from "./components/scroll-reset/ScrollReset";
import Glossary from "./components/glossary/Glossary";
import GlossaryDetails from "./components/glossary-details/GlossaryDetails";
import Bookmarks from "./components/bookmarks/Bookmarks";
import AuthorProfile from "./components/author-profile/AuthorProfile";
import MyArticles from "./components/my-articles/MyArticles";
import DcaCalculator from "./components/dca-calculator/DcaCalculator";
import MempoolVisualizer from "./components/mempool-visualizer/MempoolVisualizer";
import AddressDemystifier from "./components/address-demystifier/AddressDemystifier";
import MultisigExplainer from "./components/multisig-explainer/MultisigExplainer";
import SatsConverter from "./components/sats-converter/SatsConverter";
import SearchPage from "./components/search-page/SearchPage";
import Paths from "./components/paths/Paths";
import PathDetails from "./components/path-details/PathDetails";
import CreatePath from "./components/create-path/CreatePath";
import EditPath from "./components/edit-path/EditPath";
import MyPaths from "./components/my-paths/MyPaths";
import PathQuiz from "./components/path-quiz/PathQuiz";
import Certifications from "./components/certifications/Certifications";
import CertificationDetails from "./components/certification-details/CertificationDetails";
import Admin from "./components/admin/Admin";

function App() {
    return (
        <AuthProvider>
            <header className="app-chrome">
                <TopBar />
                <Navbar />
            </header>

            <div className="main-area">
                <ScrollReset />
                <ScrollToTop />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/articles" element={<Catalog />} />
                    <Route path="/articles/:articleId/details" element={<Details />} />
                    <Route path="/paths" element={<Paths />} />
                    <Route path="/paths/:pathId" element={<PathDetails />} />
                    <Route path="/users/:userId" element={<AuthorProfile />} />
                    <Route path="/glossary" element={<Glossary />} />
                    <Route path="/glossary/:termId" element={<GlossaryDetails />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/dca" element={<DcaCalculator />} />
                    <Route path="/mempool" element={<MempoolVisualizer />} />
                    <Route path="/address" element={<AddressDemystifier />} />
                    <Route path="/multisig" element={<MultisigExplainer />} />
                    <Route path="/converter" element={<SatsConverter />} />

                    <Route element={<AuthGuard />}>
                        <Route path="/articles/create" element={<Create />} />
                        <Route path="/articles/:articleId/edit" element={<Edit />} />
                        <Route path="/paths/create" element={<CreatePath />} />
                        <Route path="/paths/:pathId/edit" element={<EditPath />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/bookmarks" element={<Bookmarks />} />
                        <Route path="/my-articles" element={<MyArticles />} />
                        <Route path="/my-paths" element={<MyPaths />} />
                        <Route path="/paths/:pathId/quiz" element={<PathQuiz />} />
                        <Route path="/certifications" element={<Certifications />} />
                        <Route path="/certifications/:certId" element={<CertificationDetails />} />
                    </Route>

                    <Route element={<GuestGuard />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    <Route element={<AdminGuard />}>
                        <Route path="/admin" element={<Admin />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>

                <Footer />
            </div>
        </AuthProvider>
    );
}

export default App;