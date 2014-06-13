goog.provide('DepthMeshDemo');

goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.style');


/**
 * Load the shader at the given url (synchronously) and return the
 * resuting code.
 *
 * @param {string} url
 * @return {string}
 */
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


/**
 * Get the FOV for the given calibration parameters.
 * @param {!Calibration} calib
 * @return {number}
 */
function getFov(calib) {
  var f = (calib.fx + calib.fy) / 2.0;
  return 180.0 * Math.atan2(calib.height / 2.0, f) * 2.0 / Math.PI;
}


/**
 * Get the back-projection matrix used by the shaders.
 * @return {!THREE.Matrix4}
 */
function getBackProjectionMatrix(c) {
  // ignoring skew.  The depth map transformation will have to be done
  // before (e.g., as w = 1/d).
  // x = width * x / fx - calib.cx / fx
  // y = height * y / fx - calib.cy / fy
  return new THREE.Matrix4(
      c.width / c.fx, 0, -c.cx / c.fx, 0,
      0, c.height / c.fy, -c.cy / c.fy, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
  );
}



/**
 * Helper class for the demo program. 
 *
 * @param {!Element} container
 * @param {!HTMLVideoElement} videoEl
 * @param {!Calibration} calib
 * @constructor
 */
DepthMeshDemo = function(container, videoEl, calib) {
  /** @private {!THREE.Scene} */
  this.scene_ = new THREE.Scene();

  /** @private {!HTMLVideoElement} */
  this.videoEl_ = videoEl;

  /** @private {Calibration} */
  this.calib_ = calib;

  /** @private {!THREE.WebGLRenderer} */
  this.renderer_ = new THREE.WebGLRenderer();
  this.renderer_.setSize(calib.width, calib.height);
  this.renderer_.setDepthTest(true);
  this.renderer_.setDepthWrite(true);
  this.renderer_.setClearColor(0x000000, 1);

  /** 
   * The camera has been setup so that the parameters are close to those used
   * for the depth map.
   * @private {!THREE.PerspectiveCamera} 
   */
  this.camera_ = new THREE.PerspectiveCamera(getFov(calib), 
      calib.width / calib.height, 0.05, 100);
  container.appendChild(this.renderer_.domElement);

  this.texture_ = THREE.ImageUtils.loadTexture("textures/depth.png");
  this.texture_.wrapS = THREE.RepeatWrapping;
  this.texture_.wrapT = THREE.RepeatWrapping;

  this.uniforms_ = {
    depth: {
      type: 't', value: this.texture_
    },
    backProjection: {
      type: 'm4', value: getBackProjectionMatrix(calib)
    },
    nearPlane: {
      type: 'f', value: calib.near
    },
    farPlane: {
      type: 'f', value: calib.far
    },
    showDepthMap: {
      type: 'i', value: 0
    }, 
    shaded: {
      type: 'i', value: 0
    },
    showBackground: {
      type: 'i', value: 1
    },
    alphaThresh: {
      type: 'f', value: 0.05
    }
  };

  /** @private {THREE.Mesh} */
  this.planeMesh_ = null;
  this.createPlane(DepthMeshDemo.DEFAULT_NUM_VERTICES);

  /** @private {HTMLCanvas} */
  this.canvas_ = document.createElement('canvas');

  this.videoEl_.addEventListener('loadedmetadata', 
      goog.bind(this.onLoadedMetadata_, this));

  // Listen to mouse events on the canvas.
  goog.events.listen(this.renderer_.domElement,
      goog.events.EventType.MOUSEMOVE, goog.bind(this.onMouseMove_, this));
  goog.events.listen(this.renderer_.domElement,
      goog.events.EventType.MOUSEUP, goog.bind(this.onMouseUp_, this));
  goog.events.listen(this.renderer_.domElement,
      goog.events.EventType.MOUSEDOWN, goog.bind(this.onMouseDown_, this));
};


/** @const {string} */
DepthMeshDemo.VERT_SHADER = 'shaders/vert.vsh';


/** @const {string} */
DepthMeshDemo.FRAG_SHADER = 'shaders/frag.fsh';


/** @const {number} */
DepthMeshDemo.ALPHA_TEST = 0.4;


/** @const {number} */
DepthMeshDemo.DEFAULT_NUM_VERTICES = 100;


/**
 * @param {numVertices}
 */
