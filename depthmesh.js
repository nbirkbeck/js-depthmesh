
function loadShader(url) {
  var shaderSrc;
  var result = jQuery.ajax(url, {
    async: false,
    success: function(data, status) {
      shaderSrc = data;
    },
    error: function() { 
      console.log('error');
    }
  });
  return shaderSrc;
}

var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 800);
renderer.setDepthTest(true);
renderer.setDepthWrite(true);

renderer.setClearColor(0x000000, 1);

/** @type {!THREE.PerspectiveCamera} */
var camera = new THREE.PerspectiveCamera(60, 1.0, 0.3, 2000);
camera.position.z = 6.5;
camera.position.x = 0;
camera.rotation.y = 0;
container.appendChild(renderer.domElement);

var light = new THREE.DirectionalLight();
scene.add(light);
light.position.set(0, 0, 1);

var texture = THREE.ImageUtils.loadTexture("textures/depth.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

var uniforms = {
  depth: { type: 't', value: texture }
};
var plane = new THREE.PlaneGeometry(1, 1, 200, 200);
var planeMat = new THREE.ShaderMaterial({
  vertexShader: loadShader('shaders/vert.vsh'),
  fragmentShader: loadShader('shaders/frag.fsh'),
  uniforms: uniforms
});
planeMat.alphaTest = 0.4;
planeMat.transparent = true;

var planeMesh = new THREE.Mesh(plane, planeMat);
planeMesh.rotation.y = 0.6;
planeMesh.rotation.z = 3.14;
scene.add(planeMesh);

var canvas = document.createElement('canvas');
vid.addEventListener('loadedmetadata', function() {
  canvas.width = vid.videoWidth;
  canvas.height = vid.videoHeight;

  var y = 0;
  setInterval(function() {
    var ctx = canvas.getContext('2d');
    ctx.drawImage(vid, 0, 0);

    uniforms['depth'].value = new THREE.Texture(canvas);
    uniforms['depth'].value.needsUpdate = true;

    y += 0.1;
    planeMesh.rotation.y = Math.sin(y) * 0.2725;
    renderer.render(scene, camera);
  }, 100);
});
