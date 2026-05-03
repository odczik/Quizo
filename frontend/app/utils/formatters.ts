/**
 * Formats a date into a human-readable string.
 * @example
 * formatDate('2026-05-03') // "3. 5. 2026"
 */
export function formatDate(dateInput: string | Date): string {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    return date.toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
}
