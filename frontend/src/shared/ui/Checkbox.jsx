import React, { forwardRef, useId } from 'react';

const Checkbox = forwardRef(function Checkbox({ label, error, id, className = '', ...rest }, ref) {
    const auto = useId();
    const boxId = id ?? auto;
    return (
        <div className={className}>
            <label htmlFor={boxId} className="flex items-start gap-3 font-mono text-sm text-cyber-text cursor-pointer">
                <input
                    ref={ref}
                    id={boxId}
                    type="checkbox"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${boxId}-error` : undefined}
                    className="mt-0.5 h-4 w-4 shrink-0 appearance-none border border-cyber-border bg-cyber-panel checked:bg-cyber-pink checked:border-cyber-pink focus-visible:ring-2 focus-visible:ring-cyber-cyan focus:outline-none cursor-pointer"
                    {...rest}
                />
                <span>{label}</span>
            </label>
            {error && <p id={`${boxId}-error`} role="alert" className="mt-1 font-mono text-xs text-cyber-offline">{error}</p>}
        </div>
    );
});

export default Checkbox;
