varying vec2 vUv;
varying vec3 vNormal;

uniform sampler2D depth;
uniform sampler2D color;

void main() {
  vec4 rgb = texture2D(depth, vUv);
  vec4 dx = texture2D(depth, vec2(vUv.x + 0.005, vUv.y));
  vec4 dy = texture2D(depth, vec2(vUv.x, vUv.y + 0.005));
  vec3 n = vec3(-(dx.x - rgb.x) / 0.005, -(dy.x - rgb.x) / 0.005, 0.1);
  float len = sqrt(dot(n, n));
  n.z /= len;
  rgb = texture2D(color, vUv);
  
  //  rgb = vec4(dx.x - rgb.x, dy.x - rgb.x, 1.0, 1.0);
  float alpha = n.z;
  n.z = 1.0;
  if (alpha < 0.01) {
    alpha = 0.0;
  } else {
    alpha = 1.0;
  }
  gl_FragColor = vec4(n.z * rgb.x, n.z * rgb.y, n.z * rgb.z, alpha);
}
