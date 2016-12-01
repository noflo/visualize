/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var exported = {
	  noflo: __webpack_require__(1),
	  fbp: __webpack_require__(8)
	};

	if (window) {
	  window.require = function (moduleName) {
	    if (exported[moduleName]) {
	      return exported[moduleName];
	    }
	    throw new Error('Module ' + moduleName + ' not available');
	  };
	}




/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var ports;

	  exports.graph = __webpack_require__(2);

	  exports.Graph = exports.graph.Graph;

	  exports.journal = __webpack_require__(10);

	  exports.Journal = exports.journal.Journal;

	  exports.Network = __webpack_require__(11).Network;

	  exports.isBrowser = __webpack_require__(5).isBrowser;

	  exports.ComponentLoader = __webpack_require__(15).ComponentLoader;

	  exports.Component = __webpack_require__(18).Component;

	  exports.AsyncComponent = __webpack_require__(23).AsyncComponent;

	  exports.helpers = __webpack_require__(25);

	  exports.streams = __webpack_require__(26);

	  ports = __webpack_require__(19);

	  exports.InPorts = ports.InPorts;

	  exports.OutPorts = ports.OutPorts;

	  exports.InPort = __webpack_require__(20);

	  exports.OutPort = __webpack_require__(22);

	  exports.Port = __webpack_require__(24).Port;

	  exports.ArrayPort = __webpack_require__(27).ArrayPort;

	  exports.internalSocket = __webpack_require__(13);

	  exports.IP = __webpack_require__(14);

	  exports.createNetwork = function(graph, callback, options) {
	    var network, networkReady;
	    if (typeof options !== 'object') {
	      options = {
	        delay: options
	      };
	    }
	    if (typeof callback !== 'function') {
	      callback = function(err) {
	        if (err) {
	          throw err;
	        }
	      };
	    }
	    network = new exports.Network(graph, options);
	    networkReady = function(network) {
	      return network.start(function(err) {
	        if (err) {
	          return callback(err);
	        }
	        return callback(null, network);
	      });
	    };
	    network.loader.listComponents(function(err) {
	      if (err) {
	        return callback(err);
	      }
	      if (graph.nodes.length === 0) {
	        return networkReady(network);
	      }
	      if (options.delay) {
	        callback(null, network);
	        return;
	      }
	      return network.connect(function(err) {
	        if (err) {
	          return callback(err);
	        }
	        return networkReady(network);
	      });
	    });
	    return network;
	  };

	  exports.loadFile = function(file, options, callback) {
	    var baseDir;
	    if (!callback) {
	      callback = options;
	      baseDir = null;
	    }
	    if (callback && typeof options !== 'object') {
	      options = {
	        baseDir: options
	      };
	    }
	    return exports.graph.loadFile(file, function(err, net) {
	      if (err) {
	        return callback(err);
	      }
	      if (options.baseDir) {
	        net.baseDir = options.baseDir;
	      }
	      return exports.createNetwork(net, callback, options);
	    });
	  };

	  exports.saveFile = function(graph, file, callback) {
	    return exports.graph.save(file, function() {
	      return callback(file);
	    });
	  };

	}).call(this);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var EventEmitter, Graph, clone, mergeResolveTheirsNaive, platform, resetGraph,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  clone = __webpack_require__(4).clone;

	  platform = __webpack_require__(5);

	  Graph = (function(_super) {
	    __extends(Graph, _super);

	    Graph.prototype.name = '';

	    Graph.prototype.caseSensitive = false;

	    Graph.prototype.properties = {};

	    Graph.prototype.nodes = [];

	    Graph.prototype.edges = [];

	    Graph.prototype.initializers = [];

	    Graph.prototype.exports = [];

	    Graph.prototype.inports = {};

	    Graph.prototype.outports = {};

	    Graph.prototype.groups = [];

	    function Graph(name, options) {
	      this.name = name != null ? name : '';
	      if (options == null) {
	        options = {};
	      }
	      this.properties = {};
	      this.nodes = [];
	      this.edges = [];
	      this.initializers = [];
	      this.exports = [];
	      this.inports = {};
	      this.outports = {};
	      this.groups = [];
	      this.transaction = {
	        id: null,
	        depth: 0
	      };
	      this.caseSensitive = options.caseSensitive || false;
	    }

	    Graph.prototype.getPortName = function(port) {
	      if (this.caseSensitive) {
	        return port;
	      } else {
	        return port.toLowerCase();
	      }
	    };

	    Graph.prototype.startTransaction = function(id, metadata) {
	      if (this.transaction.id) {
	        throw Error("Nested transactions not supported");
	      }
	      this.transaction.id = id;
	      this.transaction.depth = 1;
	      return this.emit('startTransaction', id, metadata);
	    };

	    Graph.prototype.endTransaction = function(id, metadata) {
	      if (!this.transaction.id) {
	        throw Error("Attempted to end non-existing transaction");
	      }
	      this.transaction.id = null;
	      this.transaction.depth = 0;
	      return this.emit('endTransaction', id, metadata);
	    };

	    Graph.prototype.checkTransactionStart = function() {
	      if (!this.transaction.id) {
	        return this.startTransaction('implicit');
	      } else if (this.transaction.id === 'implicit') {
	        return this.transaction.depth += 1;
	      }
	    };

	    Graph.prototype.checkTransactionEnd = function() {
	      if (this.transaction.id === 'implicit') {
	        this.transaction.depth -= 1;
	      }
	      if (this.transaction.depth === 0) {
	        return this.endTransaction('implicit');
	      }
	    };

	    Graph.prototype.setProperties = function(properties) {
	      var before, item, val;
	      this.checkTransactionStart();
	      before = clone(this.properties);
	      for (item in properties) {
	        val = properties[item];
	        this.properties[item] = val;
	      }
	      this.emit('changeProperties', this.properties, before);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addExport = function(publicPort, nodeKey, portKey, metadata) {
	      var exported;
	      if (metadata == null) {
	        metadata = {
	          x: 0,
	          y: 0
	        };
	      }
	      if (!this.getNode(nodeKey)) {
	        return;
	      }
	      this.checkTransactionStart();
	      exported = {
	        "public": this.getPortName(publicPort),
	        process: nodeKey,
	        port: this.getPortName(portKey),
	        metadata: metadata
	      };
	      this.exports.push(exported);
	      this.emit('addExport', exported);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeExport = function(publicPort) {
	      var exported, found, idx, _i, _len, _ref;
	      publicPort = this.getPortName(publicPort);
	      found = null;
	      _ref = this.exports;
	      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
	        exported = _ref[idx];
	        if (exported["public"] === publicPort) {
	          found = exported;
	        }
	      }
	      if (!found) {
	        return;
	      }
	      this.checkTransactionStart();
	      this.exports.splice(this.exports.indexOf(found), 1);
	      this.emit('removeExport', found);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addInport = function(publicPort, nodeKey, portKey, metadata) {
	      if (!this.getNode(nodeKey)) {
	        return;
	      }
	      publicPort = this.getPortName(publicPort);
	      this.checkTransactionStart();
	      this.inports[publicPort] = {
	        process: nodeKey,
	        port: this.getPortName(portKey),
	        metadata: metadata
	      };
	      this.emit('addInport', publicPort, this.inports[publicPort]);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeInport = function(publicPort) {
	      var port;
	      publicPort = this.getPortName(publicPort);
	      if (!this.inports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      port = this.inports[publicPort];
	      this.setInportMetadata(publicPort, {});
	      delete this.inports[publicPort];
	      this.emit('removeInport', publicPort, port);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.renameInport = function(oldPort, newPort) {
	      oldPort = this.getPortName(oldPort);
	      newPort = this.getPortName(newPort);
	      if (!this.inports[oldPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      this.inports[newPort] = this.inports[oldPort];
	      delete this.inports[oldPort];
	      this.emit('renameInport', oldPort, newPort);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setInportMetadata = function(publicPort, metadata) {
	      var before, item, val;
	      publicPort = this.getPortName(publicPort);
	      if (!this.inports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(this.inports[publicPort].metadata);
	      if (!this.inports[publicPort].metadata) {
	        this.inports[publicPort].metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          this.inports[publicPort].metadata[item] = val;
	        } else {
	          delete this.inports[publicPort].metadata[item];
	        }
	      }
	      this.emit('changeInport', publicPort, this.inports[publicPort], before);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addOutport = function(publicPort, nodeKey, portKey, metadata) {
	      if (!this.getNode(nodeKey)) {
	        return;
	      }
	      publicPort = this.getPortName(publicPort);
	      this.checkTransactionStart();
	      this.outports[publicPort] = {
	        process: nodeKey,
	        port: this.getPortName(portKey),
	        metadata: metadata
	      };
	      this.emit('addOutport', publicPort, this.outports[publicPort]);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeOutport = function(publicPort) {
	      var port;
	      publicPort = this.getPortName(publicPort);
	      if (!this.outports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      port = this.outports[publicPort];
	      this.setOutportMetadata(publicPort, {});
	      delete this.outports[publicPort];
	      this.emit('removeOutport', publicPort, port);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.renameOutport = function(oldPort, newPort) {
	      oldPort = this.getPortName(oldPort);
	      newPort = this.getPortName(newPort);
	      if (!this.outports[oldPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      this.outports[newPort] = this.outports[oldPort];
	      delete this.outports[oldPort];
	      this.emit('renameOutport', oldPort, newPort);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setOutportMetadata = function(publicPort, metadata) {
	      var before, item, val;
	      publicPort = this.getPortName(publicPort);
	      if (!this.outports[publicPort]) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(this.outports[publicPort].metadata);
	      if (!this.outports[publicPort].metadata) {
	        this.outports[publicPort].metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          this.outports[publicPort].metadata[item] = val;
	        } else {
	          delete this.outports[publicPort].metadata[item];
	        }
	      }
	      this.emit('changeOutport', publicPort, this.outports[publicPort], before);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addGroup = function(group, nodes, metadata) {
	      var g;
	      this.checkTransactionStart();
	      g = {
	        name: group,
	        nodes: nodes,
	        metadata: metadata
	      };
	      this.groups.push(g);
	      this.emit('addGroup', g);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.renameGroup = function(oldName, newName) {
	      var group, _i, _len, _ref;
	      this.checkTransactionStart();
	      _ref = this.groups;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        group = _ref[_i];
	        if (!group) {
	          continue;
	        }
	        if (group.name !== oldName) {
	          continue;
	        }
	        group.name = newName;
	        this.emit('renameGroup', oldName, newName);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeGroup = function(groupName) {
	      var group, _i, _len, _ref;
	      this.checkTransactionStart();
	      _ref = this.groups;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        group = _ref[_i];
	        if (!group) {
	          continue;
	        }
	        if (group.name !== groupName) {
	          continue;
	        }
	        this.setGroupMetadata(group.name, {});
	        this.groups.splice(this.groups.indexOf(group), 1);
	        this.emit('removeGroup', group);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setGroupMetadata = function(groupName, metadata) {
	      var before, group, item, val, _i, _len, _ref;
	      this.checkTransactionStart();
	      _ref = this.groups;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        group = _ref[_i];
	        if (!group) {
	          continue;
	        }
	        if (group.name !== groupName) {
	          continue;
	        }
	        before = clone(group.metadata);
	        for (item in metadata) {
	          val = metadata[item];
	          if (val != null) {
	            group.metadata[item] = val;
	          } else {
	            delete group.metadata[item];
	          }
	        }
	        this.emit('changeGroup', group, before);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addNode = function(id, component, metadata) {
	      var node;
	      this.checkTransactionStart();
	      if (!metadata) {
	        metadata = {};
	      }
	      node = {
	        id: id,
	        component: component,
	        metadata: metadata
	      };
	      this.nodes.push(node);
	      this.emit('addNode', node);
	      this.checkTransactionEnd();
	      return node;
	    };

	    Graph.prototype.removeNode = function(id) {
	      var edge, exported, group, index, initializer, node, priv, pub, toRemove, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _o, _p, _q, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
	      node = this.getNode(id);
	      if (!node) {
	        return;
	      }
	      this.checkTransactionStart();
	      toRemove = [];
	      _ref = this.edges;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        edge = _ref[_i];
	        if ((edge.from.node === node.id) || (edge.to.node === node.id)) {
	          toRemove.push(edge);
	        }
	      }
	      for (_j = 0, _len1 = toRemove.length; _j < _len1; _j++) {
	        edge = toRemove[_j];
	        this.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
	      }
	      toRemove = [];
	      _ref1 = this.initializers;
	      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
	        initializer = _ref1[_k];
	        if (initializer.to.node === node.id) {
	          toRemove.push(initializer);
	        }
	      }
	      for (_l = 0, _len3 = toRemove.length; _l < _len3; _l++) {
	        initializer = toRemove[_l];
	        this.removeInitial(initializer.to.node, initializer.to.port);
	      }
	      toRemove = [];
	      _ref2 = this.exports;
	      for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
	        exported = _ref2[_m];
	        if (this.getPortName(id) === exported.process) {
	          toRemove.push(exported);
	        }
	      }
	      for (_n = 0, _len5 = toRemove.length; _n < _len5; _n++) {
	        exported = toRemove[_n];
	        this.removeExport(exported["public"]);
	      }
	      toRemove = [];
	      _ref3 = this.inports;
	      for (pub in _ref3) {
	        priv = _ref3[pub];
	        if (priv.process === id) {
	          toRemove.push(pub);
	        }
	      }
	      for (_o = 0, _len6 = toRemove.length; _o < _len6; _o++) {
	        pub = toRemove[_o];
	        this.removeInport(pub);
	      }
	      toRemove = [];
	      _ref4 = this.outports;
	      for (pub in _ref4) {
	        priv = _ref4[pub];
	        if (priv.process === id) {
	          toRemove.push(pub);
	        }
	      }
	      for (_p = 0, _len7 = toRemove.length; _p < _len7; _p++) {
	        pub = toRemove[_p];
	        this.removeOutport(pub);
	      }
	      _ref5 = this.groups;
	      for (_q = 0, _len8 = _ref5.length; _q < _len8; _q++) {
	        group = _ref5[_q];
	        if (!group) {
	          continue;
	        }
	        index = group.nodes.indexOf(id);
	        if (index === -1) {
	          continue;
	        }
	        group.nodes.splice(index, 1);
	      }
	      this.setNodeMetadata(id, {});
	      if (-1 !== this.nodes.indexOf(node)) {
	        this.nodes.splice(this.nodes.indexOf(node), 1);
	      }
	      this.emit('removeNode', node);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.getNode = function(id) {
	      var node, _i, _len, _ref;
	      _ref = this.nodes;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        node = _ref[_i];
	        if (!node) {
	          continue;
	        }
	        if (node.id === id) {
	          return node;
	        }
	      }
	      return null;
	    };

	    Graph.prototype.renameNode = function(oldId, newId) {
	      var edge, exported, group, iip, index, node, priv, pub, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
	      this.checkTransactionStart();
	      node = this.getNode(oldId);
	      if (!node) {
	        return;
	      }
	      node.id = newId;
	      _ref = this.edges;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        edge = _ref[_i];
	        if (!edge) {
	          continue;
	        }
	        if (edge.from.node === oldId) {
	          edge.from.node = newId;
	        }
	        if (edge.to.node === oldId) {
	          edge.to.node = newId;
	        }
	      }
	      _ref1 = this.initializers;
	      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	        iip = _ref1[_j];
	        if (!iip) {
	          continue;
	        }
	        if (iip.to.node === oldId) {
	          iip.to.node = newId;
	        }
	      }
	      _ref2 = this.inports;
	      for (pub in _ref2) {
	        priv = _ref2[pub];
	        if (priv.process === oldId) {
	          priv.process = newId;
	        }
	      }
	      _ref3 = this.outports;
	      for (pub in _ref3) {
	        priv = _ref3[pub];
	        if (priv.process === oldId) {
	          priv.process = newId;
	        }
	      }
	      _ref4 = this.exports;
	      for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
	        exported = _ref4[_k];
	        if (exported.process === oldId) {
	          exported.process = newId;
	        }
	      }
	      _ref5 = this.groups;
	      for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
	        group = _ref5[_l];
	        if (!group) {
	          continue;
	        }
	        index = group.nodes.indexOf(oldId);
	        if (index === -1) {
	          continue;
	        }
	        group.nodes[index] = newId;
	      }
	      this.emit('renameNode', oldId, newId);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.setNodeMetadata = function(id, metadata) {
	      var before, item, node, val;
	      node = this.getNode(id);
	      if (!node) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(node.metadata);
	      if (!node.metadata) {
	        node.metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          node.metadata[item] = val;
	        } else {
	          delete node.metadata[item];
	        }
	      }
	      this.emit('changeNode', node, before);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addEdge = function(outNode, outPort, inNode, inPort, metadata) {
	      var edge, _i, _len, _ref;
	      if (metadata == null) {
	        metadata = {};
	      }
	      outPort = this.getPortName(outPort);
	      inPort = this.getPortName(inPort);
	      _ref = this.edges;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        edge = _ref[_i];
	        if (edge.from.node === outNode && edge.from.port === outPort && edge.to.node === inNode && edge.to.port === inPort) {
	          return;
	        }
	      }
	      if (!this.getNode(outNode)) {
	        return;
	      }
	      if (!this.getNode(inNode)) {
	        return;
	      }
	      this.checkTransactionStart();
	      edge = {
	        from: {
	          node: outNode,
	          port: outPort
	        },
	        to: {
	          node: inNode,
	          port: inPort
	        },
	        metadata: metadata
	      };
	      this.edges.push(edge);
	      this.emit('addEdge', edge);
	      this.checkTransactionEnd();
	      return edge;
	    };

	    Graph.prototype.addEdgeIndex = function(outNode, outPort, outIndex, inNode, inPort, inIndex, metadata) {
	      var edge;
	      if (metadata == null) {
	        metadata = {};
	      }
	      if (!this.getNode(outNode)) {
	        return;
	      }
	      if (!this.getNode(inNode)) {
	        return;
	      }
	      outPort = this.getPortName(outPort);
	      inPort = this.getPortName(inPort);
	      if (inIndex === null) {
	        inIndex = void 0;
	      }
	      if (outIndex === null) {
	        outIndex = void 0;
	      }
	      if (!metadata) {
	        metadata = {};
	      }
	      this.checkTransactionStart();
	      edge = {
	        from: {
	          node: outNode,
	          port: outPort,
	          index: outIndex
	        },
	        to: {
	          node: inNode,
	          port: inPort,
	          index: inIndex
	        },
	        metadata: metadata
	      };
	      this.edges.push(edge);
	      this.emit('addEdge', edge);
	      this.checkTransactionEnd();
	      return edge;
	    };

	    Graph.prototype.removeEdge = function(node, port, node2, port2) {
	      var edge, index, toKeep, toRemove, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
	      this.checkTransactionStart();
	      port = this.getPortName(port);
	      port2 = this.getPortName(port2);
	      toRemove = [];
	      toKeep = [];
	      if (node2 && port2) {
	        _ref = this.edges;
	        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
	          edge = _ref[index];
	          if (edge.from.node === node && edge.from.port === port && edge.to.node === node2 && edge.to.port === port2) {
	            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
	            toRemove.push(edge);
	          } else {
	            toKeep.push(edge);
	          }
	        }
	      } else {
	        _ref1 = this.edges;
	        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
	          edge = _ref1[index];
	          if ((edge.from.node === node && edge.from.port === port) || (edge.to.node === node && edge.to.port === port)) {
	            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
	            toRemove.push(edge);
	          } else {
	            toKeep.push(edge);
	          }
	        }
	      }
	      this.edges = toKeep;
	      for (_k = 0, _len2 = toRemove.length; _k < _len2; _k++) {
	        edge = toRemove[_k];
	        this.emit('removeEdge', edge);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.getEdge = function(node, port, node2, port2) {
	      var edge, index, _i, _len, _ref;
	      port = this.getPortName(port);
	      port2 = this.getPortName(port2);
	      _ref = this.edges;
	      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
	        edge = _ref[index];
	        if (!edge) {
	          continue;
	        }
	        if (edge.from.node === node && edge.from.port === port) {
	          if (edge.to.node === node2 && edge.to.port === port2) {
	            return edge;
	          }
	        }
	      }
	      return null;
	    };

	    Graph.prototype.setEdgeMetadata = function(node, port, node2, port2, metadata) {
	      var before, edge, item, val;
	      edge = this.getEdge(node, port, node2, port2);
	      if (!edge) {
	        return;
	      }
	      this.checkTransactionStart();
	      before = clone(edge.metadata);
	      if (!edge.metadata) {
	        edge.metadata = {};
	      }
	      for (item in metadata) {
	        val = metadata[item];
	        if (val != null) {
	          edge.metadata[item] = val;
	        } else {
	          delete edge.metadata[item];
	        }
	      }
	      this.emit('changeEdge', edge, before);
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.addInitial = function(data, node, port, metadata) {
	      var initializer;
	      if (!this.getNode(node)) {
	        return;
	      }
	      port = this.getPortName(port);
	      this.checkTransactionStart();
	      initializer = {
	        from: {
	          data: data
	        },
	        to: {
	          node: node,
	          port: port
	        },
	        metadata: metadata
	      };
	      this.initializers.push(initializer);
	      this.emit('addInitial', initializer);
	      this.checkTransactionEnd();
	      return initializer;
	    };

	    Graph.prototype.addInitialIndex = function(data, node, port, index, metadata) {
	      var initializer;
	      if (!this.getNode(node)) {
	        return;
	      }
	      if (index === null) {
	        index = void 0;
	      }
	      port = this.getPortName(port);
	      this.checkTransactionStart();
	      initializer = {
	        from: {
	          data: data
	        },
	        to: {
	          node: node,
	          port: port,
	          index: index
	        },
	        metadata: metadata
	      };
	      this.initializers.push(initializer);
	      this.emit('addInitial', initializer);
	      this.checkTransactionEnd();
	      return initializer;
	    };

	    Graph.prototype.addGraphInitial = function(data, node, metadata) {
	      var inport;
	      inport = this.inports[node];
	      if (!inport) {
	        return;
	      }
	      return this.addInitial(data, inport.process, inport.port, metadata);
	    };

	    Graph.prototype.addGraphInitialIndex = function(data, node, index, metadata) {
	      var inport;
	      inport = this.inports[node];
	      if (!inport) {
	        return;
	      }
	      return this.addInitialIndex(data, inport.process, inport.port, index, metadata);
	    };

	    Graph.prototype.removeInitial = function(node, port) {
	      var edge, index, toKeep, toRemove, _i, _j, _len, _len1, _ref;
	      port = this.getPortName(port);
	      this.checkTransactionStart();
	      toRemove = [];
	      toKeep = [];
	      _ref = this.initializers;
	      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
	        edge = _ref[index];
	        if (edge.to.node === node && edge.to.port === port) {
	          toRemove.push(edge);
	        } else {
	          toKeep.push(edge);
	        }
	      }
	      this.initializers = toKeep;
	      for (_j = 0, _len1 = toRemove.length; _j < _len1; _j++) {
	        edge = toRemove[_j];
	        this.emit('removeInitial', edge);
	      }
	      return this.checkTransactionEnd();
	    };

	    Graph.prototype.removeGraphInitial = function(node) {
	      var inport;
	      inport = this.inports[node];
	      if (!inport) {
	        return;
	      }
	      return this.removeInitial(inport.process, inport.port);
	    };

	    Graph.prototype.toDOT = function() {
	      var cleanID, cleanPort, data, dot, edge, id, initializer, node, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
	      cleanID = function(id) {
	        return id.replace(/\s*/g, "");
	      };
	      cleanPort = function(port) {
	        return port.replace(/\./g, "");
	      };
	      dot = "digraph {\n";
	      _ref = this.nodes;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        node = _ref[_i];
	        dot += "    " + (cleanID(node.id)) + " [label=" + node.id + " shape=box]\n";
	      }
	      _ref1 = this.initializers;
	      for (id = _j = 0, _len1 = _ref1.length; _j < _len1; id = ++_j) {
	        initializer = _ref1[id];
	        if (typeof initializer.from.data === 'function') {
	          data = 'Function';
	        } else {
	          data = initializer.from.data;
	        }
	        dot += "    data" + id + " [label=\"'" + data + "'\" shape=plaintext]\n";
	        dot += "    data" + id + " -> " + (cleanID(initializer.to.node)) + "[headlabel=" + (cleanPort(initializer.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
	      }
	      _ref2 = this.edges;
	      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	        edge = _ref2[_k];
	        dot += "    " + (cleanID(edge.from.node)) + " -> " + (cleanID(edge.to.node)) + "[taillabel=" + (cleanPort(edge.from.port)) + " headlabel=" + (cleanPort(edge.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
	      }
	      dot += "}";
	      return dot;
	    };

	    Graph.prototype.toYUML = function() {
	      var edge, initializer, yuml, _i, _j, _len, _len1, _ref, _ref1;
	      yuml = [];
	      _ref = this.initializers;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        initializer = _ref[_i];
	        yuml.push("(start)[" + initializer.to.port + "]->(" + initializer.to.node + ")");
	      }
	      _ref1 = this.edges;
	      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	        edge = _ref1[_j];
	        yuml.push("(" + edge.from.node + ")[" + edge.from.port + "]->(" + edge.to.node + ")");
	      }
	      return yuml.join(",");
	    };

	    Graph.prototype.toJSON = function() {
	      var connection, edge, exported, group, groupData, initializer, json, node, priv, property, pub, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
	      json = {
	        caseSensitive: this.caseSensitive,
	        properties: {},
	        inports: {},
	        outports: {},
	        groups: [],
	        processes: {},
	        connections: []
	      };
	      if (this.name) {
	        json.properties.name = this.name;
	      }
	      _ref = this.properties;
	      for (property in _ref) {
	        value = _ref[property];
	        json.properties[property] = value;
	      }
	      _ref1 = this.inports;
	      for (pub in _ref1) {
	        priv = _ref1[pub];
	        json.inports[pub] = priv;
	      }
	      _ref2 = this.outports;
	      for (pub in _ref2) {
	        priv = _ref2[pub];
	        json.outports[pub] = priv;
	      }
	      _ref3 = this.exports;
	      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
	        exported = _ref3[_i];
	        if (!json.exports) {
	          json.exports = [];
	        }
	        json.exports.push(exported);
	      }
	      _ref4 = this.groups;
	      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
	        group = _ref4[_j];
	        groupData = {
	          name: group.name,
	          nodes: group.nodes
	        };
	        if (Object.keys(group.metadata).length) {
	          groupData.metadata = group.metadata;
	        }
	        json.groups.push(groupData);
	      }
	      _ref5 = this.nodes;
	      for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
	        node = _ref5[_k];
	        json.processes[node.id] = {
	          component: node.component
	        };
	        if (node.metadata) {
	          json.processes[node.id].metadata = node.metadata;
	        }
	      }
	      _ref6 = this.edges;
	      for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
	        edge = _ref6[_l];
	        connection = {
	          src: {
	            process: edge.from.node,
	            port: edge.from.port,
	            index: edge.from.index
	          },
	          tgt: {
	            process: edge.to.node,
	            port: edge.to.port,
	            index: edge.to.index
	          }
	        };
	        if (Object.keys(edge.metadata).length) {
	          connection.metadata = edge.metadata;
	        }
	        json.connections.push(connection);
	      }
	      _ref7 = this.initializers;
	      for (_m = 0, _len4 = _ref7.length; _m < _len4; _m++) {
	        initializer = _ref7[_m];
	        json.connections.push({
	          data: initializer.from.data,
	          tgt: {
	            process: initializer.to.node,
	            port: initializer.to.port,
	            index: initializer.to.index
	          }
	        });
	      }
	      return json;
	    };

	    Graph.prototype.save = function(file, callback) {
	      var json;
	      if (platform.isBrowser()) {
	        return callback(new Error("Saving graphs not supported on browser"));
	      }
	      json = JSON.stringify(this.toJSON(), null, 4);
	      return __webpack_require__(7).writeFile("" + file + ".json", json, "utf-8", function(err, data) {
	        if (err) {
	          throw err;
	        }
	        return callback(file);
	      });
	    };

	    return Graph;

	  })(EventEmitter);

	  exports.Graph = Graph;

	  exports.createGraph = function(name, options) {
	    return new Graph(name, options);
	  };

	  exports.loadJSON = function(definition, callback, metadata) {
	    var caseSensitive, conn, def, exported, graph, group, id, portId, priv, processId, properties, property, pub, split, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
	    if (metadata == null) {
	      metadata = {};
	    }
	    if (typeof definition === 'string') {
	      definition = JSON.parse(definition);
	    }
	    if (!definition.properties) {
	      definition.properties = {};
	    }
	    if (!definition.processes) {
	      definition.processes = {};
	    }
	    if (!definition.connections) {
	      definition.connections = [];
	    }
	    caseSensitive = definition.caseSensitive || false;
	    graph = new Graph(definition.properties.name, {
	      caseSensitive: caseSensitive
	    });
	    graph.startTransaction('loadJSON', metadata);
	    properties = {};
	    _ref = definition.properties;
	    for (property in _ref) {
	      value = _ref[property];
	      if (property === 'name') {
	        continue;
	      }
	      properties[property] = value;
	    }
	    graph.setProperties(properties);
	    _ref1 = definition.processes;
	    for (id in _ref1) {
	      def = _ref1[id];
	      if (!def.metadata) {
	        def.metadata = {};
	      }
	      graph.addNode(id, def.component, def.metadata);
	    }
	    _ref2 = definition.connections;
	    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
	      conn = _ref2[_i];
	      metadata = conn.metadata ? conn.metadata : {};
	      if (conn.data !== void 0) {
	        if (typeof conn.tgt.index === 'number') {
	          graph.addInitialIndex(conn.data, conn.tgt.process, graph.getPortName(conn.tgt.port), conn.tgt.index, metadata);
	        } else {
	          graph.addInitial(conn.data, conn.tgt.process, graph.getPortName(conn.tgt.port), metadata);
	        }
	        continue;
	      }
	      if (typeof conn.src.index === 'number' || typeof conn.tgt.index === 'number') {
	        graph.addEdgeIndex(conn.src.process, graph.getPortName(conn.src.port), conn.src.index, conn.tgt.process, graph.getPortName(conn.tgt.port), conn.tgt.index, metadata);
	        continue;
	      }
	      graph.addEdge(conn.src.process, graph.getPortName(conn.src.port), conn.tgt.process, graph.getPortName(conn.tgt.port), metadata);
	    }
	    if (definition.exports && definition.exports.length) {
	      _ref3 = definition.exports;
	      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
	        exported = _ref3[_j];
	        if (exported["private"]) {
	          split = exported["private"].split('.');
	          if (split.length !== 2) {
	            continue;
	          }
	          processId = split[0];
	          portId = split[1];
	          for (id in definition.processes) {
	            if (graph.getPortName(id) === graph.getPortName(processId)) {
	              processId = id;
	            }
	          }
	        } else {
	          processId = exported.process;
	          portId = graph.getPortName(exported.port);
	        }
	        graph.addExport(exported["public"], processId, portId, exported.metadata);
	      }
	    }
	    if (definition.inports) {
	      _ref4 = definition.inports;
	      for (pub in _ref4) {
	        priv = _ref4[pub];
	        graph.addInport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
	      }
	    }
	    if (definition.outports) {
	      _ref5 = definition.outports;
	      for (pub in _ref5) {
	        priv = _ref5[pub];
	        graph.addOutport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
	      }
	    }
	    if (definition.groups) {
	      _ref6 = definition.groups;
	      for (_k = 0, _len2 = _ref6.length; _k < _len2; _k++) {
	        group = _ref6[_k];
	        graph.addGroup(group.name, group.nodes, group.metadata || {});
	      }
	    }
	    graph.endTransaction('loadJSON');
	    return callback(null, graph);
	  };

	  exports.loadFBP = function(fbpData, callback, metadata, caseSensitive) {
	    var definition, e;
	    if (metadata == null) {
	      metadata = {};
	    }
	    if (caseSensitive == null) {
	      caseSensitive = false;
	    }
	    try {
	      definition = __webpack_require__(8).parse(fbpData, {
	        caseSensitive: caseSensitive
	      });
	    } catch (_error) {
	      e = _error;
	      return callback(e);
	    }
	    return exports.loadJSON(definition, callback, metadata);
	  };

	  exports.loadHTTP = function(url, callback) {
	    var req;
	    req = new XMLHttpRequest;
	    req.onreadystatechange = function() {
	      if (req.readyState !== 4) {
	        return;
	      }
	      if (req.status !== 200) {
	        return callback(new Error("Failed to load " + url + ": HTTP " + req.status));
	      }
	      return callback(null, req.responseText);
	    };
	    req.open('GET', url, true);
	    return req.send();
	  };

	  exports.loadFile = function(file, callback, metadata, caseSensitive) {
	    if (metadata == null) {
	      metadata = {};
	    }
	    if (caseSensitive == null) {
	      caseSensitive = false;
	    }
	    if (platform.isBrowser()) {
	      exports.loadHTTP(file, function(err, data) {
	        var definition;
	        if (err) {
	          return callback(err);
	        }
	        if (file.split('.').pop() === 'fbp') {
	          return exports.loadFBP(data, callback, metadata);
	        }
	        definition = JSON.parse(data);
	        return exports.loadJSON(definition, callback, metadata);
	      });
	      return;
	    }
	    return __webpack_require__(7).readFile(file, "utf-8", function(err, data) {
	      var definition;
	      if (err) {
	        return callback(err);
	      }
	      if (file.split('.').pop() === 'fbp') {
	        return exports.loadFBP(data, callback, {}, caseSensitive);
	      }
	      definition = JSON.parse(data);
	      return exports.loadJSON(definition, callback, {});
	    });
	  };

	  resetGraph = function(graph) {
	    var edge, exp, group, iip, node, port, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
	    _ref = (clone(graph.groups)).reverse();
	    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	      group = _ref[_i];
	      if (group != null) {
	        graph.removeGroup(group.name);
	      }
	    }
	    _ref1 = clone(graph.outports);
	    for (port in _ref1) {
	      v = _ref1[port];
	      graph.removeOutport(port);
	    }
	    _ref2 = clone(graph.inports);
	    for (port in _ref2) {
	      v = _ref2[port];
	      graph.removeInport(port);
	    }
	    _ref3 = clone(graph.exports.reverse());
	    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
	      exp = _ref3[_j];
	      graph.removeExport(exp["public"]);
	    }
	    graph.setProperties({});
	    _ref4 = (clone(graph.initializers)).reverse();
	    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
	      iip = _ref4[_k];
	      graph.removeInitial(iip.to.node, iip.to.port);
	    }
	    _ref5 = (clone(graph.edges)).reverse();
	    for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
	      edge = _ref5[_l];
	      graph.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
	    }
	    _ref6 = (clone(graph.nodes)).reverse();
	    _results = [];
	    for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
	      node = _ref6[_m];
	      _results.push(graph.removeNode(node.id));
	    }
	    return _results;
	  };

	  mergeResolveTheirsNaive = function(base, to) {
	    var edge, exp, group, iip, node, priv, pub, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
	    resetGraph(base);
	    _ref = to.nodes;
	    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	      node = _ref[_i];
	      base.addNode(node.id, node.component, node.metadata);
	    }
	    _ref1 = to.edges;
	    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	      edge = _ref1[_j];
	      base.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, edge.metadata);
	    }
	    _ref2 = to.initializers;
	    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	      iip = _ref2[_k];
	      base.addInitial(iip.from.data, iip.to.node, iip.to.port, iip.metadata);
	    }
	    _ref3 = to.exports;
	    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
	      exp = _ref3[_l];
	      base.addExport(exp["public"], exp.node, exp.port, exp.metadata);
	    }
	    base.setProperties(to.properties);
	    _ref4 = to.inports;
	    for (pub in _ref4) {
	      priv = _ref4[pub];
	      base.addInport(pub, priv.process, priv.port, priv.metadata);
	    }
	    _ref5 = to.outports;
	    for (pub in _ref5) {
	      priv = _ref5[pub];
	      base.addOutport(pub, priv.process, priv.port, priv.metadata);
	    }
	    _ref6 = to.groups;
	    _results = [];
	    for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
	      group = _ref6[_m];
	      _results.push(base.addGroup(group.name, group.nodes, group.metadata));
	    }
	    return _results;
	  };

	  exports.equivalent = function(a, b, options) {
	    var A, B;
	    if (options == null) {
	      options = {};
	    }
	    A = JSON.stringify(a);
	    B = JSON.stringify(b);
	    return A === B;
	  };

	  exports.mergeResolveTheirs = mergeResolveTheirsNaive;

	}).call(this);


