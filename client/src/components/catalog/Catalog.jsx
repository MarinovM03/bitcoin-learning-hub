import { useEffect, useState } from "react";
import * as articleService from '../../services/articleService';
import ArticleItem from "../article-item/ArticleItem";
import Spinner from "../spinner/Spinner";

export default function Catalog() {
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        articleService.getAll()
            .then(result => {
                setArticles(result);
            })
            .catch(err => {
                alert(err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section id="catalog-page" className="page-content catalog-page">
            <h1>All Articles</h1>

            <div className="search-container">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search by title..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    {filteredArticles.length === 0 && <h3 className="no-articles">No articles found</h3>}
                    
                    <div className="catalog-list">
                        {filteredArticles.map(article => <ArticleItem key={article._id} {...article} />)}
                    </div>
                </>
            )}
        </section>
    );
}