import { useEffect, useState } from "react";
import * as articleService from "../../services/articleService";
import ProfileForm from "../profile-form/ProfileForm";
import MyArticlesList from "../my-articles-list/MyArticlesList";

export default function Profile() {
    const [showToast, setShowToast] = useState(false);
    const [myArticles, setMyArticles] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(true);

    useEffect(() => {
        articleService.getMyArticles()
            .then(result => setMyArticles(result))
            .catch(err => console.log("Failed to load articles:", err.message))
            .finally(() => setArticlesLoading(false));
    }, []);

    const handleSaveSuccess = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleArticleDeleted = (articleId) => {
        setMyArticles(prev => prev.filter(a => a._id !== articleId));
    };

    return (
        <section id="profile-page" className="page-content">
            {showToast && (
                <div className="profile-toast">
                    ✅ Profile updated successfully!
                </div>
            )}

            <ProfileForm onSaveSuccess={handleSaveSuccess} />

            <div className="profile-articles-section">
                <MyArticlesList
                    articles={myArticles}
                    isLoading={articlesLoading}
                    onArticleDeleted={handleArticleDeleted}
                />
            </div>
        </section>
    );
}