/***/ },
/* 3 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	(function() {
	  var clone, guessLanguageFromFilename;

	  clone = function(obj) {
	    var flags, key, newInstance;
	    if ((obj == null) || typeof obj !== 'object') {
	      return obj;
	    }
	    if (obj instanceof Date) {
	      return new Date(obj.getTime());
	    }
	    if (obj instanceof RegExp) {
	      flags = '';
	      if (obj.global != null) {
	        flags += 'g';
	      }
	      if (obj.ignoreCase != null) {
	        flags += 'i';
	      }
	      if (obj.multiline != null) {
	        flags += 'm';
	      }
	      if (obj.sticky != null) {
	        flags += 'y';
	      }
	      return new RegExp(obj.source, flags);
	    }
	    newInstance = new obj.constructor();
	    for (key in obj) {
	      newInstance[key] = clone(obj[key]);
	    }
	    return newInstance;
	  };

	  guessLanguageFromFilename = function(filename) {
	    if (/.*\.coffee$/.test(filename)) {
	      return 'coffeescript';
	    }
	    return 'javascript';
	  };

	  exports.clone = clone;

	  exports.guessLanguageFromFilename = guessLanguageFromFilename;

	}).call(this);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function() {
	  exports.isBrowser = function() {
	    if (typeof process !== 'undefined' && process.execPath && process.execPath.match(/node|iojs/)) {
	      return false;
	    }
	    return true;
	  };

	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 7 */
