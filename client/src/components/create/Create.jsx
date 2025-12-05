export default function Create() {

    const createArticleHandler = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const data = Object.fromEntries(formData);

        console.log(data);
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