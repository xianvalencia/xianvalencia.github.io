import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: {
    default: 'Xian Valencia — code & cadence',
    template: '%s · Xian Valencia',
  },
  description:
    'Personal blog of Xian Rex Valencia — software engineering, running, and everything in between.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
