import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import BitcoinPrice from '../common/BitcoinPrice';

export default function Header() {
    const { isAuthenticated, logoutHandler } = useAuth();

    return (
        <header>
            <h1><Link className="home" to="/">Bitcoin Learning Hub</Link></h1>

            <nav>
                <BitcoinPrice />
                <Link to="/articles">All Articles</Link>

                {isAuthenticated ? (
                    <div id="user">
                        <Link to="/articles/create">Create Article</Link>
                        <Link to="/" onClick={logoutHandler}>Logout</Link>
                    </div>
                ) : (
                    <div id="guest">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                )}
            </nav>
        </header>
    );
}