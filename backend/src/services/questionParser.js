function normalizeText(text) {
    return text
        .replace(/\r/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
}

function createQuestion(questionNumber, questionText, optionTexts) {
    return {
        question_number: questionNumber,
        question_text: questionText,
        options: optionTexts.map((optionText, index) => ({
            option_key: String.fromCharCode(65 + index),
            option_text: optionText
        }))
    };
}

function hasCompleteOptions(question) {
    const optionKeys = question.options.map(
        (option) => option.option_key
    );

    return question.question_text &&
        ['A', 'B', 'C', 'D'].every((key) => optionKeys.includes(key));
}

function parseSequentialListQuestions(lines) {
    const items = lines
        .map((line) => line.replace(/^(?:\d+\s*[.)]|[-•])\s*/, ''))
        .map(normalizeText)
        .filter(Boolean);

    const questions = [];

    // Dokumen contoh menggunakan satu daftar bernomor datar:
    // 1 pertanyaan, lalu 4 pilihan, kemudian pola tersebut berulang.
    for (let index = 0; index + 4 < items.length; index += 5) {
        const question = createQuestion(
            questions.length + 1,
            items[index],
            items.slice(index + 1, index + 5)
        );

        if (hasCompleteOptions(question)) {
            questions.push(question);
        }
    }

    return questions;
}

function parseQuestions(extractedText) {
    if (!extractedText || !extractedText.trim()) {
        return [];
    }

    const lines = extractedText
        .replace(/\r/g, '')
        .split('\n')
        .map(normalizeText)
        .filter(Boolean);

    const questions = [];
    let currentQuestion = null;
    let currentOption = null;

    // Mendukung "1. Pertanyaan", "1) Pertanyaan", dan "Soal 1: Pertanyaan".
    const questionPattern = /^(?:soal\s*)?(\d+)\s*[.)\-:]\s*(.+)$/i;
    // Mendukung "A. Jawaban", "A) Jawaban", dan "(A) Jawaban".
    const optionPattern = /^\(?([A-D])\)?[.)]\s*(.+)$/i;

    for (const line of lines) {
        const questionMatch = line.match(questionPattern);

        if (questionMatch) {
            currentQuestion = {
                question_number: Number(questionMatch[1]),
                question_text: normalizeText(questionMatch[2]),
                options: []
            };
            questions.push(currentQuestion);
            currentOption = null;
            continue;
        }

        const optionMatch = line.match(optionPattern);

        if (optionMatch && currentQuestion) {
            const optionKey = optionMatch[1].toUpperCase();
            const optionText = normalizeText(optionMatch[2]);
            const existingOption = currentQuestion.options.find(
                (option) => option.option_key === optionKey
            );

            if (existingOption) {
                existingOption.option_text = optionText;
            } else {
                currentQuestion.options.push({
                    option_key: optionKey,
                    option_text: optionText
                });
            }

            currentOption = optionKey;
            continue;
        }

        if (!currentQuestion) {
            // Abaikan judul atau petunjuk sebelum soal pertama.
            continue;
        }

        if (currentOption) {
            const option = currentQuestion.options.find(
                (item) => item.option_key === currentOption
            );

            if (option) {
                option.option_text = `${option.option_text} ${line}`;
            }
            continue;
        }

        currentQuestion.question_text =
            `${currentQuestion.question_text} ${line}`;
    }

    const labelledQuestions = questions.filter((question) => {
        question.options.sort((a, b) =>
            a.option_key.localeCompare(b.option_key)
        );

        return hasCompleteOptions(question);
    });

    if (labelledQuestions.length > 0) {
        return labelledQuestions;
    }

    return parseSequentialListQuestions(lines);
}

module.exports = {
    parseQuestions
};
