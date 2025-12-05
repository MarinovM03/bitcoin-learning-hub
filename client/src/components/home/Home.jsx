import { useEffect, useState } from "react";
import { Link } from "react-router";
import * as articleService from '../../services/articleService';
import ArticleItem from "../article-item/ArticleItem";

export default function Home() {
    const [latestArticles, setLatestArticles] = useState([]);

    useEffect(() => {
        articleService.getAll()
            .then(result => {
                const latest = result.slice(-3).reverse();
                setLatestArticles(latest);
            })
            .catch(err => alert(err.message));
    }, []);
    
    return (
        <section id="home-page" className="page-content">
            
            <div className="hero-section">
                <h1>Welcome to <span>Bitcoin Learning Hub</span></h1>
                <p className="lead">
                    The ultimate resource for understanding cryptocurrency. 
                    Read the latest articles, share your knowledge, and join the revolution.
                </p>
                <Link to="/articles" className="btn-home">Browse All Articles</Link>
            </div>

            <div className="latest-articles">
                <h2>Latest Knowledge</h2>

                <div className="latest-articles-list">
                    
                    {latestArticles.map(article => <ArticleItem key={article._id} {...article} />)}

                    {latestArticles.length === 0 && <p className="no-articles">No articles yet</p>}
                </div>
            </div>
        </section>
    );
}