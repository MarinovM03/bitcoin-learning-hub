import { Link } from "react-router";

export default function Catalog() {
    return (
        <section id="catalog-page" className="page-content catalog-page">
            <h1>All Knowledge</h1>

            <div className="catalog-list">

                {/* <!-- Hardcoded Card 1 --> */}
                <div className="article-card">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png" 
                        alt="Bitcoin" 
                        className="article-image" />
                    
                    <div className="article-info">
                        <h3>Bitcoin Basics</h3>
                        <p>Bitcoin is a decentralized digital currency without a central bank or single administrator.</p>
                        <Link to="/articles/be7920ee-987b-4522-be1e-e66737c81c66" className="btn-details">Read More</Link>
                    </div>
                </div>

                {/* <!-- Hardcoded Card 2 */}
                <div className="article-card">
                    <img src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Ethereum" 
                        className="article-image" />
                    
                    <div className="article-info">
                        <h3>Ethereum Smart Contracts</h3>
                        <p>Ethereum is a decentralized, open-source blockchain with smart contract functionality.</p>
                        <Link to="/articles/eth-id-123" className="btn-details">Read More</Link>
                    </div>
                </div>

            </div>

            {/* <!-- 2. "No Articles" Message (Show this if list is empty) --> */}
            {/* <!-- <h3 className="no-articles">No articles yet</h3> --> */}

        </section>
    );
}