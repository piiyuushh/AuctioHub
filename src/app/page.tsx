import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import TrendingProducts from "@/components/TrendingProducts";
import NewArrival from "@/components/NewArrivals";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
    <Header />
      {/* Full width on small screens, add small side padding starting from xl (13"+), minimal on 2xl (15"+) */}
      <main className="w-full xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto">
        <Carousel />
        <TrendingProducts />
        <NewArrival />
      </main>
      <Footer />
    </>
  );
}

