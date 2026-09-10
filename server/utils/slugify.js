const BASE = /[^a-z0-9]+/g;

export const slugify = (value) => String(value ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(BASE, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const uniqueSlug = async (Model, title, excludeId = null, fallback = 'item') => {
    const base = slugify(title) || fallback;

    for (let attempt = 0; attempt < 50; attempt += 1) {
        const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
        const query = { $or: [{ slug: candidate }, { previousSlugs: candidate }] };
        if (excludeId) query._id = { $ne: excludeId };

        const taken = await Model.exists(query);
        if (!taken) return candidate;
    }

    return `${base}-${Date.now()}`;
};
