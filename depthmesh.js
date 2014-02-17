
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

function getFov(calib) {
  var f = (calib.fx + calib.fy) / 2.0;
  return 180.0 * Math.atan2(calib.height / 2.0, f) * 2.0 / Math.PI;
}

function getBackProjectionMatrix(c) {
  // ignoring skew.
  // x = (width * x - calib.cx)
  // x = width * x / fx - calib.cx / fx
  // y = height * y / fx - calib.cy / fy
  return new THREE.Matrix4(
      c.width / c.fx, 0, -c.cx / c.fx, 0,
      0, c.height / c.fy, -c.cy / c.fy, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
  );
}

var calib = {
  fx: 693.3400214945934, 
  fy: 693.0773296706444, 
  skew: -0.0387564987471391, 
  cx: 400,
  cy: 300,
  width: 800,
  height: 600,
  near: 2,
  far: 6
};

var scene = new THREE.Scene();


var renderer = new THREE.WebGLRenderer();
renderer.setSize(calib.width, calib.height);
renderer.setDepthTest(true);
renderer.setDepthWrite(true);

renderer.setClearColor(0x000000, 1);

/** @type {!THREE.PerspectiveCamera} */
console.log(getFov(calib));
var camera = new THREE.PerspectiveCamera(getFov(calib), 
    calib.width / calib.height, 0.05, 100);
camera.position.z = 0.5 ;
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
  depth: { type: 't', value: texture },
  backProjection: { type: 'm4', value: getBackProjectionMatrix(calib) },
  nearPlane: {type: 'f', value: calib.near },
  farPlane: {type: 'f', value: calib.far }
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
planeMesh.frustumCulled = false;
planeMesh.rotation.z = Math.PI;
scene.add(planeMesh);

var canvas = document.createElement('canvas');
vid.addEventListener('loadedmetadata', function() {
  canvas.width = vid.videoWidth;
  canvas.height = vid.videoHeight;
  uniforms['depth'].value = new THREE.Texture(canvas);

  var x = 0;
  setInterval(function() {
    var ctx = canvas.getContext('2d');
    ctx.drawImage(vid, 0, 0);

    uniforms['depth'].value.needsUpdate = true;

    x += 0.1;

    var offset = Math.sin(x) * calib.far / 2;
    console.log(offset);
    camera.position.x = offset;
    camera.rotation.y = Math.atan2(offset, calib.far);
    console.log(camera.rotation.y);
    renderer.render(scene, camera);
  }, 100);
});
