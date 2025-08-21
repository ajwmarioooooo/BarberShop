import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Products from "@/components/Products";
import Booking from "@/components/Booking";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import LocationMap from "@/components/LocationMap";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-dark-sand">
      <Header />
      <Hero />
      <Services />
      <Products />
      <Booking />
      <About />
      <Gallery />
      <LoyaltyProgram />
      <LocationMap />
      <Footer />
    </div>
  );
}
