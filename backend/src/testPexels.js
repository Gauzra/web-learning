require('dotenv').config({
    path: '../.env'
});

const {
    searchMaterialTheme
} = require('./services/pexelsService');

async function test() {
    try {
        const result =
            await searchMaterialTheme(
                'Konsep Dasar Investasi'
            );

        console.log(result);

    } catch (error) {
        console.error(
            'Pexels test error:',
            error
        );
    }
}

test();