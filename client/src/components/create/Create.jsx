import { useNavigate } from 'react-router';
import * as articleService from '../../services/articleService';
import { useState } from 'react';

export default function Create() {
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({
        title: '',
        category: '',
        imageUrl: '',
        summary: '',
        content: '',
    });

    const changeHandler = (e) => {
        setFormValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
    };

    const createArticleSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            await articleService.create(formValues);
            navigate('/articles');
        } catch (err) {
            console.log("Error creating article:", err.message);
        }
    };

    return (
        <section id="create-page" className="page-content">
            <div className="create-page">
                <h1>Create Article</h1>

                <form id="create" className="create-form" onSubmit={createArticleSubmitHandler}>
                    
                    <div className="form-group">
                        <label htmlFor="title">Article Title</label>
                        <input type="text" id="title" name="title" placeholder="Enter title..." required value={formValues.title} onChange={changeHandler} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input type="text" id="category" name="category" placeholder="e.g. Technology, Economics..." required value={formValues.category} onChange={changeHandler} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imageUrl">Image URL</label>
                        <input type="text" id="imageUrl" name="imageUrl" placeholder="http://..." required value={formValues.imageUrl} onChange={changeHandler} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">Summary</label>
                        <textarea id="summary" name="summary" placeholder="Short description for the card..." required value={formValues.summary} onChange={changeHandler} ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea id="content" name="content" className="content-input" placeholder="Full article content..." required value={formValues.content} onChange={changeHandler} ></textarea>
                    </div>

                    <input type="submit" value="Publish Article" className="btn-submit" />
                    
                </form>
            </div>
        </section>
    );
}