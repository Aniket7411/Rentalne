import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";
import { defaultBrowsePath } from "../../utils/browseUrls";

const PANEL_TRANSITION = "flex 0.85s cubic-bezier(0.4,0,0.2,1)";

function SingleScreen() {
  const [active, setActive] = useState(null); // 'left' | 'right' | null
  const bannerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = bannerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    if (ratio < 0.25) setActive("left");
    else if (ratio > 0.75) setActive("right");
    else setActive(null); // dead zone — center 50%
  }, []);

  const handleMouseLeave = useCallback(() => setActive(null), []);

  const leftFlex  = active === "right" ? 0.75 : active === "left" ? 1.6 : 1;
  const rightFlex = active === "left"  ? 0.75 : active === "right" ? 1.6 : 1;

  return (
    <div
      ref={bannerRef}
      className="flex flex-row w-full"
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
        <div className="absolute inset-0 flex flex-col justify-center px-3 sm:px-10 lg:px-20 py-6 z-10">
          <h1
            className="text-white font-extrabold leading-tight mb-3 sm:mb-4"
            style={{
              fontSize: "clamp(0.9rem, 4.5vw, 3.25rem)",
              textShadow: "0 2px 10px rgba(0,0,0,0.85), 0 0 32px rgba(14,165,233,0.5)",
            }}
          >
            Rent Smart,{' '}
            <br className="lg:hidden" />
            Live{' '}
            <br className="hidden lg:block" />
            Easy
          </h1>
          <Link to={defaultBrowsePath()}>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-sm">
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
        <div className="absolute inset-0 flex flex-col justify-center items-start lg:items-end px-3 sm:px-10 lg:px-20 py-6 z-10 text-left lg:text-right">
          <h1
            className="text-white font-extrabold leading-tight mb-3 sm:mb-4"
            style={{
              fontSize: "clamp(0.9rem, 4.5vw, 3.25rem)",
              textShadow: "0 2px 10px rgba(0,0,0,0.85), 0 0 32px rgba(14,165,233,0.5)",
            }}
          >
            Expert AC{' '}
            <br className="lg:hidden" />
            Care &amp;{' '}
            <br className="hidden lg:block" />
            Repair
          </h1>
          <Link to="/service-request">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 text-sm">
              Book Service <Wrench className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SingleScreen;
