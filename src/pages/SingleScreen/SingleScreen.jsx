import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";
import { defaultBrowsePath } from "../../utils/browseUrls";

function SingleScreen() {
  return (
    <div
      className="flex flex-col sm:flex-row w-full"
      style={{ height: "100vh", minHeight: 400 }}
    >
      {/* Left Panel — Rent */}
      <div className="relative flex-1 overflow-hidden" style={{ minHeight: "50vh" }}>
        <img
          src="/bannerleftimage.png"
          alt="Rent appliances"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col justify-center px-10 sm:px-16 lg:px-20 py-10 z-10">
          <h1
            className="text-white font-extrabold leading-tight mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              textShadow: "0 0 24px rgba(56,189,248,0.85), 0 0 60px rgba(14,165,233,0.45)",
            }}
          >
            Rent Smart,{' '}
            <br className="lg:hidden" />
            Live{' '}
            <br className="hidden lg:block" />
            Easy
          </h1>
          <Link to={defaultBrowsePath()}>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg shadow transition-all duration-200 text-sm">
              Rent Now <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Right Panel — Service */}
      <div className="relative flex-1 overflow-hidden" style={{ minHeight: "50vh" }}>
        <img
          src="/bannerright.png"
          alt="AC repair and service"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col justify-center items-start lg:items-end px-10 sm:px-16 lg:px-20 py-10 z-10 text-left lg:text-right">
          <h1
            className="text-white font-extrabold leading-tight mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              textShadow: "0 0 24px rgba(56,189,248,0.85), 0 0 60px rgba(14,165,233,0.45)",
            }}
          >
            Expert AC{' '}
            <br className="lg:hidden" />
            Care &amp;{' '}
            <br className="hidden lg:block" />
            Repair
          </h1>
          <Link to="/service-request">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg shadow transition-all duration-200 text-sm">
              Book Service <Wrench className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SingleScreen;
