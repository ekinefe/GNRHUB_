import React, { forwardRef, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import Field from './Field';
import { controlClasses, describedBy } from './fieldStyles';

// options: [{ value, label }] or plain strings
const Select = forwardRef(function Select({ label, hint, error, required, options = [], className = '', id, ...rest }, ref) {
    const auto = useId();
    const selectId = id ?? auto;
    return (
        <Field id={selectId} label={label} hint={hint} error={error} required={required}>
            <select
                ref={ref}
                id={selectId}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(selectId, error, hint)}
                className={twMerge(controlClasses(error), className)}
                {...rest}
            >
                {options.map((o) => {
                    const { value, label: text } = typeof o === 'string' ? { value: o, label: o } : o;
                    return <option key={value} value={value}>{text}</option>;
                })}
            </select>
        </Field>
    );
});

export default Select;
