import { Link } from "react-router";

export default function Header({
    auth,
    onLogout,
}) {
    const isAuthenticated = !!auth.accessToken;

    return (
        <header>
            <h1>
                <Link className="home" to="/">Bitcoin Learning Hub</Link>
            </h1>

            <nav>
                <Link to="/articles">All Articles</Link>

                {isAuthenticated ? (
                    <div id="user">
                        <Link to="/articles/create">Create Article</Link>
                        <Link to="/" onClick={onLogout}>Logout</Link>
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