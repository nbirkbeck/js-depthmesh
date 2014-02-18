varying vec2 vUv;
uniform sampler2D depth;
uniform int showDepthMap;
uniform int shaded;
uniform int showBackground;
uniform float alphaThresh;

float sampleDepth(vec2 uv) {
  vec4 t = texture2D(depth, uv);
  return t.x + t.y / 255.0 + t.z / (255.0*255.0);
}

void main() {
  const float kEps = 0.005;
  float d = sampleDepth(vUv);

  // Compute lighting with the surface tangents.
  float dx = (sampleDepth(vec2(vUv.x + kEps, vUv.y)) - d) / kEps;
  float dy = (sampleDepth(vec2(vUv.x, vUv.y + kEps)) - d) / kEps;
  vec3 n = vec3(-dx, -dy, 1);
  float len = sqrt(dot(n, n));
  n.z /= len;

  float verticalOffset = 0.5;
  if (showDepthMap != 0) {
    verticalOffset = 0.0;
  }
  vec4 rgb = texture2D(depth, vec2(vUv.x, vUv.y + verticalOffset));  
  float alpha = n.z;

  // Assume that the there is one light pointing to the surface, so the
  // surface shading value is the z component of the normal.
  if (shaded == 0) {
    n.z = 1.0;
  }

  // For surface regions pointed away from the surface, clear the alpha
  // value.
  if (alpha < alphaThresh) {
    alpha = 0.0;
  } else {
    alpha = 1.0;
  }

  // Clear the stuff on the background if it is desired.
  if (d >= 0.98 && showBackground == 0) {
    alpha = 0.0;
  }
  gl_FragColor = vec4(n.z * rgb.x, n.z * rgb.y, n.z * rgb.z, alpha);
}
