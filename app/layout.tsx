import { MainLayout, ReduxProvider } from "@/components/atoms";
import { fonts } from "./fonts";
// @ts-ignore
import "./globals.css";
import { ToastContainer } from "react-toastify";
// @ts-ignore
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fonts.zalandoSans.variable}>
        <Analytics />
        <SpeedInsights/>
        <ReduxProvider>
          <MainLayout>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </MainLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
