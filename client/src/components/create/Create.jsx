import { useNavigate } from 'react-router';
import * as articleService from '../../services/articleService';

export default function Create() {
    const navigate = useNavigate();

    const createArticleHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const articleData = Object.fromEntries(formData);

        try {
            await articleService.create(articleData);

            navigate('/articles');
        } catch (err) {
            console.log("Error creating article:", err.message);
        }
    };

    return (
        <section id="create-page" className="page-content">
            <div className="create-page">
                <h1>Create Article</h1>

                <form id="create" className="create-form" onSubmit={createArticleHandler}>
                    
                    <div className="form-group">
                        <label htmlFor="title">Article Title</label>
                        <input type="text" id="title" name="title" placeholder="Enter title..." required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input type="text" id="category" name="category" placeholder="e.g. Technology, Economics..." required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imageUrl">Image URL</label>
                        <input type="text" id="imageUrl" name="imageUrl" placeholder="http://..." required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">Summary</label>
                        <textarea id="summary" name="summary" placeholder="Short description for the card..." required></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea id="content" name="content" className="content-input" placeholder="Full article content..." required></textarea>
                    </div>

                    <input type="submit" value="Publish Article" className="btn-submit" />
                    
                </form>
            </div>
        </section>
    );
}