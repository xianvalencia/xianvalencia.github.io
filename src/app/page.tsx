import { Metadata } from "next";
import Header from "@/components/Header";
import PersonCard from "@/components/PersonCard";

export const metadata: Metadata = {
    title: "Xian Valencia"
}

export default function Home() {
    return (
        <div className="min-h-screen grid grid-cols-12 content-start">
            <Header
                logo="naix"
                menuItems={[
                    {url: '/', text: 'Home', active: true},
                    {url: 'mailto:xian.valencia@gmail.com', text: 'Contact'},
                ]}
                copyright="&copy; 2023 Xian Valencia" />
            <section className="min-h-content grid grid-cols-12 lg:grid-cols-9 lg:col-start-4 col-span-full lg:col-span-9 content-center">
                <PersonCard
                    image={{src: "https://picsum.photos/id/6/320", alt: "Xian Valencia"}}
                    name="Xian Valencia"
                    description="I am a Drupal/WordPress Developer and an aspiring React JS Developer"
                    links={[
                        {url: "https://facebook.com/xianvalencia", iconName: "facebook"},
                        {url: "https://www.linkedin.com/in/xianvalencia", iconName: "linkedin"},
                    ]} />
            </section>
        </div>
    );
}