DepthMeshDemo.prototype.createPlane = function(numVertices) {
  var wireframe = false;
  if (this.planeMesh_) {
    wireframe = this.planeMat.wireframe;
    this.scene_.remove(this.planeMesh_);
  }
  var plane = new THREE.PlaneGeometry(1, 1, numVertices, numVertices);
  this.planeMat = new THREE.ShaderMaterial({
    vertexShader: loadShader(DepthMeshDemo.VERT_SHADER),
    fragmentShader: loadShader(DepthMeshDemo.FRAG_SHADER),
    uniforms: this.uniforms_,
    wireframe: wireframe
  });
  this.planeMat.alphaTest = DepthMeshDemo.ALPHA_TEST;
  this.planeMat.transparent = true;

  /** @private {!THREE.Mesh} */
  this.planeMesh_ = new THREE.Mesh(plane, this.planeMat);
  this.planeMesh_.frustumCulled = false;
  this.planeMesh_.rotation.z = Math.PI;
  this.scene_.add(this.planeMesh_);
};


/**
 * Enable/disable wireframe.
 *
 * @param {boolean} wireframe
 */
DepthMeshDemo.prototype.setWireframe = function(wireframe) {
  this.planeMat.wireframe = wireframe;
  this.planeMat.needsUpdate = true;
};


/**
 * Set show of the depthMap.
 *
 * @param {boolean} depthMap
 */
DepthMeshDemo.prototype.setShowDepthMap = function(depthMap) {
  this.uniforms_['showDepthMap'].value = depthMap;
};


/**
 * Set whether depth map is shaded.
 *
 * @param {boolean} shaded
 */
DepthMeshDemo.prototype.setShaded = function(shaded) {
  this.uniforms_['shaded'].value = shaded;
};


/**
 * Set alpha threshold.
 *
 * @param {number} alphaThresh
 */
DepthMeshDemo.prototype.setAlphaThresh = function(alphaThresh) {
  this.uniforms_['alphaThresh'].value = alphaThresh;
};


/**
 * Set show the background (things close to depth 1).
 *
 * @param {boolean} showBackground
 */
DepthMeshDemo.prototype.setShowBackground = function(showBackground) {
  this.uniforms_['showBackground'].value = showBackground;
};


/**
 * Show the pop effect.
 */
DepthMeshDemo.prototype.pop = function() {
  this.popping_ = true;
};


/**
 * Set the rotation angle.
 */
DepthMeshDemo.prototype.setRotation = function(value) {
  var offset = value * this.calib_.far / 2;
  this.camera_.position.x = offset;
  this.camera_.rotation.y = Math.atan2(offset, this.calib_.far);
  this.renderer_.render(this.scene_, this.camera_);
};


/**
 * Callback for handling when video meta data is loaded.
 * @private
 */
DepthMeshDemo.prototype.onLoadedMetadata_ = function() {
  // Update the canvas dimensions relative to the video. 
  this.canvas_.width = this.videoEl_.videoWidth;
  this.canvas_.height = this.videoEl_.videoHeight;
  this.uniforms_['depth'].value = new THREE.Texture(this.canvas_);

  var ctx = this.canvas_.getContext('2d');
  var x = 0;
  setInterval(goog.bind(function() {
    ctx.drawImage(vid, 0, 0);

    // Tell the texture to update when ready.
    this.uniforms_['depth'].value.needsUpdate = true;

    if (this.popping_) {
      x += 0.2;
      if (x > 2.0 * Math.PI) {
        x = 0;
        this.popping_ = false;
      }
      this.setRotation(Math.sin(x));
    }
    this.renderer_.render(this.scene_, this.camera_);
  }, this), 60);
};


/**
 * Callback for mouse move.
 *
 * @param {Event} event
 * @private
 */
DepthMeshDemo.prototype.onMouseMove_ = function(event) {
  if (this.mouseDown_) {
    var mouse = this.getMouseCoordinate_(event);
    this.setRotation(-(mouse[0] / 800 - 0.5) * 5.0);
    this.mouseDown_ = mouse;
  }
};


/**
 * Callback for mouse up.
 *
 * @param {Event} event
 * @private
 */
DepthMeshDemo.prototype.onMouseUp_ = function(event) {
  this.mouseDown_ = undefined;
};


/**
 * Callback for mouse down.
 *
 * @param {Event} event
 * @private
 */
DepthMeshDemo.prototype.onMouseDown_ = function(event) {
  this.mouseDown_ = this.getMouseCoordinate_(event);
};


/**
 * Get the mouse coordinate relative to canvas element.
 *
 * @param {Event} event
 * @return {!goog.math.Coordinate}
 * @private
 */
DepthMeshDemo.prototype.getMouseCoordinate_ = function(event) {
  var pageOffset = goog.style.getPageOffset(this.renderer_.domElement);
  return [event.clientX - pageOffset.x, event.clientY - pageOffset.y];
};
