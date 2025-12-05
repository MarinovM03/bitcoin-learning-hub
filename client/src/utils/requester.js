async function request(method, url, data) {
    const options = {};

    if (method !== 'GET') {
        options.method = method;

        if (data) {
            options.headers = {
                'Content-Type': 'application/json',
            };
            options.body = JSON.stringify(data);
        }
    }

    // TODO: Add Auth Token logic here later

    try {
        const response = await fetch(url, options);

        if (response.status === 204) {
            return {};
        }

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        return result;
        
    } catch (error) {
        alert(error.message);
        throw error;
    }
}

export const get = request.bind(null, 'GET');
export const post = request.bind(null, 'POST');
export const put = request.bind(null, 'PUT');
export const del = request.bind(null, 'DELETE');