import { useState } from "react";
import { packages } from "./site.config.js";
import { Header, Hero } from "./components/Hero.jsx";
import { Faq, Footer, Guides, Packages, Sites, WeekSteps, Works } from "./components/Sections.jsx";
import { OrderSection } from "./components/OrderForm.jsx";
import VideoDialog from "./components/VideoDialog.jsx";

const defaultPackage = packages[0].id;

export default function App() {
  const [packageId, setPackageId] = useState(defaultPackage);
  const [playing, setPlaying] = useState(null);

  return (
    <>
      <Header />
      <main>
        <Hero onPlay={setPlaying} />
        <WeekSteps />
        <Packages onChoose={setPackageId} />
        <Works onPlay={setPlaying} />
        <Guides onPlay={setPlaying} />
        <OrderSection packageId={packageId} onPackage={setPackageId} />
        <Sites />
        <Faq />
      </main>
      <Footer />
      {playing && <VideoDialog key={playing.path} video={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}
