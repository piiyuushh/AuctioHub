import { getPublicCarouselImages, getPublicNewArrivals } from '@/lib/public-content';
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import NewArrival from "@/components/NewArrivals";
import Header from "@/components/Header";

export const revalidate = 300

export default async function Home() {
  const [carouselImages, newArrivalProducts] = await Promise.all([
    getPublicCarouselImages(),
    getPublicNewArrivals(),
  ])

  return (
    <>
      <Header />
      {/* Full width on small screens, add small side padding starting from xl (13"+), minimal on 2xl (15"+) */}
      <main className="w-full xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto">
        <Carousel initialImages={carouselImages.map((image) => image.url)} />
        <NewArrival initialProducts={newArrivalProducts} />
      </main>
      <Footer />
    </>
  );
}

