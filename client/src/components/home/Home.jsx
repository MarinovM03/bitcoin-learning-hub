import { Link } from "react-router";

export default function Home() {
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
                    
                    <div className="article-card">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png" 
                             alt="Bitcoin" 
                             className="article-image"/>
                        
                        <div className="article-info">
                            <h3>Bitcoin Basics</h3>
                            <p>Bitcoin is a decentralized digital currency without a central bank or single administrator.</p>
                            <Link to="/articles/be7920ee-987b-4522-be1e-e66737c81c66" className="btn-details">Read More</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}