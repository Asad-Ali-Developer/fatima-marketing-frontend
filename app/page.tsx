import { HomePageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fatima Marketing",
  description: "Welcome to the home page of the Fatima Marketing Application.",
};

const Home = () => {
  return (
    <main>
      <HomePageTemplate />
    </main>
  );
};

export default Home;
