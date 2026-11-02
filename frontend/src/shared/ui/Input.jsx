import React, { forwardRef, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import Field from './Field';
import { controlClasses, describedBy } from './fieldStyles';

// Extra props (name, value, onChange, type, autoComplete, placeholder...) go straight to the <input>.
const Input = forwardRef(function Input({ label, hint, error, required, className = '', id, ...rest }, ref) {
    const auto = useId();
    const inputId = id ?? auto;
    return (
        <Field id={inputId} label={label} hint={hint} error={error} required={required}>
            <input
                ref={ref}
                id={inputId}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(inputId, error, hint)}
                className={twMerge(controlClasses(error), className)}
                {...rest}
            />
        </Field>
    );
});

export default Input;
