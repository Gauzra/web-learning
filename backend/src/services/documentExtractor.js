const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

function normalizeDocxHtml(html) {
    let text = html;

    /*
     * Mammoth dapat menghasilkan nested <ol>/<ul>. Regex list sebelumnya
     * memotong list bersarang dan menggabungkan item setelahnya. Jadikan
     * setiap <li> sebagai baris tersendiri agar struktur soal tetap utuh.
     */
    text = text
        .replace(/<\/?ol[^>]*>/gi, '\n')
        .replace(/<\/?ul[^>]*>/gi, '\n')
        .replace(/<li[^>]*>/gi, '\n')
        .replace(/<\/li>/gi, '\n');

    /*
     * Pertahankan paragraf.
     */
    text = text.replace(
        /<p[^>]*>([\s\S]*?)<\/p>/gi,
        (_, content) => {
            return `\n${content}\n`;
        }
    );

    text = text.replace(
        /<br\s*\/?>/gi,
        '\n'
    );

    /*
     * Hapus formatting HTML.
     */
    text = text.replace(
        /<strong[^>]*>([\s\S]*?)<\/strong>/gi,
        '$1'
    );

    text = text.replace(
        /<em[^>]*>([\s\S]*?)<\/em>/gi,
        '$1'
    );

    text = text.replace(
        /<span[^>]*>([\s\S]*?)<\/span>/gi,
        '$1'
    );

    text = text.replace(
        /<[^>]+>/g,
        ''
    );

    /*
     * Decode HTML entity.
     */
    text = text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#39;/gi, "'")
        .replace(/&quot;/gi, '"');

    text = text.replace(/\r/g, '');

    /*
     * Rapikan setiap baris.
     */
    const lines = text
        .split('\n')
        .map((line) => {
            return line
                .replace(/\s+/g, ' ')
                .trim();
        });

    const result = [];

    for (const line of lines) {
        if (!line) {
            if (
                result.length > 0 &&
                result[result.length - 1] !== ''
            ) {
                result.push('');
            }

            continue;
        }

        result.push(line);
    }

    return result
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

async function extractDocxText(buffer) {
    const result = await mammoth.convertToHtml({
        buffer
    });

    return normalizeDocxHtml(result.value);
}

async function extractDocumentText(filePath, fileType) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error('File materi tidak ditemukan');
    }

    const buffer = fs.readFileSync(absolutePath);

    if (fileType === 'pdf') {
        const result = await pdfParse(buffer);

        return result.text.trim();
    }

    if (fileType === 'docx') {
        return extractDocxText(buffer);
    }

    throw new Error(
        'Format dokumen tidak didukung'
    );
}

module.exports = {
    extractDocumentText
};