/***/ function(module, exports) {

	

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function() {
	  "use strict";

	  /*
	   * Generated by PEG.js 0.9.0.
	   *
	   * http://pegjs.org/
	   */

	  function peg$subclass(child, parent) {
	    function ctor() { this.constructor = child; }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	  }

	  function peg$SyntaxError(message, expected, found, location) {
	    this.message  = message;
	    this.expected = expected;
	    this.found    = found;
	    this.location = location;
	    this.name     = "SyntaxError";

	    if (typeof Error.captureStackTrace === "function") {
	      Error.captureStackTrace(this, peg$SyntaxError);
	    }
	  }

	  peg$subclass(peg$SyntaxError, Error);

	  function peg$parse(input) {
	    var options = arguments.length > 1 ? arguments[1] : {},
	        parser  = this,

	        peg$FAILED = {},

	        peg$startRuleFunctions = { start: peg$parsestart },
	        peg$startRuleFunction  = peg$parsestart,

	        peg$c0 = function() { return parser.getResult();  },
	        peg$c1 = "EXPORT=",
	        peg$c2 = { type: "literal", value: "EXPORT=", description: "\"EXPORT=\"" },
	        peg$c3 = ":",
	        peg$c4 = { type: "literal", value: ":", description: "\":\"" },
	        peg$c5 = function(priv, pub) {return parser.registerExports(priv,pub)},
	        peg$c6 = "INPORT=",
	        peg$c7 = { type: "literal", value: "INPORT=", description: "\"INPORT=\"" },
	        peg$c8 = ".",
	        peg$c9 = { type: "literal", value: ".", description: "\".\"" },
	        peg$c10 = function(node, port, pub) {return parser.registerInports(node,port,pub)},
	        peg$c11 = "OUTPORT=",
	        peg$c12 = { type: "literal", value: "OUTPORT=", description: "\"OUTPORT=\"" },
	        peg$c13 = function(node, port, pub) {return parser.registerOutports(node,port,pub)},
	        peg$c14 = "DEFAULT_INPORT=",
	        peg$c15 = { type: "literal", value: "DEFAULT_INPORT=", description: "\"DEFAULT_INPORT=\"" },
	        peg$c16 = function(name) { defaultInPort = name},
	        peg$c17 = "DEFAULT_OUTPORT=",
	        peg$c18 = { type: "literal", value: "DEFAULT_OUTPORT=", description: "\"DEFAULT_OUTPORT=\"" },
	        peg$c19 = function(name) { defaultOutPort = name},
	        peg$c20 = /^[\n\r\u2028\u2029]/,
	        peg$c21 = { type: "class", value: "[\\n\\r\\u2028\\u2029]", description: "[\\n\\r\\u2028\\u2029]" },
	        peg$c22 = function(edges) {return parser.registerEdges(edges);},
	        peg$c23 = ",",
	        peg$c24 = { type: "literal", value: ",", description: "\",\"" },
	        peg$c25 = "#",
	        peg$c26 = { type: "literal", value: "#", description: "\"#\"" },
	        peg$c27 = "->",
	        peg$c28 = { type: "literal", value: "->", description: "\"->\"" },
	        peg$c29 = function(x, y) { return [x,y]; },
	        peg$c30 = function(x, proc, y) { return [{"tgt":makeInPort(proc, x)},{"src":makeOutPort(proc, y)}]; },
	        peg$c31 = function(proc, port) { return {"src":makeOutPort(proc, port)} },
	        peg$c32 = function(port, proc) { return {"tgt":makeInPort(proc, port)} },
	        peg$c33 = "'",
	        peg$c34 = { type: "literal", value: "'", description: "\"'\"" },
	        peg$c35 = function(iip) { return {"data":iip.join("")} },
	        peg$c36 = function(iip) { return {"data":iip} },
	        peg$c37 = function(name) { return name},
	        peg$c38 = /^[a-zA-Z_]/,
	        peg$c39 = { type: "class", value: "[a-zA-Z_]", description: "[a-zA-Z_]" },
	        peg$c40 = /^[a-zA-Z0-9_\-]/,
	        peg$c41 = { type: "class", value: "[a-zA-Z0-9_\\-]", description: "[a-zA-Z0-9_\\-]" },
	        peg$c42 = function(name) { return makeName(name)},
	        peg$c43 = function(name, comp) { parser.addNode(name,comp); return name},
	        peg$c44 = function(comp) { return parser.addAnonymousNode(comp, location().start.offset) },
	        peg$c45 = "(",
	        peg$c46 = { type: "literal", value: "(", description: "\"(\"" },
	        peg$c47 = /^[a-zA-Z\/\-0-9_]/,
	        peg$c48 = { type: "class", value: "[a-zA-Z/\\-0-9_]", description: "[a-zA-Z/\\-0-9_]" },
	        peg$c49 = ")",
	        peg$c50 = { type: "literal", value: ")", description: "\")\"" },
	        peg$c51 = function(comp, meta) { var o = {}; comp ? o.comp = comp.join("") : o.comp = ''; meta ? o.meta = meta.join("").split(',') : null; return o; },
	        peg$c52 = /^[a-zA-Z\/=_,0-9]/,
	        peg$c53 = { type: "class", value: "[a-zA-Z/=_,0-9]", description: "[a-zA-Z/=_,0-9]" },
	        peg$c54 = function(meta) {return meta},
	        peg$c55 = function(portname, portindex) {return { port: options.caseSensitive? portname : portname.toLowerCase(), index: portindex != null ? portindex : undefined }},
	        peg$c56 = function(port) { return port; },
	        peg$c57 = /^[a-zA-Z.0-9_]/,
	        peg$c58 = { type: "class", value: "[a-zA-Z.0-9_]", description: "[a-zA-Z.0-9_]" },
	        peg$c59 = function(portname) {return makeName(portname)},
	        peg$c60 = "[",
	        peg$c61 = { type: "literal", value: "[", description: "\"[\"" },
	        peg$c62 = /^[0-9]/,
	        peg$c63 = { type: "class", value: "[0-9]", description: "[0-9]" },
	        peg$c64 = "]",
	        peg$c65 = { type: "literal", value: "]", description: "\"]\"" },
	        peg$c66 = function(portindex) {return parseInt(portindex.join(''))},
	        peg$c67 = /^[^\n\r\u2028\u2029]/,
	        peg$c68 = { type: "class", value: "[^\\n\\r\\u2028\\u2029]", description: "[^\\n\\r\\u2028\\u2029]" },
	        peg$c69 = /^[\\]/,
	        peg$c70 = { type: "class", value: "[\\\\]", description: "[\\\\]" },
	        peg$c71 = /^[']/,
	        peg$c72 = { type: "class", value: "[']", description: "[']" },
	        peg$c73 = function() { return "'"; },
	        peg$c74 = /^[^']/,
	        peg$c75 = { type: "class", value: "[^']", description: "[^']" },
	        peg$c76 = " ",
	        peg$c77 = { type: "literal", value: " ", description: "\" \"" },
	        peg$c78 = function(value) { return value; },
	        peg$c79 = "{",
	        peg$c80 = { type: "literal", value: "{", description: "\"{\"" },
	        peg$c81 = "}",
	        peg$c82 = { type: "literal", value: "}", description: "\"}\"" },
	        peg$c83 = { type: "other", description: "whitespace" },
	        peg$c84 = /^[ \t\n\r]/,
	        peg$c85 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
	        peg$c86 = "false",
	        peg$c87 = { type: "literal", value: "false", description: "\"false\"" },
	        peg$c88 = function() { return false; },
	        peg$c89 = "null",
	        peg$c90 = { type: "literal", value: "null", description: "\"null\"" },
	        peg$c91 = function() { return null;  },
	        peg$c92 = "true",
	        peg$c93 = { type: "literal", value: "true", description: "\"true\"" },
	        peg$c94 = function() { return true;  },
	        peg$c95 = function(head, m) { return m; },
	        peg$c96 = function(head, tail) {
	                  var result = {}, i;

	                  result[head.name] = head.value;

	                  for (i = 0; i < tail.length; i++) {
	                    result[tail[i].name] = tail[i].value;
	                  }

	                  return result;
	                },
	        peg$c97 = function(members) { return members !== null ? members: {}; },
	        peg$c98 = function(name, value) {
	                return { name: name, value: value };
	              },
	        peg$c99 = function(head, v) { return v; },
	        peg$c100 = function(head, tail) { return [head].concat(tail); },
	        peg$c101 = function(values) { return values !== null ? values : []; },
	        peg$c102 = { type: "other", description: "number" },
	        peg$c103 = function() { return parseFloat(text()); },
	        peg$c104 = /^[1-9]/,
	        peg$c105 = { type: "class", value: "[1-9]", description: "[1-9]" },
	        peg$c106 = /^[eE]/,
	        peg$c107 = { type: "class", value: "[eE]", description: "[eE]" },
	        peg$c108 = "-",
	        peg$c109 = { type: "literal", value: "-", description: "\"-\"" },
	        peg$c110 = "+",
	        peg$c111 = { type: "literal", value: "+", description: "\"+\"" },
	        peg$c112 = "0",
	        peg$c113 = { type: "literal", value: "0", description: "\"0\"" },
	        peg$c114 = { type: "other", description: "string" },
	        peg$c115 = function(chars) { return chars.join(""); },
	        peg$c116 = "\"",
	        peg$c117 = { type: "literal", value: "\"", description: "\"\\\"\"" },
	        peg$c118 = "\\",
	        peg$c119 = { type: "literal", value: "\\", description: "\"\\\\\"" },
	        peg$c120 = "/",
	        peg$c121 = { type: "literal", value: "/", description: "\"/\"" },
	        peg$c122 = "b",
	        peg$c123 = { type: "literal", value: "b", description: "\"b\"" },
	        peg$c124 = function() { return "\b"; },
	        peg$c125 = "f",
	        peg$c126 = { type: "literal", value: "f", description: "\"f\"" },
	        peg$c127 = function() { return "\f"; },
	        peg$c128 = "n",
	        peg$c129 = { type: "literal", value: "n", description: "\"n\"" },
	        peg$c130 = function() { return "\n"; },
	        peg$c131 = "r",
	        peg$c132 = { type: "literal", value: "r", description: "\"r\"" },
	        peg$c133 = function() { return "\r"; },
	        peg$c134 = "t",
	        peg$c135 = { type: "literal", value: "t", description: "\"t\"" },
	        peg$c136 = function() { return "\t"; },
	        peg$c137 = "u",
	        peg$c138 = { type: "literal", value: "u", description: "\"u\"" },
	        peg$c139 = function(digits) {
	                    return String.fromCharCode(parseInt(digits, 16));
	                  },
	        peg$c140 = function(sequence) { return sequence; },
	        peg$c141 = /^[^\0-\x1F"\\]/,
	        peg$c142 = { type: "class", value: "[^\\0-\\x1F\\x22\\x5C]", description: "[^\\0-\\x1F\\x22\\x5C]" },
	        peg$c143 = /^[0-9a-f]/i,
	        peg$c144 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },

	        peg$currPos          = 0,
	        peg$savedPos         = 0,
	        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
	        peg$maxFailPos       = 0,
	        peg$maxFailExpected  = [],
	        peg$silentFails      = 0,

	        peg$result;

	    if ("startRule" in options) {
	      if (!(options.startRule in peg$startRuleFunctions)) {
	        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	      }

	      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	    }

	    function text() {
	      return input.substring(peg$savedPos, peg$currPos);
	    }

	    function location() {
	      return peg$computeLocation(peg$savedPos, peg$currPos);
	    }

	    function expected(description) {
	      throw peg$buildException(
	        null,
	        [{ type: "other", description: description }],
	        input.substring(peg$savedPos, peg$currPos),
	        peg$computeLocation(peg$savedPos, peg$currPos)
	      );
	    }

	    function error(message) {
	      throw peg$buildException(
	        message,
	        null,
	        input.substring(peg$savedPos, peg$currPos),
	        peg$computeLocation(peg$savedPos, peg$currPos)
	      );
	    }

	    function peg$computePosDetails(pos) {
	      var details = peg$posDetailsCache[pos],
	          p, ch;

	      if (details) {
	        return details;
	      } else {
	        p = pos - 1;
	        while (!peg$posDetailsCache[p]) {
	          p--;
	        }

	        details = peg$posDetailsCache[p];
	        details = {
	          line:   details.line,
	          column: details.column,
	          seenCR: details.seenCR
	        };

	        while (p < pos) {
	          ch = input.charAt(p);
	          if (ch === "\n") {
	            if (!details.seenCR) { details.line++; }
	            details.column = 1;
	            details.seenCR = false;
	          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
	            details.line++;
	            details.column = 1;
	            details.seenCR = true;
	          } else {
	            details.column++;
	            details.seenCR = false;
	          }

	          p++;
	        }

	        peg$posDetailsCache[pos] = details;
	        return details;
	      }
	    }

	    function peg$computeLocation(startPos, endPos) {
	      var startPosDetails = peg$computePosDetails(startPos),
	          endPosDetails   = peg$computePosDetails(endPos);

	      return {
	        start: {
	          offset: startPos,
	          line:   startPosDetails.line,
	          column: startPosDetails.column
	        },
	        end: {
	          offset: endPos,
	          line:   endPosDetails.line,
	          column: endPosDetails.column
	        }
	      };
	    }

	    function peg$fail(expected) {
	      if (peg$currPos < peg$maxFailPos) { return; }

	      if (peg$currPos > peg$maxFailPos) {
	        peg$maxFailPos = peg$currPos;
	        peg$maxFailExpected = [];
	      }

	      peg$maxFailExpected.push(expected);
	    }

	    function peg$buildException(message, expected, found, location) {
	      function cleanupExpected(expected) {
	        var i = 1;

	        expected.sort(function(a, b) {
	          if (a.description < b.description) {
	            return -1;
	          } else if (a.description > b.description) {
	            return 1;
	          } else {
	            return 0;
	          }
	        });

	        while (i < expected.length) {
	          if (expected[i - 1] === expected[i]) {
	            expected.splice(i, 1);
	          } else {
	            i++;
	          }
	        }
	      }

	      function buildMessage(expected, found) {
	        function stringEscape(s) {
	          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

	          return s
	            .replace(/\\/g,   '\\\\')
	            .replace(/"/g,    '\\"')
	            .replace(/\x08/g, '\\b')
	            .replace(/\t/g,   '\\t')
	            .replace(/\n/g,   '\\n')
	            .replace(/\f/g,   '\\f')
	            .replace(/\r/g,   '\\r')
	            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
	            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
	            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
	            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
	        }

	        var expectedDescs = new Array(expected.length),
	            expectedDesc, foundDesc, i;

	        for (i = 0; i < expected.length; i++) {
	          expectedDescs[i] = expected[i].description;
	        }

	        expectedDesc = expected.length > 1
	          ? expectedDescs.slice(0, -1).join(", ")
	              + " or "
	              + expectedDescs[expected.length - 1]
	          : expectedDescs[0];

	        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

	        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
	      }

	      if (expected !== null) {
	        cleanupExpected(expected);
	      }

	      return new peg$SyntaxError(
	        message !== null ? message : buildMessage(expected, found),
	        expected,
	        found,
	        location
	      );
	    }

	    function peg$parsestart() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = [];
	      s2 = peg$parseline();
	      while (s2 !== peg$FAILED) {
	        s1.push(s2);
	        s2 = peg$parseline();
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c0();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parseline() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.substr(peg$currPos, 7) === peg$c1) {
	          s2 = peg$c1;
	          peg$currPos += 7;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c2); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseportName();
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 58) {
	              s4 = peg$c3;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c4); }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseportName();
	              if (s5 !== peg$FAILED) {
	                s6 = peg$parse_();
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parseLineTerminator();
	                  if (s7 === peg$FAILED) {
	                    s7 = null;
	                  }
	                  if (s7 !== peg$FAILED) {
	                    peg$savedPos = s0;
	                    s1 = peg$c5(s3, s5);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parse_();
	        if (s1 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 7) === peg$c6) {
	            s2 = peg$c6;
	            peg$currPos += 7;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c7); }
	          }
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parsenode();
	            if (s3 !== peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 46) {
	                s4 = peg$c8;
	                peg$currPos++;
	              } else {
	                s4 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c9); }
	              }
	              if (s4 !== peg$FAILED) {
	                s5 = peg$parseportName();
	                if (s5 !== peg$FAILED) {
	                  if (input.charCodeAt(peg$currPos) === 58) {
	                    s6 = peg$c3;
	                    peg$currPos++;
	                  } else {
	                    s6 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c4); }
	                  }
	                  if (s6 !== peg$FAILED) {
	                    s7 = peg$parseportName();
	                    if (s7 !== peg$FAILED) {
	                      s8 = peg$parse_();
	                      if (s8 !== peg$FAILED) {
	                        s9 = peg$parseLineTerminator();
	                        if (s9 === peg$FAILED) {
	                          s9 = null;
	                        }
	                        if (s9 !== peg$FAILED) {
	                          peg$savedPos = s0;
	                          s1 = peg$c10(s3, s5, s7);
	                          s0 = s1;
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$currPos;
	          s1 = peg$parse_();
	          if (s1 !== peg$FAILED) {
	            if (input.substr(peg$currPos, 8) === peg$c11) {
	              s2 = peg$c11;
	              peg$currPos += 8;
	            } else {
	              s2 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c12); }
	            }
	            if (s2 !== peg$FAILED) {
	              s3 = peg$parsenode();
	              if (s3 !== peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 46) {
	                  s4 = peg$c8;
	                  peg$currPos++;
	                } else {
	                  s4 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c9); }
	                }
	                if (s4 !== peg$FAILED) {
	                  s5 = peg$parseportName();
	                  if (s5 !== peg$FAILED) {
	                    if (input.charCodeAt(peg$currPos) === 58) {
	                      s6 = peg$c3;
	                      peg$currPos++;
	                    } else {
	                      s6 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c4); }
	                    }
	                    if (s6 !== peg$FAILED) {
	                      s7 = peg$parseportName();
	                      if (s7 !== peg$FAILED) {
	                        s8 = peg$parse_();
	                        if (s8 !== peg$FAILED) {
	                          s9 = peg$parseLineTerminator();
	                          if (s9 === peg$FAILED) {
	                            s9 = null;
	                          }
	                          if (s9 !== peg$FAILED) {
	                            peg$savedPos = s0;
	                            s1 = peg$c13(s3, s5, s7);
	                            s0 = s1;
	                          } else {
	                            peg$currPos = s0;
	                            s0 = peg$FAILED;
	                          }
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	          if (s0 === peg$FAILED) {
	            s0 = peg$currPos;
	            s1 = peg$parse_();
	            if (s1 !== peg$FAILED) {
	              if (input.substr(peg$currPos, 15) === peg$c14) {
	                s2 = peg$c14;
	                peg$currPos += 15;
	              } else {
	                s2 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c15); }
	              }
	              if (s2 !== peg$FAILED) {
	                s3 = peg$parseportName();
	                if (s3 !== peg$FAILED) {
	                  s4 = peg$parse_();
	                  if (s4 !== peg$FAILED) {
	                    s5 = peg$parseLineTerminator();
	                    if (s5 === peg$FAILED) {
	                      s5 = null;
	                    }
	                    if (s5 !== peg$FAILED) {
	                      peg$savedPos = s0;
	                      s1 = peg$c16(s3);
	                      s0 = s1;
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	            if (s0 === peg$FAILED) {
	              s0 = peg$currPos;
	              s1 = peg$parse_();
	              if (s1 !== peg$FAILED) {
	                if (input.substr(peg$currPos, 16) === peg$c17) {
	                  s2 = peg$c17;
	                  peg$currPos += 16;
	                } else {
	                  s2 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c18); }
	                }
	                if (s2 !== peg$FAILED) {
	                  s3 = peg$parseportName();
	                  if (s3 !== peg$FAILED) {
	                    s4 = peg$parse_();
	                    if (s4 !== peg$FAILED) {
	                      s5 = peg$parseLineTerminator();
	                      if (s5 === peg$FAILED) {
	                        s5 = null;
	                      }
	                      if (s5 !== peg$FAILED) {
	                        peg$savedPos = s0;
	                        s1 = peg$c19(s3);
	                        s0 = s1;
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	              if (s0 === peg$FAILED) {
	                s0 = peg$currPos;
	                s1 = peg$parsecomment();
	                if (s1 !== peg$FAILED) {
	                  if (peg$c20.test(input.charAt(peg$currPos))) {
	                    s2 = input.charAt(peg$currPos);
	                    peg$currPos++;
	                  } else {
	                    s2 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c21); }
	                  }
	                  if (s2 === peg$FAILED) {
	                    s2 = null;
	                  }
	                  if (s2 !== peg$FAILED) {
	                    s1 = [s1, s2];
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	                if (s0 === peg$FAILED) {
	                  s0 = peg$currPos;
	                  s1 = peg$parse_();
	                  if (s1 !== peg$FAILED) {
	                    if (peg$c20.test(input.charAt(peg$currPos))) {
	                      s2 = input.charAt(peg$currPos);
	                      peg$currPos++;
	                    } else {
	                      s2 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c21); }
	                    }
	                    if (s2 !== peg$FAILED) {
	                      s1 = [s1, s2];
	                      s0 = s1;
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                  if (s0 === peg$FAILED) {
	                    s0 = peg$currPos;
	                    s1 = peg$parse_();
	                    if (s1 !== peg$FAILED) {
	                      s2 = peg$parseconnection();
	                      if (s2 !== peg$FAILED) {
	                        s3 = peg$parse_();
	                        if (s3 !== peg$FAILED) {
	                          s4 = peg$parseLineTerminator();
	                          if (s4 === peg$FAILED) {
	                            s4 = null;
	                          }
	                          if (s4 !== peg$FAILED) {
	                            peg$savedPos = s0;
	                            s1 = peg$c22(s2);
	                            s0 = s1;
	                          } else {
	                            peg$currPos = s0;
	                            s0 = peg$FAILED;
	                          }
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }

	      return s0;
	    }

	    function peg$parseLineTerminator() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 44) {
	          s2 = peg$c23;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c24); }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsecomment();
	          if (s3 === peg$FAILED) {
	            s3 = null;
	          }
	          if (s3 !== peg$FAILED) {
	            if (peg$c20.test(input.charAt(peg$currPos))) {
	              s4 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c21); }
	            }
	            if (s4 === peg$FAILED) {
	              s4 = null;
	            }
	            if (s4 !== peg$FAILED) {
	              s1 = [s1, s2, s3, s4];
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsecomment() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 35) {
	          s2 = peg$c25;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c26); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          s4 = peg$parseanychar();
	          while (s4 !== peg$FAILED) {
	            s3.push(s4);
	            s4 = peg$parseanychar();
	          }
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseconnection() {
	      var s0, s1, s2, s3, s4, s5;

	      s0 = peg$currPos;
	      s1 = peg$parsesource();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse_();
	        if (s2 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 2) === peg$c27) {
	            s3 = peg$c27;
	            peg$currPos += 2;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c28); }
	          }
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parse_();
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseconnection();
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c29(s1, s5);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsedestination();
	      }

	      return s0;
	    }

	    function peg$parsesource() {
	      var s0;

	      s0 = peg$parsebridge();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseoutport();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseiip();
	        }
	      }

	      return s0;
	    }

	    function peg$parsedestination() {
	      var s0;

	      s0 = peg$parseinport();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsebridge();
	      }

	      return s0;
	    }

	    function peg$parsebridge() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parseport__();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsenode();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse__port();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c30(s1, s2, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parseport__();
	        if (s1 === peg$FAILED) {
	          s1 = null;
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parsenodeWithComponent();
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parse__port();
	            if (s3 === peg$FAILED) {
	              s3 = null;
	            }
	            if (s3 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c30(s1, s2, s3);
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      }

	      return s0;
	    }

	    function peg$parseoutport() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parsenode();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__port();
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c31(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseinport() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parseport__();
	      if (s1 === peg$FAILED) {
	        s1 = null;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsenode();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c32(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseiip() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 39) {
	        s1 = peg$c33;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c34); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseiipchar();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parseiipchar();
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 39) {
	            s3 = peg$c33;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c34); }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c35(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parseJSON_text();
	        if (s1 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c36(s1);
	        }
	        s0 = s1;
	      }

	      return s0;
	    }

	    function peg$parsenode() {
	      var s0, s1;

	      s0 = peg$currPos;
	      s1 = peg$parsenodeNameAndComponent();
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c37(s1);
	      }
	      s0 = s1;
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parsenodeName();
	        if (s1 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c37(s1);
	        }
	        s0 = s1;
	        if (s0 === peg$FAILED) {
	          s0 = peg$currPos;
	          s1 = peg$parsenodeComponent();
	          if (s1 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c37(s1);
	          }
	          s0 = s1;
	        }
	      }

	      return s0;
	    }

	    function peg$parsenodeName() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      if (peg$c38.test(input.charAt(peg$currPos))) {
	        s2 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c39); }
	      }
	      if (s2 !== peg$FAILED) {
	        s3 = [];
	        if (peg$c40.test(input.charAt(peg$currPos))) {
	          s4 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s4 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c41); }
	        }
	        while (s4 !== peg$FAILED) {
	          s3.push(s4);
	          if (peg$c40.test(input.charAt(peg$currPos))) {
	            s4 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s4 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c41); }
	          }
	        }
	        if (s3 !== peg$FAILED) {
	          s2 = [s2, s3];
	          s1 = s2;
	        } else {
	          peg$currPos = s1;
	          s1 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c42(s1);
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsenodeNameAndComponent() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parsenodeName();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsecomponent();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c43(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsenodeComponent() {
	      var s0, s1;

	      s0 = peg$currPos;
	      s1 = peg$parsecomponent();
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c44(s1);
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsenodeWithComponent() {
	      var s0;

	      s0 = peg$parsenodeNameAndComponent();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsenodeComponent();
	      }

	      return s0;
	    }

	    function peg$parsecomponent() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 40) {
	        s1 = peg$c45;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c46); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        if (peg$c47.test(input.charAt(peg$currPos))) {
	          s3 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c48); }
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          if (peg$c47.test(input.charAt(peg$currPos))) {
	            s3 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c48); }
	          }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsecompMeta();
	          if (s3 === peg$FAILED) {
	            s3 = null;
	          }
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 41) {
	              s4 = peg$c49;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c50); }
	            }
	            if (s4 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c51(s2, s3);
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsecompMeta() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 58) {
	        s1 = peg$c3;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c4); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        if (peg$c52.test(input.charAt(peg$currPos))) {
	          s3 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c53); }
	        }
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            if (peg$c52.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c53); }
	            }
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c54(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseport() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parseportName();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseportIndex();
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c55(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseport__() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parseport();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c56(s1);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parse__port() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = peg$parse__();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseport();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c56(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseportName() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      if (peg$c38.test(input.charAt(peg$currPos))) {
	        s2 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c39); }
	      }
	      if (s2 !== peg$FAILED) {
	        s3 = [];
	        if (peg$c57.test(input.charAt(peg$currPos))) {
	          s4 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s4 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c58); }
	        }
	        while (s4 !== peg$FAILED) {
	          s3.push(s4);
	          if (peg$c57.test(input.charAt(peg$currPos))) {
	            s4 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s4 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c58); }
	          }
	        }
	        if (s3 !== peg$FAILED) {
	          s2 = [s2, s3];
	          s1 = s2;
	        } else {
	          peg$currPos = s1;
	          s1 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c59(s1);
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parseportIndex() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 91) {
	        s1 = peg$c60;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c61); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        if (peg$c62.test(input.charAt(peg$currPos))) {
	          s3 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c63); }
	        }
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            if (peg$c62.test(input.charAt(peg$currPos))) {
	              s3 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c63); }
	            }
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 93) {
	            s3 = peg$c64;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c65); }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c66(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseanychar() {
	      var s0;

	      if (peg$c67.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c68); }
	      }

	      return s0;
	    }

	    function peg$parseiipchar() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      if (peg$c69.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c70); }
	      }
	      if (s1 !== peg$FAILED) {
	        if (peg$c71.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c72); }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c73();
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        if (peg$c74.test(input.charAt(peg$currPos))) {
	          s0 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c75); }
	        }
	      }

	      return s0;
	    }

	    function peg$parse_() {
	      var s0, s1;

	      s0 = [];
	      if (input.charCodeAt(peg$currPos) === 32) {
	        s1 = peg$c76;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c77); }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        if (input.charCodeAt(peg$currPos) === 32) {
	          s1 = peg$c76;
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c77); }
	        }
	      }
	      if (s0 === peg$FAILED) {
	        s0 = null;
	      }

	      return s0;
	    }

	    function peg$parse__() {
	      var s0, s1;

	      s0 = [];
	      if (input.charCodeAt(peg$currPos) === 32) {
	        s1 = peg$c76;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c77); }
	      }
	      if (s1 !== peg$FAILED) {
	        while (s1 !== peg$FAILED) {
	          s0.push(s1);
	          if (input.charCodeAt(peg$currPos) === 32) {
	            s1 = peg$c76;
	            peg$currPos++;
	          } else {
	            s1 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c77); }
	          }
	        }
	      } else {
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseJSON_text() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsevalue();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c78(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsebegin_array() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 91) {
	          s2 = peg$c60;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c61); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsebegin_object() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 123) {
	          s2 = peg$c79;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c80); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseend_array() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 93) {
	          s2 = peg$c64;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c65); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseend_object() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 125) {
	          s2 = peg$c81;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c82); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsename_separator() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 58) {
	          s2 = peg$c3;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c4); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsevalue_separator() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsews();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 44) {
	          s2 = peg$c23;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c24); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsews();
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsews() {
	      var s0, s1;

	      peg$silentFails++;
	      s0 = [];
	      if (peg$c84.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c85); }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        if (peg$c84.test(input.charAt(peg$currPos))) {
	          s1 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c85); }
	        }
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c83); }
	      }

	      return s0;
	    }

	    function peg$parsevalue() {
	      var s0;

	      s0 = peg$parsefalse();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsenull();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parsetrue();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseobject();
	            if (s0 === peg$FAILED) {
	              s0 = peg$parsearray();
	              if (s0 === peg$FAILED) {
	                s0 = peg$parsenumber();
	                if (s0 === peg$FAILED) {
	                  s0 = peg$parsestring();
	                }
	              }
	            }
	          }
	        }
	      }

	      return s0;
	    }

	    function peg$parsefalse() {
	      var s0, s1;

	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c86) {
	        s1 = peg$c86;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c87); }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c88();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsenull() {
	      var s0, s1;

	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c89) {
	        s1 = peg$c89;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c90); }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c91();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parsetrue() {
	      var s0, s1;

	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c92) {
	        s1 = peg$c92;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c93); }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c94();
	      }
	      s0 = s1;

	      return s0;
	    }

	    function peg$parseobject() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parsebegin_object();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$parsemember();
	        if (s3 !== peg$FAILED) {
	          s4 = [];
	          s5 = peg$currPos;
	          s6 = peg$parsevalue_separator();
	          if (s6 !== peg$FAILED) {
	            s7 = peg$parsemember();
	            if (s7 !== peg$FAILED) {
	              peg$savedPos = s5;
	              s6 = peg$c95(s3, s7);
	              s5 = s6;
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s5;
	            s5 = peg$FAILED;
	          }
	          while (s5 !== peg$FAILED) {
	            s4.push(s5);
	            s5 = peg$currPos;
	            s6 = peg$parsevalue_separator();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parsemember();
	              if (s7 !== peg$FAILED) {
	                peg$savedPos = s5;
	                s6 = peg$c95(s3, s7);
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          }
	          if (s4 !== peg$FAILED) {
	            peg$savedPos = s2;
	            s3 = peg$c96(s3, s4);
	            s2 = s3;
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseend_object();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c97(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsemember() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsestring();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsename_separator();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsevalue();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c98(s1, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsearray() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parsebegin_array();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$parsevalue();
	        if (s3 !== peg$FAILED) {
	          s4 = [];
	          s5 = peg$currPos;
	          s6 = peg$parsevalue_separator();
	          if (s6 !== peg$FAILED) {
	            s7 = peg$parsevalue();
	            if (s7 !== peg$FAILED) {
	              peg$savedPos = s5;
	              s6 = peg$c99(s3, s7);
	              s5 = s6;
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s5;
	            s5 = peg$FAILED;
	          }
	          while (s5 !== peg$FAILED) {
	            s4.push(s5);
	            s5 = peg$currPos;
	            s6 = peg$parsevalue_separator();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parsevalue();
	              if (s7 !== peg$FAILED) {
	                peg$savedPos = s5;
	                s6 = peg$c99(s3, s7);
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          }
	          if (s4 !== peg$FAILED) {
	            peg$savedPos = s2;
	            s3 = peg$c100(s3, s4);
	            s2 = s3;
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseend_array();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c101(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsenumber() {
	      var s0, s1, s2, s3, s4;

	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$parseminus();
	      if (s1 === peg$FAILED) {
	        s1 = null;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseint();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsefrac();
	          if (s3 === peg$FAILED) {
	            s3 = null;
	          }
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parseexp();
	            if (s4 === peg$FAILED) {
	              s4 = null;
	            }
	            if (s4 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c103();
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c102); }
	      }

	      return s0;
	    }

	    function peg$parsedecimal_point() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 46) {
	        s0 = peg$c8;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c9); }
	      }

	      return s0;
	    }

	    function peg$parsedigit1_9() {
	      var s0;

	      if (peg$c104.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c105); }
	      }

	      return s0;
	    }

	    function peg$parsee() {
	      var s0;

	      if (peg$c106.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c107); }
	      }

	      return s0;
	    }

	    function peg$parseexp() {
	      var s0, s1, s2, s3, s4;

	      s0 = peg$currPos;
	      s1 = peg$parsee();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseminus();
	        if (s2 === peg$FAILED) {
	          s2 = peg$parseplus();
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          s4 = peg$parseDIGIT();
	          if (s4 !== peg$FAILED) {
	            while (s4 !== peg$FAILED) {
	              s3.push(s4);
	              s4 = peg$parseDIGIT();
	            }
	          } else {
	            s3 = peg$FAILED;
	          }
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parsefrac() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parsedecimal_point();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseDIGIT();
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$parseDIGIT();
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }

	      return s0;
	    }

	    function peg$parseint() {
	      var s0, s1, s2, s3;

	      s0 = peg$parsezero();
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parsedigit1_9();
	        if (s1 !== peg$FAILED) {
	          s2 = [];
	          s3 = peg$parseDIGIT();
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$parseDIGIT();
	          }
	          if (s2 !== peg$FAILED) {
	            s1 = [s1, s2];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      }

	      return s0;
	    }

	    function peg$parseminus() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 45) {
	        s0 = peg$c108;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c109); }
	      }

	      return s0;
	    }

	    function peg$parseplus() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 43) {
	        s0 = peg$c110;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c111); }
	      }

	      return s0;
	    }

	    function peg$parsezero() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 48) {
	        s0 = peg$c112;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c113); }
	      }

	      return s0;
	    }

	    function peg$parsestring() {
	      var s0, s1, s2, s3;

	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$parsequotation_mark();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parsechar();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parsechar();
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parsequotation_mark();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c115(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c114); }
	      }

	      return s0;
	    }

	    function peg$parsechar() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

	      s0 = peg$parseunescaped();
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parseescape();
	        if (s1 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 34) {
	            s2 = peg$c116;
	            peg$currPos++;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c117); }
	          }
	          if (s2 === peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 92) {
	              s2 = peg$c118;
	              peg$currPos++;
	            } else {
	              s2 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c119); }
	            }
	            if (s2 === peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 47) {
	                s2 = peg$c120;
	                peg$currPos++;
	              } else {
	                s2 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c121); }
	              }
	              if (s2 === peg$FAILED) {
	                s2 = peg$currPos;
	                if (input.charCodeAt(peg$currPos) === 98) {
	                  s3 = peg$c122;
	                  peg$currPos++;
	                } else {
	                  s3 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c123); }
	                }
	                if (s3 !== peg$FAILED) {
	                  peg$savedPos = s2;
	                  s3 = peg$c124();
	                }
	                s2 = s3;
	                if (s2 === peg$FAILED) {
	                  s2 = peg$currPos;
	                  if (input.charCodeAt(peg$currPos) === 102) {
	                    s3 = peg$c125;
	                    peg$currPos++;
	                  } else {
	                    s3 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c126); }
	                  }
	                  if (s3 !== peg$FAILED) {
	                    peg$savedPos = s2;
	                    s3 = peg$c127();
	                  }
	                  s2 = s3;
	                  if (s2 === peg$FAILED) {
	                    s2 = peg$currPos;
	                    if (input.charCodeAt(peg$currPos) === 110) {
	                      s3 = peg$c128;
	                      peg$currPos++;
	                    } else {
	                      s3 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c129); }
	                    }
	                    if (s3 !== peg$FAILED) {
	                      peg$savedPos = s2;
	                      s3 = peg$c130();
	                    }
	                    s2 = s3;
	                    if (s2 === peg$FAILED) {
	                      s2 = peg$currPos;
	                      if (input.charCodeAt(peg$currPos) === 114) {
	                        s3 = peg$c131;
	                        peg$currPos++;
	                      } else {
	                        s3 = peg$FAILED;
	                        if (peg$silentFails === 0) { peg$fail(peg$c132); }
	                      }
	                      if (s3 !== peg$FAILED) {
	                        peg$savedPos = s2;
	                        s3 = peg$c133();
	                      }
	                      s2 = s3;
	                      if (s2 === peg$FAILED) {
	                        s2 = peg$currPos;
	                        if (input.charCodeAt(peg$currPos) === 116) {
	                          s3 = peg$c134;
	                          peg$currPos++;
	                        } else {
	                          s3 = peg$FAILED;
	                          if (peg$silentFails === 0) { peg$fail(peg$c135); }
	                        }
	                        if (s3 !== peg$FAILED) {
	                          peg$savedPos = s2;
	                          s3 = peg$c136();
	                        }
	                        s2 = s3;
	                        if (s2 === peg$FAILED) {
	                          s2 = peg$currPos;
	                          if (input.charCodeAt(peg$currPos) === 117) {
	                            s3 = peg$c137;
	                            peg$currPos++;
	                          } else {
	                            s3 = peg$FAILED;
	                            if (peg$silentFails === 0) { peg$fail(peg$c138); }
	                          }
	                          if (s3 !== peg$FAILED) {
	                            s4 = peg$currPos;
	                            s5 = peg$currPos;
	                            s6 = peg$parseHEXDIG();
	                            if (s6 !== peg$FAILED) {
	                              s7 = peg$parseHEXDIG();
	                              if (s7 !== peg$FAILED) {
	                                s8 = peg$parseHEXDIG();
	                                if (s8 !== peg$FAILED) {
	                                  s9 = peg$parseHEXDIG();
	                                  if (s9 !== peg$FAILED) {
	                                    s6 = [s6, s7, s8, s9];
	                                    s5 = s6;
	                                  } else {
	                                    peg$currPos = s5;
	                                    s5 = peg$FAILED;
	                                  }
	                                } else {
	                                  peg$currPos = s5;
	                                  s5 = peg$FAILED;
	                                }
	                              } else {
	                                peg$currPos = s5;
	                                s5 = peg$FAILED;
	                              }
	                            } else {
	                              peg$currPos = s5;
	                              s5 = peg$FAILED;
	                            }
	                            if (s5 !== peg$FAILED) {
	                              s4 = input.substring(s4, peg$currPos);
	                            } else {
	                              s4 = s5;
	                            }
	                            if (s4 !== peg$FAILED) {
	                              peg$savedPos = s2;
	                              s3 = peg$c139(s4);
	                              s2 = s3;
	                            } else {
	                              peg$currPos = s2;
	                              s2 = peg$FAILED;
	                            }
	                          } else {
	                            peg$currPos = s2;
	                            s2 = peg$FAILED;
	                          }
	                        }
	                      }
	                    }
	                  }
	                }
	              }
	            }
	          }
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c140(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      }

	      return s0;
	    }

	    function peg$parseescape() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 92) {
	        s0 = peg$c118;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c119); }
	      }

	      return s0;
	    }

	    function peg$parsequotation_mark() {
	      var s0;

	      if (input.charCodeAt(peg$currPos) === 34) {
	        s0 = peg$c116;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c117); }
	      }

	      return s0;
	    }

	    function peg$parseunescaped() {
	      var s0;

	      if (peg$c141.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c142); }
	      }

	      return s0;
	    }

	    function peg$parseDIGIT() {
	      var s0;

	      if (peg$c62.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c63); }
	      }

	      return s0;
	    }

	    function peg$parseHEXDIG() {
	      var s0;

	      if (peg$c143.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c144); }
	      }

	      return s0;
	    }


	      var parser, edges, nodes;

	      var defaultInPort = "IN", defaultOutPort = "OUT";

	      parser = this;
	      delete parser.exports;
	      delete parser.inports;
	      delete parser.outports;

	      edges = parser.edges = [];

	      nodes = {};

	      var serialize, indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	      parser.serialize = function(graph) {
	        var conn, getInOutName, getName, i, inPort, input, len, name, namedComponents, outPort, output, process, ref, ref1, ref2, src, srcName, srcPort, srcProcess, tgt, tgtName, tgtPort, tgtProcess;
	        if (options == null) {
	          options = {};
	        }
	        if (typeof(graph) === 'string') {
	          input = JSON.parse(graph);
	        } else {
	          input = graph;
	        }
	        namedComponents = [];
	        output = "";
	        getName = function(name) {
	          if (input.processes[name].metadata != null) {
	            name = input.processes[name].metadata.label;
	          }
	          if (name.indexOf('/') > -1) {
	            name = name.split('/').pop();
	          }
	          return name;
	        };
	        getInOutName = function(name, data) {
	          if ((data.process != null) && (input.processes[data.process].metadata != null)) {
	            name = input.processes[data.process].metadata.label;
	          } else if (data.process != null) {
	            name = data.process;
	          }
	          if (name.indexOf('/') > -1) {
	            name = name.split('/').pop();
	          }
	          return name;
	        };
	        ref = input.inports;
	        for (name in ref) {
	          inPort = ref[name];
	          process = getInOutName(name, inPort);
	          name = name.toUpperCase();
	          inPort.port = inPort.port.toUpperCase();
	          output += "INPORT=" + process + "." + inPort.port + ":" + name + "\n";
	        }
	        ref1 = input.outports;
	        for (name in ref1) {
	          outPort = ref1[name];
	          process = getInOutName(name, inPort);
	          name = name.toUpperCase();
	          outPort.port = outPort.port.toUpperCase();
	          output += "OUTPORT=" + process + "." + outPort.port + ":" + name + "\n";
	        }
	        output += "\n";
	        ref2 = input.connections;
	        for (i = 0, len = ref2.length; i < len; i++) {
	          conn = ref2[i];
	          if (conn.data != null) {
	            tgtPort = conn.tgt.port.toUpperCase();
	            tgtName = conn.tgt.process;
	            tgtProcess = input.processes[tgtName].component;
	            tgt = getName(tgtName);
	            if (indexOf.call(namedComponents, tgtProcess) < 0) {
	              tgt += "(" + tgtProcess + ")";
	              namedComponents.push(tgtProcess);
	            }
	            output += '"' + conn.data + '"' + (" -> " + tgtPort + " " + tgt + "\n");
	          } else {
	            srcPort = conn.src.port.toUpperCase();
	            srcName = conn.src.process;
	            srcProcess = input.processes[srcName].component;
	            src = getName(srcName);
	            if (indexOf.call(namedComponents, srcProcess) < 0) {
	              src += "(" + srcProcess + ")";
	              namedComponents.push(srcProcess);
	            }
	            tgtPort = conn.tgt.port.toUpperCase();
	            tgtName = conn.tgt.process;
	            tgtProcess = input.processes[tgtName].component;
	            tgt = getName(tgtName);
	            if (indexOf.call(namedComponents, tgtProcess) < 0) {
	              tgt += "(" + tgtProcess + ")";
	              namedComponents.push(tgtProcess);
	            }
	            output += src + " " + srcPort + " -> " + tgtPort + " " + tgt + "\n";
	          }
	        }
	        return output;
	      };

	      parser.addNode = function (nodeName, comp) {
	        if (!nodes[nodeName]) {
	          nodes[nodeName] = {}
	        }
	        if (!!comp.comp) {
	          nodes[nodeName].component = comp.comp;
	        }
	        if (!!comp.meta) {
	          var metadata = {};
	          for (var i = 0; i < comp.meta.length; i++) {
	            var item = comp.meta[i].split('=');
	            if (item.length === 1) {
	              item = ['routes', item[0]];
	            }
	            var key = item[0];
	            var value = item[1];
	            if (key==='x' || key==='y') {
	              value = parseFloat(value);
	            }
	            metadata[key] = value;
	          }
	          nodes[nodeName].metadata=metadata;
	        }

	      }

	      var anonymousIndexes = {};
	      var anonymousNodeNames = {};
	      parser.addAnonymousNode = function(comp, offset) {
	          if (!anonymousNodeNames[offset]) {
	              var componentName = comp.comp.replace(/[^a-zA-Z0-9]+/, "_");
	              anonymousIndexes[componentName] = (anonymousIndexes[componentName] || 0) + 1;
	              anonymousNodeNames[offset] = "_" + componentName + "_" + anonymousIndexes[componentName];
	              this.addNode(anonymousNodeNames[offset], comp);
	          }
	          return anonymousNodeNames[offset];
	      }

	      parser.getResult = function () {
	        var result = {
	          processes: nodes,
	          connections: parser.processEdges(),
	          exports: parser.exports,
	          inports: parser.inports,
	          outports: parser.outports
	        };

	        var validateSchema = parser.validateSchema; // default
	        if (typeof(options.validateSchema) !== 'undefined') { validateSchema = options.validateSchema; } // explicit option
	        if (validateSchema) {
	          if (typeof(tv4) === 'undefined') {
	            var tv4 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"tv4\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	          }
	          var schema = __webpack_require__(9);
	          var validation = tv4.validateMultiple(result, schema);
	          if (!validation.valid) {
	            throw new Error("fbp: Did not validate againt graph schema:\n" + JSON.stringify(validation.errors, null, 2));
	          }
	        }
	        result.caseSensitive = options.caseSensitive;
	        return result;
	      }

	      var flatten = function (array, isShallow) {
	        var index = -1,
	          length = array ? array.length : 0,
	          result = [];

	        while (++index < length) {
	          var value = array[index];

	          if (value instanceof Array) {
	            Array.prototype.push.apply(result, isShallow ? value : flatten(value));
	          }
	          else {
	            result.push(value);
	          }
	        }
	        return result;
	      }

	      parser.registerExports = function (priv, pub) {
	        if (!parser.exports) {
	          parser.exports = [];
	        }

	        if (!options.caseSensitive) {
	          priv = priv.toLowerCase();
	          pub = pub.toLowerCase();
	        }

	        parser.exports.push({private:priv, public:pub});
	      }
	      parser.registerInports = function (node, port, pub) {
	        if (!parser.inports) {
	          parser.inports = {};
	        }

	        if (!options.caseSensitive) {
	          pub = pub.toLowerCase();
	          port = port.toLowerCase();
	        }

	        parser.inports[pub] = {process:node, port:port};
	      }
	      parser.registerOutports = function (node, port, pub) {
	        if (!parser.outports) {
	          parser.outports = {};
	        }

	        if (!options.caseSensitive) {
	          pub = pub.toLowerCase();
	          port = port.toLowerCase();
	        }

	        parser.outports[pub] = {process:node, port:port};
	      }

	      parser.registerEdges = function (edges) {
	        if (Array.isArray(edges)) {
	          edges.forEach(function (o, i) {
	            parser.edges.push(o);
	          });
	        }
	      }

	      parser.processEdges = function () {
	        var flats, grouped;
	        flats = flatten(parser.edges);
	        grouped = [];
	        var current = {};
	        for (var i = 1; i < flats.length; i += 1) {
	            // skip over default ports at the beginning of lines (could also handle this in grammar)
	            if (("src" in flats[i - 1] || "data" in flats[i - 1]) && "tgt" in flats[i]) {
	                flats[i - 1].tgt = flats[i].tgt;
	                grouped.push(flats[i - 1]);
	                i++;
	            }
	        }
	        return grouped;
	      }

	      function makeName(s) {
	        return s[0] + s[1].join("");
	      }

	      function makePort(process, port, defaultPort) {
	        if (!options.caseSensitive) {
	          defaultPort = defaultPort.toLowerCase()
	        }
	        var p = {
	            process: process,
	            port: port ? port.port : defaultPort
	        };
	        if (port && port.index != null) {
	            p.index = port.index;
	        }
	        return p;
	    }

	      function makeInPort(process, port) {
	          return makePort(process, port, defaultInPort);
	      }
	      function makeOutPort(process, port) {
	          return makePort(process, port, defaultOutPort);
	      }


	    peg$result = peg$startRuleFunction();

	    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	      return peg$result;
	    } else {
	      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	        peg$fail({ type: "end", description: "end of input" });
	      }

	      throw peg$buildException(
	        null,
	        peg$maxFailExpected,
	        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
	        peg$maxFailPos < input.length
	          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
	          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
	      );
	    }
	  }

	  return {
	    SyntaxError: peg$SyntaxError,
	    parse:       peg$parse
	  };
	})();

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {
		"$schema": "http://json-schema.org/draft-04/schema",
		"id": "graph.json",
		"title": "FBP graph",
		"description": "A graph of FBP processes and connections between them.\nThis is the primary way of specifying FBP programs.\n",
		"name": "graph",
		"type": "object",
		"additionalProperties": false,
		"properties": {
			"properties": {
				"type": "object",
				"description": "User-defined properties attached to the graph.",
				"additionalProperties": true,
				"properties": {
					"name": {
						"type": "string"
					}
				}
			},
			"inports": {
				"type": [
					"object",
					"undefined"
				],
				"description": "Exported inports of the graph",
				"additionalProperties": true,
				"patternProperties": {
					"[a-z0-9]+": {
						"type": "object",
						"properties": {
							"process": {
								"type": "string"
							},
							"port": {
								"type": "string"
							},
							"metadata": {
								"type": "object",
								"additionalProperties": true
							}
						}
					}
				}
			},
			"outports": {
				"type": [
					"object",
					"undefined"
				],
				"description": "Exported outports of the graph",
				"additionalProperties": true,
				"patternProperties": {
					"[a-z0-9]+": {
						"type": "object",
						"properties": {
							"process": {
								"type": "string"
							},
							"port": {
								"type": "string"
							},
							"metadata": {
								"type": "object",
								"additionalProperties": true
							}
						}
					}
				}
			},
			"exports": {
				"type": [
					"array",
					"undefined"
				],
				"description": "Deprecated, use inports and outports instead"
			},
			"groups": {
				"type": "array",
				"description": "List of groups of processes",
				"items": {
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"name": {
							"type": "string"
						},
						"nodes": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"metadata": {
							"additionalProperties": true
						}
					}
				}
			},
			"processes": {
				"type": "object",
				"description": "The processes of this graph.\nEach process is an instance of a component.\n",
				"additionalProperties": false,
				"patternProperties": {
					"[a-zA-Z0-9_]+": {
						"type": "object",
						"properties": {
							"component": {
								"type": "string"
							},
							"metadata": {
								"type": "object",
								"additionalProperties": true
							}
						}
					}
				}
			},
			"connections": {
				"type": "array",
				"description": "Connections of the graph.\nA connection either connects ports of two processes, or specifices an IIP as initial input packet to a port.\n",
				"items": {
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"src": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"process": {
									"type": "string"
								},
								"port": {
									"type": "string"
								},
								"index": {
									"type": "integer"
								}
							}
						},
						"tgt": {
							"type": "object",
							"additionalProperties": false,
							"properties": {
								"process": {
									"type": "string"
								},
								"port": {
									"type": "string"
								},
								"index": {
									"type": "integer"
								}
							}
						},
						"data": {},
						"metadata": {
							"type": "object",
							"additionalProperties": true
						}
					}
				}
			}
		}
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var EventEmitter, Journal, JournalStore, MemoryJournalStore, calculateMeta, clone, entryToPrettyString,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  clone = __webpack_require__(4).clone;

	  entryToPrettyString = function(entry) {
	    var a;
	    a = entry.args;
	    switch (entry.cmd) {
	      case 'addNode':
	        return "" + a.id + "(" + a.component + ")";
	      case 'removeNode':
	        return "DEL " + a.id + "(" + a.component + ")";
	      case 'renameNode':
	        return "RENAME " + a.oldId + " " + a.newId;
	      case 'changeNode':
	        return "META " + a.id;
	      case 'addEdge':
	        return "" + a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
	      case 'removeEdge':
	        return "" + a.from.node + " " + a.from.port + " -X> " + a.to.port + " " + a.to.node;
	      case 'changeEdge':
	        return "META " + a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
	      case 'addInitial':
	        return "'" + a.from.data + "' -> " + a.to.port + " " + a.to.node;
	      case 'removeInitial':
	        return "'" + a.from.data + "' -X> " + a.to.port + " " + a.to.node;
	      case 'startTransaction':
	        return ">>> " + entry.rev + ": " + a.id;
	      case 'endTransaction':
	        return "<<< " + entry.rev + ": " + a.id;
	      case 'changeProperties':
	        return "PROPERTIES";
	      case 'addGroup':
	        return "GROUP " + a.name;
	      case 'renameGroup':
	        return "RENAME GROUP " + a.oldName + " " + a.newName;
	      case 'removeGroup':
	        return "DEL GROUP " + a.name;
	      case 'changeGroup':
	        return "META GROUP " + a.name;
	      case 'addInport':
	        return "INPORT " + a.name;
	      case 'removeInport':
	        return "DEL INPORT " + a.name;
	      case 'renameInport':
	        return "RENAME INPORT " + a.oldId + " " + a.newId;
	      case 'changeInport':
	        return "META INPORT " + a.name;
	      case 'addOutport':
	        return "OUTPORT " + a.name;
	      case 'removeOutport':
	        return "DEL OUTPORT " + a.name;
	      case 'renameOutport':
	        return "RENAME OUTPORT " + a.oldId + " " + a.newId;
	      case 'changeOutport':
	        return "META OUTPORT " + a.name;
	      default:
	        throw new Error("Unknown journal entry: " + entry.cmd);
	    }
	  };

	  calculateMeta = function(oldMeta, newMeta) {
	    var k, setMeta, v;
	    setMeta = {};
	    for (k in oldMeta) {
	      v = oldMeta[k];
	      setMeta[k] = null;
	    }
	    for (k in newMeta) {
	      v = newMeta[k];
	      setMeta[k] = v;
	    }
	    return setMeta;
	  };

	  JournalStore = (function(_super) {
	    __extends(JournalStore, _super);

	    JournalStore.prototype.lastRevision = 0;

	    function JournalStore(graph) {
	      this.graph = graph;
	      this.lastRevision = 0;
	    }

	    JournalStore.prototype.putTransaction = function(revId, entries) {
	      if (revId > this.lastRevision) {
	        this.lastRevision = revId;
	      }
	      return this.emit('transaction', revId);
	    };

	    JournalStore.prototype.fetchTransaction = function(revId, entries) {};

	    return JournalStore;

	  })(EventEmitter);

	  MemoryJournalStore = (function(_super) {
	    __extends(MemoryJournalStore, _super);

	    function MemoryJournalStore(graph) {
	      MemoryJournalStore.__super__.constructor.call(this, graph);
	      this.transactions = [];
	    }

	    MemoryJournalStore.prototype.putTransaction = function(revId, entries) {
	      MemoryJournalStore.__super__.putTransaction.call(this, revId, entries);
	      return this.transactions[revId] = entries;
	    };

	    MemoryJournalStore.prototype.fetchTransaction = function(revId) {
	      return this.transactions[revId];
	    };

	    return MemoryJournalStore;

	  })(JournalStore);

	  Journal = (function(_super) {
	    __extends(Journal, _super);

	    Journal.prototype.graph = null;

	    Journal.prototype.entries = [];

	    Journal.prototype.subscribed = true;

	    function Journal(graph, metadata, store) {
	      this.endTransaction = __bind(this.endTransaction, this);
	      this.startTransaction = __bind(this.startTransaction, this);
	      var edge, group, iip, k, node, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
	      this.graph = graph;
	      this.entries = [];
	      this.subscribed = true;
	      this.store = store || new MemoryJournalStore(this.graph);
	      if (this.store.transactions.length === 0) {
	        this.currentRevision = -1;
	        this.startTransaction('initial', metadata);
	        _ref = this.graph.nodes;
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          node = _ref[_i];
	          this.appendCommand('addNode', node);
	        }
	        _ref1 = this.graph.edges;
	        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	          edge = _ref1[_j];
	          this.appendCommand('addEdge', edge);
	        }
	        _ref2 = this.graph.initializers;
	        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	          iip = _ref2[_k];
	          this.appendCommand('addInitial', iip);
	        }
	        if (Object.keys(this.graph.properties).length > 0) {
	          this.appendCommand('changeProperties', this.graph.properties, {});
	        }
	        _ref3 = this.graph.inports;
	        for (k in _ref3) {
	          v = _ref3[k];
	          this.appendCommand('addInport', {
	            name: k,
	            port: v
	          });
	        }
	        _ref4 = this.graph.outports;
	        for (k in _ref4) {
	          v = _ref4[k];
	          this.appendCommand('addOutport', {
	            name: k,
	            port: v
	          });
	        }
	        _ref5 = this.graph.groups;
	        for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
	          group = _ref5[_l];
	          this.appendCommand('addGroup', group);
	        }
	        this.endTransaction('initial', metadata);
	      } else {
	        this.currentRevision = this.store.lastRevision;
	      }
	      this.graph.on('addNode', (function(_this) {
	        return function(node) {
	          return _this.appendCommand('addNode', node);
	        };
	      })(this));
	      this.graph.on('removeNode', (function(_this) {
	        return function(node) {
	          return _this.appendCommand('removeNode', node);
	        };
	      })(this));
	      this.graph.on('renameNode', (function(_this) {
	        return function(oldId, newId) {
	          var args;
	          args = {
	            oldId: oldId,
	            newId: newId
	          };
	          return _this.appendCommand('renameNode', args);
	        };
	      })(this));
	      this.graph.on('changeNode', (function(_this) {
	        return function(node, oldMeta) {
	          return _this.appendCommand('changeNode', {
	            id: node.id,
	            "new": node.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addEdge', (function(_this) {
	        return function(edge) {
	          return _this.appendCommand('addEdge', edge);
	        };
	      })(this));
	      this.graph.on('removeEdge', (function(_this) {
	        return function(edge) {
	          return _this.appendCommand('removeEdge', edge);
	        };
	      })(this));
	      this.graph.on('changeEdge', (function(_this) {
	        return function(edge, oldMeta) {
	          return _this.appendCommand('changeEdge', {
	            from: edge.from,
	            to: edge.to,
	            "new": edge.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addInitial', (function(_this) {
	        return function(iip) {
	          return _this.appendCommand('addInitial', iip);
	        };
	      })(this));
	      this.graph.on('removeInitial', (function(_this) {
	        return function(iip) {
	          return _this.appendCommand('removeInitial', iip);
	        };
	      })(this));
	      this.graph.on('changeProperties', (function(_this) {
	        return function(newProps, oldProps) {
	          return _this.appendCommand('changeProperties', {
	            "new": newProps,
	            old: oldProps
	          });
	        };
	      })(this));
	      this.graph.on('addGroup', (function(_this) {
	        return function(group) {
	          return _this.appendCommand('addGroup', group);
	        };
	      })(this));
	      this.graph.on('renameGroup', (function(_this) {
	        return function(oldName, newName) {
	          return _this.appendCommand('renameGroup', {
	            oldName: oldName,
	            newName: newName
	          });
	        };
	      })(this));
	      this.graph.on('removeGroup', (function(_this) {
	        return function(group) {
	          return _this.appendCommand('removeGroup', group);
	        };
	      })(this));
	      this.graph.on('changeGroup', (function(_this) {
	        return function(group, oldMeta) {
	          return _this.appendCommand('changeGroup', {
	            name: group.name,
	            "new": group.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addExport', (function(_this) {
	        return function(exported) {
	          return _this.appendCommand('addExport', exported);
	        };
	      })(this));
	      this.graph.on('removeExport', (function(_this) {
	        return function(exported) {
	          return _this.appendCommand('removeExport', exported);
	        };
	      })(this));
	      this.graph.on('addInport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('addInport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('removeInport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('removeInport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('renameInport', (function(_this) {
	        return function(oldId, newId) {
	          return _this.appendCommand('renameInport', {
	            oldId: oldId,
	            newId: newId
	          });
	        };
	      })(this));
	      this.graph.on('changeInport', (function(_this) {
	        return function(name, port, oldMeta) {
	          return _this.appendCommand('changeInport', {
	            name: name,
	            "new": port.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('addOutport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('addOutport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('removeOutport', (function(_this) {
	        return function(name, port) {
	          return _this.appendCommand('removeOutport', {
	            name: name,
	            port: port
	          });
	        };
	      })(this));
	      this.graph.on('renameOutport', (function(_this) {
	        return function(oldId, newId) {
	          return _this.appendCommand('renameOutport', {
	            oldId: oldId,
	            newId: newId
	          });
	        };
	      })(this));
	      this.graph.on('changeOutport', (function(_this) {
	        return function(name, port, oldMeta) {
	          return _this.appendCommand('changeOutport', {
	            name: name,
	            "new": port.metadata,
	            old: oldMeta
	          });
	        };
	      })(this));
	      this.graph.on('startTransaction', (function(_this) {
	        return function(id, meta) {
	          return _this.startTransaction(id, meta);
	        };
	      })(this));
	      this.graph.on('endTransaction', (function(_this) {
	        return function(id, meta) {
	          return _this.endTransaction(id, meta);
	        };
	      })(this));
	    }

	    Journal.prototype.startTransaction = function(id, meta) {
	      if (!this.subscribed) {
	        return;
	      }
	      if (this.entries.length > 0) {
	        throw Error("Inconsistent @entries");
	      }
	      this.currentRevision++;
	      return this.appendCommand('startTransaction', {
	        id: id,
	        metadata: meta
	      }, this.currentRevision);
	    };

	    Journal.prototype.endTransaction = function(id, meta) {
	      if (!this.subscribed) {
	        return;
	      }
	      this.appendCommand('endTransaction', {
	        id: id,
	        metadata: meta
	      }, this.currentRevision);
	      this.store.putTransaction(this.currentRevision, this.entries);
	      return this.entries = [];
	    };

	    Journal.prototype.appendCommand = function(cmd, args, rev) {
	      var entry;
	      if (!this.subscribed) {
	        return;
	      }
	      entry = {
	        cmd: cmd,
	        args: clone(args)
	      };
	      if (rev != null) {
	        entry.rev = rev;
	      }
	      return this.entries.push(entry);
	    };

	    Journal.prototype.executeEntry = function(entry) {
	      var a;
	      a = entry.args;
	      switch (entry.cmd) {
	        case 'addNode':
	          return this.graph.addNode(a.id, a.component);
	        case 'removeNode':
	          return this.graph.removeNode(a.id);
	        case 'renameNode':
	          return this.graph.renameNode(a.oldId, a.newId);
	        case 'changeNode':
	          return this.graph.setNodeMetadata(a.id, calculateMeta(a.old, a["new"]));
	        case 'addEdge':
	          return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'removeEdge':
	          return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'changeEdge':
	          return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a.old, a["new"]));
	        case 'addInitial':
	          return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
	        case 'removeInitial':
	          return this.graph.removeInitial(a.to.node, a.to.port);
	        case 'startTransaction':
	          return null;
	        case 'endTransaction':
	          return null;
	        case 'changeProperties':
	          return this.graph.setProperties(a["new"]);
	        case 'addGroup':
	          return this.graph.addGroup(a.name, a.nodes, a.metadata);
	        case 'renameGroup':
	          return this.graph.renameGroup(a.oldName, a.newName);
	        case 'removeGroup':
	          return this.graph.removeGroup(a.name);
	        case 'changeGroup':
	          return this.graph.setGroupMetadata(a.name, calculateMeta(a.old, a["new"]));
	        case 'addInport':
	          return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
	        case 'removeInport':
	          return this.graph.removeInport(a.name);
	        case 'renameInport':
	          return this.graph.renameInport(a.oldId, a.newId);
	        case 'changeInport':
	          return this.graph.setInportMetadata(a.name, calculateMeta(a.old, a["new"]));
	        case 'addOutport':
	          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata(a.name));
	        case 'removeOutport':
	          return this.graph.removeOutport;
	        case 'renameOutport':
	          return this.graph.renameOutport(a.oldId, a.newId);
	        case 'changeOutport':
	          return this.graph.setOutportMetadata(a.name, calculateMeta(a.old, a["new"]));
	        default:
	          throw new Error("Unknown journal entry: " + entry.cmd);
	      }
	    };

	    Journal.prototype.executeEntryInversed = function(entry) {
	      var a;
	      a = entry.args;
	      switch (entry.cmd) {
	        case 'addNode':
	          return this.graph.removeNode(a.id);
	        case 'removeNode':
	          return this.graph.addNode(a.id, a.component);
	        case 'renameNode':
	          return this.graph.renameNode(a.newId, a.oldId);
	        case 'changeNode':
	          return this.graph.setNodeMetadata(a.id, calculateMeta(a["new"], a.old));
	        case 'addEdge':
	          return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'removeEdge':
	          return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
	        case 'changeEdge':
	          return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a["new"], a.old));
	        case 'addInitial':
	          return this.graph.removeInitial(a.to.node, a.to.port);
	        case 'removeInitial':
	          return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
	        case 'startTransaction':
	          return null;
	        case 'endTransaction':
	          return null;
	        case 'changeProperties':
	          return this.graph.setProperties(a.old);
	        case 'addGroup':
	          return this.graph.removeGroup(a.name);
	        case 'renameGroup':
	          return this.graph.renameGroup(a.newName, a.oldName);
	        case 'removeGroup':
	          return this.graph.addGroup(a.name, a.nodes, a.metadata);
	        case 'changeGroup':
	          return this.graph.setGroupMetadata(a.name, calculateMeta(a["new"], a.old));
	        case 'addInport':
	          return this.graph.removeInport(a.name);
	        case 'removeInport':
	          return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
	        case 'renameInport':
	          return this.graph.renameInport(a.newId, a.oldId);
	        case 'changeInport':
	          return this.graph.setInportMetadata(a.name, calculateMeta(a["new"], a.old));
	        case 'addOutport':
	          return this.graph.removeOutport(a.name);
	        case 'removeOutport':
	          return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata);
	        case 'renameOutport':
	          return this.graph.renameOutport(a.newId, a.oldId);
	        case 'changeOutport':
	          return this.graph.setOutportMetadata(a.name, calculateMeta(a["new"], a.old));
	        default:
	          throw new Error("Unknown journal entry: " + entry.cmd);
	      }
	    };

	    Journal.prototype.moveToRevision = function(revId) {
	      var entries, entry, i, r, _i, _j, _k, _l, _len, _ref, _ref1, _ref2, _ref3, _ref4;
	      if (revId === this.currentRevision) {
	        return;
	      }
	      this.subscribed = false;
	      if (revId > this.currentRevision) {
	        for (r = _i = _ref = this.currentRevision + 1; _ref <= revId ? _i <= revId : _i >= revId; r = _ref <= revId ? ++_i : --_i) {
	          _ref1 = this.store.fetchTransaction(r);
	          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
	            entry = _ref1[_j];
	            this.executeEntry(entry);
	          }
	        }
	      } else {
	        for (r = _k = _ref2 = this.currentRevision, _ref3 = revId + 1; _k >= _ref3; r = _k += -1) {
	          entries = this.store.fetchTransaction(r);
	          for (i = _l = _ref4 = entries.length - 1; _l >= 0; i = _l += -1) {
	            this.executeEntryInversed(entries[i]);
	          }
	        }
	      }
	      this.currentRevision = revId;
	      return this.subscribed = true;
	    };

	    Journal.prototype.undo = function() {
	      if (!this.canUndo()) {
	        return;
	      }
	      return this.moveToRevision(this.currentRevision - 1);
	    };

	    Journal.prototype.canUndo = function() {
	      return this.currentRevision > 0;
	    };

	    Journal.prototype.redo = function() {
	      if (!this.canRedo()) {
	        return;
	      }
	      return this.moveToRevision(this.currentRevision + 1);
	    };

	    Journal.prototype.canRedo = function() {
	      return this.currentRevision < this.store.lastRevision;
	    };

	    Journal.prototype.toPrettyString = function(startRev, endRev) {
	      var e, entry, lines, r, _i, _j, _len;
	      startRev |= 0;
	      endRev |= this.store.lastRevision;
	      lines = [];
	      for (r = _i = startRev; startRev <= endRev ? _i < endRev : _i > endRev; r = startRev <= endRev ? ++_i : --_i) {
	        e = this.store.fetchTransaction(r);
	        for (_j = 0, _len = e.length; _j < _len; _j++) {
	          entry = e[_j];
	          lines.push(entryToPrettyString(entry));
	        }
	      }
	      return lines.join('\n');
	    };

	    Journal.prototype.toJSON = function(startRev, endRev) {
	      var entries, entry, r, _i, _j, _len, _ref;
	      startRev |= 0;
	      endRev |= this.store.lastRevision;
	      entries = [];
	      for (r = _i = startRev; _i < endRev; r = _i += 1) {
	        _ref = this.store.fetchTransaction(r);
	        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
	          entry = _ref[_j];
	          entries.push(entryToPrettyString(entry));
	        }
	      }
	      return entries;
	    };

	    Journal.prototype.save = function(file, success) {
	      var json;
	      json = JSON.stringify(this.toJSON(), null, 4);
	      return __webpack_require__(7).writeFile("" + file + ".json", json, "utf-8", function(err, data) {
	        if (err) {
	          throw err;
	        }
	        return success(file);
	      });
	    };

	    return Journal;

	  })(EventEmitter);

	  exports.Journal = Journal;

	  exports.JournalStore = JournalStore;

	  exports.MemoryJournalStore = MemoryJournalStore;

	}).call(this);


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function() {
	  var EventEmitter, Network, componentLoader, graph, internalSocket, platform, _,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  _ = __webpack_require__(12);

	  internalSocket = __webpack_require__(13);

	  graph = __webpack_require__(2);

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  platform = __webpack_require__(5);

	  componentLoader = __webpack_require__(15);

	  Network = (function(_super) {
	    __extends(Network, _super);

	    Network.prototype.processes = {};

	    Network.prototype.connections = [];

	    Network.prototype.initials = [];

	    Network.prototype.defaults = [];

	    Network.prototype.graph = null;

	    Network.prototype.startupDate = null;

	    Network.prototype.portBuffer = {};

	    function Network(graph, options) {
	      this.options = options != null ? options : {};
	      this.processes = {};
	      this.connections = [];
	      this.initials = [];
	      this.nextInitials = [];
	      this.defaults = [];
	      this.graph = graph;
	      this.started = false;
	      this.debug = true;
	      this.connectionCount = 0;
	      if (!platform.isBrowser()) {
	        this.baseDir = graph.baseDir || process.cwd();
	      } else {
	        this.baseDir = graph.baseDir || '/';
	      }
	      this.startupDate = null;
	      if (graph.componentLoader) {
	        this.loader = graph.componentLoader;
	      } else {
	        this.loader = new componentLoader.ComponentLoader(this.baseDir, this.options);
	      }
	    }

	    Network.prototype.uptime = function() {
	      if (!this.startupDate) {
	        return 0;
	      }
	      return new Date() - this.startupDate;
	    };

	    Network.prototype.increaseConnections = function() {
	      if (this.connectionCount === 0) {
	        this.setStarted(true);
	      }
	      return this.connectionCount++;
	    };

	    Network.prototype.decreaseConnections = function() {
	      this.connectionCount--;
	      if (this.connectionCount) {
	        return;
	      }
	      if (!this.debouncedEnd) {
	        this.debouncedEnd = _.debounce((function(_this) {
	          return function() {
	            if (_this.connectionCount) {
	              return;
	            }
	            return _this.setStarted(false);
	          };
	        })(this), 50);
	      }
	      return this.debouncedEnd();
	    };

	    Network.prototype.load = function(component, metadata, callback) {
	      return this.loader.load(component, callback, metadata);
	    };

	    Network.prototype.addNode = function(node, callback) {
	      var process;
	      if (this.processes[node.id]) {
	        if (callback) {
	          callback(null, this.processes[node.id]);
	        }
	        return;
	      }
	      process = {
	        id: node.id
	      };
	      if (!node.component) {
	        this.processes[process.id] = process;
	        if (callback) {
	          callback(null, process);
	        }
	        return;
	      }
	      return this.load(node.component, node.metadata, (function(_this) {
	        return function(err, instance) {
	          var name, port, _ref, _ref1;
	          if (err) {
	            return callback(err);
	          }
	          instance.nodeId = node.id;
	          process.component = instance;
	          _ref = process.component.inPorts;
	          for (name in _ref) {
	            port = _ref[name];
	            if (!port || typeof port === 'function' || !port.canAttach) {
	              continue;
	            }
	            port.node = node.id;
	            port.nodeInstance = instance;
	            port.name = name;
	          }
	          _ref1 = process.component.outPorts;
	          for (name in _ref1) {
	            port = _ref1[name];
	            if (!port || typeof port === 'function' || !port.canAttach) {
	              continue;
	            }
	            port.node = node.id;
	            port.nodeInstance = instance;
	            port.name = name;
	          }
	          if (instance.isSubgraph()) {
	            _this.subscribeSubgraph(process);
	          }
	          _this.subscribeNode(process);
	          _this.processes[process.id] = process;
	          if (callback) {
	            return callback(null, process);
	          }
	        };
	      })(this));
	    };

	    Network.prototype.removeNode = function(node, callback) {
	      if (!this.processes[node.id]) {
	        return callback(new Error("Node " + node.id + " not found"));
	      }
	      this.processes[node.id].component.shutdown();
	      delete this.processes[node.id];
	      if (callback) {
	        return callback(null);
	      }
	    };

	    Network.prototype.renameNode = function(oldId, newId, callback) {
	      var name, port, process, _ref, _ref1;
	      process = this.getNode(oldId);
	      if (!process) {
	        return callback(new Error("Process " + oldId + " not found"));
	      }
	      process.id = newId;
	      _ref = process.component.inPorts;
	      for (name in _ref) {
	        port = _ref[name];
	        port.node = newId;
	      }
	      _ref1 = process.component.outPorts;
	      for (name in _ref1) {
	        port = _ref1[name];
	        port.node = newId;
	      }
	      this.processes[newId] = process;
	      delete this.processes[oldId];
	      if (callback) {
	        return callback(null);
	      }
	    };

	    Network.prototype.getNode = function(id) {
	      return this.processes[id];
	    };

	    Network.prototype.connect = function(done) {
	      var callStack, edges, initializers, nodes, serialize, setDefaults, subscribeGraph;
	      if (done == null) {
	        done = function() {};
	      }
	      callStack = 0;
	      serialize = (function(_this) {
	        return function(next, add) {
	          return function(type) {
	            return _this["add" + type](add, function(err) {
	              if (err) {
	                console.log(err);
	              }
	              if (err) {
	                return done(err);
	              }
	              callStack++;
	              if (callStack % 100 === 0) {
	                setTimeout(function() {
	                  return next(type);
	                }, 0);
	                return;
	              }
	              return next(type);
	            });
	          };
	        };
	      })(this);
	      subscribeGraph = (function(_this) {
	        return function() {
	          _this.subscribeGraph();
	          return done();
	        };
	      })(this);
	      setDefaults = _.reduceRight(this.graph.nodes, serialize, subscribeGraph);
	      initializers = _.reduceRight(this.graph.initializers, serialize, function() {
	        return setDefaults("Defaults");
	      });
	      edges = _.reduceRight(this.graph.edges, serialize, function() {
	        return initializers("Initial");
	      });
	      nodes = _.reduceRight(this.graph.nodes, serialize, function() {
	        return edges("Edge");
	      });
	      return nodes("Node");
	    };

	    Network.prototype.connectPort = function(socket, process, port, index, inbound) {
	      if (inbound) {
	        socket.to = {
	          process: process,
	          port: port,
	          index: index
	        };
	        if (!(process.component.inPorts && process.component.inPorts[port])) {
	          throw new Error("No inport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
	          return;
	        }
	        if (process.component.inPorts[port].isAddressable()) {
	          return process.component.inPorts[port].attach(socket, index);
	        }
	        return process.component.inPorts[port].attach(socket);
	      }
	      socket.from = {
	        process: process,
	        port: port,
	        index: index
	      };
	      if (!(process.component.outPorts && process.component.outPorts[port])) {
	        throw new Error("No outport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
	        return;
	      }
	      if (process.component.outPorts[port].isAddressable()) {
	        return process.component.outPorts[port].attach(socket, index);
	      }
	      return process.component.outPorts[port].attach(socket);
	    };

	    Network.prototype.subscribeGraph = function() {
	      var graphOps, processOps, processing, registerOp;
	      graphOps = [];
	      processing = false;
	      registerOp = function(op, details) {
	        return graphOps.push({
	          op: op,
	          details: details
	        });
	      };
	      processOps = (function(_this) {
	        return function(err) {
	          var cb, op;
	          if (err) {
	            if (_this.listeners('process-error').length === 0) {
	              throw err;
	            }
	            _this.emit('process-error', err);
	          }
	          if (!graphOps.length) {
	            processing = false;
	            return;
	          }
	          processing = true;
	          op = graphOps.shift();
	          cb = processOps;
	          switch (op.op) {
	            case 'renameNode':
	              return _this.renameNode(op.details.from, op.details.to, cb);
	            default:
	              return _this[op.op](op.details, cb);
	          }
	        };
	      })(this);
	      this.graph.on('addNode', (function(_this) {
	        return function(node) {
	          registerOp('addNode', node);
	          if (!processing) {
	            return processOps();
	          }
	        };
	      })(this));
	      this.graph.on('removeNode', (function(_this) {
	        return function(node) {
	          registerOp('removeNode', node);
	          if (!processing) {
	            return processOps();
	          }
	        };
	      })(this));
	      this.graph.on('renameNode', (function(_this) {
	        return function(oldId, newId) {
	          registerOp('renameNode', {
	            from: oldId,
	            to: newId
	          });
	          if (!processing) {
	            return processOps();
	          }
	        };
	      })(this));
	      this.graph.on('addEdge', (function(_this) {
	        return function(edge) {
	          registerOp('addEdge', edge);
	          if (!processing) {
	            return processOps();
	          }
	        };
	      })(this));
	      this.graph.on('removeEdge', (function(_this) {
	        return function(edge) {
	          registerOp('removeEdge', edge);
	          if (!processing) {
	            return processOps();
	          }
	        };
	      })(this));
	      this.graph.on('addInitial', (function(_this) {
	        return function(iip) {
	          registerOp('addInitial', iip);
	          if (!processing) {
	            return processOps();
	          }
	        };
	      })(this));
	      return this.graph.on('removeInitial', (function(_this) {
	        return function(iip) {
	          registerOp('removeInitial', iip);
	          if (!processing) {
	            return processOps();
	          }
	        };
	      })(this));
	    };

	    Network.prototype.subscribeSubgraph = function(node) {
	      var emitSub;
	      if (!node.component.isReady()) {
	        node.component.once('ready', (function(_this) {
	          return function() {
	            return _this.subscribeSubgraph(node);
	          };
	        })(this));
	        return;
	      }
	      if (!node.component.network) {
	        return;
	      }
	      node.component.network.setDebug(this.debug);
	      emitSub = (function(_this) {
	        return function(type, data) {
	          if (type === 'process-error' && _this.listeners('process-error').length === 0) {
	            throw data;
	          }
	          if (type === 'connect') {
	            _this.increaseConnections();
	          }
	          if (type === 'disconnect') {
	            _this.decreaseConnections();
	          }
	          if (!data) {
	            data = {};
	          }
	          if (data.subgraph) {
	            if (!data.subgraph.unshift) {
	              data.subgraph = [data.subgraph];
	            }
	            data.subgraph = data.subgraph.unshift(node.id);
	          } else {
	            data.subgraph = [node.id];
	          }
	          return _this.emit(type, data);
	        };
	      })(this);
	      node.component.network.on('connect', function(data) {
	        return emitSub('connect', data);
	      });
	      node.component.network.on('begingroup', function(data) {
	        return emitSub('begingroup', data);
	      });
	      node.component.network.on('data', function(data) {
	        return emitSub('data', data);
	      });
	      node.component.network.on('endgroup', function(data) {
	        return emitSub('endgroup', data);
	      });
	      node.component.network.on('disconnect', function(data) {
	        return emitSub('disconnect', data);
	      });
	      return node.component.network.on('process-error', function(data) {
	        return emitSub('process-error', data);
	      });
	    };

	    Network.prototype.subscribeSocket = function(socket) {
	      socket.on('connect', (function(_this) {
	        return function() {
	          _this.increaseConnections();
	          return _this.emit('connect', {
	            id: socket.getId(),
	            socket: socket,
	            metadata: socket.metadata
	          });
	        };
	      })(this));
	      socket.on('begingroup', (function(_this) {
	        return function(group) {
	          return _this.emit('begingroup', {
	            id: socket.getId(),
	            socket: socket,
	            group: group,
	            metadata: socket.metadata
	          });
	        };
	      })(this));
	      socket.on('data', (function(_this) {
	        return function(data) {
	          return _this.emit('data', {
	            id: socket.getId(),
	            socket: socket,
	            data: data,
	            metadata: socket.metadata
	          });
	        };
	      })(this));
	      socket.on('endgroup', (function(_this) {
	        return function(group) {
	          return _this.emit('endgroup', {
	            id: socket.getId(),
	            socket: socket,
	            group: group,
	            metadata: socket.metadata
	          });
	        };
	      })(this));
	      socket.on('disconnect', (function(_this) {
	        return function() {
	          _this.decreaseConnections();
	          return _this.emit('disconnect', {
	            id: socket.getId(),
	            socket: socket,
	            metadata: socket.metadata
	          });
	        };
	      })(this));
	      return socket.on('error', (function(_this) {
	        return function(event) {
	          if (_this.listeners('process-error').length === 0) {
	            throw event;
	          }
	          return _this.emit('process-error', event);
	        };
	      })(this));
	    };

	    Network.prototype.subscribeNode = function(node) {
	      if (!node.component.getIcon) {
	        return;
	      }
	      return node.component.on('icon', (function(_this) {
	        return function() {
	          return _this.emit('icon', {
	            id: node.id,
	            icon: node.component.getIcon()
	          });
	        };
	      })(this));
	    };

	    Network.prototype.addEdge = function(edge, callback) {
	      var from, socket, to;
	      socket = internalSocket.createSocket(edge.metadata);
	      socket.setDebug(this.debug);
	      from = this.getNode(edge.from.node);
	      if (!from) {
	        return callback(new Error("No process defined for outbound node " + edge.from.node));
	      }
	      if (!from.component) {
	        return callback(new Error("No component defined for outbound node " + edge.from.node));
	      }
	      if (!from.component.isReady()) {
	        from.component.once("ready", (function(_this) {
	          return function() {
	            return _this.addEdge(edge, callback);
	          };
	        })(this));
	        return;
	      }
	      to = this.getNode(edge.to.node);
	      if (!to) {
	        return callback(new Error("No process defined for inbound node " + edge.to.node));
	      }
	      if (!to.component) {
	        return callback(new Error("No component defined for inbound node " + edge.to.node));
	      }
	      if (!to.component.isReady()) {
	        to.component.once("ready", (function(_this) {
	          return function() {
	            return _this.addEdge(edge, callback);
	          };
	        })(this));
	        return;
	      }
	      this.subscribeSocket(socket);
	      this.connectPort(socket, to, edge.to.port, edge.to.index, true);
	      this.connectPort(socket, from, edge.from.port, edge.from.index, false);
	      this.connections.push(socket);
	      if (callback) {
	        return callback();
	      }
	    };

	    Network.prototype.removeEdge = function(edge, callback) {
	      var connection, _i, _len, _ref, _results;
	      _ref = this.connections;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        connection = _ref[_i];
	        if (!connection) {
	          continue;
	        }
	        if (!(edge.to.node === connection.to.process.id && edge.to.port === connection.to.port)) {
	          continue;
	        }
	        connection.to.process.component.inPorts[connection.to.port].detach(connection);
	        if (edge.from.node) {
	          if (connection.from && edge.from.node === connection.from.process.id && edge.from.port === connection.from.port) {
	            connection.from.process.component.outPorts[connection.from.port].detach(connection);
	          }
	        }
	        this.connections.splice(this.connections.indexOf(connection), 1);
	        if (callback) {
	          _results.push(callback());
	        } else {
	          _results.push(void 0);
	        }
	      }
	      return _results;
	    };

	    Network.prototype.addDefaults = function(node, callback) {
	      var key, port, process, socket, _ref;
	      process = this.processes[node.id];
	      if (!process.component.isReady()) {
	        if (process.component.setMaxListeners) {
	          process.component.setMaxListeners(0);
	        }
	        process.component.once("ready", (function(_this) {
	          return function() {
	            return _this.addDefaults(process, callback);
	          };
	        })(this));
	        return;
	      }
	      _ref = process.component.inPorts.ports;
	      for (key in _ref) {
	        port = _ref[key];
	        if (typeof port.hasDefault === 'function' && port.hasDefault() && !port.isAttached()) {
	          socket = internalSocket.createSocket();
	          socket.setDebug(this.debug);
	          this.subscribeSocket(socket);
	          this.connectPort(socket, process, key, void 0, true);
	          this.connections.push(socket);
	          this.defaults.push(socket);
	        }
	      }
	      if (callback) {
	        return callback();
	      }
	    };

	    Network.prototype.addInitial = function(initializer, callback) {
	      var init, socket, to;
	      socket = internalSocket.createSocket(initializer.metadata);
	      socket.setDebug(this.debug);
	      this.subscribeSocket(socket);
	      to = this.getNode(initializer.to.node);
	      if (!to) {
	        return callback(new Error("No process defined for inbound node " + initializer.to.node));
	      }
	      if (!(to.component.isReady() || to.component.inPorts[initializer.to.port])) {
	        if (to.component.setMaxListeners) {
	          to.component.setMaxListeners(0);
	        }
	        to.component.once("ready", (function(_this) {
	          return function() {
	            return _this.addInitial(initializer, callback);
	          };
	        })(this));
	        return;
	      }
	      this.connectPort(socket, to, initializer.to.port, initializer.to.index, true);
	      this.connections.push(socket);
	      init = {
	        socket: socket,
	        data: initializer.from.data
	      };
	      this.initials.push(init);
	      this.nextInitials.push(init);
	      if (this.isStarted()) {
	        this.sendInitials();
	      }
	      if (callback) {
	        return callback();
	      }
	    };

	    Network.prototype.removeInitial = function(initializer, callback) {
	      var connection, init, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
	      _ref = this.connections;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        connection = _ref[_i];
	        if (!connection) {
	          continue;
	        }
	        if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {
	          continue;
	        }
	        connection.to.process.component.inPorts[connection.to.port].detach(connection);
	        this.connections.splice(this.connections.indexOf(connection), 1);
	        _ref1 = this.initials;
	        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	          init = _ref1[_j];
	          if (!init) {
	            continue;
	          }
	          if (init.socket !== connection) {
	            continue;
	          }
	          this.initials.splice(this.initials.indexOf(init), 1);
	        }
	        _ref2 = this.nextInitials;
	        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	          init = _ref2[_k];
	          if (!init) {
	            continue;
	          }
	          if (init.socket !== connection) {
	            continue;
	          }
	          this.nextInitials.splice(this.nextInitials.indexOf(init), 1);
	        }
	      }
	      if (callback) {
	        return callback();
	      }
	    };

	    Network.prototype.sendInitial = function(initial) {
	      initial.socket.connect();
	      initial.socket.send(initial.data);
	      return initial.socket.disconnect();
	    };

	    Network.prototype.sendInitials = function(callback) {
	      var send;
	      if (!callback) {
	        callback = function() {};
	      }
	      send = (function(_this) {
	        return function() {
	          var initial, _i, _len, _ref;
	          _ref = _this.initials;
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            initial = _ref[_i];
	            _this.sendInitial(initial);
	          }
	          _this.initials = [];
	          return callback();
	        };
	      })(this);
	      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
	        return process.nextTick(send);
	      } else {
	        return setTimeout(send, 0);
	      }
	    };

	    Network.prototype.isStarted = function() {
	      return this.started;
	    };

	    Network.prototype.isRunning = function() {
	      if (!this.started) {
	        return false;
	      }
	      return this.connectionCount > 0;
	    };

	    Network.prototype.startComponents = function(callback) {
	      var id, process, _ref;
	      if (!callback) {
	        callback = function() {};
	      }
	      _ref = this.processes;
	      for (id in _ref) {
	        process = _ref[id];
	        process.component.start();
	      }
	      return callback();
	    };

	    Network.prototype.sendDefaults = function(callback) {
	      var socket, _i, _len, _ref;
	      if (!callback) {
	        callback = function() {};
	      }
	      if (!this.defaults.length) {
	        return callback();
	      }
	      _ref = this.defaults;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        socket = _ref[_i];
	        if (socket.to.process.component.inPorts[socket.to.port].sockets.length !== 1) {
	          continue;
	        }
	        socket.connect();
	        socket.send();
	        socket.disconnect();
	      }
	      return callback();
	    };

	    Network.prototype.start = function(callback) {
	      if (!callback) {
	        callback = function() {};
	      }
	      if (this.started) {
	        this.stop();
	      }
	      this.initials = this.nextInitials.slice(0);
	      return this.startComponents((function(_this) {
	        return function(err) {
	          if (err) {
	            return callback(err);
	          }
	          return _this.sendInitials(function(err) {
	            if (err) {
	              return callback(err);
	            }
	            return _this.sendDefaults(function(err) {
	              if (err) {
	                return callback(err);
	              }
	              _this.setStarted(true);
	              return callback(null);
	            });
	          });
	        };
	      })(this));
	    };

	    Network.prototype.stop = function() {
	      var connection, id, process, _i, _len, _ref, _ref1;
	      _ref = this.connections;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        connection = _ref[_i];
	        if (!connection.isConnected()) {
	          continue;
	        }
	        connection.disconnect();
	      }
	      _ref1 = this.processes;
	      for (id in _ref1) {
	        process = _ref1[id];
	        process.component.shutdown();
	      }
	      return this.setStarted(false);
	    };

	    Network.prototype.setStarted = function(started) {
	      if (this.started === started) {
	        return;
	      }
	      if (!started) {
	        this.started = false;
	        this.emit('end', {
	          start: this.startupDate,
	          end: new Date,
	          uptime: this.uptime()
	        });
	        return;
	      }
	      if (!this.startupDate) {
	        this.startupDate = new Date;
	      }
	      this.started = true;
	      return this.emit('start', {
	        start: this.startupDate
	      });
	    };

	    Network.prototype.getDebug = function() {
	      return this.debug;
	    };

	    Network.prototype.setDebug = function(active) {
	      var instance, process, processId, socket, _i, _len, _ref, _ref1, _results;
	      if (active === this.debug) {
	        return;
	      }
	      this.debug = active;
	      _ref = this.connections;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        socket = _ref[_i];
	        socket.setDebug(active);
	      }
	      _ref1 = this.processes;
	      _results = [];
	      for (processId in _ref1) {
	        process = _ref1[processId];
	        instance = process.component;
	        if (instance.isSubgraph()) {
	          _results.push(instance.network.setDebug(active));
	        } else {
	          _results.push(void 0);
	        }
	      }
	      return _results;
	    };

	    return Network;

	  })(EventEmitter);

	  exports.Network = Network;

	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var EventEmitter, IP, InternalSocket,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  IP = __webpack_require__(14);

	  InternalSocket = (function(_super) {
	    __extends(InternalSocket, _super);

	    InternalSocket.prototype.regularEmitEvent = function(event, data) {
	      return this.emit(event, data);
	    };

	    InternalSocket.prototype.debugEmitEvent = function(event, data) {
	      var error;
	      try {
	        return this.emit(event, data);
	      } catch (_error) {
	        error = _error;
	        if (error.id && error.metadata && error.error) {
	          if (this.listeners('error').length === 0) {
	            throw error.error;
	          }
	          this.emit('error', error);
	          return;
	        }
	        if (this.listeners('error').length === 0) {
	          throw error;
	        }
	        return this.emit('error', {
	          id: this.to.process.id,
	          error: error,
	          metadata: this.metadata
	        });
	      }
	    };

	    function InternalSocket(metadata) {
	      this.metadata = metadata != null ? metadata : {};
	      this.brackets = [];
	      this.dataDelegate = null;
	      this.debug = false;
	      this.emitEvent = this.regularEmitEvent;
	    }

	    InternalSocket.prototype.connect = function() {
	      return this.handleSocketEvent('connect', null);
	    };

	    InternalSocket.prototype.disconnect = function() {
	      return this.handleSocketEvent('disconnect', null);
	    };

	    InternalSocket.prototype.isConnected = function() {
	      return this.brackets.length > 0;
	    };

	    InternalSocket.prototype.send = function(data) {
	      if (data === void 0 && typeof this.dataDelegate === 'function') {
	        data = this.dataDelegate();
	      }
	      return this.handleSocketEvent('data', data);
	    };

	    InternalSocket.prototype.post = function(data) {
	      if (data === void 0 && typeof this.dataDelegate === 'function') {
	        data = this.dataDelegate();
	      }
	      if (data.type === 'data' && this.brackets.length === 0) {
	        this.emitEvent('connect', this);
	      }
	      this.handleSocketEvent('data', data, false);
	      if (data.type === 'data' && this.brackets.length === 0) {
	        return this.emitEvent('disconnect', this);
	      }
	    };

	    InternalSocket.prototype.beginGroup = function(group) {
	      return this.handleSocketEvent('begingroup', group);
	    };

	    InternalSocket.prototype.endGroup = function() {
	      return this.handleSocketEvent('endgroup');
	    };

	    InternalSocket.prototype.setDataDelegate = function(delegate) {
	      if (typeof delegate !== 'function') {
	        throw Error('A data delegate must be a function.');
	      }
	      return this.dataDelegate = delegate;
	    };

	    InternalSocket.prototype.setDebug = function(active) {
	      this.debug = active;
	      return this.emitEvent = this.debug ? this.debugEmitEvent : this.regularEmitEvent;
	    };

	    InternalSocket.prototype.getId = function() {
	      var fromStr, toStr;
	      fromStr = function(from) {
	        return "" + from.process.id + "() " + (from.port.toUpperCase());
	      };
	      toStr = function(to) {
	        return "" + (to.port.toUpperCase()) + " " + to.process.id + "()";
	      };
	      if (!(this.from || this.to)) {
	        return "UNDEFINED";
	      }
	      if (this.from && !this.to) {
	        return "" + (fromStr(this.from)) + " -> ANON";
	      }
	      if (!this.from) {
	        return "DATA -> " + (toStr(this.to));
	      }
	      return "" + (fromStr(this.from)) + " -> " + (toStr(this.to));
	    };

	    InternalSocket.prototype.legacyToIp = function(event, payload) {
	      if (IP.isIP(payload)) {
	        return payload;
	      }
	      switch (event) {
	        case 'connect':
	        case 'begingroup':
	          return new IP('openBracket', payload);
	        case 'disconnect':
	        case 'endgroup':
	          return new IP('closeBracket');
	        default:
	          return new IP('data', payload);
	      }
	    };

	    InternalSocket.prototype.ipToLegacy = function(ip) {
	      var legacy;
	      switch (ip.type) {
	        case 'openBracket':
	          if (this.brackets.length === 1) {
	            return legacy = {
	              event: 'connect',
	              payload: this
	            };
	          }
	          return legacy = {
	            event: 'begingroup',
	            payload: ip.data
	          };
	        case 'data':
	          return legacy = {
	            event: 'data',
	            payload: ip.data
	          };
	        case 'closeBracket':
	          if (this.brackets.length === 0) {
	            return legacy = {
	              event: 'disconnect',
	              payload: this
	            };
	          }
	          return legacy = {
	            event: 'endgroup',
	            payload: ip.data
	          };
	      }
	    };

	    InternalSocket.prototype.handleSocketEvent = function(event, payload, autoConnect) {
	      var ip, legacyEvent;
	      if (autoConnect == null) {
	        autoConnect = true;
	      }
	      ip = this.legacyToIp(event, payload);
	      if (ip.type === 'data' && this.brackets.length === 0 && autoConnect) {
	        this.handleSocketEvent('connect', null);
	      }
	      if (ip.type === 'openBracket') {
	        if (ip.data === null) {
	          if (this.brackets.length) {
	            return;
	          }
	        } else {
	          if (this.brackets.length === 0 && autoConnect) {
	            this.handleSocketEvent('connect', null);
	          }
	        }
	        this.brackets.push(ip.data);
	      }
	      if (ip.type === 'closeBracket') {
	        if (this.brackets.length === 0) {
	          return;
	        }
	        ip.data = this.brackets.pop();
	      }
	      this.emitEvent('ip', ip);
	      if (!(ip && ip.type)) {
	        return;
	      }
	      legacyEvent = this.ipToLegacy(ip);
	      return this.emitEvent(legacyEvent.event, legacyEvent.payload);
	    };

	    return InternalSocket;

	  })(EventEmitter);

	  exports.InternalSocket = InternalSocket;

	  exports.createSocket = function() {
	    return new InternalSocket;
	  };

	}).call(this);


