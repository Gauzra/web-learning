async function searchMaterialTheme(title) {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
        throw new Error('PEXELS_API_KEY belum dikonfigurasi');
    }

    if (!title || !title.trim()) {
        return null;
    }

    const query = encodeURIComponent(title.trim());

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&orientation=landscape&locale=id-ID&per_page=1`,
        {
            method: 'GET',
            headers: {
                Authorization: apiKey
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Pexels API error: ${response.status} ${errorText}`
        );
    }

    const data = await response.json();

    if (
        !data.photos ||
        data.photos.length === 0
    ) {
        return null;
    }

    const photo = data.photos[0];

    return {
        image_url: photo.src.landscape,
        photo_url: photo.url,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        pexels_id: photo.id
    };
}

module.exports = {
    searchMaterialTheme
};