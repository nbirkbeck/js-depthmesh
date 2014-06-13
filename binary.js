/**
 * @fileoverview Exports for the main application binary.
 */
goog.provide('DepthMeshDemo.bin');

goog.require('DepthMeshDemo');

goog.exportSymbol('DepthMeshDemo', DepthMeshDemo);

goog.exportProperty(DepthMeshDemo.prototype, 'loadModel', 
  DepthMeshDemo.prototype.loadModel);
goog.exportProperty(DepthMeshDemo.prototype, 'pop', 
  DepthMeshDemo.prototype.pop);
goog.exportProperty(DepthMeshDemo.prototype, 'setRotation', 
  DepthMeshDemo.prototype.setRotation);
goog.exportProperty(DepthMeshDemo.prototype, 'setShaded', 
  DepthMeshDemo.prototype.setShaded);
goog.exportProperty(DepthMeshDemo.prototype, 'setWireframe', 
  DepthMeshDemo.prototype.setWireframe);
goog.exportProperty(DepthMeshDemo.prototype, 'setAlphaThresh', 
  DepthMeshDemo.prototype.setAlphaThresh);
goog.exportProperty(DepthMeshDemo.prototype, 'setShowBackground', 
  DepthMeshDemo.prototype.setShowBackground);
