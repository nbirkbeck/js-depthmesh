varying vec2 vUv;
varying vec3 vNormal;

uniform sampler2D depth;

void main() {
  vUv = uv;
  vec4 d = texture2D(depth, vUv);
  d.x = d.x * 10.0 + 0.001;
  d.x *= -0.5;
  vec4 p = vec4(1.33 * position.x * d.x, position.y * d.x, d.x, 1);
  p.z += 5.0;
  gl_Position = projectionMatrix * modelViewMatrix * p;
  vNormal = vec3(modelViewMatrix * vec4(normal, 0.0));
}
