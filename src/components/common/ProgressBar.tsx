import React from "react";

interface ProgressBarProps {
    value: number;
    max: number;
    color?: string;
}

export function ProgressBar({ value, max, color = "#6366f1" }: ProgressBarProps) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
        <div className="progress-wrap">
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="progress-label">{value}/{max}</span>
        </div>
    );
}
