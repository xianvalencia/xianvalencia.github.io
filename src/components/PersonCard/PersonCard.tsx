import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { PersonCardProps } from "./PersonCard.interface";

function getIcon(iconName: string): JSX.Element | null {
    switch (iconName) {
        case "facebook":
            return <FaFacebook className="text-2xl text-zinc-50" />;
            break;
        case "linkedin":
            return <FaLinkedin className="text-2xl text-zinc-50" />;
            break;
        default:
            return null;
    }
}

export default function PersonCard({ image, name, description, links}: PersonCardProps) {
    return (
        <article className="grid grid-cols-12 lg:grid-cols-9 col-span-full content-center">
            {image && <div className="col-start-3 md:col-start-5 lg:col-start-4 col-span-8 md:col-span-4 lg:col-span-3 aspect-square mb-4">
                <Image src={image.src} alt={image.alt} width={320} height={320} className="w-full h-full object-fill" />
            </div>}
            {(name || description || links) && <div className="col-start-2 md:col-start-4 lg:col-start-3 col-span-10 md:col-span-6 lg:col-span-5 text-center">
                {name && <h1 className="text-3xl md:text-5xl font-montserrat font-extrabold uppercase text-zinc-50">{name}</h1>}
                {description && <div className="mt-4 font-montserrat text-zinc-50">{description}</div>}
                {links && <ul className="mt-4 p-0 list-none flex justify-center items-center">
                    {links.map((item, index) =>
                        <li key={index} className="inline ml-4 first:ml-0">
                            <Link href={item.url} target="_blank">{getIcon(item.iconName)}</Link>
                        </li>
                    )}
                </ul>}
            </div>}
        </article>
    );
}
