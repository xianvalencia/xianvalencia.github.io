import { ReactNode } from "react";

export interface HeaderPropsMenuItem {
    url: string;
    text: string;
    active?: boolean;
}

export interface HeaderProps {
    logo: ReactNode;
    menuItems: HeaderPropsMenuItem[];
    copyright: ReactNode
}
