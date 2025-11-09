import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Box } from "@mui/material";
import Providers from "./providers";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "GeoPhotos - Photo Mapping App",
    description: "Upload and display geotagged photos on an interactive map",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <AuthProvider>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                height: "100vh",
                                overflow: "hidden",
                            }}
                        >
                            {/* Navbar - fixed height */}
                            <Navbar />

                            {/* Main content - takes remaining height */}
                            <Box
                                component="main"
                                sx={{
                                    flex: 1,
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                {children}
                            </Box>
                        </Box>
                    </AuthProvider>
                </Providers>
            </body>
        </html>
    );
}
