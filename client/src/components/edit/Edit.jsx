import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as articleService from '../../services/articleService';

export default function Edit() {
    const navigate = useNavigate();
    const { articleId } = useParams();

    const [error, setError] = useState('');
    const [formValues, setFormValues] = useState({
        title: '',
        category: '',
        imageUrl: '',
        summary: '',
        content: '',
    });

    useEffect(() => {
        articleService.getOne(articleId)
            .then(result => {
                setFormValues(result);
            })
            .catch(err => {
                console.log(err.message);
                navigate('/404');
            })
    }, [articleId]);

    const changeHandler = (e) => {
        setFormValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const editArticleSubmitHandler = async (e) => {
        e.preventDefault();

        if (formValues.title.length < 5) {
            setError("Title must be at least 5 characters long!");
            return;
        }

        if (formValues.summary.length < 10) {
            setError("Summary must be at least 10 characters long!");
            return;
        }

        if (formValues.content.length < 10) {
            setError("Content must be at least 10 characters long!");
            return;
        }

        try {
            await articleService.edit(articleId, formValues);
            navigate(`/articles/${articleId}/details`);
        } catch (err) {
            console.log('Error editing article:', err.message);
            setError(err.message);
        }
    };
    
    return (
        <section id="edit-page" className="page-content">
            <div className="create-page">
                <h1>Edit Knowledge</h1>

                <form id="edit" className="create-form" onSubmit={editArticleSubmitHandler}>
                    
                    <div className="form-group">
                        <label htmlFor="title">Article Title</label>
                        <input 
                            type="text" 
                            id="title" 
                            name="title" 
                            placeholder="Enter title..." 
                            required 
                            value={formValues.title}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input 
                            type="text" 
                            id="category" 
                            name="category" 
                            placeholder="e.g. Technology, Economics..." 
                            required 
                            value={formValues.category}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imageUrl">Image URL</label>
                        <input 
                            type="text" 
                            id="imageUrl" 
                            name="imageUrl" 
                            placeholder="http://..." 
                            required 
                            value={formValues.imageUrl}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">Summary</label>
                        <textarea 
                            id="summary" 
                            name="summary" 
                            placeholder="Short description for the card..." 
                            required
                            value={formValues.summary}
                            onChange={changeHandler}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea 
                            id="content" 
                            name="content" 
                            className="content-input" 
                            placeholder="Full article content..." 
                            required
                            value={formValues.content}
                            onChange={changeHandler}
                        ></textarea>
                    </div>

                    {error && (
                        <p className="field-error">{error}</p>
                    )}

                    <input type="submit" value="Save Changes" className="btn-submit" />
                    
                </form>
            </div>
        </section>
    );
}