import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { AuthProvider } from './contexts/AuthContext';
import './styles/site.css';

import TopBar from "./components/top-bar/TopBar";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./components/home/Home";
import AuthGuard from "./components/guards/AuthGuard";
import GuestGuard from "./components/guards/GuestGuard";
import AdminGuard from "./components/guards/AdminGuard";
import ScrollToTop from "./components/scroll-to-top/ScrollToTop";
import ScrollReset from "./components/scroll-reset/ScrollReset";
import Toaster from "./components/toaster/Toaster";
import Spinner from "./components/spinner/Spinner";

const Catalog = lazy(() => import("./components/catalog/Catalog"));
const Details = lazy(() => import("./components/details/Details"));
const Create = lazy(() => import("./components/create/Create"));
const Login = lazy(() => import("./components/login/Login"));
const Register = lazy(() => import("./components/register/Register"));
const Edit = lazy(() => import("./components/edit/Edit"));
const Profile = lazy(() => import("./components/profile/Profile"));
const NotFound = lazy(() => import("./components/not-found/NotFound"));
const Glossary = lazy(() => import("./components/glossary/Glossary"));
const GlossaryDetails = lazy(() => import("./components/glossary-details/GlossaryDetails"));
const Bookmarks = lazy(() => import("./components/bookmarks/Bookmarks"));
const AuthorProfile = lazy(() => import("./components/author-profile/AuthorProfile"));
const MyArticles = lazy(() => import("./components/my-articles/MyArticles"));
const DcaCalculator = lazy(() => import("./components/dca-calculator/DcaCalculator"));
const MempoolVisualizer = lazy(() => import("./components/mempool-visualizer/MempoolVisualizer"));
const AddressDemystifier = lazy(() => import("./components/address-demystifier/AddressDemystifier"));
const MultisigExplainer = lazy(() => import("./components/multisig-explainer/MultisigExplainer"));
const SatsConverter = lazy(() => import("./components/sats-converter/SatsConverter"));
const SearchPage = lazy(() => import("./components/search-page/SearchPage"));
const Paths = lazy(() => import("./components/paths/Paths"));
const PathDetails = lazy(() => import("./components/path-details/PathDetails"));
const CreatePath = lazy(() => import("./components/create-path/CreatePath"));
const EditPath = lazy(() => import("./components/edit-path/EditPath"));
const MyPaths = lazy(() => import("./components/my-paths/MyPaths"));
const PathQuiz = lazy(() => import("./components/path-quiz/PathQuiz"));
const Certifications = lazy(() => import("./components/certifications/Certifications"));
const CertificationDetails = lazy(() => import("./components/certification-details/CertificationDetails"));
const Admin = lazy(() => import("./components/admin/Admin"));
const ForgotPassword = lazy(() => import("./components/forgot-password/ForgotPassword"));

function App() {
    return (
        <AuthProvider>
            <header className="app-chrome">
                <TopBar />
                <Navbar />
            </header>

            <Toaster />

            <div className="main-area">
                <ScrollReset />
                <ScrollToTop />

                <Suspense fallback={<Spinner />}>
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
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                        </Route>

                        <Route element={<AdminGuard />}>
                            <Route path="/admin" element={<Admin />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>

                <Footer />
            </div>
        </AuthProvider>
    );
}

export default App;
