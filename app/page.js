"use client";

import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Mainbanner from "@/components/homepage/Mainbanner";
import Rimagecard from "@/components/homepage/Rimagecard";
import Limagecard from "@/components/homepage/Limagecard";
import ProductCard from "@/components/homepage/Productcard";
import ContentBtnCard from "@/components/homepage/ContentBtncard";
import ContentCard from "@/components/homepage/ContentCard";
import FloatingActions from "@/components/homepage/FloatingActions";

export default function Home() {

  return (
    <>
      <FloatingActions />
      <Header />
      <Mainbanner />
      <ContentCard
        title="Our Revolutionary Products Range"
        description="ANAADIPRO WELLNESS PRIVATE LIMITED is, above all, a family-driven company. We are guided by a dynamic and diverse global leadership team dedicated to empowering Independent Business Owners in achieving their dreams. Stay focused on your goals with our expertly curated product combinations designed for impactful and targeted results."
      />
      <Limagecard
        title=" ANAADIPRO WELLNESS – Premium Hair Care Range"
        description="Welcome to the world of ANAADIPRO WELLNESS, where nature meets science to bring you the ultimate Hair Care Range. Our star product, the Hair Oil, is a result of carefully researched formulations, infused with green, natural ingredients and produced through cutting-edge manufacturing processes.

This luxurious oil is designed to reduce hair fall, promote healthy growth, strengthen your scalp, and bring back the natural shine and softness of your hair."
        viewmore="/"
        image="/images/homepage/f063399f-23d2-4015-bc54-6e578501d177.webp"
        sideimage="/images/homepage/images.jpeg"
      />
      <Rimagecard
        title="ANAADIPRO WELLNESS – Beauty Care Range"
        description="Discover the essence of true beauty with ANAADIPRO WELLNESS. Our Beauty Care Range is thoughtfully created using advanced scientific formulations and enriched with green, skin-loving ingredients. Every product is crafted with precision and care through modern, hygienic manufacturing practices.

Designed to enhance your natural glow, our range nourishes the skin from within, giving you a radiant, healthy, and confident look every day.

With ANAADIPRO WELLNESS, beauty is not just skin-deep — it’s a lifestyle."
        viewmore="/"
        image="/images/homepage/6ea6bf90-f522-4bf0-b51c-6df24b035430.png"
        sideimage="/images/homepage/wel-side1.jpg"
      />
      <Limagecard
        title="ANAADIPRO WELLNESS – Wellness Care Range"
        description="tep into a world of well-being with ANAADIPRO WELLNESS. Our Wellness Care Range is thoughtfully developed to support a healthier, more balanced lifestyle. Crafted using scientifically backed formulations and enriched with natural, green ingredients, each product is made with care through modern, hygienic manufacturing processes.

Designed to nurture your body from the inside out, our wellness solutions help you feel energized, revitalized, and in harmony with yourself.

Choose ANAADIPRO WELLNESS — where nature, science, and self-care come together."
        viewmore="/"
        image="/images/homepage/171fe72d-b248-43bd-9ca6-ed0df1522b8e.png"
        sideimage="/images/homepage/wel-side1.jpg"
      />
      <Rimagecard
        title=" ANAADIPRO WELLNESS – Food Product Range"
        description="At ANAADIPRO WELLNESS, we believe that good health begins with what you eat. Our Food Product Range is developed with a perfect blend of scientific formulations and nature’s finest ingredients. Each product is prepared using modern, hygienic processes to ensure purity, safety, and maximum nutritional value.

From everyday nourishment to targeted wellness, our food products are designed to support a healthy lifestyle, providing your body with the fuel it needs to thrive.

Fuel your day the natural way — with ANAADIPRO WELLNESS."
        viewmore="/"
        image="/images/homepage/foodstuff-for-donation-storage-and-delivery-various-food-pasta-cooking-oil-and-canned-food-in-cardboard-box-photo.jpg"
        sideimage="/images/homepage/wel-side1.jpg"
      />
      <ContentBtnCard
        title=" ABOUT ANAADIPRO WELLNESS"
        description="At ANAADIPRO WELLNESS, we are more than just a health products company — we are a movement towards a healthier, more informed lifestyle. Founded by seasoned business professionals, our mission is to empower driven individuals by offering high-quality wellness solutions that truly make a difference.

Every product we create is rooted in scientific innovation, enriched with nature’s finest ingredients, and developed through advanced, modern manufacturing techniques.

We are committed not only to wellness but also to education — helping our consumers and partners make smart, healthy choices through knowledge and awareness.

With ANAADIPRO WELLNESS, it’s not just about products — it’s about building a community focused on well-being, growth, and success."
        knowMoreLink="/about"
        contactUsLink="/contact"
      />
      <ContentCard
        title="Latest Products"
        description="We are a Health Products Selling company founded by business professionals. At Asclepius Wellness, we create dynamic entrepreneurs through the promotion of high-quality wellness products."
      />
      <ProductCard />
      <Footer />
    </>
  );
}
