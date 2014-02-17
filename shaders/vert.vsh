varying vec2 vUv;
varying vec3 vNormal;

uniform sampler2D depth;

void main() {
  vUv = vec2(uv.x, uv.y / 2.0);
  vec4 d = texture2D(depth, vUv);
  d.x = d.x * 5.0 + 2.0;
  d.x *= -0.5;
  vec4 p = vec4(1.33 * position.x * d.x, position.y * d.x, d.x, 1);
  p.z += 6.0;
  gl_Position = projectionMatrix * modelViewMatrix * p;
  vNormal = vec3(modelViewMatrix * vec4(normal, 0.0));
}
