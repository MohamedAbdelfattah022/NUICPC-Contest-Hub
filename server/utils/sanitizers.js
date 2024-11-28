export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';

    input = input.replace(/<[^>]*>/g, '');

    input = input.replace(/\s+/g, ' ');

    input = input.trim();

    input = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return input;
};