/***/ },
/* 14 */
/***/ function(module, exports) {

	(function() {
	  var IP;

	  module.exports = IP = (function() {
	    IP.types = ['data', 'openBracket', 'closeBracket'];

	    IP.isIP = function(obj) {
	      return obj && typeof obj === 'object' && obj.type && this.types.indexOf(obj.type) > -1;
	    };

	    function IP(type, data, options) {
	      var key, val;
	      this.type = type != null ? type : 'data';
	      this.data = data != null ? data : null;
	      if (options == null) {
	        options = {};
	      }
	      this.groups = [];
	      this.scope = null;
	      this.owner = null;
	      this.clonable = false;
	      this.index = null;
	      for (key in options) {
	        val = options[key];
	        this[key] = val;
	      }
	    }

	    IP.prototype.clone = function() {
	      var ip, key, val;
	      ip = new IP(this.type);
	      for (key in this) {
	        val = this[key];
	        if (['owner'].indexOf(key) !== -1) {
	          continue;
	        }
	        if (val === null) {
	          continue;
	        }
	        if (typeof val === 'object') {
	          ip[key] = JSON.parse(JSON.stringify(val));
	        } else {
	          ip[key] = val;
	        }
	      }
	      return ip;
	    };

	    IP.prototype.move = function(owner) {
	      this.owner = owner;
	    };

	    IP.prototype.drop = function() {
	      var key, val, _results;
	      _results = [];
	      for (key in this) {
	        val = this[key];
	        _results.push(delete this[key]);
	      }
	      return _results;
	    };

	    return IP;

	  })();

	}).call(this);


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function() {
	  var ComponentLoader, EventEmitter, internalSocket, nofloGraph, registerLoader,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  internalSocket = __webpack_require__(13);

	  nofloGraph = __webpack_require__(2);

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  registerLoader = __webpack_require__(16);

	  ComponentLoader = (function(_super) {
	    __extends(ComponentLoader, _super);

	    function ComponentLoader(baseDir, options) {
	      this.baseDir = baseDir;
	      this.options = options != null ? options : {};
	      this.components = null;
	      this.libraryIcons = {};
	      this.processing = false;
	      this.ready = false;
	      if (typeof this.setMaxListeners === 'function') {
	        this.setMaxListeners(0);
	      }
	    }

	    ComponentLoader.prototype.getModulePrefix = function(name) {
	      if (!name) {
	        return '';
	      }
	      if (name === 'noflo') {
	        return '';
	      }
	      if (name[0] === '@') {
	        name = name.replace(/\@[a-z\-]+\//, '');
	      }
	      return name.replace('noflo-', '');
	    };

	    ComponentLoader.prototype.listComponents = function(callback) {
	      if (this.processing) {
	        this.once('ready', (function(_this) {
	          return function() {
	            return callback(null, _this.components);
	          };
	        })(this));
	        return;
	      }
	      if (this.components) {
	        return callback(null, this.components);
	      }
	      this.ready = false;
	      this.processing = true;
	      this.components = {};
	      return registerLoader.register(this, (function(_this) {
	        return function(err) {
	          if (err) {
	            if (callback) {
	              return callback(err);
	            }
	            throw err;
	          }
	          _this.processing = false;
	          _this.ready = true;
	          _this.emit('ready', true);
	          if (callback) {
	            return callback(null, _this.components);
	          }
	        };
	      })(this));
	    };

	    ComponentLoader.prototype.load = function(name, callback, metadata) {
	      var component, componentName;
	      if (!this.ready) {
	        this.listComponents((function(_this) {
	          return function(err) {
	            if (err) {
	              return callback(err);
	            }
	            return _this.load(name, callback, metadata);
	          };
	        })(this));
	        return;
	      }
	      component = this.components[name];
	      if (!component) {
	        for (componentName in this.components) {
	          if (componentName.split('/')[1] === name) {
	            component = this.components[componentName];
	            break;
	          }
	        }
	        if (!component) {
	          callback(new Error("Component " + name + " not available with base " + this.baseDir));
	          return;
	        }
	      }
	      if (this.isGraph(component)) {
	        if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
	          process.nextTick((function(_this) {
	            return function() {
	              return _this.loadGraph(name, component, callback, metadata);
	            };
	          })(this));
	        } else {
	          setTimeout((function(_this) {
	            return function() {
	              return _this.loadGraph(name, component, callback, metadata);
	            };
	          })(this), 0);
	        }
	        return;
	      }
	      return this.createComponent(name, component, metadata, (function(_this) {
	        return function(err, instance) {
	          if (err) {
	            return callback(err);
	          }
	          if (!instance) {
	            callback(new Error("Component " + name + " could not be loaded."));
	            return;
	          }
	          if (name === 'Graph') {
	            instance.baseDir = _this.baseDir;
	          }
	          _this.setIcon(name, instance);
	          return callback(null, instance);
	        };
	      })(this));
	    };

	    ComponentLoader.prototype.createComponent = function(name, component, metadata, callback) {
	      var implementation, instance;
	      implementation = component;
	      if (!implementation) {
	        return callback(new Error("Component " + name + " not available"));
	      }
	      if (typeof implementation === 'string') {
	        if (typeof registerLoader.dynamicLoad === 'function') {
	          registerLoader.dynamicLoad(name, implementation, metadata, callback);
	          return;
	        }
	        return callback(Error("Dynamic loading of " + implementation + " for component " + name + " not available on this platform."));
	      }
	      if (typeof implementation.getComponent === 'function') {
	        instance = implementation.getComponent(metadata);
	      } else if (typeof implementation === 'function') {
	        instance = implementation(metadata);
	      } else {
	        callback(new Error("Invalid type " + (typeof implementation) + " for component " + name + "."));
	        return;
	      }
	      if (typeof name === 'string') {
	        instance.componentName = name;
	      }
	      return callback(null, instance);
	    };

	    ComponentLoader.prototype.isGraph = function(cPath) {
	      if (typeof cPath === 'object' && cPath instanceof nofloGraph.Graph) {
	        return true;
	      }
	      if (typeof cPath === 'object' && cPath.processes && cPath.connections) {
	        return true;
	      }
	      if (typeof cPath !== 'string') {
	        return false;
	      }
	      return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;
	    };

	    ComponentLoader.prototype.loadGraph = function(name, component, callback, metadata) {
	      return this.createComponent(name, this.components['Graph'], metadata, (function(_this) {
	        return function(err, graph) {
	          var graphSocket;
	          if (err) {
	            return callback(err);
	          }
	          graphSocket = internalSocket.createSocket();
	          graph.loader = _this;
	          graph.baseDir = _this.baseDir;
	          graph.inPorts.graph.attach(graphSocket);
	          graphSocket.send(component);
	          graphSocket.disconnect();
	          graph.inPorts.remove('graph');
	          _this.setIcon(name, graph);
	          return callback(null, graph);
	        };
	      })(this));
	    };

	    ComponentLoader.prototype.setIcon = function(name, instance) {
	      var componentName, library, _ref;
	      if (!instance.getIcon || instance.getIcon()) {
	        return;
	      }
	      _ref = name.split('/'), library = _ref[0], componentName = _ref[1];
	      if (componentName && this.getLibraryIcon(library)) {
	        instance.setIcon(this.getLibraryIcon(library));
	        return;
	      }
	      if (instance.isSubgraph()) {
	        instance.setIcon('sitemap');
	        return;
	      }
	      instance.setIcon('square');
	    };

	    ComponentLoader.prototype.getLibraryIcon = function(prefix) {
	      if (this.libraryIcons[prefix]) {
	        return this.libraryIcons[prefix];
	      }
	      return null;
	    };

	    ComponentLoader.prototype.setLibraryIcon = function(prefix, icon) {
	      return this.libraryIcons[prefix] = icon;
	    };

	    ComponentLoader.prototype.normalizeName = function(packageId, name) {
	      var fullName, prefix;
	      prefix = this.getModulePrefix(packageId);
	      fullName = "" + prefix + "/" + name;
	      if (!packageId) {
	        fullName = name;
	      }
	      return fullName;
	    };

	    ComponentLoader.prototype.registerComponent = function(packageId, name, cPath, callback) {
	      var fullName;
	      fullName = this.normalizeName(packageId, name);
	      this.components[fullName] = cPath;
	      if (callback) {
	        return callback();
	      }
	    };

	    ComponentLoader.prototype.registerGraph = function(packageId, name, gPath, callback) {
	      return this.registerComponent(packageId, name, gPath, callback);
	    };

	    ComponentLoader.prototype.registerLoader = function(loader, callback) {
	      return loader(this, callback);
	    };

	    ComponentLoader.prototype.setSource = function(packageId, name, source, language, callback) {
	      if (!registerLoader.setSource) {
	        return callback(new Error('setSource not allowed'));
	      }
	      if (!this.ready) {
	        this.listComponents((function(_this) {
	          return function(err) {
	            if (err) {
	              return callback(err);
	            }
	            return _this.setSource(packageId, name, source, language, callback);
	          };
	        })(this));
	        return;
	      }
	      return registerLoader.setSource(this, packageId, name, source, language, callback);
	    };

	    ComponentLoader.prototype.getSource = function(name, callback) {
	      if (!registerLoader.getSource) {
	        return callback(new Error('getSource not allowed'));
	      }
	      if (!this.ready) {
	        this.listComponents((function(_this) {
	          return function(err) {
	            if (err) {
	              return callback(err);
	            }
	            return _this.getSource(name, callback);
	          };
	        })(this));
	        return;
	      }
	      return registerLoader.getSource(this, name, callback);
	    };

	    ComponentLoader.prototype.clear = function() {
	      this.components = null;
	      this.ready = false;
	      return this.processing = false;
	    };

	    return ComponentLoader;

	  })(EventEmitter);

	  exports.ComponentLoader = ComponentLoader;

	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var registerCustomLoaders = function (loader, loaders, callback) {
	  if (!loaders.length) {
	    return callback();
	  }
	  var customLoader = loaders.shift();
	  loader.registerLoader(customLoader, function (err) {
	    if (err) {
	      return callback(err);
	    }
	    registerCustomLoaders(loader, loaders, callback);
	  });
	};

	exports.register = function (loader, callback) {
	  var components = {
	    'Graph': __webpack_require__(17)
	  };
	  var loaders = [

	  ];
	  var names = Object.keys(components);

	  names.forEach(function (fullname) {
	    var mod = components[fullname];
	    var tok = fullname.split('/');
	    if (tok.length == 2) {
	      var modulename = tok[0];
	      var componentname = tok[1];
	      loader.registerComponent(modulename, componentname, mod);
	    } else {
	      loader.registerComponent(null, fullname, mod);
	    }
	  });

	  if (!loaders.length) {
	    return callback();
	  }

	  registerCustomLoaders(loader, loaders, callback);
	};



/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function() {
	  var Graph, noflo,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  noflo = __webpack_require__(1);

	  Graph = (function(_super) {
	    __extends(Graph, _super);

	    function Graph(metadata) {
	      this.metadata = metadata;
	      this.network = null;
	      this.ready = true;
	      this.started = false;
	      this.baseDir = null;
	      this.loader = null;
	      this.inPorts = new noflo.InPorts({
	        graph: {
	          datatype: 'all',
	          description: 'NoFlo graph definition to be used with the subgraph component',
	          required: true,
	          immediate: true
	        }
	      });
	      this.outPorts = new noflo.OutPorts;
	      this.inPorts.on('graph', 'data', (function(_this) {
	        return function(data) {
	          return _this.setGraph(data);
	        };
	      })(this));
	    }

	    Graph.prototype.setGraph = function(graph) {
	      this.ready = false;
	      if (typeof graph === 'object') {
	        if (typeof graph.addNode === 'function') {
	          return this.createNetwork(graph, (function(_this) {
	            return function(err) {
	              if (err) {
	                return _this.error(err);
	              }
	            };
	          })(this));
	        }
	        noflo.graph.loadJSON(graph, (function(_this) {
	          return function(err, instance) {
	            if (err) {
	              return _this.error(err);
	            }
	            instance.baseDir = _this.baseDir;
	            return _this.createNetwork(instance, function(err) {
	              if (err) {
	                return _this.error(err);
	              }
	            });
	          };
	        })(this));
	        return;
	      }
	      if (graph.substr(0, 1) !== "/" && graph.substr(1, 1) !== ":" && process && process.cwd) {
	        graph = "" + (process.cwd()) + "/" + graph;
	      }
	      return graph = noflo.graph.loadFile(graph, (function(_this) {
	        return function(err, instance) {
	          if (err) {
	            return _this.error(err);
	          }
	          instance.baseDir = _this.baseDir;
	          return _this.createNetwork(instance, function(err) {
	            if (err) {
	              return _this.error(err);
	            }
	          });
	        };
	      })(this));
	    };

	    Graph.prototype.createNetwork = function(graph) {
	      this.description = graph.properties.description || '';
	      this.icon = graph.properties.icon || this.icon;
	      graph.componentLoader = this.loader;
	      return noflo.createNetwork(graph, (function(_this) {
	        return function(err, network) {
	          _this.network = network;
	          if (err) {
	            return _this.error(err);
	          }
	          _this.emit('network', _this.network);
	          return _this.network.connect(function(err) {
	            var name, notReady, process, _ref;
	            if (err) {
	              return _this.error(err);
	            }
	            notReady = false;
	            _ref = _this.network.processes;
	            for (name in _ref) {
	              process = _ref[name];
	              if (!_this.checkComponent(name, process)) {
	                notReady = true;
	              }
	            }
	            if (!notReady) {
	              return _this.setToReady();
	            }
	          });
	        };
	      })(this), true);
	    };

	    Graph.prototype.start = function() {
	      if (!this.isReady()) {
	        this.on('ready', (function(_this) {
	          return function() {
	            return _this.start();
	          };
	        })(this));
	        return;
	      }
	      if (!this.network) {
	        return;
	      }
	      this.started = true;
	      return this.network.start();
	    };

	    Graph.prototype.checkComponent = function(name, process) {
	      if (!process.component.isReady()) {
	        process.component.once("ready", (function(_this) {
	          return function() {
	            _this.checkComponent(name, process);
	            return _this.setToReady();
	          };
	        })(this));
	        return false;
	      }
	      this.findEdgePorts(name, process);
	      return true;
	    };

	    Graph.prototype.isExportedInport = function(port, nodeName, portName) {
	      var exported, priv, pub, _i, _len, _ref, _ref1;
	      _ref = this.network.graph.inports;
	      for (pub in _ref) {
	        priv = _ref[pub];
	        if (!(priv.process === nodeName && priv.port === portName)) {
	          continue;
	        }
	        return pub;
	      }
	      _ref1 = this.network.graph.exports;
	      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	        exported = _ref1[_i];
	        if (!(exported.process === nodeName && exported.port === portName)) {
	          continue;
	        }
	        this.network.graph.checkTransactionStart();
	        this.network.graph.removeExport(exported["public"]);
	        this.network.graph.addInport(exported["public"], exported.process, exported.port, exported.metadata);
	        this.network.graph.checkTransactionEnd();
	        return exported["public"];
	      }
	      return false;
	    };

	    Graph.prototype.isExportedOutport = function(port, nodeName, portName) {
	      var exported, priv, pub, _i, _len, _ref, _ref1;
	      _ref = this.network.graph.outports;
	      for (pub in _ref) {
	        priv = _ref[pub];
	        if (!(priv.process === nodeName && priv.port === portName)) {
	          continue;
	        }
	        return pub;
	      }
	      _ref1 = this.network.graph.exports;
	      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	        exported = _ref1[_i];
	        if (!(exported.process === nodeName && exported.port === portName)) {
	          continue;
	        }
	        this.network.graph.checkTransactionStart();
	        this.network.graph.removeExport(exported["public"]);
	        this.network.graph.addOutport(exported["public"], exported.process, exported.port, exported.metadata);
	        this.network.graph.checkTransactionEnd();
	        return exported["public"];
	      }
	      return false;
	    };

	    Graph.prototype.setToReady = function() {
	      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
	        return process.nextTick((function(_this) {
	          return function() {
	            _this.ready = true;
	            return _this.emit('ready');
	          };
	        })(this));
	      } else {
	        return setTimeout((function(_this) {
	          return function() {
	            _this.ready = true;
	            return _this.emit('ready');
	          };
	        })(this), 0);
	      }
	    };

	    Graph.prototype.findEdgePorts = function(name, process) {
	      var port, portName, targetPortName, _ref, _ref1;
	      _ref = process.component.inPorts;
	      for (portName in _ref) {
	        port = _ref[portName];
	        if (!port || typeof port === 'function' || !port.canAttach) {
	          continue;
	        }
	        targetPortName = this.isExportedInport(port, name, portName);
	        if (targetPortName === false) {
	          continue;
	        }
	        this.inPorts.add(targetPortName, port);
	        this.inPorts[targetPortName].once('connect', (function(_this) {
	          return function() {
	            if (_this.isStarted()) {
	              return;
	            }
	            return _this.start();
	          };
	        })(this));
	      }
	      _ref1 = process.component.outPorts;
	      for (portName in _ref1) {
	        port = _ref1[portName];
	        if (!port || typeof port === 'function' || !port.canAttach) {
	          continue;
	        }
	        targetPortName = this.isExportedOutport(port, name, portName);
	        if (targetPortName === false) {
	          continue;
	        }
	        this.outPorts.add(targetPortName, port);
	      }
	      return true;
	    };

	    Graph.prototype.isReady = function() {
	      return this.ready;
	    };

	    Graph.prototype.isSubgraph = function() {
	      return true;
	    };

	    Graph.prototype.shutdown = function() {
	      if (!this.network) {
	        return;
	      }
	      return this.network.stop();
	    };

	    return Graph;

	  })(noflo.Component);

	  exports.getComponent = function(metadata) {
	    return new Graph(metadata);
	  };

	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var Component, EventEmitter, IP, PortBuffer, ProcessInput, ProcessOutput, ports,
	    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    __slice = [].slice;

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  ports = __webpack_require__(19);

	  IP = __webpack_require__(14);

	  Component = (function(_super) {
	    __extends(Component, _super);

	    Component.prototype.description = '';

	    Component.prototype.icon = null;

	    function Component(options) {
	      this.error = __bind(this.error, this);
	      var _ref, _ref1, _ref2;
	      if (!options) {
	        options = {};
	      }
	      if (!options.inPorts) {
	        options.inPorts = {};
	      }
	      if (options.inPorts instanceof ports.InPorts) {
	        this.inPorts = options.inPorts;
	      } else {
	        this.inPorts = new ports.InPorts(options.inPorts);
	      }
	      if (!options.outPorts) {
	        options.outPorts = {};
	      }
	      if (options.outPorts instanceof ports.OutPorts) {
	        this.outPorts = options.outPorts;
	      } else {
	        this.outPorts = new ports.OutPorts(options.outPorts);
	      }
	      if (options.icon) {
	        this.icon = options.icon;
	      }
	      if (options.description) {
	        this.description = options.description;
	      }
	      this.started = false;
	      this.load = 0;
	      this.ordered = (_ref = options.ordered) != null ? _ref : false;
	      this.autoOrdering = (_ref1 = options.autoOrdering) != null ? _ref1 : null;
	      this.outputQ = [];
	      this.activateOnInput = (_ref2 = options.activateOnInput) != null ? _ref2 : true;
	      this.forwardBrackets = {
	        "in": ['out', 'error']
	      };
	      this.bracketCounter = {};
	      if ('forwardBrackets' in options) {
	        this.forwardBrackets = options.forwardBrackets;
	      }
	      if (typeof options.process === 'function') {
	        this.process(options.process);
	      }
	    }

	    Component.prototype.getDescription = function() {
	      return this.description;
	    };

	    Component.prototype.isReady = function() {
	      return true;
	    };

	    Component.prototype.isSubgraph = function() {
	      return false;
	    };

	    Component.prototype.setIcon = function(icon) {
	      this.icon = icon;
	      return this.emit('icon', this.icon);
	    };

	    Component.prototype.getIcon = function() {
	      return this.icon;
	    };

	    Component.prototype.error = function(e, groups, errorPort) {
	      var group, _i, _j, _len, _len1;
	      if (groups == null) {
	        groups = [];
	      }
	      if (errorPort == null) {
	        errorPort = 'error';
	      }
	      if (this.outPorts[errorPort] && (this.outPorts[errorPort].isAttached() || !this.outPorts[errorPort].isRequired())) {
	        for (_i = 0, _len = groups.length; _i < _len; _i++) {
	          group = groups[_i];
	          this.outPorts[errorPort].beginGroup(group);
	        }
	        this.outPorts[errorPort].send(e);
	        for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
	          group = groups[_j];
	          this.outPorts[errorPort].endGroup();
	        }
	        this.outPorts[errorPort].disconnect();
	        return;
	      }
	      throw e;
	    };

	    Component.prototype.shutdown = function() {
	      return this.started = false;
	    };

	    Component.prototype.start = function() {
	      this.started = true;
	      return this.started;
	    };

	    Component.prototype.isStarted = function() {
	      return this.started;
	    };

	    Component.prototype.prepareForwarding = function() {
	      var inPort, outPort, outPorts, tmp, _i, _len, _ref, _results;
	      _ref = this.forwardBrackets;
	      _results = [];
	      for (inPort in _ref) {
	        outPorts = _ref[inPort];
	        if (!(inPort in this.inPorts.ports)) {
	          delete this.forwardBrackets[inPort];
	          continue;
	        }
	        tmp = [];
	        for (_i = 0, _len = outPorts.length; _i < _len; _i++) {
	          outPort = outPorts[_i];
	          if (outPort in this.outPorts.ports) {
	            tmp.push(outPort);
	          }
	        }
	        if (tmp.length === 0) {
	          _results.push(delete this.forwardBrackets[inPort]);
	        } else {
	          this.forwardBrackets[inPort] = tmp;
	          _results.push(this.bracketCounter[inPort] = 0);
	        }
	      }
	      return _results;
	    };

	    Component.prototype.process = function(handle) {
	      var name, port, _fn, _ref;
	      if (typeof handle !== 'function') {
	        throw new Error("Process handler must be a function");
	      }
	      if (!this.inPorts) {
	        throw new Error("Component ports must be defined before process function");
	      }
	      this.prepareForwarding();
	      this.handle = handle;
	      _ref = this.inPorts.ports;
	      _fn = (function(_this) {
	        return function(name, port) {
	          if (!port.name) {
	            port.name = name;
	          }
	          return port.on('ip', function(ip) {
	            return _this.handleIP(ip, port);
	          });
	        };
	      })(this);
	      for (name in _ref) {
	        port = _ref[name];
	        _fn(name, port);
	      }
	      return this;
	    };

	    Component.prototype.handleIP = function(ip, port) {
	      var input, outPort, output, outputEntry, result, _i, _len, _ref;
	      if (ip.type === 'openBracket') {
	        if (this.autoOrdering === null) {
	          this.autoOrdering = true;
	        }
	        this.bracketCounter[port.name]++;
	      }
	      if (port.name in this.forwardBrackets && (ip.type === 'openBracket' || ip.type === 'closeBracket')) {
	        outputEntry = {
	          __resolved: true,
	          __forwarded: true,
	          __type: ip.type,
	          __scope: ip.scope
	        };
	        _ref = this.forwardBrackets[port.name];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          outPort = _ref[_i];
	          if (!(outPort in outputEntry)) {
	            outputEntry[outPort] = [];
	          }
	          outputEntry[outPort].push(ip);
	        }
	        port.buffer.pop();
	        this.outputQ.push(outputEntry);
	        this.processOutputQueue();
	        return;
	      }
	      if (!port.options.triggering) {
	        return;
	      }
	      result = {};
	      input = new ProcessInput(this.inPorts, ip, this, port, result);
	      output = new ProcessOutput(this.outPorts, ip, this, result);
	      this.load++;
	      return this.handle(input, output, function() {
	        return output.done();
	      });
	    };

	    Component.prototype.processOutputQueue = function() {
	      var bracketsClosed, ip, ips, name, port, result, _i, _len, _ref;
	      while (this.outputQ.length > 0) {
	        result = this.outputQ[0];
	        if (!result.__resolved) {
	          break;
	        }
	        for (port in result) {
	          ips = result[port];
	          if (port.indexOf('__') === 0) {
	            continue;
	          }
	          if (!this.outPorts.ports[port].isAttached()) {
	            continue;
	          }
	          for (_i = 0, _len = ips.length; _i < _len; _i++) {
	            ip = ips[_i];
	            if (ip.type === 'closeBracket') {
	              this.bracketCounter[port]--;
	            }
	            this.outPorts[port].sendIP(ip);
	          }
	        }
	        this.outputQ.shift();
	      }
	      bracketsClosed = true;
	      _ref = this.outPorts.ports;
	      for (name in _ref) {
	        port = _ref[name];
	        if (this.bracketCounter[port] !== 0) {
	          bracketsClosed = false;
	          break;
	        }
	      }
	      if (bracketsClosed && this.autoOrdering === true) {
	        return this.autoOrdering = null;
	      }
	    };

	    return Component;

	  })(EventEmitter);

	  exports.Component = Component;

	  ProcessInput = (function() {
	    function ProcessInput(ports, ip, nodeInstance, port, result) {
	      this.ports = ports;
	      this.ip = ip;
	      this.nodeInstance = nodeInstance;
	      this.port = port;
	      this.result = result;
	      this.scope = this.ip.scope;
	      this.buffer = new PortBuffer(this);
	    }

	    ProcessInput.prototype.activate = function() {
	      this.result.__resolved = false;
	      if (this.nodeInstance.ordered || this.nodeInstance.autoOrdering) {
	        return this.nodeInstance.outputQ.push(this.result);
	      }
	    };

	    ProcessInput.prototype.has = function() {
	      var args, port, res, validate, _i, _j, _len, _len1;
	      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (!args.length) {
	        args = ['in'];
	      }
	      if (typeof args[args.length - 1] === 'function') {
	        validate = args.pop();
	        for (_i = 0, _len = args.length; _i < _len; _i++) {
	          port = args[_i];
	          if (!this.ports[port].has(this.scope, validate)) {
	            return false;
	          }
	        }
	        return true;
	      }
	      res = true;
	      for (_j = 0, _len1 = args.length; _j < _len1; _j++) {
	        port = args[_j];
	        res && (res = this.ports[port].ready(this.scope));
	      }
	      return res;
	    };

	    ProcessInput.prototype.get = function() {
	      var args, port, res;
	      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (!args.length) {
	        args = ['in'];
	      }
	      if ((this.nodeInstance.ordered || this.nodeInstance.autoOrdering) && this.nodeInstance.activateOnInput && !('__resolved' in this.result)) {
	        this.activate();
	      }
	      res = (function() {
	        var _i, _len, _results;
	        _results = [];
	        for (_i = 0, _len = args.length; _i < _len; _i++) {
	          port = args[_i];
	          _results.push(this.ports[port].get(this.scope));
	        }
	        return _results;
	      }).call(this);
	      if (args.length === 1) {
	        return res[0];
	      } else {
	        return res;
	      }
	    };

	    ProcessInput.prototype.getData = function() {
	      var args, ip, ips, _i, _len, _ref, _ref1, _results;
	      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
	      if (!args.length) {
	        args = ['in'];
	      }
	      ips = this.get.apply(this, args);
	      if (args.length === 1) {
	        return (_ref = ips != null ? ips.data : void 0) != null ? _ref : void 0;
	      }
	      _results = [];
	      for (_i = 0, _len = ips.length; _i < _len; _i++) {
	        ip = ips[_i];
	        _results.push((_ref1 = ip != null ? ip.data : void 0) != null ? _ref1 : void 0);
	      }
	      return _results;
	    };

	    return ProcessInput;

	  })();

	  PortBuffer = (function() {
	    function PortBuffer(context) {
	      this.context = context;
	    }

	    PortBuffer.prototype.set = function(name, buffer) {
	      if ((name != null) && typeof name !== 'string') {
	        buffer = name;
	        name = null;
	      }
	      if (this.context.scope != null) {
	        if (name != null) {
	          this.context.ports[name].scopedBuffer[this.context.scope] = buffer;
	          return this.context.ports[name].scopedBuffer[this.context.scope];
	        }
	        this.context.port.scopedBuffer[this.context.scope] = buffer;
	        return this.context.port.scopedBuffer[this.context.scope];
	      }
	      if (name != null) {
	        this.context.ports[name].buffer = buffer;
	        return this.context.ports[name].buffer;
	      }
	      this.context.port.buffer = buffer;
	      return this.context.port.buffer;
	    };

	    PortBuffer.prototype.get = function(name) {
	      if (name == null) {
	        name = null;
	      }
	      if (this.context.scope != null) {
	        if (name != null) {
	          return this.context.ports[name].scopedBuffer[this.context.scope];
	        }
	        return this.context.port.scopedBuffer[this.context.scope];
	      }
	      if (name != null) {
	        return this.context.ports[name].buffer;
	      }
	      return this.context.port.buffer;
	    };

	    PortBuffer.prototype.find = function(name, cb) {
	      var b;
	      b = this.get(name);
	      return b.filter(cb);
	    };

	    PortBuffer.prototype.filter = function(name, cb) {
	      var b;
	      if ((name != null) && typeof name !== 'string') {
	        cb = name;
	        name = null;
	      }
	      b = this.get(name);
	      b = b.filter(cb);
	      return this.set(name, b);
	    };

	    return PortBuffer;

	  })();

	  ProcessOutput = (function() {
	    function ProcessOutput(ports, ip, nodeInstance, result) {
	      this.ports = ports;
	      this.ip = ip;
	      this.nodeInstance = nodeInstance;
	      this.result = result;
	      this.scope = this.ip.scope;
	    }

	    ProcessOutput.prototype.activate = function() {
	      this.result.__resolved = false;
	      if (this.nodeInstance.ordered || this.nodeInstance.autoOrdering) {
	        return this.nodeInstance.outputQ.push(this.result);
	      }
	    };

	    ProcessOutput.prototype.isError = function(err) {
	      return err instanceof Error || Array.isArray(err) && err.length > 0 && err[0] instanceof Error;
	    };

	    ProcessOutput.prototype.error = function(err) {
	      var e, multiple, _i, _j, _len, _len1, _results;
	      multiple = Array.isArray(err);
	      if (!multiple) {
	        err = [err];
	      }
	      if ('error' in this.ports && (this.ports.error.isAttached() || !this.ports.error.isRequired())) {
	        if (multiple) {
	          this.sendIP('error', new IP('openBracket'));
	        }
	        for (_i = 0, _len = err.length; _i < _len; _i++) {
	          e = err[_i];
	          this.sendIP('error', e);
	        }
	        if (multiple) {
	          return this.sendIP('error', new IP('closeBracket'));
	        }
	      } else {
	        _results = [];
	        for (_j = 0, _len1 = err.length; _j < _len1; _j++) {
	          e = err[_j];
	          throw e;
	        }
	        return _results;
	      }
	    };

	    ProcessOutput.prototype.sendIP = function(port, packet) {
	      var ip;
	      if (typeof packet !== 'object' || IP.types.indexOf(packet.type) === -1) {
	        ip = new IP('data', packet);
	      } else {
	        ip = packet;
	      }
	      if (this.scope !== null && ip.scope === null) {
	        ip.scope = this.scope;
	      }
	      if (this.nodeInstance.ordered || this.nodeInstance.autoOrdering) {
	        if (!(port in this.result)) {
	          this.result[port] = [];
	        }
	        return this.result[port].push(ip);
	      } else {
	        return this.nodeInstance.outPorts[port].sendIP(ip);
	      }
	    };

	    ProcessOutput.prototype.send = function(outputMap) {
	      var componentPorts, mapIsInPorts, packet, port, _i, _len, _ref, _results;
	      if ((this.nodeInstance.ordered || this.nodeInstance.autoOrdering) && !('__resolved' in this.result)) {
	        this.activate();
	      }
	      if (this.isError(outputMap)) {
	        return this.error(outputMap);
	      }
	      componentPorts = [];
	      mapIsInPorts = false;
	      _ref = Object.keys(this.ports.ports);
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        port = _ref[_i];
	        if (port !== 'error' && port !== 'ports' && port !== '_callbacks') {
	          componentPorts.push(port);
	        }
	        if (!mapIsInPorts && typeof outputMap === 'object' && Object.keys(outputMap).indexOf(port) !== -1) {
	          mapIsInPorts = true;
	        }
	      }
	      if (componentPorts.length === 1 && !mapIsInPorts) {
	        this.sendIP(componentPorts[0], outputMap);
	        return;
	      }
	      _results = [];
	      for (port in outputMap) {
	        packet = outputMap[port];
	        _results.push(this.sendIP(port, packet));
	      }
	      return _results;
	    };

	    ProcessOutput.prototype.sendDone = function(outputMap) {
	      this.send(outputMap);
	      return this.done();
	    };

	    ProcessOutput.prototype.pass = function(data, options) {
	      var key, val;
	      if (options == null) {
	        options = {};
	      }
	      if (!('out' in this.ports)) {
	        throw new Error('output.pass() requires port "out" to be present');
	      }
	      for (key in options) {
	        val = options[key];
	        this.ip[key] = val;
	      }
	      this.ip.data = data;
	      this.sendIP('out', this.ip);
	      return this.done();
	    };

	    ProcessOutput.prototype.done = function(error) {
	      if (error) {
	        this.error(error);
	      }
	      if (this.nodeInstance.ordered || this.nodeInstance.autoOrdering) {
	        this.result.__resolved = true;
	        this.nodeInstance.processOutputQueue();
	      }
	      return this.nodeInstance.load--;
	    };

	    return ProcessOutput;

	  })();

	}).call(this);


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var EventEmitter, InPort, InPorts, OutPort, OutPorts, Ports,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  InPort = __webpack_require__(20);

	  OutPort = __webpack_require__(22);

	  Ports = (function(_super) {
	    __extends(Ports, _super);

	    Ports.prototype.model = InPort;

	    function Ports(ports) {
	      var name, options;
	      this.ports = {};
	      if (!ports) {
	        return;
	      }
	      for (name in ports) {
	        options = ports[name];
	        this.add(name, options);
	      }
	    }

	    Ports.prototype.add = function(name, options, process) {
	      if (name === 'add' || name === 'remove') {
	        throw new Error('Add and remove are restricted port names');
	      }
	      if (!name.match(/^[a-z0-9_\.\/]+$/)) {
	        throw new Error("Port names can only contain lowercase alphanumeric characters and underscores. '" + name + "' not allowed");
	      }
	      if (this.ports[name]) {
	        this.remove(name);
	      }
	      if (typeof options === 'object' && options.canAttach) {
	        this.ports[name] = options;
	      } else {
	        this.ports[name] = new this.model(options, process);
	      }
	      this[name] = this.ports[name];
	      this.emit('add', name);
	      return this;
	    };

	    Ports.prototype.remove = function(name) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not defined");
	      }
	      delete this.ports[name];
	      delete this[name];
	      this.emit('remove', name);
	      return this;
	    };

	    return Ports;

	  })(EventEmitter);

	  exports.InPorts = InPorts = (function(_super) {
	    __extends(InPorts, _super);

	    function InPorts() {
	      return InPorts.__super__.constructor.apply(this, arguments);
	    }

	    InPorts.prototype.on = function(name, event, callback) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not available");
	      }
	      return this.ports[name].on(event, callback);
	    };

	    InPorts.prototype.once = function(name, event, callback) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not available");
	      }
	      return this.ports[name].once(event, callback);
	    };

	    return InPorts;

	  })(Ports);

	  exports.OutPorts = OutPorts = (function(_super) {
	    __extends(OutPorts, _super);

	    function OutPorts() {
	      return OutPorts.__super__.constructor.apply(this, arguments);
	    }

	    OutPorts.prototype.model = OutPort;

	    OutPorts.prototype.connect = function(name, socketId) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not available");
	      }
	      return this.ports[name].connect(socketId);
	    };

	    OutPorts.prototype.beginGroup = function(name, group, socketId) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not available");
	      }
	      return this.ports[name].beginGroup(group, socketId);
	    };

	    OutPorts.prototype.send = function(name, data, socketId) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not available");
	      }
	      return this.ports[name].send(data, socketId);
	    };

	    OutPorts.prototype.endGroup = function(name, socketId) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not available");
	      }
	      return this.ports[name].endGroup(socketId);
	    };

	    OutPorts.prototype.disconnect = function(name, socketId) {
	      if (!this.ports[name]) {
	        throw new Error("Port " + name + " not available");
	      }
	      return this.ports[name].disconnect(socketId);
	    };

	    return OutPorts;

	  })(Ports);

	}).call(this);


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var BasePort, IP, InPort,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  BasePort = __webpack_require__(21);

	  IP = __webpack_require__(14);

	  InPort = (function(_super) {
	    __extends(InPort, _super);

	    function InPort(options, process) {
	      this.process = null;
	      if (!process && typeof options === 'function') {
	        process = options;
	        options = {};
	      }
	      if (options == null) {
	        options = {};
	      }
	      if (options.buffered == null) {
	        options.buffered = false;
	      }
	      if (options.control == null) {
	        options.control = false;
	      }
	      if (options.triggering == null) {
	        options.triggering = true;
	      }
	      if (!process && options && options.process) {
	        process = options.process;
	        delete options.process;
	      }
	      if (process) {
	        if (typeof process !== 'function') {
	          throw new Error('process must be a function');
	        }
	        this.process = process;
	      }
	      if (options.handle) {
	        if (typeof options.handle !== 'function') {
	          throw new Error('handle must be a function');
	        }
	        this.handle = options.handle;
	        delete options.handle;
	      }
	      InPort.__super__.constructor.call(this, options);
	      this.prepareBuffer();
	    }

	    InPort.prototype.attachSocket = function(socket, localId) {
	      if (localId == null) {
	        localId = null;
	      }
	      if (this.hasDefault()) {
	        if (this.handle) {
	          socket.setDataDelegate((function(_this) {
	            return function() {
	              return new IP('data', _this.options["default"]);
	            };
	          })(this));
	        } else {
	          socket.setDataDelegate((function(_this) {
	            return function() {
	              return _this.options["default"];
	            };
	          })(this));
	        }
	      }
	      socket.on('connect', (function(_this) {
	        return function() {
	          return _this.handleSocketEvent('connect', socket, localId);
	        };
	      })(this));
	      socket.on('begingroup', (function(_this) {
	        return function(group) {
	          return _this.handleSocketEvent('begingroup', group, localId);
	        };
	      })(this));
	      socket.on('data', (function(_this) {
	        return function(data) {
	          _this.validateData(data);
	          return _this.handleSocketEvent('data', data, localId);
	        };
	      })(this));
	      socket.on('endgroup', (function(_this) {
	        return function(group) {
	          return _this.handleSocketEvent('endgroup', group, localId);
	        };
	      })(this));
	      socket.on('disconnect', (function(_this) {
	        return function() {
	          return _this.handleSocketEvent('disconnect', socket, localId);
	        };
	      })(this));
	      return socket.on('ip', (function(_this) {
	        return function(ip) {
	          return _this.handleIP(ip, localId);
	        };
	      })(this));
	    };

	    InPort.prototype.handleIP = function(ip, id) {
	      var buf;
	      if (this.process) {
	        return;
	      }
	      if (this.options.control && ip.type !== 'data') {
	        return;
	      }
	      ip.owner = this.nodeInstance;
	      ip.index = id;
	      if (ip.scope != null) {
	        if (!(ip.scope in this.scopedBuffer)) {
	          this.scopedBuffer[ip.scope] = [];
	        }
	        buf = this.scopedBuffer[ip.scope];
	      } else {
	        buf = this.buffer;
	      }
	      buf.push(ip);
	      if (this.options.control && buf.length > 1) {
	        buf.shift();
	      }
	      if (this.handle) {
	        this.handle(ip, this.nodeInstance);
	      }
	      return this.emit('ip', ip, id);
	    };

	    InPort.prototype.handleSocketEvent = function(event, payload, id) {
	      if (this.isBuffered()) {
	        this.buffer.push({
	          event: event,
	          payload: payload,
	          id: id
	        });
	        if (this.isAddressable()) {
	          if (this.process) {
	            this.process(event, id, this.nodeInstance);
	          }
	          this.emit(event, id);
	        } else {
	          if (this.process) {
	            this.process(event, this.nodeInstance);
	          }
	          this.emit(event);
	        }
	        return;
	      }
	      if (this.process) {
	        if (this.isAddressable()) {
	          this.process(event, payload, id, this.nodeInstance);
	        } else {
	          this.process(event, payload, this.nodeInstance);
	        }
	      }
	      if (this.isAddressable()) {
	        return this.emit(event, payload, id);
	      }
	      return this.emit(event, payload);
	    };

	    InPort.prototype.hasDefault = function() {
	      return this.options["default"] !== void 0;
	    };

	    InPort.prototype.prepareBuffer = function() {
	      this.buffer = [];
	      return this.scopedBuffer = {};
	    };

	    InPort.prototype.validateData = function(data) {
	      if (!this.options.values) {
	        return;
	      }
	      if (this.options.values.indexOf(data) === -1) {
	        throw new Error("Invalid data='" + data + "' received, not in [" + this.options.values + "]");
	      }
	    };

	    InPort.prototype.receive = function() {
	      if (!this.isBuffered()) {
	        throw new Error('Receive is only possible on buffered ports');
	      }
	      return this.buffer.shift();
	    };

	    InPort.prototype.contains = function() {
	      if (!this.isBuffered()) {
	        throw new Error('Contains query is only possible on buffered ports');
	      }
	      return this.buffer.filter(function(packet) {
	        if (packet.event === 'data') {
	          return true;
	        }
	      }).length;
	    };

	    InPort.prototype.get = function(scope) {
	      var buf;
	      if (scope != null) {
	        if (!(scope in this.scopedBuffer)) {
	          return void 0;
	        }
	        buf = this.scopedBuffer[scope];
	      } else {
	        buf = this.buffer;
	      }
	      if (this.options.control) {
	        return buf[buf.length - 1];
	      } else {
	        return buf.shift();
	      }
	    };

	    InPort.prototype.has = function(scope, validate) {
	      var buf, packet;
	      if (scope != null) {
	        if (!(scope in this.scopedBuffer)) {
	          return false;
	        }
	        buf = this.scopedBuffer[scope];
	      } else {
	        if (!this.buffer.length) {
	          return false;
	        }
	        buf = this.buffer;
	      }
	      if ((function() {
	        var _i, _len, _results;
	        _results = [];
	        for (_i = 0, _len = buf.length; _i < _len; _i++) {
	          packet = buf[_i];
	          _results.push(validate(packet));
	        }
	        return _results;
	      })()) {
	        return true;
	      }
	      return false;
	    };

	    InPort.prototype.length = function(scope) {
	      if (scope != null) {
	        if (!(scope in this.scopedBuffer)) {
	          return 0;
	        }
	        return this.scopedBuffer[scope].length;
	      }
	      return this.buffer.length;
	    };

	    InPort.prototype.ready = function(scope) {
	      return this.length(scope) > 0;
	    };

	    return InPort;

	  })(BasePort);

	  module.exports = InPort;

	}).call(this);


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var BasePort, EventEmitter, validTypes,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  validTypes = ['all', 'string', 'number', 'int', 'object', 'array', 'boolean', 'color', 'date', 'bang', 'function', 'buffer', 'stream'];

	  BasePort = (function(_super) {
	    __extends(BasePort, _super);

	    function BasePort(options) {
	      this.handleOptions(options);
	      this.sockets = [];
	      this.node = null;
	      this.name = null;
	    }

	    BasePort.prototype.handleOptions = function(options) {
	      if (!options) {
	        options = {};
	      }
	      if (!options.datatype) {
	        options.datatype = 'all';
	      }
	      if (options.required === void 0) {
	        options.required = false;
	      }
	      if (options.datatype === 'integer') {
	        options.datatype = 'int';
	      }
	      if (validTypes.indexOf(options.datatype) === -1) {
	        throw new Error("Invalid port datatype '" + options.datatype + "' specified, valid are " + (validTypes.join(', ')));
	      }
	      if (options.type && options.type.indexOf('/') === -1) {
	        throw new Error("Invalid port type '" + options.type + "' specified. Should be URL or MIME type");
	      }
	      return this.options = options;
	    };

	    BasePort.prototype.getId = function() {
	      if (!(this.node && this.name)) {
	        return 'Port';
	      }
	      return "" + this.node + " " + (this.name.toUpperCase());
	    };

	    BasePort.prototype.getDataType = function() {
	      return this.options.datatype;
	    };

	    BasePort.prototype.getDescription = function() {
	      return this.options.description;
	    };

	    BasePort.prototype.attach = function(socket, index) {
	      if (index == null) {
	        index = null;
	      }
	      if (!this.isAddressable() || index === null) {
	        index = this.sockets.length;
	      }
	      this.sockets[index] = socket;
	      this.attachSocket(socket, index);
	      if (this.isAddressable()) {
	        this.emit('attach', socket, index);
	        return;
	      }
	      return this.emit('attach', socket);
	    };

	    BasePort.prototype.attachSocket = function() {};

	    BasePort.prototype.detach = function(socket) {
	      var index;
	      index = this.sockets.indexOf(socket);
	      if (index === -1) {
	        return;
	      }
	      this.sockets[index] = void 0;
	      if (this.isAddressable()) {
	        this.emit('detach', socket, index);
	        return;
	      }
	      return this.emit('detach', socket);
	    };

	    BasePort.prototype.isAddressable = function() {
	      if (this.options.addressable) {
	        return true;
	      }
	      return false;
	    };

	    BasePort.prototype.isBuffered = function() {
	      if (this.options.buffered) {
	        return true;
	      }
	      return false;
	    };

	    BasePort.prototype.isRequired = function() {
	      if (this.options.required) {
	        return true;
	      }
	      return false;
	    };

	    BasePort.prototype.isAttached = function(socketId) {
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (this.isAddressable() && socketId !== null) {
	        if (this.sockets[socketId]) {
	          return true;
	        }
	        return false;
	      }
	      if (this.sockets.length) {
	        return true;
	      }
	      return false;
	    };

	    BasePort.prototype.listAttached = function() {
	      var attached, idx, socket, _i, _len, _ref;
	      attached = [];
	      _ref = this.sockets;
	      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
	        socket = _ref[idx];
	        if (!socket) {
	          continue;
	        }
	        attached.push(idx);
	      }
	      return attached;
	    };

	    BasePort.prototype.isConnected = function(socketId) {
	      var connected;
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (this.isAddressable()) {
	        if (socketId === null) {
	          throw new Error("" + (this.getId()) + ": Socket ID required");
	        }
	        if (!this.sockets[socketId]) {
	          throw new Error("" + (this.getId()) + ": Socket " + socketId + " not available");
	        }
	        return this.sockets[socketId].isConnected();
	      }
	      connected = false;
	      this.sockets.forEach((function(_this) {
	        return function(socket) {
	          if (!socket) {
	            return;
	          }
	          if (socket.isConnected()) {
	            return connected = true;
	          }
	        };
	      })(this));
	      return connected;
	    };

	    BasePort.prototype.canAttach = function() {
	      return true;
	    };

	    return BasePort;

	  })(EventEmitter);

	  module.exports = BasePort;

	}).call(this);


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var BasePort, IP, OutPort,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  BasePort = __webpack_require__(21);

	  IP = __webpack_require__(14);

	  OutPort = (function(_super) {
	    __extends(OutPort, _super);

	    function OutPort(options) {
	      this.cache = {};
	      OutPort.__super__.constructor.call(this, options);
	    }

	    OutPort.prototype.attach = function(socket, index) {
	      if (index == null) {
	        index = null;
	      }
	      OutPort.__super__.attach.call(this, socket, index);
	      if (this.isCaching() && (this.cache[index] != null)) {
	        return this.send(this.cache[index], index);
	      }
	    };

	    OutPort.prototype.connect = function(socketId) {
	      var socket, sockets, _i, _len, _results;
	      if (socketId == null) {
	        socketId = null;
	      }
	      sockets = this.getSockets(socketId);
	      this.checkRequired(sockets);
	      _results = [];
	      for (_i = 0, _len = sockets.length; _i < _len; _i++) {
	        socket = sockets[_i];
	        if (!socket) {
	          continue;
	        }
	        _results.push(socket.connect());
	      }
	      return _results;
	    };

	    OutPort.prototype.beginGroup = function(group, socketId) {
	      var sockets;
	      if (socketId == null) {
	        socketId = null;
	      }
	      sockets = this.getSockets(socketId);
	      this.checkRequired(sockets);
	      return sockets.forEach(function(socket) {
	        if (!socket) {
	          return;
	        }
	        return socket.beginGroup(group);
	      });
	    };

	    OutPort.prototype.send = function(data, socketId) {
	      var sockets;
	      if (socketId == null) {
	        socketId = null;
	      }
	      sockets = this.getSockets(socketId);
	      this.checkRequired(sockets);
	      if (this.isCaching() && data !== this.cache[socketId]) {
	        this.cache[socketId] = data;
	      }
	      return sockets.forEach(function(socket) {
	        if (!socket) {
	          return;
	        }
	        return socket.send(data);
	      });
	    };

	    OutPort.prototype.endGroup = function(socketId) {
	      var socket, sockets, _i, _len, _results;
	      if (socketId == null) {
	        socketId = null;
	      }
	      sockets = this.getSockets(socketId);
	      this.checkRequired(sockets);
	      _results = [];
	      for (_i = 0, _len = sockets.length; _i < _len; _i++) {
	        socket = sockets[_i];
	        if (!socket) {
	          continue;
	        }
	        _results.push(socket.endGroup());
	      }
	      return _results;
	    };

	    OutPort.prototype.disconnect = function(socketId) {
	      var socket, sockets, _i, _len, _results;
	      if (socketId == null) {
	        socketId = null;
	      }
	      sockets = this.getSockets(socketId);
	      this.checkRequired(sockets);
	      _results = [];
	      for (_i = 0, _len = sockets.length; _i < _len; _i++) {
	        socket = sockets[_i];
	        if (!socket) {
	          continue;
	        }
	        _results.push(socket.disconnect());
	      }
	      return _results;
	    };

	    OutPort.prototype.sendIP = function(type, data, options, socketId) {
	      var ip, pristine, socket, sockets, _i, _len, _ref;
	      if (IP.isIP(type)) {
	        ip = type;
	        socketId = ip.index;
	      } else {
	        ip = new IP(type, data, options);
	      }
	      sockets = this.getSockets(socketId);
	      this.checkRequired(sockets);
	      if (this.isCaching() && data !== ((_ref = this.cache[socketId]) != null ? _ref.data : void 0)) {
	        this.cache[socketId] = ip;
	      }
	      pristine = true;
	      for (_i = 0, _len = sockets.length; _i < _len; _i++) {
	        socket = sockets[_i];
	        if (!socket) {
	          continue;
	        }
	        if (pristine) {
	          socket.post(ip);
	          pristine = false;
	        } else {
	          socket.post(ip.clonable ? ip.clone() : ip);
	        }
	      }
	      return this;
	    };

	    OutPort.prototype.openBracket = function(data, options, socketId) {
	      if (data == null) {
	        data = null;
	      }
	      if (options == null) {
	        options = {};
	      }
	      if (socketId == null) {
	        socketId = null;
	      }
	      return this.sendIP('openBracket', data, options, socketId);
	    };

	    OutPort.prototype.data = function(data, options, socketId) {
	      if (options == null) {
	        options = {};
	      }
	      if (socketId == null) {
	        socketId = null;
	      }
	      return this.sendIP('data', data, options, socketId);
	    };

	    OutPort.prototype.closeBracket = function(data, options, socketId) {
	      if (data == null) {
	        data = null;
	      }
	      if (options == null) {
	        options = {};
	      }
	      if (socketId == null) {
	        socketId = null;
	      }
	      return this.sendIP('closeBracket', data, options, socketId);
	    };

	    OutPort.prototype.checkRequired = function(sockets) {
	      if (sockets.length === 0 && this.isRequired()) {
	        throw new Error("" + (this.getId()) + ": No connections available");
	      }
	    };

	    OutPort.prototype.getSockets = function(socketId) {
	      if (this.isAddressable()) {
	        if (socketId === null) {
	          throw new Error("" + (this.getId()) + " Socket ID required");
	        }
	        if (!this.sockets[socketId]) {
	          return [];
	        }
	        return [this.sockets[socketId]];
	      }
	      return this.sockets;
	    };

	    OutPort.prototype.isCaching = function() {
	      if (this.options.caching) {
	        return true;
	      }
	      return false;
	    };

	    return OutPort;

	  })(BasePort);

	  module.exports = OutPort;

	}).call(this);


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function() {
	  var AsyncComponent, component, port,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  port = __webpack_require__(24);

	  component = __webpack_require__(18);

	  AsyncComponent = (function(_super) {
	    __extends(AsyncComponent, _super);

	    function AsyncComponent(inPortName, outPortName, errPortName) {
	      this.inPortName = inPortName != null ? inPortName : "in";
	      this.outPortName = outPortName != null ? outPortName : "out";
	      this.errPortName = errPortName != null ? errPortName : "error";
	      if (!this.inPorts[this.inPortName]) {
	        throw new Error("no inPort named '" + this.inPortName + "'");
	      }
	      if (!this.outPorts[this.outPortName]) {
	        throw new Error("no outPort named '" + this.outPortName + "'");
	      }
	      this.load = 0;
	      this.q = [];
	      this.errorGroups = [];
	      this.outPorts.load = new port.Port();
	      this.inPorts[this.inPortName].on("begingroup", (function(_this) {
	        return function(group) {
	          if (_this.load > 0) {
	            return _this.q.push({
	              name: "begingroup",
	              data: group
	            });
	          }
	          _this.errorGroups.push(group);
	          return _this.outPorts[_this.outPortName].beginGroup(group);
	        };
	      })(this));
	      this.inPorts[this.inPortName].on("endgroup", (function(_this) {
	        return function() {
	          if (_this.load > 0) {
	            return _this.q.push({
	              name: "endgroup"
	            });
	          }
	          _this.errorGroups.pop();
	          return _this.outPorts[_this.outPortName].endGroup();
	        };
	      })(this));
	      this.inPorts[this.inPortName].on("disconnect", (function(_this) {
	        return function() {
	          if (_this.load > 0) {
	            return _this.q.push({
	              name: "disconnect"
	            });
	          }
	          _this.outPorts[_this.outPortName].disconnect();
	          _this.errorGroups = [];
	          if (_this.outPorts.load.isAttached()) {
	            return _this.outPorts.load.disconnect();
	          }
	        };
	      })(this));
	      this.inPorts[this.inPortName].on("data", (function(_this) {
	        return function(data) {
	          if (_this.q.length > 0) {
	            return _this.q.push({
	              name: "data",
	              data: data
	            });
	          }
	          return _this.processData(data);
	        };
	      })(this));
	    }

	    AsyncComponent.prototype.processData = function(data) {
	      this.incrementLoad();
	      return this.doAsync(data, (function(_this) {
	        return function(err) {
	          if (err) {
	            _this.error(err, _this.errorGroups, _this.errPortName);
	          }
	          return _this.decrementLoad();
	        };
	      })(this));
	    };

	    AsyncComponent.prototype.incrementLoad = function() {
	      this.load++;
	      if (this.outPorts.load.isAttached()) {
	        this.outPorts.load.send(this.load);
	      }
	      if (this.outPorts.load.isAttached()) {
	        return this.outPorts.load.disconnect();
	      }
	    };

	    AsyncComponent.prototype.doAsync = function(data, callback) {
	      return callback(new Error("AsyncComponents must implement doAsync"));
	    };

	    AsyncComponent.prototype.decrementLoad = function() {
	      if (this.load === 0) {
	        throw new Error("load cannot be negative");
	      }
	      this.load--;
	      if (this.outPorts.load.isAttached()) {
	        this.outPorts.load.send(this.load);
	      }
	      if (this.outPorts.load.isAttached()) {
	        this.outPorts.load.disconnect();
	      }
	      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
	        return process.nextTick((function(_this) {
	          return function() {
	            return _this.processQueue();
	          };
	        })(this));
	      } else {
	        return setTimeout((function(_this) {
	          return function() {
	            return _this.processQueue();
	          };
	        })(this), 0);
	      }
	    };

	    AsyncComponent.prototype.processQueue = function() {
	      var event, processedData;
	      if (this.load > 0) {
	        return;
	      }
	      processedData = false;
	      while (this.q.length > 0) {
	        event = this.q[0];
	        switch (event.name) {
	          case "begingroup":
	            if (processedData) {
	              return;
	            }
	            this.outPorts[this.outPortName].beginGroup(event.data);
	            this.errorGroups.push(event.data);
	            this.q.shift();
	            break;
	          case "endgroup":
	            if (processedData) {
	              return;
	            }
	            this.outPorts[this.outPortName].endGroup();
	            this.errorGroups.pop();
	            this.q.shift();
	            break;
	          case "disconnect":
	            if (processedData) {
	              return;
	            }
	            this.outPorts[this.outPortName].disconnect();
	            if (this.outPorts.load.isAttached()) {
	              this.outPorts.load.disconnect();
	            }
	            this.errorGroups = [];
	            this.q.shift();
	            break;
	          case "data":
	            this.processData(event.data);
	            this.q.shift();
	            processedData = true;
	        }
	      }
	    };

	    AsyncComponent.prototype.shutdown = function() {
	      this.q = [];
	      return this.errorGroups = [];
	    };

	    return AsyncComponent;

	  })(component.Component);

	  exports.AsyncComponent = AsyncComponent;

	}).call(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var EventEmitter, Port,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  EventEmitter = __webpack_require__(3).EventEmitter;

	  Port = (function(_super) {
	    __extends(Port, _super);

	    Port.prototype.description = '';

	    Port.prototype.required = true;

	    function Port(type) {
	      this.type = type;
	      if (!this.type) {
	        this.type = 'all';
	      }
	      if (this.type === 'integer') {
	        this.type = 'int';
	      }
	      this.sockets = [];
	      this.from = null;
	      this.node = null;
	      this.name = null;
	    }

	    Port.prototype.getId = function() {
	      if (!(this.node && this.name)) {
	        return 'Port';
	      }
	      return "" + this.node + " " + (this.name.toUpperCase());
	    };

	    Port.prototype.getDataType = function() {
	      return this.type;
	    };

	    Port.prototype.getDescription = function() {
	      return this.description;
	    };

	    Port.prototype.attach = function(socket) {
	      this.sockets.push(socket);
	      return this.attachSocket(socket);
	    };

	    Port.prototype.attachSocket = function(socket, localId) {
	      if (localId == null) {
	        localId = null;
	      }
	      this.emit("attach", socket, localId);
	      this.from = socket.from;
	      if (socket.setMaxListeners) {
	        socket.setMaxListeners(0);
	      }
	      socket.on("connect", (function(_this) {
	        return function() {
	          return _this.emit("connect", socket, localId);
	        };
	      })(this));
	      socket.on("begingroup", (function(_this) {
	        return function(group) {
	          return _this.emit("begingroup", group, localId);
	        };
	      })(this));
	      socket.on("data", (function(_this) {
	        return function(data) {
	          return _this.emit("data", data, localId);
	        };
	      })(this));
	      socket.on("endgroup", (function(_this) {
	        return function(group) {
	          return _this.emit("endgroup", group, localId);
	        };
	      })(this));
	      return socket.on("disconnect", (function(_this) {
	        return function() {
	          return _this.emit("disconnect", socket, localId);
	        };
	      })(this));
	    };

	    Port.prototype.connect = function() {
	      var socket, _i, _len, _ref, _results;
	      if (this.sockets.length === 0) {
	        throw new Error("" + (this.getId()) + ": No connections available");
	      }
	      _ref = this.sockets;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        socket = _ref[_i];
	        _results.push(socket.connect());
	      }
	      return _results;
	    };

	    Port.prototype.beginGroup = function(group) {
	      if (this.sockets.length === 0) {
	        throw new Error("" + (this.getId()) + ": No connections available");
	      }
	      return this.sockets.forEach(function(socket) {
	        if (socket.isConnected()) {
	          return socket.beginGroup(group);
	        }
	        socket.once('connect', function() {
	          return socket.beginGroup(group);
	        });
	        return socket.connect();
	      });
	    };

	    Port.prototype.send = function(data) {
	      if (this.sockets.length === 0) {
	        throw new Error("" + (this.getId()) + ": No connections available");
	      }
	      return this.sockets.forEach(function(socket) {
	        if (socket.isConnected()) {
	          return socket.send(data);
	        }
	        socket.once('connect', function() {
	          return socket.send(data);
	        });
	        return socket.connect();
	      });
	    };

	    Port.prototype.endGroup = function() {
	      var socket, _i, _len, _ref, _results;
	      if (this.sockets.length === 0) {
	        throw new Error("" + (this.getId()) + ": No connections available");
	      }
	      _ref = this.sockets;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        socket = _ref[_i];
	        _results.push(socket.endGroup());
	      }
	      return _results;
	    };

	    Port.prototype.disconnect = function() {
	      var socket, _i, _len, _ref, _results;
	      if (this.sockets.length === 0) {
	        throw new Error("" + (this.getId()) + ": No connections available");
	      }
	      _ref = this.sockets;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        socket = _ref[_i];
	        _results.push(socket.disconnect());
	      }
	      return _results;
	    };

	    Port.prototype.detach = function(socket) {
	      var index;
	      if (this.sockets.length === 0) {
	        return;
	      }
	      if (!socket) {
	        socket = this.sockets[0];
	      }
	      index = this.sockets.indexOf(socket);
	      if (index === -1) {
	        return;
	      }
	      if (this.isAddressable()) {
	        this.sockets[index] = void 0;
	        this.emit('detach', socket, index);
	        return;
	      }
	      this.sockets.splice(index, 1);
	      return this.emit("detach", socket);
	    };

	    Port.prototype.isConnected = function() {
	      var connected;
	      connected = false;
	      this.sockets.forEach((function(_this) {
	        return function(socket) {
	          if (socket.isConnected()) {
	            return connected = true;
	          }
	        };
	      })(this));
	      return connected;
	    };

	    Port.prototype.isAddressable = function() {
	      return false;
	    };

	    Port.prototype.isRequired = function() {
	      return this.required;
	    };

	    Port.prototype.isAttached = function() {
	      if (this.sockets.length > 0) {
	        return true;
	      }
	      return false;
	    };

	    Port.prototype.listAttached = function() {
	      var attached, idx, socket, _i, _len, _ref;
	      attached = [];
	      _ref = this.sockets;
	      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
	        socket = _ref[idx];
	        if (!socket) {
	          continue;
	        }
	        attached.push(idx);
	      }
	      return attached;
	    };

	    Port.prototype.canAttach = function() {
	      return true;
	    };

	    return Port;

	  })(EventEmitter);

	  exports.Port = Port;

	}).call(this);


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var InternalSocket, StreamReceiver, StreamSender, isArray, _,
	    __hasProp = {}.hasOwnProperty;

	  _ = __webpack_require__(12);

	  StreamSender = __webpack_require__(26).StreamSender;

	  StreamReceiver = __webpack_require__(26).StreamReceiver;

	  InternalSocket = __webpack_require__(13);

	  isArray = function(obj) {
	    if (Array.isArray) {
	      return Array.isArray(obj);
	    }
	    return Object.prototype.toString.call(arg) === '[object Array]';
	  };

	  exports.MapComponent = function(component, func, config) {
	    var groups, inPort, outPort;
	    if (!config) {
	      config = {};
	    }
	    if (!config.inPort) {
	      config.inPort = 'in';
	    }
	    if (!config.outPort) {
	      config.outPort = 'out';
	    }
	    inPort = component.inPorts[config.inPort];
	    outPort = component.outPorts[config.outPort];
	    groups = [];
	    return inPort.process = function(event, payload) {
	      switch (event) {
	        case 'connect':
	          return outPort.connect();
	        case 'begingroup':
	          groups.push(payload);
	          return outPort.beginGroup(payload);
	        case 'data':
	          return func(payload, groups, outPort);
	        case 'endgroup':
	          groups.pop();
	          return outPort.endGroup();
	        case 'disconnect':
	          groups = [];
	          return outPort.disconnect();
	      }
	    };
	  };

	  exports.WirePattern = function(component, config, proc) {
	    var baseShutdown, closeGroupOnOuts, collectGroups, disconnectOuts, gc, inPorts, name, outPorts, port, processQueue, resumeTaskQ, sendGroupToOuts, _fn, _fn1, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1;
	    inPorts = 'in' in config ? config["in"] : 'in';
	    if (!isArray(inPorts)) {
	      inPorts = [inPorts];
	    }
	    outPorts = 'out' in config ? config.out : 'out';
	    if (!isArray(outPorts)) {
	      outPorts = [outPorts];
	    }
	    if (!('error' in config)) {
	      config.error = 'error';
	    }
	    if (!('async' in config)) {
	      config.async = false;
	    }
	    if (!('ordered' in config)) {
	      config.ordered = true;
	    }
	    if (!('group' in config)) {
	      config.group = false;
	    }
	    if (!('field' in config)) {
	      config.field = null;
	    }
	    if (!('forwardGroups' in config)) {
	      config.forwardGroups = false;
	    }
	    if (!('receiveStreams' in config)) {
	      config.receiveStreams = false;
	    }
	    if (typeof config.receiveStreams === 'string') {
	      config.receiveStreams = [config.receiveStreams];
	    }
	    if (!('sendStreams' in config)) {
	      config.sendStreams = false;
	    }
	    if (typeof config.sendStreams === 'string') {
	      config.sendStreams = [config.sendStreams];
	    }
	    if (config.async) {
	      config.sendStreams = outPorts;
	    }
	    if (!('params' in config)) {
	      config.params = [];
	    }
	    if (typeof config.params === 'string') {
	      config.params = [config.params];
	    }
	    if (!('name' in config)) {
	      config.name = '';
	    }
	    if (!('dropInput' in config)) {
	      config.dropInput = false;
	    }
	    if (!('arrayPolicy' in config)) {
	      config.arrayPolicy = {
	        "in": 'any',
	        params: 'all'
	      };
	    }
	    if (!('gcFrequency' in config)) {
	      config.gcFrequency = 100;
	    }
	    if (!('gcTimeout' in config)) {
	      config.gcTimeout = 300;
	    }
	    collectGroups = config.forwardGroups;
	    if (typeof collectGroups === 'boolean' && !config.group) {
	      collectGroups = inPorts;
	    }
	    if (typeof collectGroups === 'string' && !config.group) {
	      collectGroups = [collectGroups];
	    }
	    if (collectGroups !== false && config.group) {
	      collectGroups = true;
	    }
	    for (_i = 0, _len = inPorts.length; _i < _len; _i++) {
	      name = inPorts[_i];
	      if (!component.inPorts[name]) {
	        throw new Error("no inPort named '" + name + "'");
	      }
	    }
	    for (_j = 0, _len1 = outPorts.length; _j < _len1; _j++) {
	      name = outPorts[_j];
	      if (!component.outPorts[name]) {
	        throw new Error("no outPort named '" + name + "'");
	      }
	    }
	    component.groupedData = {};
	    component.groupedGroups = {};
	    component.groupedDisconnects = {};
	    disconnectOuts = function() {
	      var p, _k, _len2, _results;
	      _results = [];
	      for (_k = 0, _len2 = outPorts.length; _k < _len2; _k++) {
	        p = outPorts[_k];
	        if (component.outPorts[p].isConnected()) {
	          _results.push(component.outPorts[p].disconnect());
	        } else {
	          _results.push(void 0);
	        }
	      }
	      return _results;
	    };
	    sendGroupToOuts = function(grp) {
	      var p, _k, _len2, _results;
	      _results = [];
	      for (_k = 0, _len2 = outPorts.length; _k < _len2; _k++) {
	        p = outPorts[_k];
	        _results.push(component.outPorts[p].beginGroup(grp));
	      }
	      return _results;
	    };
	    closeGroupOnOuts = function(grp) {
	      var p, _k, _len2, _results;
	      _results = [];
	      for (_k = 0, _len2 = outPorts.length; _k < _len2; _k++) {
	        p = outPorts[_k];
	        _results.push(component.outPorts[p].endGroup(grp));
	      }
	      return _results;
	    };
	    component.outputQ = [];
	    processQueue = function() {
	      var flushed, key, stream, streams, tmp;
	      while (component.outputQ.length > 0) {
	        streams = component.outputQ[0];
	        flushed = false;
	        if (streams === null) {
	          disconnectOuts();
	          flushed = true;
	        } else {
	          if (outPorts.length === 1) {
	            tmp = {};
	            tmp[outPorts[0]] = streams;
	            streams = tmp;
	          }
	          for (key in streams) {
	            stream = streams[key];
	            if (stream.resolved) {
	              stream.flush();
	              flushed = true;
	            }
	          }
	        }
	        if (flushed) {
	          component.outputQ.shift();
	        }
	        if (!flushed) {
	          return;
	        }
	      }
	    };
	    if (config.async) {
	      if ('load' in component.outPorts) {
	        component.load = 0;
	      }
	      component.beforeProcess = function(outs) {
	        if (config.ordered) {
	          component.outputQ.push(outs);
	        }
	        component.load++;
	        if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
	          component.outPorts.load.send(component.load);
	          return component.outPorts.load.disconnect();
	        }
	      };
	      component.afterProcess = function(err, outs) {
	        processQueue();
	        component.load--;
	        if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
	          component.outPorts.load.send(component.load);
	          return component.outPorts.load.disconnect();
	        }
	      };
	    }
	    component.taskQ = [];
	    component.params = {};
	    component.requiredParams = [];
	    component.completeParams = [];
	    component.receivedParams = [];
	    component.defaultedParams = [];
	    component.defaultsSent = false;
	    component.sendDefaults = function() {
	      var param, tempSocket, _k, _len2, _ref;
	      if (component.defaultedParams.length > 0) {
	        _ref = component.defaultedParams;
	        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
	          param = _ref[_k];
	          if (component.receivedParams.indexOf(param) === -1) {
	            tempSocket = InternalSocket.createSocket();
	            component.inPorts[param].attach(tempSocket);
	            tempSocket.send();
	            tempSocket.disconnect();
	            component.inPorts[param].detach(tempSocket);
	          }
	        }
	      }
	      return component.defaultsSent = true;
	    };
	    resumeTaskQ = function() {
	      var task, temp, _results;
	      if (component.completeParams.length === component.requiredParams.length && component.taskQ.length > 0) {
	        temp = component.taskQ.slice(0);
	        component.taskQ = [];
	        _results = [];
	        while (temp.length > 0) {
	          task = temp.shift();
	          _results.push(task());
	        }
	        return _results;
	      }
	    };
	    _ref = config.params;
	    for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
	      port = _ref[_k];
	      if (!component.inPorts[port]) {
	        throw new Error("no inPort named '" + port + "'");
	      }
	      if (component.inPorts[port].isRequired()) {
	        component.requiredParams.push(port);
	      }
	      if (component.inPorts[port].hasDefault()) {
	        component.defaultedParams.push(port);
	      }
	    }
	    _ref1 = config.params;
	    _fn = function(port) {
	      var inPort;
	      inPort = component.inPorts[port];
	      return inPort.process = function(event, payload, index) {
	        if (event !== 'data') {
	          return;
	        }
	        if (inPort.isAddressable()) {
	          if (!(port in component.params)) {
	            component.params[port] = {};
	          }
	          component.params[port][index] = payload;
	          if (config.arrayPolicy.params === 'all' && Object.keys(component.params[port]).length < inPort.listAttached().length) {
	            return;
	          }
	        } else {
	          component.params[port] = payload;
	        }
	        if (component.completeParams.indexOf(port) === -1 && component.requiredParams.indexOf(port) > -1) {
	          component.completeParams.push(port);
	        }
	        component.receivedParams.push(port);
	        return resumeTaskQ();
	      };
	    };
	    for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
	      port = _ref1[_l];
	      _fn(port);
	    }
	    component.disconnectData = {};
	    component.disconnectQ = [];
	    component.groupBuffers = {};
	    component.keyBuffers = {};
	    component.gcTimestamps = {};
	    component.dropRequest = function(key) {
	      if (key in component.disconnectData) {
	        delete component.disconnectData[key];
	      }
	      if (key in component.groupedData) {
	        delete component.groupedData[key];
	      }
	      if (key in component.groupedGroups) {
	        return delete component.groupedGroups[key];
	      }
	    };
	    component.gcCounter = 0;
	    gc = function() {
	      var current, key, val, _ref2, _results;
	      component.gcCounter++;
	      if (component.gcCounter % config.gcFrequency === 0) {
	        current = new Date().getTime();
	        _ref2 = component.gcTimestamps;
	        _results = [];
	        for (key in _ref2) {
	          val = _ref2[key];
	          if ((current - val) > (config.gcTimeout * 1000)) {
	            component.dropRequest(key);
	            _results.push(delete component.gcTimestamps[key]);
	          } else {
	            _results.push(void 0);
	          }
	        }
	        return _results;
	      }
	    };
	    _fn1 = function(port) {
	      var inPort, needPortGroups;
	      component.groupBuffers[port] = [];
	      component.keyBuffers[port] = null;
	      if (config.receiveStreams && config.receiveStreams.indexOf(port) !== -1) {
	        inPort = new StreamReceiver(component.inPorts[port]);
	      } else {
	        inPort = component.inPorts[port];
	      }
	      needPortGroups = collectGroups instanceof Array && collectGroups.indexOf(port) !== -1;
	      return inPort.process = function(event, payload, index) {
	        var data, foundGroup, g, groupLength, groups, grp, i, key, obj, out, outs, postpone, postponedToQ, reqId, requiredLength, resume, task, tmp, whenDone, whenDoneGroups, _len5, _len6, _len7, _len8, _n, _o, _p, _q, _r, _ref2, _ref3, _ref4, _s;
	        if (!component.groupBuffers[port]) {
	          component.groupBuffers[port] = [];
	        }
	        switch (event) {
	          case 'begingroup':
	            component.groupBuffers[port].push(payload);
	            if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
	              return sendGroupToOuts(payload);
	            }
	            break;
	          case 'endgroup':
	            component.groupBuffers[port] = component.groupBuffers[port].slice(0, component.groupBuffers[port].length - 1);
	            if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
	              return closeGroupOnOuts(payload);
	            }
	            break;
	          case 'disconnect':
	            if (inPorts.length === 1) {
	              if (config.async || config.StreamSender) {
	                if (config.ordered) {
	                  component.outputQ.push(null);
	                  return processQueue();
	                } else {
	                  return component.disconnectQ.push(true);
	                }
	              } else {
	                return disconnectOuts();
	              }
	            } else {
	              foundGroup = false;
	              key = component.keyBuffers[port];
	              if (!(key in component.disconnectData)) {
	                component.disconnectData[key] = [];
	              }
	              for (i = _n = 0, _ref2 = component.disconnectData[key].length; 0 <= _ref2 ? _n < _ref2 : _n > _ref2; i = 0 <= _ref2 ? ++_n : --_n) {
	                if (!(port in component.disconnectData[key][i])) {
	                  foundGroup = true;
	                  component.disconnectData[key][i][port] = true;
	                  if (Object.keys(component.disconnectData[key][i]).length === inPorts.length) {
	                    component.disconnectData[key].shift();
	                    if (config.async || config.StreamSender) {
	                      if (config.ordered) {
	                        component.outputQ.push(null);
	                        processQueue();
	                      } else {
	                        component.disconnectQ.push(true);
	                      }
	                    } else {
	                      disconnectOuts();
	                    }
	                    if (component.disconnectData[key].length === 0) {
	                      delete component.disconnectData[key];
	                    }
	                  }
	                  break;
	                }
	              }
	              if (!foundGroup) {
	                obj = {};
	                obj[port] = true;
	                return component.disconnectData[key].push(obj);
	              }
	            }
	            break;
	          case 'data':
	            if (inPorts.length === 1 && !inPort.isAddressable()) {
	              data = payload;
	              groups = component.groupBuffers[port];
	            } else {
	              key = '';
	              if (config.group && component.groupBuffers[port].length > 0) {
	                key = component.groupBuffers[port].toString();
	                if (config.group instanceof RegExp) {
	                  reqId = null;
	                  _ref3 = component.groupBuffers[port];
	                  for (_o = 0, _len5 = _ref3.length; _o < _len5; _o++) {
	                    grp = _ref3[_o];
	                    if (config.group.test(grp)) {
	                      reqId = grp;
	                      break;
	                    }
	                  }
	                  key = reqId ? reqId : '';
	                }
	              } else if (config.field && typeof payload === 'object' && config.field in payload) {
	                key = payload[config.field];
	              }
	              component.keyBuffers[port] = key;
	              if (!(key in component.groupedData)) {
	                component.groupedData[key] = [];
	              }
	              if (!(key in component.groupedGroups)) {
	                component.groupedGroups[key] = [];
	              }
	              foundGroup = false;
	              requiredLength = inPorts.length;
	              if (config.field) {
	                ++requiredLength;
	              }
	              for (i = _p = 0, _ref4 = component.groupedData[key].length; 0 <= _ref4 ? _p < _ref4 : _p > _ref4; i = 0 <= _ref4 ? ++_p : --_p) {
	                if (!(port in component.groupedData[key][i]) || (component.inPorts[port].isAddressable() && config.arrayPolicy["in"] === 'all' && !(index in component.groupedData[key][i][port]))) {
	                  foundGroup = true;
	                  if (component.inPorts[port].isAddressable()) {
	                    if (!(port in component.groupedData[key][i])) {
	                      component.groupedData[key][i][port] = {};
	                    }
	                    component.groupedData[key][i][port][index] = payload;
	                  } else {
	                    component.groupedData[key][i][port] = payload;
	                  }
	                  if (needPortGroups) {
	                    component.groupedGroups[key][i] = _.union(component.groupedGroups[key][i], component.groupBuffers[port]);
	                  } else if (collectGroups === true) {
	                    component.groupedGroups[key][i][port] = component.groupBuffers[port];
	                  }
	                  if (component.inPorts[port].isAddressable() && config.arrayPolicy["in"] === 'all' && Object.keys(component.groupedData[key][i][port]).length < component.inPorts[port].listAttached().length) {
	                    return;
	                  }
	                  groupLength = Object.keys(component.groupedData[key][i]).length;
	                  if (groupLength === requiredLength) {
	                    data = (component.groupedData[key].splice(i, 1))[0];
	                    if (inPorts.length === 1 && inPort.isAddressable()) {
	                      data = data[port];
	                    }
	                    groups = (component.groupedGroups[key].splice(i, 1))[0];
	                    if (collectGroups === true) {
	                      groups = _.intersection.apply(null, _.values(groups));
	                    }
	                    if (component.groupedData[key].length === 0) {
	                      delete component.groupedData[key];
	                    }
	                    if (component.groupedGroups[key].length === 0) {
	                      delete component.groupedGroups[key];
	                    }
	                    if (config.group && key) {
	                      delete component.gcTimestamps[key];
	                    }
	                    break;
	                  } else {
	                    return;
	                  }
	                }
	              }
	              if (!foundGroup) {
	                obj = {};
	                if (config.field) {
	                  obj[config.field] = key;
	                }
	                if (component.inPorts[port].isAddressable()) {
	                  obj[port] = {};
	                  obj[port][index] = payload;
	                } else {
	                  obj[port] = payload;
	                }
	                if (inPorts.length === 1 && component.inPorts[port].isAddressable() && (config.arrayPolicy["in"] === 'any' || component.inPorts[port].listAttached().length === 1)) {
	                  data = obj[port];
	                  groups = component.groupBuffers[port];
	                } else {
	                  component.groupedData[key].push(obj);
	                  if (needPortGroups) {
	                    component.groupedGroups[key].push(component.groupBuffers[port]);
	                  } else if (collectGroups === true) {
	                    tmp = {};
	                    tmp[port] = component.groupBuffers[port];
	                    component.groupedGroups[key].push(tmp);
	                  } else {
	                    component.groupedGroups[key].push([]);
	                  }
	                  if (config.group && key) {
	                    component.gcTimestamps[key] = new Date().getTime();
	                  }
	                  return;
	                }
	              }
	            }
	            if (config.dropInput && component.completeParams.length !== component.requiredParams.length) {
	              return;
	            }
	            outs = {};
	            for (_q = 0, _len6 = outPorts.length; _q < _len6; _q++) {
	              name = outPorts[_q];
	              if (config.async || config.sendStreams && config.sendStreams.indexOf(name) !== -1) {
	                outs[name] = new StreamSender(component.outPorts[name], config.ordered);
	              } else {
	                outs[name] = component.outPorts[name];
	              }
	            }
	            if (outPorts.length === 1) {
	              outs = outs[outPorts[0]];
	            }
	            if (!groups) {
	              groups = [];
	            }
	            whenDoneGroups = groups.slice(0);
	            whenDone = function(err) {
	              var disconnect, out, outputs, _len7, _r;
	              if (err) {
	                component.error(err, whenDoneGroups);
	              }
	              if (typeof component.fail === 'function' && component.hasErrors) {
	                component.fail();
	              }
	              outputs = outPorts.length === 1 ? {
	                port: outs
	              } : outs;
	              disconnect = false;
	              if (component.disconnectQ.length > 0) {
	                component.disconnectQ.shift();
	                disconnect = true;
	              }
	              for (name in outputs) {
	                out = outputs[name];
	                if (config.forwardGroups && config.async) {
	                  for (_r = 0, _len7 = whenDoneGroups.length; _r < _len7; _r++) {
	                    i = whenDoneGroups[_r];
	                    out.endGroup();
	                  }
	                }
	                if (disconnect) {
	                  out.disconnect();
	                }
	                if (config.async || config.StreamSender) {
	                  out.done();
	                }
	              }
	              if (typeof component.afterProcess === 'function') {
	                return component.afterProcess(err || component.hasErrors, outs);
	              }
	            };
	            if (typeof component.beforeProcess === 'function') {
	              component.beforeProcess(outs);
	            }
	            if (config.forwardGroups && config.async) {
	              if (outPorts.length === 1) {
	                for (_r = 0, _len7 = groups.length; _r < _len7; _r++) {
	                  g = groups[_r];
	                  outs.beginGroup(g);
	                }
	              } else {
	                for (name in outs) {
	                  out = outs[name];
	                  for (_s = 0, _len8 = groups.length; _s < _len8; _s++) {
	                    g = groups[_s];
	                    out.beginGroup(g);
	                  }
	                }
	              }
	            }
	            exports.MultiError(component, config.name, config.error, groups);
	            if (config.async) {
	              postpone = function() {};
	              resume = function() {};
	              postponedToQ = false;
	              task = function() {
	                return proc.call(component, data, groups, outs, whenDone, postpone, resume);
	              };
	              postpone = function(backToQueue) {
	                if (backToQueue == null) {
	                  backToQueue = true;
	                }
	                postponedToQ = backToQueue;
	                if (backToQueue) {
	                  return component.taskQ.push(task);
	                }
	              };
	              resume = function() {
	                if (postponedToQ) {
	                  return resumeTaskQ();
	                } else {
	                  return task();
	                }
	              };
	            } else {
	              task = function() {
	                proc.call(component, data, groups, outs);
	                return whenDone();
	              };
	            }
	            component.taskQ.push(task);
	            resumeTaskQ();
	            return gc();
	        }
	      };
	    };
	    for (_m = 0, _len4 = inPorts.length; _m < _len4; _m++) {
	      port = inPorts[_m];
	      _fn1(port);
	    }
	    baseShutdown = component.shutdown;
	    component.shutdown = function() {
	      baseShutdown.call(component);
	      component.groupedData = {};
	      component.groupedGroups = {};
	      component.outputQ = [];
	      component.disconnectData = {};
	      component.disconnectQ = [];
	      component.taskQ = [];
	      component.params = {};
	      component.completeParams = [];
	      component.receivedParams = [];
	      component.defaultsSent = false;
	      component.groupBuffers = {};
	      component.keyBuffers = {};
	      component.gcTimestamps = {};
	      return component.gcCounter = 0;
	    };
	    return component;
	  };

	  exports.GroupedInput = exports.WirePattern;

	  exports.CustomError = function(message, options) {
	    var err;
	    err = new Error(message);
	    return exports.CustomizeError(err, options);
	  };

	  exports.CustomizeError = function(err, options) {
	    var key, val;
	    for (key in options) {
	      if (!__hasProp.call(options, key)) continue;
	      val = options[key];
	      err[key] = val;
	    }
	    return err;
	  };

	  exports.MultiError = function(component, group, errorPort, forwardedGroups) {
	    var baseShutdown;
	    if (group == null) {
	      group = '';
	    }
	    if (errorPort == null) {
	      errorPort = 'error';
	    }
	    if (forwardedGroups == null) {
	      forwardedGroups = [];
	    }
	    component.hasErrors = false;
	    component.errors = [];
	    component.error = function(e, groups) {
	      if (groups == null) {
	        groups = [];
	      }
	      component.errors.push({
	        err: e,
	        groups: forwardedGroups.concat(groups)
	      });
	      return component.hasErrors = true;
	    };
	    component.fail = function(e, groups) {
	      var error, grp, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
	      if (e == null) {
	        e = null;
	      }
	      if (groups == null) {
	        groups = [];
	      }
	      if (e) {
	        component.error(e, groups);
	      }
	      if (!component.hasErrors) {
	        return;
	      }
	      if (!(errorPort in component.outPorts)) {
	        return;
	      }
	      if (!component.outPorts[errorPort].isAttached()) {
	        return;
	      }
	      if (group) {
	        component.outPorts[errorPort].beginGroup(group);
	      }
	      _ref = component.errors;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        error = _ref[_i];
	        _ref1 = error.groups;
	        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	          grp = _ref1[_j];
	          component.outPorts[errorPort].beginGroup(grp);
	        }
	        component.outPorts[errorPort].send(error.err);
	        _ref2 = error.groups;
	        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	          grp = _ref2[_k];
	          component.outPorts[errorPort].endGroup();
	        }
	      }
	      if (group) {
	        component.outPorts[errorPort].endGroup();
	      }
	      component.outPorts[errorPort].disconnect();
	      component.hasErrors = false;
	      return component.errors = [];
	    };
	    baseShutdown = component.shutdown;
	    component.shutdown = function() {
	      baseShutdown.call(component);
	      component.hasErrors = false;
	      return component.errors = [];
	    };
	    return component;
	  };

	}).call(this);


