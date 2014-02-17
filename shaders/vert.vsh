varying vec2 vUv;
uniform mat4 backProjection;
uniform sampler2D depth;
uniform float nearPlane;
uniform float farPlane;

void main() {
  vUv = vec2(uv.x, uv.y/2.0);
  vec4 d = texture2D(depth, vUv);
  vec4 p = vec4(position.x + 0.5, position.y + 0.5, 1.0, 
                -1.0/(d.x*(farPlane - nearPlane) + nearPlane));
  p = backProjection * p;
  p = vec4(p.x / p.w, p.y / p.w, p.z / p.w, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * p;
}
