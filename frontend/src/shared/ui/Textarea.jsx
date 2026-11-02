import React, { forwardRef, useId } from 'react';
import { twMerge } from 'tailwind-merge';
import Field from './Field';
import { controlClasses, describedBy } from './fieldStyles';

const Textarea = forwardRef(function Textarea({ label, hint, error, required, className = '', id, rows = 4, ...rest }, ref) {
    const auto = useId();
    const areaId = id ?? auto;
    return (
        <Field id={areaId} label={label} hint={hint} error={error} required={required}>
            <textarea
                ref={ref}
                id={areaId}
                rows={rows}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(areaId, error, hint)}
                className={twMerge(controlClasses(error), 'resize-y', className)}
                {...rest}
            />
        </Field>
    );
});

export default Textarea;