/***/ },
/* 26 */
/***/ function(module, exports) {

	(function() {
	  var IP, StreamReceiver, StreamSender, Substream;

	  IP = (function() {
	    function IP(data) {
	      this.data = data;
	    }

	    IP.prototype.sendTo = function(port) {
	      return port.send(this.data);
	    };

	    IP.prototype.getValue = function() {
	      return this.data;
	    };

	    IP.prototype.toObject = function() {
	      return this.data;
	    };

	    return IP;

	  })();

	  exports.IP = IP;

	  Substream = (function() {
	    function Substream(key) {
	      this.key = key;
	      this.value = [];
	    }

	    Substream.prototype.push = function(value) {
	      return this.value.push(value);
	    };

	    Substream.prototype.sendTo = function(port) {
	      var ip, _i, _len, _ref;
	      port.beginGroup(this.key);
	      _ref = this.value;
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        ip = _ref[_i];
	        if (ip instanceof Substream || ip instanceof IP) {
	          ip.sendTo(port);
	        } else {
	          port.send(ip);
	        }
	      }
	      return port.endGroup();
	    };

	    Substream.prototype.getKey = function() {
	      return this.key;
	    };

	    Substream.prototype.getValue = function() {
	      var hasKeys, ip, obj, res, val, _i, _len, _ref;
	      switch (this.value.length) {
	        case 0:
	          return null;
	        case 1:
	          if (typeof this.value[0].getValue === 'function') {
	            if (this.value[0] instanceof Substream) {
	              obj = {};
	              obj[this.value[0].key] = this.value[0].getValue();
	              return obj;
	            } else {
	              return this.value[0].getValue();
	            }
	          } else {
	            return this.value[0];
	          }
	          break;
	        default:
	          res = [];
	          hasKeys = false;
	          _ref = this.value;
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            ip = _ref[_i];
	            val = typeof ip.getValue === 'function' ? ip.getValue() : ip;
	            if (ip instanceof Substream) {
	              obj = {};
	              obj[ip.key] = ip.getValue();
	              res.push(obj);
	            } else {
	              res.push(val);
	            }
	          }
	          return res;
	      }
	    };

	    Substream.prototype.toObject = function() {
	      var obj;
	      obj = {};
	      obj[this.key] = this.getValue();
	      return obj;
	    };

	    return Substream;

	  })();

	  exports.Substream = Substream;

	  StreamSender = (function() {
	    function StreamSender(port, ordered) {
	      this.port = port;
	      this.ordered = ordered != null ? ordered : false;
	      this.q = [];
	      this.resetCurrent();
	      this.resolved = false;
	    }

	    StreamSender.prototype.resetCurrent = function() {
	      this.level = 0;
	      this.current = null;
	      return this.stack = [];
	    };

	    StreamSender.prototype.beginGroup = function(group) {
	      var stream;
	      this.level++;
	      stream = new Substream(group);
	      this.stack.push(stream);
	      this.current = stream;
	      return this;
	    };

	    StreamSender.prototype.endGroup = function() {
	      var parent, value;
	      if (this.level > 0) {
	        this.level--;
	      }
	      value = this.stack.pop();
	      if (this.level === 0) {
	        this.q.push(value);
	        this.resetCurrent();
	      } else {
	        parent = this.stack[this.stack.length - 1];
	        parent.push(value);
	        this.current = parent;
	      }
	      return this;
	    };

	    StreamSender.prototype.send = function(data) {
	      if (this.level === 0) {
	        this.q.push(new IP(data));
	      } else {
	        this.current.push(new IP(data));
	      }
	      return this;
	    };

	    StreamSender.prototype.done = function() {
	      if (this.ordered) {
	        this.resolved = true;
	      } else {
	        this.flush();
	      }
	      return this;
	    };

	    StreamSender.prototype.disconnect = function() {
	      this.q.push(null);
	      return this;
	    };

	    StreamSender.prototype.flush = function() {
	      var ip, res, _i, _len, _ref;
	      res = false;
	      if (this.q.length > 0) {
	        _ref = this.q;
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          ip = _ref[_i];
	          if (ip === null) {
	            if (this.port.isConnected()) {
	              this.port.disconnect();
	            }
	          } else {
	            ip.sendTo(this.port);
	          }
	        }
	        res = true;
	      }
	      this.q = [];
	      return res;
	    };

	    StreamSender.prototype.isAttached = function() {
	      return this.port.isAttached();
	    };

	    return StreamSender;

	  })();

	  exports.StreamSender = StreamSender;

	  StreamReceiver = (function() {
	    function StreamReceiver(port, buffered, process) {
	      this.port = port;
	      this.buffered = buffered != null ? buffered : false;
	      this.process = process != null ? process : null;
	      this.q = [];
	      this.resetCurrent();
	      this.port.process = (function(_this) {
	        return function(event, payload, index) {
	          var stream;
	          switch (event) {
	            case 'connect':
	              if (typeof _this.process === 'function') {
	                return _this.process('connect', index);
	              }
	              break;
	            case 'begingroup':
	              _this.level++;
	              stream = new Substream(payload);
	              if (_this.level === 1) {
	                _this.root = stream;
	                _this.parent = null;
	              } else {
	                _this.parent = _this.current;
	              }
	              return _this.current = stream;
	            case 'endgroup':
	              if (_this.level > 0) {
	                _this.level--;
	              }
	              if (_this.level === 0) {
	                if (_this.buffered) {
	                  _this.q.push(_this.root);
	                  _this.process('readable', index);
	                } else {
	                  if (typeof _this.process === 'function') {
	                    _this.process('data', _this.root, index);
	                  }
	                }
	                return _this.resetCurrent();
	              } else {
	                _this.parent.push(_this.current);
	                return _this.current = _this.parent;
	              }
	              break;
	            case 'data':
	              if (_this.level === 0) {
	                return _this.q.push(new IP(payload));
	              } else {
	                return _this.current.push(new IP(payload));
	              }
	              break;
	            case 'disconnect':
	              if (typeof _this.process === 'function') {
	                return _this.process('disconnect', index);
	              }
	          }
	        };
	      })(this);
	    }

	    StreamReceiver.prototype.resetCurrent = function() {
	      this.level = 0;
	      this.root = null;
	      this.current = null;
	      return this.parent = null;
	    };

	    StreamReceiver.prototype.read = function() {
	      if (this.q.length === 0) {
	        return void 0;
	      }
	      return this.q.shift();
	    };

	    return StreamReceiver;

	  })();

	  exports.StreamReceiver = StreamReceiver;

	}).call(this);


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  var ArrayPort, port,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	  port = __webpack_require__(24);

	  ArrayPort = (function(_super) {
	    __extends(ArrayPort, _super);

	    function ArrayPort(type) {
	      this.type = type;
	      ArrayPort.__super__.constructor.call(this, this.type);
	    }

	    ArrayPort.prototype.attach = function(socket, socketId) {
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (socketId === null) {
	        socketId = this.sockets.length;
	      }
	      this.sockets[socketId] = socket;
	      return this.attachSocket(socket, socketId);
	    };

	    ArrayPort.prototype.connect = function(socketId) {
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (socketId === null) {
	        if (!this.sockets.length) {
	          throw new Error("" + (this.getId()) + ": No connections available");
	        }
	        this.sockets.forEach(function(socket) {
	          if (!socket) {
	            return;
	          }
	          return socket.connect();
	        });
	        return;
	      }
	      if (!this.sockets[socketId]) {
	        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
	      }
	      return this.sockets[socketId].connect();
	    };

	    ArrayPort.prototype.beginGroup = function(group, socketId) {
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (socketId === null) {
	        if (!this.sockets.length) {
	          throw new Error("" + (this.getId()) + ": No connections available");
	        }
	        this.sockets.forEach((function(_this) {
	          return function(socket, index) {
	            if (!socket) {
	              return;
	            }
	            return _this.beginGroup(group, index);
	          };
	        })(this));
	        return;
	      }
	      if (!this.sockets[socketId]) {
	        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
	      }
	      if (this.isConnected(socketId)) {
	        return this.sockets[socketId].beginGroup(group);
	      }
	      this.sockets[socketId].once("connect", (function(_this) {
	        return function() {
	          return _this.sockets[socketId].beginGroup(group);
	        };
	      })(this));
	      return this.sockets[socketId].connect();
	    };

	    ArrayPort.prototype.send = function(data, socketId) {
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (socketId === null) {
	        if (!this.sockets.length) {
	          throw new Error("" + (this.getId()) + ": No connections available");
	        }
	        this.sockets.forEach((function(_this) {
	          return function(socket, index) {
	            if (!socket) {
	              return;
	            }
	            return _this.send(data, index);
	          };
	        })(this));
	        return;
	      }
	      if (!this.sockets[socketId]) {
	        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
	      }
	      if (this.isConnected(socketId)) {
	        return this.sockets[socketId].send(data);
	      }
	      this.sockets[socketId].once("connect", (function(_this) {
	        return function() {
	          return _this.sockets[socketId].send(data);
	        };
	      })(this));
	      return this.sockets[socketId].connect();
	    };

	    ArrayPort.prototype.endGroup = function(socketId) {
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (socketId === null) {
	        if (!this.sockets.length) {
	          throw new Error("" + (this.getId()) + ": No connections available");
	        }
	        this.sockets.forEach((function(_this) {
	          return function(socket, index) {
	            if (!socket) {
	              return;
	            }
	            return _this.endGroup(index);
	          };
	        })(this));
	        return;
	      }
	      if (!this.sockets[socketId]) {
	        throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
	      }
	      return this.sockets[socketId].endGroup();
	    };

	    ArrayPort.prototype.disconnect = function(socketId) {
	      var socket, _i, _len, _ref;
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (socketId === null) {
	        if (!this.sockets.length) {
	          throw new Error("" + (this.getId()) + ": No connections available");
	        }
	        _ref = this.sockets;
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          socket = _ref[_i];
	          if (!socket) {
	            return;
	          }
	          socket.disconnect();
	        }
	        return;
	      }
	      if (!this.sockets[socketId]) {
	        return;
	      }
	      return this.sockets[socketId].disconnect();
	    };

	    ArrayPort.prototype.isConnected = function(socketId) {
	      var connected;
	      if (socketId == null) {
	        socketId = null;
	      }
	      if (socketId === null) {
	        connected = false;
	        this.sockets.forEach((function(_this) {
	          return function(socket) {
	            if (!socket) {
	              return;
	            }
	            if (socket.isConnected()) {
	              return connected = true;
	            }
	          };
	        })(this));
	        return connected;
	      }
	      if (!this.sockets[socketId]) {
	        return false;
	      }
	      return this.sockets[socketId].isConnected();
	    };

	    ArrayPort.prototype.isAddressable = function() {
	      return true;
	    };

	    ArrayPort.prototype.isAttached = function(socketId) {
	      var socket, _i, _len, _ref;
	      if (socketId === void 0) {
	        _ref = this.sockets;
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          socket = _ref[_i];
	          if (socket) {
	            return true;
	          }
	        }
	        return false;
	      }
	      if (this.sockets[socketId]) {
	        return true;
	      }
	      return false;
	    };

	    return ArrayPort;

	  })(port.Port);

	  exports.ArrayPort = ArrayPort;

	}).call(this);


/***/ }
/******/ ]);