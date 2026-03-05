import { useData } from '../context/DataProvider';
import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
    const { data, updateData, loading } = useData();

    // Local state to handle immediate updates while waiting for context/server
    // and to handle the 'loading' state gracefully.
    const [localValue, setLocalValue] = useState(initialValue);

    useEffect(() => {
        let isMounted = true;
        if (!loading && data && data[key] !== undefined && isMounted) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalValue(data[key]);
        }
        return () => { isMounted = false; };
    }, [loading, data, key]);

    const setValue = (value) => {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(localValue) : value;

        // Update local state immediately for UI responsiveness
        setLocalValue(valueToStore);

        // Update global context (which persists to server)
        updateData(key, valueToStore);
    };

    // If loading, returning initialValue is safer than null
    if (loading) return [initialValue, setValue];

    return [localValue, setValue];
}
