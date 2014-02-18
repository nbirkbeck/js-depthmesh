/** 
 * Camera calibration parameters. These don't have to be exact unless you care
 * about measuring exact geometry.
 * The principle point (400, 300) was chosen to be the center of the image.
 * The "near" and "far" plane should correspond to the formatting of the depth map
 * in the video texture.
 *
 * @typedef {{
 *   fx: number,
 *   fy: number,
 *   skew: number,
 *   width: number,
 *   height: number,
 *   near: number,
 *   far: number,
 * }}
 */
var Calibration;


/**
 * @type {!Calibration}
 */
var calib = {
  fx: 693.34, 
  fy: 693.07, 
  skew: -0.03875, 
  cx: 400,
  cy: 300,
  width: 800,
  height: 600,
  near: 2,
  far: 6
};
