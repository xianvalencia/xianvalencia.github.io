"use client";

import { useState } from "react";
import Link from "next/link";
import { HeaderProps } from "./Header.interface";

export default function Header({ logo, menuItems, copyright }: HeaderProps) {
    const [open, setOpen] = useState(false);
    const handleBurgerClick = () => {
        setOpen(!open);
    };

    return (
        <header className={`group ${open ? "open " : ""}h-12 lg:h-screen col-span-12 lg:col-span-3 px-5 lg:px-100 lg:py-60 bg-slate-600 flex flex-row lg:flex-col justify-between items-center lg:items-start`}>
            <Link className="font-montserrat font-extrabold uppercase tracking-widest text-3xl relative z-10 text-zinc-50" href="/">{logo}</Link>
            <button type="button" onClick={handleBurgerClick} className="relative h-8 z-10 lg:hidden">
                <span className="block w-8 h-0.5 bg-zinc-50 group-[.open]:rotate-45 group-[.open]:translate-y-px transition-all ease-linear duration-300"></span>
                <span className="block w-8 h-0.5 mt-2 bg-zinc-50 group-[.open]:hidden transition-all ease-linear duration-300"></span>
                <span className="block w-8 h-0.5 mt-2 bg-zinc-50 group-[.open]:-rotate-45 group-[.open]:-translate-y-px group-[.open]:mt-0 transition-all ease-linear duration-300"></span>
            </button>
            <ul className="w-1/3 md:w-1/4 lg:w-full h-full text-right lg:text-left font-mulish list-none px-5 lg:px-0 fixed lg:static top-0 -end-1/3 md:-end-1/4 flex flex-col justify-center bg-slate-600 z-0 transition-all ease-linear duration-300 group-[.open]:end-0">
                {menuItems.map((item, index) =>
                    <li key={index} className={`${index > 0 ? "mt-3 " : ""}`}>
                        <Link href={item.url} className={`${item.active ? "text-zinc-50" : "text-zinc-300"}`}>{item.text}</Link>
                    </li>
                )}
            </ul>
            {copyright &&
                <div className="hidden lg:block text-zinc-300">{copyright}</div>}
        </header>
    );
}
