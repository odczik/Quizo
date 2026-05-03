import { useState, useCallback } from 'react';

/**
 * A simple hook to toggle a boolean value.
 */
export function useToggle(initialValue = false): [boolean, () => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => {
        setValue((v) => !v);
    }, []);

    return [value, toggle];
}
