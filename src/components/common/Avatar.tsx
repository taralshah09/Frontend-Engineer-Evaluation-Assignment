import React from "react";

interface AvatarProps {
    name: string;
    color: string;
    size?: string;
}

export function Avatar({ name, color, size = "" }: AvatarProps) {
    const initials = name.split("_").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    return <div className={`avatar ${size}`} style={{ background: color }}>{initials}</div>;
}
