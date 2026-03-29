import React, { useState } from "react";
import "./SingleScreen.css";





import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { defaultBrowsePath } from "../../utils/browseUrls";

function SingleScreen() {
  const [leftWidth, setLeftWidth] = useState(50);
  const [rightWidth, setRightWidth] = useState(50);
  const [leftScale, setLeftScale] = useState(1);
  const [rightScale, setRightScale] = useState(1);
  const [leftImageHeight, setLeftImageHeight] = useState("65%");
  const [rightImageHeight, setRightImageHeight] = useState("65%");
  const [isLeftButtonVisible, setIsLeftButtonVisible] = useState(false);
  const [isRightButtonVisible, setIsRightButtonVisible] = useState(false);
  const [isMouseMoveEnabled, setIsMouseMoveEnabled] = useState(true);
  const [isRightContentVisible, setIsRightContentVisible] = useState(true);
  const [hideImg, setHideImg] = useState(true);
  const [hideLeftImg, setHideLeftImg] = useState(true);
  const [newst, setNewst] = useState(false);
  const [isRightSectionHidden, setIsRightSectionHidden] = useState(false);
  const [isLeftSectionHidden, setIsLeftSectionHidden] = useState(false);

  // Function to handle mouse movement
  const handleMouseMove = (event) => {
    if (!isMouseMoveEnabled) return;

    const screenWidth = window.innerWidth;
    const cursorX = event.clientX;
    const cursorPercent = (cursorX / screenWidth) * 100;

    if (cursorPercent <= 40) {
      setLeftWidth(65);
      setRightWidth(35);
      setLeftScale(1.15);
      setRightScale(0.9);
      setLeftImageHeight("60%");
      setRightImageHeight("35%");
    } else if (cursorPercent >= 72) {
      setLeftWidth(35);
      setRightWidth(65);
      setLeftScale(0.9);
      setRightScale(1.15);
      setLeftImageHeight("35%");
      setRightImageHeight("70%");
    } else {
      setLeftWidth(50);
      setRightWidth(50);
      setLeftScale(1);
      setRightScale(1);
      setLeftImageHeight("60%");
      setRightImageHeight("60%");
    }
  };

  // Handle "left" button click
  const handleMouseMoveLeft = () => {
    setLeftWidth(90);
    setRightWidth(10);
    setLeftScale(1.2);
    setRightScale(0.8);
    setLeftImageHeight("70%");
    setIsLeftButtonVisible(true);
    setIsRightContentVisible(false); // Hide right content with sliding effect
    setIsMouseMoveEnabled(false);
    setHideLeftImg(false);
    setIsRightSectionHidden(true);
  };

  // Handle "right" button click
  const handleMouseMoveRight = () => {
    setLeftWidth(10);
    setRightWidth(90);
    setLeftScale(0.8);
    setRightScale(1.2);
    setLeftImageHeight("35%");
    setRightImageHeight("70%");
    setIsRightButtonVisible(true);
    setIsLeftButtonVisible(false);
    setIsRightContentVisible(true);
    setIsMouseMoveEnabled(false);
    setHideImg(false);
    setNewst(true);
    setIsLeftSectionHidden(true);
  };

  // Handle "back" button click to reset
  const handleBackClick = () => {
    setLeftWidth(50);
    setRightWidth(50);
    setLeftScale(1);
    setRightScale(1);
    setLeftImageHeight("65%");
    setRightImageHeight("65%");
    setIsLeftButtonVisible(false);
    // setIsRightButtonVisible(false);
    setIsRightContentVisible(true); // Show right content
    setIsMouseMoveEnabled(true);
    setHideLeftImg(true);
    setIsRightSectionHidden(false);
  };

  const handleBackRightClick = () => {
    setLeftWidth(50);
    setRightWidth(50);
    setLeftScale(1);
    setRightScale(1);
    setLeftImageHeight("65%");
    setRightImageHeight("65%");
    setIsRightButtonVisible(false);
    setIsRightContentVisible(true); // Show right content
    setIsMouseMoveEnabled(true);
    setHideLeftImg(true);
    setNewst(false);
    setIsLeftSectionHidden(false);
  };

  return (
    <>
      <div className="containerx">
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100vh",
            transition: "all 1.5s ease-in-out",
          }}
          onMouseMove={handleMouseMove}
        >
          <div
            className="left-section"
            style={{
              width: `${leftWidth}%`,
            }}
          >
            {!isLeftSectionHidden && (
              <>
                <div
                  style={{
                    transform: `scale(${leftScale})`,
                    transformOrigin: "top left",
                    transition: "all 1.2s ease",
                    marginTop: "3rem",
                    paddingLeft: "2rem",
                    paddingRight: "1rem",
                    maxWidth: "100%",
                    overflow: "hidden",
                    zIndex: "10",
                  }}
                >
                  {(isLeftButtonVisible || isRightButtonVisible) && (
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                      onClick={handleBackClick}
                      className="text-text-dark hover:text-primary-blue transition-colors duration-300"
                    >
                      <img src="/arrowBackBlack.svg" width={22} height={10} className="me-3" alt="" />
                      Back
                    </div>
                  )}
                  <div>
                    <h2
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginLeft: "6px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                      className="text-primary-blue"
                    >
                      For Renters
                    </h2>
                    <h2
                      style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "800", lineHeight: "1.2" }}
                      className="italic"
                    >
                      Find the Perfect AC for  <br />  Your Comfort <br />{" "}
                      Today
                    </h2>
                    <p style={{ fontSize: "clamp(12px, 1.5vw, 14px)", fontWeight: "400", lineHeight: "1.5", marginTop: "0.75rem" }}>
                      Browse through our wide selection of ACs, <br />
                      choose your preferred model, <br /> and enjoy cool comfort.
                    </p>
                  </div>
                  <Link to={defaultBrowsePath()}>
                    <button className="left-button bg-gradient-to-r from-primary-blue to-primary-blue-light text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm mt-4">
                      Browse ACs
                    </button>
                  </Link>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: "1rem",
                    height: leftImageHeight,
                    transform: `scale(${leftScale})`,
                    transformOrigin: "top right",
                    transition: "all 1.2s ease",
                    maxWidth: "50%",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="/acbanner.jfif"
                    alt=""
                    className="left-image mt-6"
                    style={{
                      width: "100%",
                      height: "100%",
                      transformOrigin: "bottom left",
                      transition: "transform 1.2s ease",
                    }}
                  />
                </div>

                {!isLeftButtonVisible && !isRightButtonVisible && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "50%",
                      right: "0.5rem",
                      cursor: "pointer",
                      opacity: isLeftButtonVisible ? 0 : 1,
                      transition: "opacity 1.2s ease",
                      zIndex: "30",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMouseMoveLeft();
                    }}
                    className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#2563EB] " />
                  </div>
                )}
              </>
            )}
          </div>

          <div
            // className="right-section"
            className="right-section rightt"
            style={{
              width: `${rightWidth}%`,
            }}
          >
            {!isRightSectionHidden && (
              <>
                {!isRightButtonVisible && !isLeftButtonVisible && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "50%",
                      left: "0.5rem",
                      cursor: "pointer",
                      opacity: isRightButtonVisible ? 0 : 1,
                      transition: "opacity 1.2s ease",
                      zIndex: "30",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMouseMoveRight();
                    }}
                    className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </div>
                )}
                <div
                  className={`${newst ? "right-section-to" : ""}`}
                  style={{
                    paddingLeft: "2rem",
                    paddingRight: "3rem",
                    paddingBottom: "2rem",
                    transform: `scale(${rightScale})`,
                    zIndex: "10",
                    marginTop: "3rem",
                    maxWidth: "100%",
                    overflow: "hidden",
                    transition: "transform 1.2s ease-in-out",
                    transformOrigin: "top left",
                    position: "relative",
                  }}
                >
                  {isRightButtonVisible && (
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        maxWidth: "maxContent",
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        zIndex: "15",
                        position: "relative",
                      }}
                      onClick={handleBackRightClick}
                      className="text-white hover:text-blue-100 transition-colors duration-300"
                    >
                      <img height={10} width={22} src="/arrowBackWhite.svg" className="me-3" alt="" />
                      Back
                    </span>
                  )}
                  <h2 style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    For Service
                  </h2>
                  <h2
                    style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "800", lineHeight: "1.2" }}
                    className="italic"
                  >
                    Get Your AC <br /> Repaired & Serviced <br /> Today
                  </h2>
                  <p style={{ fontSize: "clamp(12px, 1.5vw, 14px)", fontWeight: "400", lineHeight: "1.5", marginTop: "0.75rem" }}>
                    Need AC repair or maintenance? Book a service <br /> request easily and get professional <br /> technicians at your doorstep!
                  </p>
                  <Link to="/service-request">
                    <button className="right-button ml-4  w-auto bg-white/95 backdrop-blur-sm text-primary-blue px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white/30 text-sm mt-4">
                      Service Request
                    </button>
                  </Link>
                </div>
                {hideLeftImg && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: "1rem",
                      height: rightImageHeight,
                      transform: `scale(${rightScale})`,
                      transformOrigin: "top right",
                      transition: "all 1.2s ease",
                      maxWidth: "50%",
                      overflow: "hidden",
                    }}
                  >
                    {/* <img
                      src="/acinstaller.jpg"
                      alt=""
                      className="right-image mt-16"
                      style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "bottom left",
                        transition: "transform 1.2s ease",
                      }}
                    /> */}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="containery h-[100%]">
        <div className="top-section  flex flex-col justify-between">
          <div className="p-4 mt-10">
            <p className="text-xs">For Renters</p>
            <h1 className="italic text-xl font-bold">
              {" "}
              Find the Perfect AC  for <br /> Your Comfort Today
            </h1>
            <p className="text-sm mt-2">
              Browse through our wide selection of ACs, choose your preferred model, and enjoy cool comfort.
            </p>
            <Link to={defaultBrowsePath()}>
              <button
                className="mt-3 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ minWidth: '140px' }}
              >
                Browse ACs
              </button>
            </Link>
          </div>
          <div className="flex justify-end">
            <img
              className="h-[250px] w-[250px] "
              src="acbanner.jfif"
              alt="man"
            />
          </div>
        </div>
        <div className="top-section bg-[#2563EB] text-white flex flex-col justify-between">
          <div className="p-4 mt-5">
            <p className="text-sm">For Service</p>
            <h1 className="italic text-xl font-bold">
              {" "}
              Get Your AC <br /> Repaired & Serviced <br /> Today
            </h1>
            <p className="text-sm mt-2">
              Need AC repair or maintenance? Book a service request easily and get professional technicians at your doorstep.
            </p>

            <Link to="/service-request">
              <button
                className="mt-3 px-6 py-3 bg-white/20 w-auto backdrop-blur-md text-white rounded-xl font-semibold border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ minWidth: '140px' }}
              >
                Service Request
              </button>
            </Link>
          </div>
          <div className="flex justify-end">
            {/* <img className="h-[200px] w-[150px]" src="/acinstaller.jpg" alt="man" /> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleScreen;
