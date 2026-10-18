// Las preguntas de «calcita new» en la terminal: cada una con sus opciones numeradas y la recomendada marcada; Enter acepta
// la recomendada. Una respuesta que no sirve se vuelve a preguntar con su motivo.
//
// Funciones de node, sin React: function (regla de la casa).
import {createInterface} from 'node:readline/promises';
import {stdin, stdout} from 'node:process';

import {QUESTIONS, problemWithAnswer} from './projectAnswers.js';

/**
 * @param {Record<string, string>} recommendedAnswers las de defaultAnswersOf
 * @param {Record<string, string>} [presetAnswers] las que ya llegaron como opciones: esas no se preguntan
 * @returns {Promise<Record<string, string>>}
 */
export async function askQuestions(recommendedAnswers, presetAnswers = {}) {
    const terminal = createInterface({input: stdin, output: stdout});
    const answers = {...presetAnswers};
    try {
        for (const question of QUESTIONS) {
            if (question.key in presetAnswers || (question.when && !question.when(answers))) {
                continue;
            }
            answers[question.key] = question.options
                ? await askOption(terminal, question, recommendedAnswers[question.key])
                : await askText(terminal, question, recommendedAnswers[question.key]);
        }
    } finally {
        terminal.close();
    }
    return answers;
}

/** Una pregunta de opciones: se contesta con su número; Enter, la recomendada. */
async function askOption(terminal, question, recommendedValue) {
    stdout.write(`\n${question.text}\n`);
    question.options.forEach(([value, label], index) => {
        stdout.write(`  ${index + 1}) ${label}${value === recommendedValue ? '  ← recomendada' : ''}\n`);
    });
    for (;;) {
        const reply = (await terminal.question('Número (Enter = recomendada): ')).trim();
        if (reply === '') {
            return recommendedValue;
        }
        const option = question.options[Number(reply) - 1];
        if (option) {
            return option[0];
        }
        stdout.write(`Escriba un número del 1 al ${question.options.length}.\n`);
    }
}

/** Una pregunta de texto; Enter, la recomendada (si hay). */
async function askText(terminal, question, recommendedValue) {
    for (;;) {
        const hint = recommendedValue ? ` [${recommendedValue}]` : '';
        const reply = (await terminal.question(`\n${question.text}${hint}: `)).trim() || recommendedValue || '';
        const problem = problemWithAnswer(question.key, reply);
        if (!problem) {
            return reply;
        }
        stdout.write(`${problem}\n`);
    }
}
