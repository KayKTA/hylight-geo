import type { Metadata } from "next";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "Photo Map",
    description: "Upload geotagged photos and view them on a map",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Navbar />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
