// Moon phase images
import newMoonImg from "../assets/new-moon.png";
import waxingCrescentImg from "../assets/waxing-crescent.png";
import firstQuarterImg from "../assets/first-quarter.png";
import waxingGibbousImg from "../assets/waxing-gibbous.png";
import fullMoonImg from "../assets/full.png";
import waningGibbousImg from "../assets/waning-gibbous.png";
import lastQuarterImg from "../assets/third-quarter.png";
import waningCrescentImg from "../assets/waning-crescent.png";

/**
 * Get the appropriate moon phase image based on phase value
 * @param {number} phase - Moon phase value (0-1)
 * @returns {string} - Image source
 */
export function getMoonPhaseImage(phase) {
  if (phase < 0.0625 || phase > 0.9375) {
    return newMoonImg;
  } else if (phase < 0.25) {
    return waxingCrescentImg;
  } else if (phase < 0.375) {
    return firstQuarterImg;
  } else if (phase < 0.5) {
    return waxingGibbousImg;
  } else if (phase < 0.5625) {
    return fullMoonImg;
  } else if (phase < 0.625) {
    return waningGibbousImg;
  } else if (phase < 0.75) {
    return lastQuarterImg;
  } else {
    return waningCrescentImg;
  }
}

// Export all images for direct use if needed
export {
  newMoonImg,
  waxingCrescentImg,
  firstQuarterImg,
  waxingGibbousImg,
  fullMoonImg,
  waningGibbousImg,
  lastQuarterImg,
  waningCrescentImg,
};
