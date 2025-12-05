import { useEffect, useState } from "react";
import * as articleService from '../../services/articleService';
import ArticleItem from "../article-item/ArticleItem";

export default function Catalog() {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        articleService.getAll()
            .then(result => {
                setArticles(result);
            })
            .catch(err => {
                alert(err.message);
            });
    }, []);

    return (
        <section id="catalog-page" className="page-content catalog-page">
            <h1>All Articles</h1>

                {articles.length === 0 && <h3 className="no-articles">No articles yet</h3>}
                <div className="catalog-list">
                    {articles.map(article => <ArticleItem key={article._id} {...article} />)}
                </div>
                
        </section>
    );
}