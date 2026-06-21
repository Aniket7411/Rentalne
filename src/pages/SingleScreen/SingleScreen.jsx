import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";
import { defaultBrowsePath } from "../../utils/browseUrls";

const PANEL_TRANSITION = "flex 0.85s cubic-bezier(0.4,0,0.2,1)";

function SingleScreen() {
  const [active, setActive] = useState(null);
  const bannerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = bannerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    if (ratio < 0.25) setActive("left");
    else if (ratio > 0.75) setActive("right");
    else setActive(null);
  }, []);

  const handleMouseLeave = useCallback(() => setActive(null), []);

  const leftFlex  = active === "right" ? 0.75 : active === "left" ? 1.6 : 1;
  const rightFlex = active === "left"  ? 0.75 : active === "right" ? 1.6 : 1;

  return (
    <div
      ref={bannerRef}
      className="flex flex-col sm:flex-row w-full"
      style={{ height: "90vh", minHeight: 320 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left Panel — Rent */}
      <div
        className="group relative overflow-hidden"
        style={{ flex: leftFlex, transition: PANEL_TRANSITION }}
      >
        <img
          src="/bannerleftimage.png"
          alt="Rent appliances"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col justify-center pl-10 pr-4 sm:pl-12 sm:pr-6 lg:pl-20 lg:pr-10 py-6 z-10">
          <span className="inline-block text-sky-300 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 drop-shadow">
            Appliance Rental
          </span>
          <h1
            className="text-white font-extrabold leading-tight mb-4 text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85), 0 0 32px rgba(14,165,233,0.5)" }}
          >
            Rent Smart,<br />
            Live Easy
          </h1>
          <p className="text-white/80 text-xs sm:text-xs md:text-sm mb-4 leading-relaxed max-w-xs drop-shadow">
            ACs, Fridges &amp; Washers — flexible plans, free maintenance.
          </p>
          <Link to={defaultBrowsePath()}>
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-sm">
              Rent Now <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Right Panel — Service */}
      <div
        className="group relative overflow-hidden"
        style={{ flex: rightFlex, transition: PANEL_TRANSITION }}
      >
        <img
          src="/bannerright.png"
          alt="AC repair and service"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col justify-center pl-10 pr-4 sm:pl-12 sm:pr-6 lg:pl-20 lg:pr-10 py-6 z-10">
          <span className="inline-block text-sky-300 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 drop-shadow">
            Need Help?
          </span>
          <h1
            className="text-white font-extrabold leading-tight mb-4 text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85), 0 0 32px rgba(14,165,233,0.5)" }}
          >
            Expert AC<br />
            Repair &amp; Care
          </h1>
          <p className="text-white/80 text-xs sm:text-xs md:text-sm mb-4 leading-relaxed max-w-xs drop-shadow">
            Gas refill, deep clean, servicing — same-day experts at your door.
          </p>
          <Link to="/service-request">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-sm">
              Service Now <Wrench className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SingleScreen;
