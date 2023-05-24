import { ReactNode } from "react";

export interface PersonCardLink {
    url: string;
    iconName: string;
}

export interface PersonCardProps {
    image?: {
        src: string;
        alt: string;
    };
    name?: string;
    description?: ReactNode;
    links?: PersonCardLink[];
}
