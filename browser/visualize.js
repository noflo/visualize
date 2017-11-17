/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 21);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var IP;

  module.exports = IP = function () {
    IP.types = ['data', 'openBracket', 'closeBracket'];

    IP.isIP = function (obj) {
      return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj._isIP === true;
    };

    function IP(type, data, options) {
      var key, val;
      this.type = type != null ? type : 'data';
      this.data = data != null ? data : null;
      if (options == null) {
        options = {};
      }
      this._isIP = true;
      this.scope = null;
      this.owner = null;
      this.clonable = false;
      this.index = null;
      this.schema = null;
      this.datatype = 'all';
      for (key in options) {
        val = options[key];
        this[key] = val;
      }
    }

    IP.prototype.clone = function () {
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
        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
          ip[key] = JSON.parse(JSON.stringify(val));
        } else {
          ip[key] = val;
        }
      }
      return ip;
    };

    IP.prototype.move = function (owner) {
      this.owner = owner;
    };

    IP.prototype.drop = function () {
      var key, results, val;
      results = [];
      for (key in this) {
        val = this[key];
        results.push(delete this[key]);
      }
      return results;
    };

    return IP;
  }();
}).call(undefined);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

(function () {
  exports.isBrowser = function () {
    if (typeof process !== 'undefined' && process.execPath && process.execPath.match(/node|iojs/)) {
      return false;
    }
    return true;
  };

  exports.deprecated = function (message) {
    if (exports.isBrowser()) {
      if (window.NOFLO_FATAL_DEPRECATED) {
        throw new Error(message);
      }
      console.warn(message);
      return;
    }
    if (process.env.NOFLO_FATAL_DEPRECATED) {
      throw new Error(message);
    }
    return console.warn(message);
  };
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var EventEmitter,
      IP,
      InternalSocket,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(0).EventEmitter;

  IP = __webpack_require__(2);

  InternalSocket = function (superClass) {
    extend(InternalSocket, superClass);

    InternalSocket.prototype.regularEmitEvent = function (event, data) {
      return this.emit(event, data);
    };

    InternalSocket.prototype.debugEmitEvent = function (event, data) {
      var error, error1;
      try {
        return this.emit(event, data);
      } catch (error1) {
        error = error1;
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
      this.connected = false;
      this.dataDelegate = null;
      this.debug = false;
      this.emitEvent = this.regularEmitEvent;
    }

    InternalSocket.prototype.connect = function () {
      if (this.connected) {
        return;
      }
      this.connected = true;
      return this.emitEvent('connect', null);
    };

    InternalSocket.prototype.disconnect = function () {
      if (!this.connected) {
        return;
      }
      this.connected = false;
      return this.emitEvent('disconnect', null);
    };

    InternalSocket.prototype.isConnected = function () {
      return this.connected;
    };

    InternalSocket.prototype.send = function (data) {
      if (data === void 0 && typeof this.dataDelegate === 'function') {
        data = this.dataDelegate();
      }
      return this.handleSocketEvent('data', data);
    };

    InternalSocket.prototype.post = function (ip, autoDisconnect) {
      if (autoDisconnect == null) {
        autoDisconnect = true;
      }
      if (ip === void 0 && typeof this.dataDelegate === 'function') {
        ip = this.dataDelegate();
      }
      if (!this.isConnected() && this.brackets.length === 0) {
        this.connect();
      }
      this.handleSocketEvent('ip', ip, false);
      if (autoDisconnect && this.isConnected() && this.brackets.length === 0) {
        return this.disconnect();
      }
    };

    InternalSocket.prototype.beginGroup = function (group) {
      return this.handleSocketEvent('begingroup', group);
    };

    InternalSocket.prototype.endGroup = function () {
      return this.handleSocketEvent('endgroup');
    };

    InternalSocket.prototype.setDataDelegate = function (delegate) {
      if (typeof delegate !== 'function') {
        throw Error('A data delegate must be a function.');
      }
      return this.dataDelegate = delegate;
    };

    InternalSocket.prototype.setDebug = function (active) {
      this.debug = active;
      return this.emitEvent = this.debug ? this.debugEmitEvent : this.regularEmitEvent;
    };

    InternalSocket.prototype.getId = function () {
      var fromStr, toStr;
      fromStr = function fromStr(from) {
        return from.process.id + "() " + from.port.toUpperCase();
      };
      toStr = function toStr(to) {
        return to.port.toUpperCase() + " " + to.process.id + "()";
      };
      if (!(this.from || this.to)) {
        return "UNDEFINED";
      }
      if (this.from && !this.to) {
        return fromStr(this.from) + " -> ANON";
      }
      if (!this.from) {
        return "DATA -> " + toStr(this.to);
      }
      return fromStr(this.from) + " -> " + toStr(this.to);
    };

    InternalSocket.prototype.legacyToIp = function (event, payload) {
      if (IP.isIP(payload)) {
        return payload;
      }
      switch (event) {
        case 'begingroup':
          return new IP('openBracket', payload);
        case 'endgroup':
          return new IP('closeBracket');
        case 'data':
          return new IP('data', payload);
        default:
          return null;
      }
    };

    InternalSocket.prototype.ipToLegacy = function (ip) {
      var legacy;
      switch (ip.type) {
        case 'openBracket':
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
          return legacy = {
            event: 'endgroup',
            payload: ip.data
          };
      }
    };

    InternalSocket.prototype.handleSocketEvent = function (event, payload, autoConnect) {
      var ip, isIP, legacy;
      if (autoConnect == null) {
        autoConnect = true;
      }
      isIP = event === 'ip' && IP.isIP(payload);
      ip = isIP ? payload : this.legacyToIp(event, payload);
      if (!ip) {
        return;
      }
      if (!this.isConnected() && autoConnect && this.brackets.length === 0) {
        this.connect();
      }
      if (event === 'begingroup') {
        this.brackets.push(payload);
      }
      if (isIP && ip.type === 'openBracket') {
        this.brackets.push(ip.data);
      }
      if (event === 'endgroup') {
        if (this.brackets.length === 0) {
          return;
        }
        ip.data = this.brackets.pop();
        payload = ip.data;
      }
      if (isIP && payload.type === 'closeBracket') {
        if (this.brackets.length === 0) {
          return;
        }
        this.brackets.pop();
      }
      this.emitEvent('ip', ip);
      if (!(ip && ip.type)) {
        return;
      }
      if (isIP) {
        legacy = this.ipToLegacy(ip);
        event = legacy.event;
        payload = legacy.payload;
      }
      if (event === 'connect') {
        this.connected = true;
      }
      if (event === 'disconnect') {
        this.connected = false;
      }
      return this.emitEvent(event, payload);
    };

    return InternalSocket;
  }(EventEmitter);

  exports.InternalSocket = InternalSocket;

  exports.createSocket = function () {
    return new InternalSocket();
  };
}).call(undefined);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

exports.graph = __webpack_require__(22);
exports.Graph = exports.graph.Graph;

exports.journal = __webpack_require__(30);
exports.Journal = exports.journal.Journal;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(34);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {



/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var ComponentLoader,
      EventEmitter,
      fbpGraph,
      internalSocket,
      registerLoader,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  internalSocket = __webpack_require__(4);

  fbpGraph = __webpack_require__(5);

  EventEmitter = __webpack_require__(0).EventEmitter;

  registerLoader = __webpack_require__(31);

  ComponentLoader = function (superClass) {
    extend(ComponentLoader, superClass);

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

    ComponentLoader.prototype.getModulePrefix = function (name) {
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

    ComponentLoader.prototype.listComponents = function (callback) {
      if (this.processing) {
        this.once('ready', function (_this) {
          return function () {
            return callback(null, _this.components);
          };
        }(this));
        return;
      }
      if (this.components) {
        return callback(null, this.components);
      }
      this.ready = false;
      this.processing = true;
      this.components = {};
      registerLoader.register(this, function (_this) {
        return function (err) {
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
      }(this));
    };

    ComponentLoader.prototype.load = function (name, callback, metadata) {
      var component, componentName;
      if (!this.ready) {
        this.listComponents(function (_this) {
          return function (err) {
            if (err) {
              return callback(err);
            }
            return _this.load(name, callback, metadata);
          };
        }(this));
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
          process.nextTick(function (_this) {
            return function () {
              return _this.loadGraph(name, component, callback, metadata);
            };
          }(this));
        } else {
          setTimeout(function (_this) {
            return function () {
              return _this.loadGraph(name, component, callback, metadata);
            };
          }(this), 0);
        }
        return;
      }
      return this.createComponent(name, component, metadata, function (_this) {
        return function (err, instance) {
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
          if (typeof name === 'string') {
            instance.componentName = name;
          }
          _this.setIcon(name, instance);
          return callback(null, instance);
        };
      }(this));
    };

    ComponentLoader.prototype.createComponent = function (name, component, metadata, callback) {
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
        callback(new Error("Invalid type " + (typeof implementation === 'undefined' ? 'undefined' : _typeof(implementation)) + " for component " + name + "."));
        return;
      }
      return callback(null, instance);
    };

    ComponentLoader.prototype.isGraph = function (cPath) {
      if ((typeof cPath === 'undefined' ? 'undefined' : _typeof(cPath)) === 'object' && cPath instanceof fbpGraph.Graph) {
        return true;
      }
      if ((typeof cPath === 'undefined' ? 'undefined' : _typeof(cPath)) === 'object' && cPath.processes && cPath.connections) {
        return true;
      }
      if (typeof cPath !== 'string') {
        return false;
      }
      return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;
    };

    ComponentLoader.prototype.loadGraph = function (name, component, callback, metadata) {
      this.createComponent(name, this.components['Graph'], metadata, function (_this) {
        return function (err, graph) {
          var graphSocket;
          if (err) {
            return callback(err);
          }
          graphSocket = internalSocket.createSocket();
          graph.loader = _this;
          graph.baseDir = _this.baseDir;
          graph.inPorts.remove('graph');
          graph.setGraph(component, function (err) {
            if (err) {
              return callback(err);
            }
            _this.setIcon(name, graph);
            return callback(null, graph);
          });
        };
      }(this));
    };

    ComponentLoader.prototype.setIcon = function (name, instance) {
      var componentName, library, ref;
      if (!instance.getIcon || instance.getIcon()) {
        return;
      }
      ref = name.split('/'), library = ref[0], componentName = ref[1];
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

    ComponentLoader.prototype.getLibraryIcon = function (prefix) {
      if (this.libraryIcons[prefix]) {
        return this.libraryIcons[prefix];
      }
      return null;
    };

    ComponentLoader.prototype.setLibraryIcon = function (prefix, icon) {
      return this.libraryIcons[prefix] = icon;
    };

    ComponentLoader.prototype.normalizeName = function (packageId, name) {
      var fullName, prefix;
      prefix = this.getModulePrefix(packageId);
      fullName = prefix + "/" + name;
      if (!packageId) {
        fullName = name;
      }
      return fullName;
    };

    ComponentLoader.prototype.registerComponent = function (packageId, name, cPath, callback) {
      var fullName;
      fullName = this.normalizeName(packageId, name);
      this.components[fullName] = cPath;
      if (callback) {
        return callback();
      }
    };

    ComponentLoader.prototype.registerGraph = function (packageId, name, gPath, callback) {
      return this.registerComponent(packageId, name, gPath, callback);
    };

    ComponentLoader.prototype.registerLoader = function (loader, callback) {
      return loader(this, callback);
    };

    ComponentLoader.prototype.setSource = function (packageId, name, source, language, callback) {
      if (!registerLoader.setSource) {
        return callback(new Error('setSource not allowed'));
      }
      if (!this.ready) {
        this.listComponents(function (_this) {
          return function (err) {
            if (err) {
              return callback(err);
            }
            return _this.setSource(packageId, name, source, language, callback);
          };
        }(this));
        return;
      }
      return registerLoader.setSource(this, packageId, name, source, language, callback);
    };

    ComponentLoader.prototype.getSource = function (name, callback) {
      if (!registerLoader.getSource) {
        return callback(new Error('getSource not allowed'));
      }
      if (!this.ready) {
        this.listComponents(function (_this) {
          return function (err) {
            if (err) {
              return callback(err);
            }
            return _this.getSource(name, callback);
          };
        }(this));
        return;
      }
      return registerLoader.getSource(this, name, callback);
    };

    ComponentLoader.prototype.clear = function () {
      this.components = null;
      this.ready = false;
      return this.processing = false;
    };

    return ComponentLoader;
  }(EventEmitter);

  exports.ComponentLoader = ComponentLoader;
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var EventEmitter,
      Port,
      platform,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(0).EventEmitter;

  platform = __webpack_require__(3);

  Port = function (superClass) {
    extend(Port, superClass);

    Port.prototype.description = '';

    Port.prototype.required = true;

    function Port(type) {
      this.type = type;
      platform.deprecated('noflo.Port is deprecated. Please port to noflo.InPort/noflo.OutPort');
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

    Port.prototype.getId = function () {
      if (!(this.node && this.name)) {
        return 'Port';
      }
      return this.node + " " + this.name.toUpperCase();
    };

    Port.prototype.getDataType = function () {
      return this.type;
    };

    Port.prototype.getSchema = function () {
      return null;
    };

    Port.prototype.getDescription = function () {
      return this.description;
    };

    Port.prototype.attach = function (socket) {
      this.sockets.push(socket);
      return this.attachSocket(socket);
    };

    Port.prototype.attachSocket = function (socket, localId) {
      if (localId == null) {
        localId = null;
      }
      this.emit("attach", socket, localId);
      this.from = socket.from;
      if (socket.setMaxListeners) {
        socket.setMaxListeners(0);
      }
      socket.on("connect", function (_this) {
        return function () {
          return _this.emit("connect", socket, localId);
        };
      }(this));
      socket.on("begingroup", function (_this) {
        return function (group) {
          return _this.emit("begingroup", group, localId);
        };
      }(this));
      socket.on("data", function (_this) {
        return function (data) {
          return _this.emit("data", data, localId);
        };
      }(this));
      socket.on("endgroup", function (_this) {
        return function (group) {
          return _this.emit("endgroup", group, localId);
        };
      }(this));
      return socket.on("disconnect", function (_this) {
        return function () {
          return _this.emit("disconnect", socket, localId);
        };
      }(this));
    };

    Port.prototype.connect = function () {
      var i, len, ref, results, socket;
      if (this.sockets.length === 0) {
        throw new Error(this.getId() + ": No connections available");
      }
      ref = this.sockets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        socket = ref[i];
        results.push(socket.connect());
      }
      return results;
    };

    Port.prototype.beginGroup = function (group) {
      if (this.sockets.length === 0) {
        throw new Error(this.getId() + ": No connections available");
      }
      return this.sockets.forEach(function (socket) {
        if (socket.isConnected()) {
          return socket.beginGroup(group);
        }
        socket.once('connect', function () {
          return socket.beginGroup(group);
        });
        return socket.connect();
      });
    };

    Port.prototype.send = function (data) {
      if (this.sockets.length === 0) {
        throw new Error(this.getId() + ": No connections available");
      }
      return this.sockets.forEach(function (socket) {
        if (socket.isConnected()) {
          return socket.send(data);
        }
        socket.once('connect', function () {
          return socket.send(data);
        });
        return socket.connect();
      });
    };

    Port.prototype.endGroup = function () {
      var i, len, ref, results, socket;
      if (this.sockets.length === 0) {
        throw new Error(this.getId() + ": No connections available");
      }
      ref = this.sockets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        socket = ref[i];
        results.push(socket.endGroup());
      }
      return results;
    };

    Port.prototype.disconnect = function () {
      var i, len, ref, results, socket;
      if (this.sockets.length === 0) {
        throw new Error(this.getId() + ": No connections available");
      }
      ref = this.sockets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        socket = ref[i];
        results.push(socket.disconnect());
      }
      return results;
    };

    Port.prototype.detach = function (socket) {
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

    Port.prototype.isConnected = function () {
      var connected;
      connected = false;
      this.sockets.forEach(function (socket) {
        if (socket.isConnected()) {
          return connected = true;
        }
      });
      return connected;
    };

    Port.prototype.isAddressable = function () {
      return false;
    };

    Port.prototype.isRequired = function () {
      return this.required;
    };

    Port.prototype.isAttached = function () {
      if (this.sockets.length > 0) {
        return true;
      }
      return false;
    };

    Port.prototype.listAttached = function () {
      var attached, i, idx, len, ref, socket;
      attached = [];
      ref = this.sockets;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        socket = ref[idx];
        if (!socket) {
          continue;
        }
        attached.push(idx);
      }
      return attached;
    };

    Port.prototype.canAttach = function () {
      return true;
    };

    Port.prototype.clear = function () {};

    return Port;
  }(EventEmitter);

  exports.Port = Port;
}).call(undefined);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var IP, StreamReceiver, StreamSender, Substream;

  IP = function () {
    function IP(data1) {
      this.data = data1;
    }

    IP.prototype.sendTo = function (port) {
      return port.send(this.data);
    };

    IP.prototype.getValue = function () {
      return this.data;
    };

    IP.prototype.toObject = function () {
      return this.data;
    };

    return IP;
  }();

  exports.IP = IP;

  Substream = function () {
    function Substream(key) {
      this.key = key;
      this.value = [];
    }

    Substream.prototype.push = function (value) {
      return this.value.push(value);
    };

    Substream.prototype.sendTo = function (port) {
      var i, ip, len, ref;
      port.beginGroup(this.key);
      ref = this.value;
      for (i = 0, len = ref.length; i < len; i++) {
        ip = ref[i];
        if (ip instanceof Substream || ip instanceof IP) {
          ip.sendTo(port);
        } else {
          port.send(ip);
        }
      }
      return port.endGroup(this.key);
    };

    Substream.prototype.getKey = function () {
      return this.key;
    };

    Substream.prototype.getValue = function () {
      var hasKeys, i, ip, len, obj, ref, res, val;
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
          ref = this.value;
          for (i = 0, len = ref.length; i < len; i++) {
            ip = ref[i];
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

    Substream.prototype.toObject = function () {
      var obj;
      obj = {};
      obj[this.key] = this.getValue();
      return obj;
    };

    return Substream;
  }();

  exports.Substream = Substream;

  StreamSender = function () {
    function StreamSender(port1, ordered) {
      this.port = port1;
      this.ordered = ordered != null ? ordered : false;
      this.q = [];
      this.resetCurrent();
      this.resolved = false;
    }

    StreamSender.prototype.resetCurrent = function () {
      this.level = 0;
      this.current = null;
      return this.stack = [];
    };

    StreamSender.prototype.beginGroup = function (group) {
      var stream;
      this.level++;
      stream = new Substream(group);
      this.stack.push(stream);
      this.current = stream;
      return this;
    };

    StreamSender.prototype.endGroup = function () {
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

    StreamSender.prototype.send = function (data) {
      if (this.level === 0) {
        this.q.push(new IP(data));
      } else {
        this.current.push(new IP(data));
      }
      return this;
    };

    StreamSender.prototype.done = function () {
      if (this.ordered) {
        this.resolved = true;
      } else {
        this.flush();
      }
      return this;
    };

    StreamSender.prototype.disconnect = function () {
      this.q.push(null);
      return this;
    };

    StreamSender.prototype.flush = function () {
      var i, ip, len, ref, res;
      res = false;
      if (this.q.length > 0) {
        ref = this.q;
        for (i = 0, len = ref.length; i < len; i++) {
          ip = ref[i];
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

    StreamSender.prototype.isAttached = function () {
      return this.port.isAttached();
    };

    return StreamSender;
  }();

  exports.StreamSender = StreamSender;

  StreamReceiver = function () {
    function StreamReceiver(port1, buffered, process) {
      this.port = port1;
      this.buffered = buffered != null ? buffered : false;
      this.process = process != null ? process : null;
      this.q = [];
      this.resetCurrent();
      this.port.process = function (_this) {
        return function (event, payload, index) {
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
      }(this);
    }

    StreamReceiver.prototype.resetCurrent = function () {
      this.level = 0;
      this.root = null;
      this.current = null;
      return this.parent = null;
    };

    StreamReceiver.prototype.read = function () {
      if (this.q.length === 0) {
        return void 0;
      }
      return this.q.shift();
    };

    return StreamReceiver;
  }();

  exports.StreamReceiver = StreamReceiver;
}).call(undefined);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var fbpGraph, ports;

  fbpGraph = __webpack_require__(5);

  exports.graph = fbpGraph.graph;

  exports.Graph = fbpGraph.Graph;

  exports.journal = fbpGraph.journal;

  exports.Journal = fbpGraph.Journal;

  exports.Network = __webpack_require__(14).Network;

  exports.isBrowser = __webpack_require__(3).isBrowser;

  exports.ComponentLoader = __webpack_require__(8).ComponentLoader;

  exports.Component = __webpack_require__(16).Component;

  exports.AsyncComponent = __webpack_require__(36).AsyncComponent;

  exports.helpers = __webpack_require__(37);

  exports.streams = __webpack_require__(10);

  ports = __webpack_require__(17);

  exports.InPorts = ports.InPorts;

  exports.OutPorts = ports.OutPorts;

  exports.InPort = __webpack_require__(18);

  exports.OutPort = __webpack_require__(20);

  exports.Port = __webpack_require__(9).Port;

  exports.ArrayPort = __webpack_require__(38).ArrayPort;

  exports.internalSocket = __webpack_require__(4);

  exports.IP = __webpack_require__(2);

  exports.createNetwork = function (graph, callback, options) {
    var network, networkReady;
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
      options = {
        delay: options
      };
    }
    if (typeof callback !== 'function') {
      callback = function callback(err) {
        if (err) {
          throw err;
        }
      };
    }
    network = new exports.Network(graph, options);
    networkReady = function networkReady(network) {
      return network.start(function (err) {
        if (err) {
          return callback(err);
        }
        return callback(null, network);
      });
    };
    network.loader.listComponents(function (err) {
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
      return network.connect(function (err) {
        if (err) {
          return callback(err);
        }
        return networkReady(network);
      });
    });
    return network;
  };

  exports.loadFile = function (file, options, callback) {
    var baseDir;
    if (!callback) {
      callback = options;
      baseDir = null;
    }
    if (callback && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
      options = {
        baseDir: options
      };
    }
    return exports.graph.loadFile(file, function (err, net) {
      if (err) {
        return callback(err);
      }
      if (options.baseDir) {
        net.baseDir = options.baseDir;
      }
      return exports.createNetwork(net, callback, options);
    });
  };

  exports.saveFile = function (graph, file, callback) {
    return exports.graph.save(file, callback);
  };

  exports.asCallback = __webpack_require__(39).asCallback;
}).call(undefined);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {var clone = (function() {
'use strict';

function _instanceof(obj, type) {
  return type != null && obj instanceof type;
}

var nativeMap;
try {
  nativeMap = Map;
} catch(_) {
  // maybe a reference error because no `Map`. Give it a dummy value that no
  // value will ever be an instanceof.
  nativeMap = function() {};
}

var nativeSet;
try {
  nativeSet = Set;
} catch(_) {
  nativeSet = function() {};
}

var nativePromise;
try {
  nativePromise = Promise;
} catch(_) {
  nativePromise = function() {};
}

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
 *    should be cloned as well. Non-enumerable properties on the prototype
 *    chain will be ignored. (optional - false by default)
*/
function clone(parent, circular, depth, prototype, includeNonEnumerable) {
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    includeNonEnumerable = circular.includeNonEnumerable;
    circular = circular.circular;
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth === 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (_instanceof(parent, nativeMap)) {
      child = new nativeMap();
    } else if (_instanceof(parent, nativeSet)) {
      child = new nativeSet();
    } else if (_instanceof(parent, nativePromise)) {
      child = new nativePromise(function (resolve, reject) {
        parent.then(function(value) {
          resolve(_clone(value, depth - 1));
        }, function(err) {
          reject(_clone(err, depth - 1));
        });
      });
    } else if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      child = new Buffer(parent.length);
      parent.copy(child);
      return child;
    } else if (_instanceof(parent, Error)) {
      child = Object.create(parent);
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    if (_instanceof(parent, nativeMap)) {
      parent.forEach(function(value, key) {
        var keyChild = _clone(key, depth - 1);
        var valueChild = _clone(value, depth - 1);
        child.set(keyChild, valueChild);
      });
    }
    if (_instanceof(parent, nativeSet)) {
      parent.forEach(function(value) {
        var entryChild = _clone(value, depth - 1);
        child.add(entryChild);
      });
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(parent);
      for (var i = 0; i < symbols.length; i++) {
        // Don't need to worry about cloning a symbol because it is a primitive,
        // like a number or string.
        var symbol = symbols[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
          continue;
        }
        child[symbol] = _clone(parent[symbol], depth - 1);
        if (!descriptor.enumerable) {
          Object.defineProperty(child, symbol, {
            enumerable: false
          });
        }
      }
    }

    if (includeNonEnumerable) {
      var allPropertyNames = Object.getOwnPropertyNames(parent);
      for (var i = 0; i < allPropertyNames.length; i++) {
        var propertyName = allPropertyNames[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
        if (descriptor && descriptor.enumerable) {
          continue;
        }
        child[propertyName] = _clone(parent[propertyName], depth - 1);
        Object.defineProperty(child, propertyName, {
          enumerable: false
        });
      }
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
}
clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
}
clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
}
clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
}
clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
}
clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23).Buffer))

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

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
        peg$c1 = "INPORT=",
        peg$c2 = { type: "literal", value: "INPORT=", description: "\"INPORT=\"" },
        peg$c3 = ".",
        peg$c4 = { type: "literal", value: ".", description: "\".\"" },
        peg$c5 = ":",
        peg$c6 = { type: "literal", value: ":", description: "\":\"" },
        peg$c7 = function(node, port, pub) {return parser.registerInports(node,port,pub)},
        peg$c8 = "OUTPORT=",
        peg$c9 = { type: "literal", value: "OUTPORT=", description: "\"OUTPORT=\"" },
        peg$c10 = function(node, port, pub) {return parser.registerOutports(node,port,pub)},
        peg$c11 = "DEFAULT_INPORT=",
        peg$c12 = { type: "literal", value: "DEFAULT_INPORT=", description: "\"DEFAULT_INPORT=\"" },
        peg$c13 = function(name) { defaultInPort = name},
        peg$c14 = "DEFAULT_OUTPORT=",
        peg$c15 = { type: "literal", value: "DEFAULT_OUTPORT=", description: "\"DEFAULT_OUTPORT=\"" },
        peg$c16 = function(name) { defaultOutPort = name},
        peg$c17 = function(annotation) { return parser.registerAnnotation(annotation[0], annotation[1]); },
        peg$c18 = function(edges) {return parser.registerEdges(edges);},
        peg$c19 = ",",
        peg$c20 = { type: "literal", value: ",", description: "\",\"" },
        peg$c21 = /^[\n\r\u2028\u2029]/,
        peg$c22 = { type: "class", value: "[\\n\\r\\u2028\\u2029]", description: "[\\n\\r\\u2028\\u2029]" },
        peg$c23 = "#",
        peg$c24 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c25 = "->",
        peg$c26 = { type: "literal", value: "->", description: "\"->\"" },
        peg$c27 = function(x, y) { return [x,y]; },
        peg$c28 = function(x, proc, y) { return [{"tgt":makeInPort(proc, x)},{"src":makeOutPort(proc, y)}]; },
        peg$c29 = function(proc, port) { return {"src":makeOutPort(proc, port)} },
        peg$c30 = function(port, proc) { return {"tgt":makeInPort(proc, port)} },
        peg$c31 = "'",
        peg$c32 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c33 = function(iip) { return {"data":iip.join("")} },
        peg$c34 = function(iip) { return {"data":iip} },
        peg$c35 = function(name) { return name},
        peg$c36 = /^[a-zA-Z_]/,
        peg$c37 = { type: "class", value: "[a-zA-Z_]", description: "[a-zA-Z_]" },
        peg$c38 = /^[a-zA-Z0-9_\-]/,
        peg$c39 = { type: "class", value: "[a-zA-Z0-9_\\-]", description: "[a-zA-Z0-9_\\-]" },
        peg$c40 = function(name) { return makeName(name)},
        peg$c41 = function(name, comp) { parser.addNode(name,comp); return name},
        peg$c42 = function(comp) { return parser.addAnonymousNode(comp, location().start.offset) },
        peg$c43 = "(",
        peg$c44 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c45 = /^[a-zA-Z\/\-0-9_]/,
        peg$c46 = { type: "class", value: "[a-zA-Z/\\-0-9_]", description: "[a-zA-Z/\\-0-9_]" },
        peg$c47 = ")",
        peg$c48 = { type: "literal", value: ")", description: "\")\"" },
        peg$c49 = function(comp, meta) { var o = {}; comp ? o.comp = comp.join("") : o.comp = ''; meta ? o.meta = meta.join("").split(',') : null; return o; },
        peg$c50 = /^[a-zA-Z\/=_,0-9]/,
        peg$c51 = { type: "class", value: "[a-zA-Z/=_,0-9]", description: "[a-zA-Z/=_,0-9]" },
        peg$c52 = function(meta) {return meta},
        peg$c53 = "@",
        peg$c54 = { type: "literal", value: "@", description: "\"@\"" },
        peg$c55 = /^[a-zA-Z0-9\-_]/,
        peg$c56 = { type: "class", value: "[a-zA-Z0-9\\-_]", description: "[a-zA-Z0-9\\-_]" },
        peg$c57 = /^[a-zA-Z0-9\-_ .]/,
        peg$c58 = { type: "class", value: "[a-zA-Z0-9\\-_ \\.]", description: "[a-zA-Z0-9\\-_ \\.]" },
        peg$c59 = function(key, value) { return [key.join(''), value.join('')]; },
        peg$c60 = function(portname, portindex) {return { port: options.caseSensitive? portname : portname.toLowerCase(), index: portindex != null ? portindex : undefined }},
        peg$c61 = function(port) { return port; },
        peg$c62 = /^[a-zA-Z.0-9_]/,
        peg$c63 = { type: "class", value: "[a-zA-Z.0-9_]", description: "[a-zA-Z.0-9_]" },
        peg$c64 = function(portname) {return makeName(portname)},
        peg$c65 = "[",
        peg$c66 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c67 = /^[0-9]/,
        peg$c68 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c69 = "]",
        peg$c70 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c71 = function(portindex) {return parseInt(portindex.join(''))},
        peg$c72 = /^[^\n\r\u2028\u2029]/,
        peg$c73 = { type: "class", value: "[^\\n\\r\\u2028\\u2029]", description: "[^\\n\\r\\u2028\\u2029]" },
        peg$c74 = /^[\\]/,
        peg$c75 = { type: "class", value: "[\\\\]", description: "[\\\\]" },
        peg$c76 = /^[']/,
        peg$c77 = { type: "class", value: "[']", description: "[']" },
        peg$c78 = function() { return "'"; },
        peg$c79 = /^[^']/,
        peg$c80 = { type: "class", value: "[^']", description: "[^']" },
        peg$c81 = " ",
        peg$c82 = { type: "literal", value: " ", description: "\" \"" },
        peg$c83 = function(value) { return value; },
        peg$c84 = "{",
        peg$c85 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c86 = "}",
        peg$c87 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c88 = { type: "other", description: "whitespace" },
        peg$c89 = /^[ \t\n\r]/,
        peg$c90 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
        peg$c91 = "false",
        peg$c92 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c93 = function() { return false; },
        peg$c94 = "null",
        peg$c95 = { type: "literal", value: "null", description: "\"null\"" },
        peg$c96 = function() { return null;  },
        peg$c97 = "true",
        peg$c98 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c99 = function() { return true;  },
        peg$c100 = function(head, m) { return m; },
        peg$c101 = function(head, tail) {
                  var result = {}, i;

                  result[head.name] = head.value;

                  for (i = 0; i < tail.length; i++) {
                    result[tail[i].name] = tail[i].value;
                  }

                  return result;
                },
        peg$c102 = function(members) { return members !== null ? members: {}; },
        peg$c103 = function(name, value) {
                return { name: name, value: value };
              },
        peg$c104 = function(head, v) { return v; },
        peg$c105 = function(head, tail) { return [head].concat(tail); },
        peg$c106 = function(values) { return values !== null ? values : []; },
        peg$c107 = { type: "other", description: "number" },
        peg$c108 = function() { return parseFloat(text()); },
        peg$c109 = /^[1-9]/,
        peg$c110 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c111 = /^[eE]/,
        peg$c112 = { type: "class", value: "[eE]", description: "[eE]" },
        peg$c113 = "-",
        peg$c114 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c115 = "+",
        peg$c116 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c117 = "0",
        peg$c118 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c119 = { type: "other", description: "string" },
        peg$c120 = function(chars) { return chars.join(""); },
        peg$c121 = "\"",
        peg$c122 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c123 = "\\",
        peg$c124 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c125 = "/",
        peg$c126 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c127 = "b",
        peg$c128 = { type: "literal", value: "b", description: "\"b\"" },
        peg$c129 = function() { return "\b"; },
        peg$c130 = "f",
        peg$c131 = { type: "literal", value: "f", description: "\"f\"" },
        peg$c132 = function() { return "\f"; },
        peg$c133 = "n",
        peg$c134 = { type: "literal", value: "n", description: "\"n\"" },
        peg$c135 = function() { return "\n"; },
        peg$c136 = "r",
        peg$c137 = { type: "literal", value: "r", description: "\"r\"" },
        peg$c138 = function() { return "\r"; },
        peg$c139 = "t",
        peg$c140 = { type: "literal", value: "t", description: "\"t\"" },
        peg$c141 = function() { return "\t"; },
        peg$c142 = "u",
        peg$c143 = { type: "literal", value: "u", description: "\"u\"" },
        peg$c144 = function(digits) {
                    return String.fromCharCode(parseInt(digits, 16));
                  },
        peg$c145 = function(sequence) { return sequence; },
        peg$c146 = /^[^\0-\x1F"\\]/,
        peg$c147 = { type: "class", value: "[^\\0-\\x1F\\x22\\x5C]", description: "[^\\0-\\x1F\\x22\\x5C]" },
        peg$c148 = /^[0-9a-f]/i,
        peg$c149 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },

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
          s3 = peg$parsenode();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c3;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseportName();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s6 = peg$c5;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c6); }
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
                        s1 = peg$c7(s3, s5, s7);
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
          if (input.substr(peg$currPos, 8) === peg$c8) {
            s2 = peg$c8;
            peg$currPos += 8;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenode();
            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s4 = peg$c3;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c4); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parseportName();
                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 58) {
                    s6 = peg$c5;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c6); }
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
            if (input.substr(peg$currPos, 15) === peg$c11) {
              s2 = peg$c11;
              peg$currPos += 15;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c12); }
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
                    s1 = peg$c13(s3);
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
              if (input.substr(peg$currPos, 16) === peg$c14) {
                s2 = peg$c14;
                peg$currPos += 16;
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
              s1 = peg$parseannotation();
              if (s1 !== peg$FAILED) {
                s2 = peg$parsenewline();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c17(s1);
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
                s1 = peg$parsecomment();
                if (s1 !== peg$FAILED) {
                  s2 = peg$parsenewline();
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
                    s2 = peg$parsenewline();
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
                            s1 = peg$c18(s2);
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
          s2 = peg$c19;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
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
            s4 = peg$parsenewline();
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

    function peg$parsenewline() {
      var s0;

      if (peg$c21.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c22); }
      }

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 35) {
          s2 = peg$c23;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
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
          if (input.substr(peg$currPos, 2) === peg$c25) {
            s3 = peg$c25;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c26); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseconnection();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c27(s1, s5);
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
            s1 = peg$c28(s1, s2, s3);
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
              s1 = peg$c28(s1, s2, s3);
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
          s1 = peg$c29(s1, s2);
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
          s1 = peg$c30(s1, s2);
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
        s1 = peg$c31;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
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
            s3 = peg$c31;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c32); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c33(s2);
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
          s1 = peg$c34(s1);
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
        s1 = peg$c35(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsenodeName();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c35(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsenodeComponent();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c35(s1);
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
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c38.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c39); }
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
        s1 = peg$c40(s1);
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
          s1 = peg$c41(s1, s2);
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
        s1 = peg$c42(s1);
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
        s1 = peg$c43;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c45.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c45.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c46); }
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
              s4 = peg$c47;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c49(s2, s3);
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
        s1 = peg$c5;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c50.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c51); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c50.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c51); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c52(s2);
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

    function peg$parseannotation() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c23;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 64) {
            s3 = peg$c53;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c54); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            if (peg$c55.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c56); }
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                if (peg$c55.test(input.charAt(peg$currPos))) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c56); }
                }
              }
            } else {
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                s6 = [];
                if (peg$c57.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c58); }
                }
                if (s7 !== peg$FAILED) {
                  while (s7 !== peg$FAILED) {
                    s6.push(s7);
                    if (peg$c57.test(input.charAt(peg$currPos))) {
                      s7 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c58); }
                    }
                  }
                } else {
                  s6 = peg$FAILED;
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c59(s4, s6);
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
          s1 = peg$c60(s1, s2);
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
          s1 = peg$c61(s1);
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
          s1 = peg$c61(s2);
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
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        if (peg$c62.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c63); }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          if (peg$c62.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c63); }
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
        s1 = peg$c64(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseportIndex() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c65;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c66); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c67.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c68); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c67.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c68); }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s3 = peg$c69;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c70); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c71(s2);
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

      if (peg$c72.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c73); }
      }

      return s0;
    }

    function peg$parseiipchar() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (peg$c74.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c75); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c76.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c77); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c78();
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
        if (peg$c79.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c80); }
        }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c81;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (input.charCodeAt(peg$currPos) === 32) {
          s1 = peg$c81;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c82); }
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
        s1 = peg$c81;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (input.charCodeAt(peg$currPos) === 32) {
            s1 = peg$c81;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c82); }
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
            s1 = peg$c83(s2);
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
          s2 = peg$c65;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c66); }
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
          s2 = peg$c84;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c85); }
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
          s2 = peg$c69;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c70); }
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
          s2 = peg$c86;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c87); }
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
          s2 = peg$c5;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
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
          s2 = peg$c19;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c20); }
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
      if (peg$c89.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c90); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c89.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c90); }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c88); }
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
      if (input.substr(peg$currPos, 5) === peg$c91) {
        s1 = peg$c91;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c92); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c93();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsenull() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c94) {
        s1 = peg$c94;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c95); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c96();
      }
      s0 = s1;

      return s0;
    }

    function peg$parsetrue() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c97) {
        s1 = peg$c97;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c98); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c99();
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
              s6 = peg$c100(s3, s7);
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
                s6 = peg$c100(s3, s7);
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
            s3 = peg$c101(s3, s4);
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
            s1 = peg$c102(s2);
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
            s1 = peg$c103(s1, s3);
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
              s6 = peg$c104(s3, s7);
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
                s6 = peg$c104(s3, s7);
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
            s3 = peg$c105(s3, s4);
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
            s1 = peg$c106(s2);
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
              s1 = peg$c108();
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
        if (peg$silentFails === 0) { peg$fail(peg$c107); }
      }

      return s0;
    }

    function peg$parsedecimal_point() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 46) {
        s0 = peg$c3;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c4); }
      }

      return s0;
    }

    function peg$parsedigit1_9() {
      var s0;

      if (peg$c109.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c110); }
      }

      return s0;
    }

    function peg$parsee() {
      var s0;

      if (peg$c111.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c112); }
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
        s0 = peg$c113;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c114); }
      }

      return s0;
    }

    function peg$parseplus() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 43) {
        s0 = peg$c115;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c116); }
      }

      return s0;
    }

    function peg$parsezero() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 48) {
        s0 = peg$c117;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c118); }
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
            s1 = peg$c120(s2);
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
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
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
            s2 = peg$c121;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c122); }
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 92) {
              s2 = peg$c123;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c124); }
            }
            if (s2 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 47) {
                s2 = peg$c125;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c126); }
              }
              if (s2 === peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 98) {
                  s3 = peg$c127;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c128); }
                }
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s2;
                  s3 = peg$c129();
                }
                s2 = s3;
                if (s2 === peg$FAILED) {
                  s2 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 102) {
                    s3 = peg$c130;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c131); }
                  }
                  if (s3 !== peg$FAILED) {
                    peg$savedPos = s2;
                    s3 = peg$c132();
                  }
                  s2 = s3;
                  if (s2 === peg$FAILED) {
                    s2 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 110) {
                      s3 = peg$c133;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c134); }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s2;
                      s3 = peg$c135();
                    }
                    s2 = s3;
                    if (s2 === peg$FAILED) {
                      s2 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 114) {
                        s3 = peg$c136;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c137); }
                      }
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s2;
                        s3 = peg$c138();
                      }
                      s2 = s3;
                      if (s2 === peg$FAILED) {
                        s2 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 116) {
                          s3 = peg$c139;
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c140); }
                        }
                        if (s3 !== peg$FAILED) {
                          peg$savedPos = s2;
                          s3 = peg$c141();
                        }
                        s2 = s3;
                        if (s2 === peg$FAILED) {
                          s2 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 117) {
                            s3 = peg$c142;
                            peg$currPos++;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c143); }
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
                              s3 = peg$c144(s4);
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
            s1 = peg$c145(s2);
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
        s0 = peg$c123;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c124); }
      }

      return s0;
    }

    function peg$parsequotation_mark() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 34) {
        s0 = peg$c121;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c122); }
      }

      return s0;
    }

    function peg$parseunescaped() {
      var s0;

      if (peg$c146.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c147); }
      }

      return s0;
    }

    function peg$parseDIGIT() {
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

    function peg$parseHEXDIG() {
      var s0;

      if (peg$c148.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c149); }
      }

      return s0;
    }


      var parser, edges, nodes;

      var defaultInPort = "IN", defaultOutPort = "OUT";

      parser = this;
      delete parser.properties;
      delete parser.inports;
      delete parser.outports;
      delete parser.groups;

      edges = parser.edges = [];

      nodes = {};

      var serialize, indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      parser.validateContents = function(graph, options) {
        // Ensure all nodes have a component
        if (graph.processes) {
          Object.keys(graph.processes).forEach(function (node) {
            if (!graph.processes[node].component) {
              throw new Error('Node "' + node + '" does not have a component defined');
            }
          });
        }
        // Ensure all inports point to existing nodes
        if (graph.inports) {
          Object.keys(graph.inports).forEach(function (port) {
            var portDef = graph.inports[port];
            if (!graph.processes[portDef.process]) {
              throw new Error('Inport "' + port + '" is connected to an undefined target node "' + portDef.process + '"');
            }
          });
        }
        // Ensure all outports point to existing nodes
        if (graph.outports) {
          Object.keys(graph.outports).forEach(function (port) {
            var portDef = graph.outports[port];
            if (!graph.processes[portDef.process]) {
              throw new Error('Outport "' + port + '" is connected to an undefined source node "' + portDef.process + '"');
            }
          });
        }
        // Ensure all edges have nodes defined
        if (graph.connections) {
          graph.connections.forEach(function (edge) {
            if (edge.tgt && !graph.processes[edge.tgt.process]) {
              if (edge.data) {
                throw new Error('IIP containing "' + edge.data + '" is connected to an undefined target node "' + edge.tgt.process + '"');
              }
              throw new Error('Edge from "' + edge.src.process + '" port "' + edge.src.port + '" is connected to an undefined target node "' + edge.tgt.process + '"');
            }
            if (edge.src && !graph.processes[edge.src.process]) {
              throw new Error('Edge to "' + edge.tgt.process + '" port "' + edge.tgt.port + '" is connected to an undefined source node "' + edge.src.process + '"');
            }
          });
        }
      };

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
        if (input.properties) {
          if (input.properties.environment && input.properties.environment.type) {
            output += "# @runtime " + input.properties.environment.type + "\n";
          }
          Object.keys(input.properties).forEach(function (prop) {
            if (!prop.match(/^[a-zA-Z0-9\-_]+$/)) {
              return;
            }
            var propval = input.properties[prop];
            if (typeof propval !== 'string') {
              return;
            }
            if (!propval.match(/^[a-zA-Z0-9\-_\s\.]+$/)) {
              return;
            }
            output += "# @" + prop + " " + propval + '\n';
          });
        }
        ref = input.inports;
        for (name in ref) {
          inPort = ref[name];
          process = getInOutName(name, inPort);
          name = input.caseSensitive ? name : name.toUpperCase();
          inPort.port = input.caseSensitive ? inPort.port : inPort.port.toUpperCase();
          output += "INPORT=" + process + "." + inPort.port + ":" + name + "\n";
        }
        ref1 = input.outports;
        for (name in ref1) {
          outPort = ref1[name];
          process = getInOutName(name, inPort);
          name = input.caseSensitive ? name : name.toUpperCase();
          outPort.port = input.caseSensitive ? outPort.port : outPort.port.toUpperCase();
          output += "OUTPORT=" + process + "." + outPort.port + ":" + name + "\n";
        }
        output += "\n";
        ref2 = input.connections;
        for (i = 0, len = ref2.length; i < len; i++) {
          conn = ref2[i];
          if (conn.data != null) {
            tgtPort = input.caseSensitive ? conn.tgt.port : conn.tgt.port.toUpperCase();
            tgtName = conn.tgt.process;
            tgtProcess = input.processes[tgtName].component;
            tgt = getName(tgtName);
            if (indexOf.call(namedComponents, tgtProcess) < 0) {
              tgt += "(" + tgtProcess + ")";
              namedComponents.push(tgtProcess);
            }
            output += '"' + conn.data + '"' + (" -> " + tgtPort + " " + tgt + "\n");
          } else {
            srcPort = input.caseSensitive ? conn.src.port : conn.src.port.toUpperCase();
            srcName = conn.src.process;
            srcProcess = input.processes[srcName].component;
            src = getName(srcName);
            if (indexOf.call(namedComponents, srcProcess) < 0) {
              src += "(" + srcProcess + ")";
              namedComponents.push(srcProcess);
            }
            tgtPort = input.caseSensitive ? conn.tgt.port : conn.tgt.port.toUpperCase();
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
          inports: parser.inports || {},
          outports: parser.outports || {},
          groups: parser.groups || [],
          processes: nodes || {},
          connections: parser.processEdges()
        };

        if (parser.properties) {
          result.properties = parser.properties;
        }
        result.caseSensitive = options.caseSensitive || false;

        var validateSchema = parser.validateSchema; // default
        if (typeof(options.validateSchema) !== 'undefined') { validateSchema = options.validateSchema; } // explicit option
        if (validateSchema) {
          if (typeof(tv4) === 'undefined') {
            var tv4 = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"tv4\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
          }
          var schema = __webpack_require__(29);
          var validation = tv4.validateMultiple(result, schema);
          if (!validation.valid) {
            throw new Error("fbp: Did not validate againt graph schema:\n" + JSON.stringify(validation.errors, null, 2));
          }
        }

        if (typeof options.validateContents === 'undefined' || options.validateContents) {
          parser.validateContents(result);
        }

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

      parser.registerAnnotation = function (key, value) {
        if (!parser.properties) {
          parser.properties = {};
        }

        if (key === 'runtime') {
          parser.properties.environment = {};
          parser.properties.environment.type = value;
          return;
        }

        parser.properties[key] = value;
      };

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

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

(function () {
  var EventEmitter,
      IP,
      Network,
      componentLoader,
      graph,
      internalSocket,
      platform,
      utils,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  internalSocket = __webpack_require__(4);

  graph = __webpack_require__(5);

  EventEmitter = __webpack_require__(0).EventEmitter;

  platform = __webpack_require__(3);

  componentLoader = __webpack_require__(8);

  utils = __webpack_require__(15);

  IP = __webpack_require__(2);

  Network = function (superClass) {
    extend(Network, superClass);

    Network.prototype.processes = {};

    Network.prototype.connections = [];

    Network.prototype.initials = [];

    Network.prototype.defaults = [];

    Network.prototype.graph = null;

    Network.prototype.startupDate = null;

    function Network(graph, options) {
      this.options = options != null ? options : {};
      this.processes = {};
      this.connections = [];
      this.initials = [];
      this.nextInitials = [];
      this.defaults = [];
      this.graph = graph;
      this.started = false;
      this.stopped = true;
      this.debug = true;
      this.eventBuffer = [];
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

    Network.prototype.uptime = function () {
      if (!this.startupDate) {
        return 0;
      }
      return new Date() - this.startupDate;
    };

    Network.prototype.getActiveProcesses = function () {
      var active, name, process, ref;
      active = [];
      if (!this.started) {
        return active;
      }
      ref = this.processes;
      for (name in ref) {
        process = ref[name];
        if (process.component.load > 0) {
          active.push(name);
        }
        if (process.component.__openConnections > 0) {
          active.push(name);
        }
      }
      return active;
    };

    Network.prototype.bufferedEmit = function (event, payload) {
      var ev, i, len, ref;
      if (event === 'error' || event === 'process-error' || event === 'end') {
        this.emit(event, payload);
        return;
      }
      if (!this.isStarted() && event !== 'end') {
        this.eventBuffer.push({
          type: event,
          payload: payload
        });
        return;
      }
      this.emit(event, payload);
      if (event === 'start') {
        ref = this.eventBuffer;
        for (i = 0, len = ref.length; i < len; i++) {
          ev = ref[i];
          this.emit(ev.type, ev.payload);
        }
        return this.eventBuffer = [];
      }
    };

    Network.prototype.load = function (component, metadata, callback) {
      return this.loader.load(component, callback, metadata);
    };

    Network.prototype.addNode = function (node, callback) {
      var process;
      if (this.processes[node.id]) {
        callback(null, this.processes[node.id]);
        return;
      }
      process = {
        id: node.id
      };
      if (!node.component) {
        this.processes[process.id] = process;
        callback(null, process);
        return;
      }
      return this.load(node.component, node.metadata, function (_this) {
        return function (err, instance) {
          var inPorts, name, outPorts, port;
          if (err) {
            return callback(err);
          }
          instance.nodeId = node.id;
          process.component = instance;
          process.componentName = node.component;
          inPorts = process.component.inPorts.ports || process.component.inPorts;
          outPorts = process.component.outPorts.ports || process.component.outPorts;
          for (name in inPorts) {
            port = inPorts[name];
            port.node = node.id;
            port.nodeInstance = instance;
            port.name = name;
          }
          for (name in outPorts) {
            port = outPorts[name];
            port.node = node.id;
            port.nodeInstance = instance;
            port.name = name;
          }
          if (instance.isSubgraph()) {
            _this.subscribeSubgraph(process);
          }
          _this.subscribeNode(process);
          _this.processes[process.id] = process;
          return callback(null, process);
        };
      }(this));
    };

    Network.prototype.removeNode = function (node, callback) {
      if (!this.processes[node.id]) {
        return callback(new Error("Node " + node.id + " not found"));
      }
      return this.processes[node.id].component.shutdown(function (_this) {
        return function (err) {
          if (err) {
            return callback(err);
          }
          delete _this.processes[node.id];
          return callback(null);
        };
      }(this));
    };

    Network.prototype.renameNode = function (oldId, newId, callback) {
      var inPorts, name, outPorts, port, process;
      process = this.getNode(oldId);
      if (!process) {
        return callback(new Error("Process " + oldId + " not found"));
      }
      process.id = newId;
      inPorts = process.component.inPorts.ports || process.component.inPorts;
      outPorts = process.component.outPorts.ports || process.component.outPorts;
      for (name in inPorts) {
        port = inPorts[name];
        if (!port) {
          continue;
        }
        port.node = newId;
      }
      for (name in outPorts) {
        port = outPorts[name];
        if (!port) {
          continue;
        }
        port.node = newId;
      }
      this.processes[newId] = process;
      delete this.processes[oldId];
      return callback(null);
    };

    Network.prototype.getNode = function (id) {
      return this.processes[id];
    };

    Network.prototype.connect = function (done) {
      var callStack, edges, initializers, nodes, serialize, setDefaults, subscribeGraph;
      if (done == null) {
        done = function done() {};
      }
      callStack = 0;
      serialize = function (_this) {
        return function (next, add) {
          return function (type) {
            return _this["add" + type](add, function (err) {
              if (err) {
                return done(err);
              }
              callStack++;
              if (callStack % 100 === 0) {
                setTimeout(function () {
                  return next(type);
                }, 0);
                return;
              }
              return next(type);
            });
          };
        };
      }(this);
      subscribeGraph = function (_this) {
        return function () {
          _this.subscribeGraph();
          return done();
        };
      }(this);
      setDefaults = utils.reduceRight(this.graph.nodes, serialize, subscribeGraph);
      initializers = utils.reduceRight(this.graph.initializers, serialize, function () {
        return setDefaults("Defaults");
      });
      edges = utils.reduceRight(this.graph.edges, serialize, function () {
        return initializers("Initial");
      });
      nodes = utils.reduceRight(this.graph.nodes, serialize, function () {
        return edges("Edge");
      });
      return nodes("Node");
    };

    Network.prototype.connectPort = function (socket, process, port, index, inbound, callback) {
      if (inbound) {
        socket.to = {
          process: process,
          port: port,
          index: index
        };
        if (!(process.component.inPorts && process.component.inPorts[port])) {
          callback(new Error("No inport '" + port + "' defined in process " + process.id + " (" + socket.getId() + ")"));
          return;
        }
        if (process.component.inPorts[port].isAddressable()) {
          process.component.inPorts[port].attach(socket, index);
          callback();
          return;
        }
        process.component.inPorts[port].attach(socket);
        callback();
        return;
      }
      socket.from = {
        process: process,
        port: port,
        index: index
      };
      if (!(process.component.outPorts && process.component.outPorts[port])) {
        callback(new Error("No outport '" + port + "' defined in process " + process.id + " (" + socket.getId() + ")"));
        return;
      }
      if (process.component.outPorts[port].isAddressable()) {
        process.component.outPorts[port].attach(socket, index);
        callback();
        return;
      }
      process.component.outPorts[port].attach(socket);
      callback();
    };

    Network.prototype.subscribeGraph = function () {
      var graphOps, processOps, processing, registerOp;
      graphOps = [];
      processing = false;
      registerOp = function registerOp(op, details) {
        return graphOps.push({
          op: op,
          details: details
        });
      };
      processOps = function (_this) {
        return function (err) {
          var cb, op;
          if (err) {
            if (_this.listeners('process-error').length === 0) {
              throw err;
            }
            _this.bufferedEmit('process-error', err);
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
      }(this);
      this.graph.on('addNode', function (node) {
        registerOp('addNode', node);
        if (!processing) {
          return processOps();
        }
      });
      this.graph.on('removeNode', function (node) {
        registerOp('removeNode', node);
        if (!processing) {
          return processOps();
        }
      });
      this.graph.on('renameNode', function (oldId, newId) {
        registerOp('renameNode', {
          from: oldId,
          to: newId
        });
        if (!processing) {
          return processOps();
        }
      });
      this.graph.on('addEdge', function (edge) {
        registerOp('addEdge', edge);
        if (!processing) {
          return processOps();
        }
      });
      this.graph.on('removeEdge', function (edge) {
        registerOp('removeEdge', edge);
        if (!processing) {
          return processOps();
        }
      });
      this.graph.on('addInitial', function (iip) {
        registerOp('addInitial', iip);
        if (!processing) {
          return processOps();
        }
      });
      return this.graph.on('removeInitial', function (iip) {
        registerOp('removeInitial', iip);
        if (!processing) {
          return processOps();
        }
      });
    };

    Network.prototype.subscribeSubgraph = function (node) {
      var emitSub;
      if (!node.component.isReady()) {
        node.component.once('ready', function (_this) {
          return function () {
            return _this.subscribeSubgraph(node);
          };
        }(this));
        return;
      }
      if (!node.component.network) {
        return;
      }
      node.component.network.setDebug(this.debug);
      emitSub = function (_this) {
        return function (type, data) {
          if (type === 'process-error' && _this.listeners('process-error').length === 0) {
            if (data.id && data.metadata && data.error) {
              throw data.error;
            }
            throw data;
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
          return _this.bufferedEmit(type, data);
        };
      }(this);
      node.component.network.on('connect', function (data) {
        return emitSub('connect', data);
      });
      node.component.network.on('begingroup', function (data) {
        return emitSub('begingroup', data);
      });
      node.component.network.on('data', function (data) {
        return emitSub('data', data);
      });
      node.component.network.on('endgroup', function (data) {
        return emitSub('endgroup', data);
      });
      node.component.network.on('disconnect', function (data) {
        return emitSub('disconnect', data);
      });
      node.component.network.on('ip', function (data) {
        return emitSub('ip', data);
      });
      return node.component.network.on('process-error', function (data) {
        return emitSub('process-error', data);
      });
    };

    Network.prototype.subscribeSocket = function (socket, source) {
      socket.on('ip', function (_this) {
        return function (ip) {
          return _this.bufferedEmit('ip', {
            id: socket.getId(),
            type: ip.type,
            socket: socket,
            data: ip.data,
            metadata: socket.metadata
          });
        };
      }(this));
      socket.on('connect', function (_this) {
        return function () {
          if (source && source.component.isLegacy()) {
            if (!source.component.__openConnections) {
              source.component.__openConnections = 0;
            }
            source.component.__openConnections++;
          }
          return _this.bufferedEmit('connect', {
            id: socket.getId(),
            socket: socket,
            metadata: socket.metadata
          });
        };
      }(this));
      socket.on('begingroup', function (_this) {
        return function (group) {
          return _this.bufferedEmit('begingroup', {
            id: socket.getId(),
            socket: socket,
            group: group,
            metadata: socket.metadata
          });
        };
      }(this));
      socket.on('data', function (_this) {
        return function (data) {
          return _this.bufferedEmit('data', {
            id: socket.getId(),
            socket: socket,
            data: data,
            metadata: socket.metadata
          });
        };
      }(this));
      socket.on('endgroup', function (_this) {
        return function (group) {
          return _this.bufferedEmit('endgroup', {
            id: socket.getId(),
            socket: socket,
            group: group,
            metadata: socket.metadata
          });
        };
      }(this));
      socket.on('disconnect', function (_this) {
        return function () {
          _this.bufferedEmit('disconnect', {
            id: socket.getId(),
            socket: socket,
            metadata: socket.metadata
          });
          if (source && source.component.isLegacy()) {
            source.component.__openConnections--;
            if (source.component.__openConnections < 0) {
              source.component.__openConnections = 0;
            }
            if (source.component.__openConnections === 0) {
              return _this.checkIfFinished();
            }
          }
        };
      }(this));
      return socket.on('error', function (_this) {
        return function (event) {
          if (_this.listeners('process-error').length === 0) {
            if (event.id && event.metadata && event.error) {
              throw event.error;
            }
            throw event;
          }
          return _this.bufferedEmit('process-error', event);
        };
      }(this));
    };

    Network.prototype.subscribeNode = function (node) {
      node.component.on('deactivate', function (_this) {
        return function (load) {
          if (load > 0) {
            return;
          }
          return _this.checkIfFinished();
        };
      }(this));
      if (!node.component.getIcon) {
        return;
      }
      return node.component.on('icon', function (_this) {
        return function () {
          return _this.bufferedEmit('icon', {
            id: node.id,
            icon: node.component.getIcon()
          });
        };
      }(this));
    };

    Network.prototype.addEdge = function (edge, callback) {
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
        from.component.once("ready", function (_this) {
          return function () {
            return _this.addEdge(edge, callback);
          };
        }(this));
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
        to.component.once("ready", function (_this) {
          return function () {
            return _this.addEdge(edge, callback);
          };
        }(this));
        return;
      }
      this.subscribeSocket(socket, from);
      return this.connectPort(socket, to, edge.to.port, edge.to.index, true, function (_this) {
        return function (err) {
          if (err) {
            return callback(err);
          }
          return _this.connectPort(socket, from, edge.from.port, edge.from.index, false, function (err) {
            if (err) {
              return callback(err);
            }
            _this.connections.push(socket);
            return callback();
          });
        };
      }(this));
    };

    Network.prototype.removeEdge = function (edge, callback) {
      var connection, i, len, ref, results;
      ref = this.connections;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        connection = ref[i];
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
        results.push(callback());
      }
      return results;
    };

    Network.prototype.addDefaults = function (node, callback) {
      var key, port, process, ref, socket;
      process = this.processes[node.id];
      if (!process.component.isReady()) {
        if (process.component.setMaxListeners) {
          process.component.setMaxListeners(0);
        }
        process.component.once("ready", function (_this) {
          return function () {
            return _this.addDefaults(process, callback);
          };
        }(this));
        return;
      }
      ref = process.component.inPorts.ports;
      for (key in ref) {
        port = ref[key];
        if (typeof port.hasDefault === 'function' && port.hasDefault() && !port.isAttached()) {
          socket = internalSocket.createSocket();
          socket.setDebug(this.debug);
          this.subscribeSocket(socket);
          this.connectPort(socket, process, key, void 0, true, function () {});
          this.connections.push(socket);
          this.defaults.push(socket);
        }
      }
      return callback();
    };

    Network.prototype.addInitial = function (initializer, callback) {
      var socket, to;
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
        to.component.once("ready", function (_this) {
          return function () {
            return _this.addInitial(initializer, callback);
          };
        }(this));
        return;
      }
      return this.connectPort(socket, to, initializer.to.port, initializer.to.index, true, function (_this) {
        return function (err) {
          var init;
          if (err) {
            return callback(err);
          }
          _this.connections.push(socket);
          init = {
            socket: socket,
            data: initializer.from.data
          };
          _this.initials.push(init);
          _this.nextInitials.push(init);
          if (_this.isRunning()) {
            _this.sendInitials();
          } else if (!_this.isStopped()) {
            _this.setStarted(true);
            _this.sendInitials();
          }
          return callback();
        };
      }(this));
    };

    Network.prototype.removeInitial = function (initializer, callback) {
      var connection, i, init, j, k, len, len1, len2, ref, ref1, ref2;
      ref = this.connections;
      for (i = 0, len = ref.length; i < len; i++) {
        connection = ref[i];
        if (!connection) {
          continue;
        }
        if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {
          continue;
        }
        connection.to.process.component.inPorts[connection.to.port].detach(connection);
        this.connections.splice(this.connections.indexOf(connection), 1);
        ref1 = this.initials;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          init = ref1[j];
          if (!init) {
            continue;
          }
          if (init.socket !== connection) {
            continue;
          }
          this.initials.splice(this.initials.indexOf(init), 1);
        }
        ref2 = this.nextInitials;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          init = ref2[k];
          if (!init) {
            continue;
          }
          if (init.socket !== connection) {
            continue;
          }
          this.nextInitials.splice(this.nextInitials.indexOf(init), 1);
        }
      }
      return callback();
    };

    Network.prototype.sendInitial = function (initial) {
      return initial.socket.post(new IP('data', initial.data, {
        initial: true
      }));
    };

    Network.prototype.sendInitials = function (callback) {
      var send;
      if (!callback) {
        callback = function callback() {};
      }
      send = function (_this) {
        return function () {
          var i, initial, len, ref;
          ref = _this.initials;
          for (i = 0, len = ref.length; i < len; i++) {
            initial = ref[i];
            _this.sendInitial(initial);
          }
          _this.initials = [];
          return callback();
        };
      }(this);
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        return process.nextTick(send);
      } else {
        return setTimeout(send, 0);
      }
    };

    Network.prototype.isStarted = function () {
      return this.started;
    };

    Network.prototype.isStopped = function () {
      return this.stopped;
    };

    Network.prototype.isRunning = function () {
      if (!this.started) {
        return false;
      }
      return this.getActiveProcesses().length > 0;
    };

    Network.prototype.startComponents = function (callback) {
      var count, id, length, onProcessStart, process, ref, results;
      if (!callback) {
        callback = function callback() {};
      }
      count = 0;
      length = this.processes ? Object.keys(this.processes).length : 0;
      onProcessStart = function onProcessStart(err) {
        if (err) {
          return callback(err);
        }
        count++;
        if (count === length) {
          return callback();
        }
      };
      if (!(this.processes && Object.keys(this.processes).length)) {
        return callback();
      }
      ref = this.processes;
      results = [];
      for (id in ref) {
        process = ref[id];
        if (process.component.isStarted()) {
          onProcessStart();
          continue;
        }
        if (process.component.start.length === 0) {
          platform.deprecated('component.start method without callback is deprecated');
          process.component.start();
          onProcessStart();
          continue;
        }
        results.push(process.component.start(onProcessStart));
      }
      return results;
    };

    Network.prototype.sendDefaults = function (callback) {
      var i, len, ref, socket;
      if (!callback) {
        callback = function callback() {};
      }
      if (!this.defaults.length) {
        return callback();
      }
      ref = this.defaults;
      for (i = 0, len = ref.length; i < len; i++) {
        socket = ref[i];
        if (socket.to.process.component.inPorts[socket.to.port].sockets.length !== 1) {
          continue;
        }
        socket.connect();
        socket.send();
        socket.disconnect();
      }
      return callback();
    };

    Network.prototype.start = function (callback) {
      if (!callback) {
        platform.deprecated('Calling network.start() without callback is deprecated');
        callback = function callback() {};
      }
      if (this.debouncedEnd) {
        this.abortDebounce = true;
      }
      if (this.started) {
        this.stop(function (_this) {
          return function (err) {
            if (err) {
              return callback(err);
            }
            return _this.start(callback);
          };
        }(this));
        return;
      }
      this.initials = this.nextInitials.slice(0);
      this.eventBuffer = [];
      return this.startComponents(function (_this) {
        return function (err) {
          if (err) {
            return callback(err);
          }
          return _this.sendInitials(function (err) {
            if (err) {
              return callback(err);
            }
            return _this.sendDefaults(function (err) {
              if (err) {
                return callback(err);
              }
              _this.setStarted(true);
              return callback(null);
            });
          });
        };
      }(this));
    };

    Network.prototype.stop = function (callback) {
      var connection, count, i, id, len, length, onProcessEnd, process, ref, ref1, results;
      if (!callback) {
        platform.deprecated('Calling network.stop() without callback is deprecated');
        callback = function callback() {};
      }
      if (this.debouncedEnd) {
        this.abortDebounce = true;
      }
      if (!this.started) {
        this.stopped = true;
        return callback(null);
      }
      ref = this.connections;
      for (i = 0, len = ref.length; i < len; i++) {
        connection = ref[i];
        if (!connection.isConnected()) {
          continue;
        }
        connection.disconnect();
      }
      count = 0;
      length = this.processes ? Object.keys(this.processes).length : 0;
      onProcessEnd = function (_this) {
        return function (err) {
          if (err) {
            return callback(err);
          }
          count++;
          if (count === length) {
            _this.setStarted(false);
            _this.stopped = true;
            return callback();
          }
        };
      }(this);
      if (!(this.processes && Object.keys(this.processes).length)) {
        this.setStarted(false);
        this.stopped = true;
        return callback();
      }
      ref1 = this.processes;
      results = [];
      for (id in ref1) {
        process = ref1[id];
        if (!process.component.isStarted()) {
          onProcessEnd();
          continue;
        }
        if (process.component.shutdown.length === 0) {
          platform.deprecated('component.shutdown method without callback is deprecated');
          process.component.shutdown();
          onProcessEnd();
          continue;
        }
        results.push(process.component.shutdown(onProcessEnd));
      }
      return results;
    };

    Network.prototype.setStarted = function (started) {
      if (this.started === started) {
        return;
      }
      if (!started) {
        this.started = false;
        this.bufferedEmit('end', {
          start: this.startupDate,
          end: new Date(),
          uptime: this.uptime()
        });
        return;
      }
      if (!this.startupDate) {
        this.startupDate = new Date();
      }
      this.started = true;
      this.stopped = false;
      return this.bufferedEmit('start', {
        start: this.startupDate
      });
    };

    Network.prototype.checkIfFinished = function () {
      if (this.isRunning()) {
        return;
      }
      delete this.abortDebounce;
      if (!this.debouncedEnd) {
        this.debouncedEnd = utils.debounce(function (_this) {
          return function () {
            if (_this.abortDebounce) {
              return;
            }
            if (_this.isRunning()) {
              return;
            }
            return _this.setStarted(false);
          };
        }(this), 50);
      }
      return this.debouncedEnd();
    };

    Network.prototype.getDebug = function () {
      return this.debug;
    };

    Network.prototype.setDebug = function (active) {
      var i, instance, len, process, processId, ref, ref1, results, socket;
      if (active === this.debug) {
        return;
      }
      this.debug = active;
      ref = this.connections;
      for (i = 0, len = ref.length; i < len; i++) {
        socket = ref[i];
        socket.setDebug(active);
      }
      ref1 = this.processes;
      results = [];
      for (processId in ref1) {
        process = ref1[processId];
        instance = process.component;
        if (instance.isSubgraph()) {
          results.push(instance.network.setDebug(active));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return Network;
  }(EventEmitter);

  exports.Network = Network;
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var _clone, contains, createReduce, debounce, getKeys, getValues, guessLanguageFromFilename, intersection, isArray, isObject, optimizeCb, reduceRight, unique;

  _clone = function clone(obj) {
    var flags, key, newInstance;
    if (obj == null || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
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
      newInstance[key] = _clone(obj[key]);
    }
    return newInstance;
  };

  guessLanguageFromFilename = function guessLanguageFromFilename(filename) {
    if (/.*\.coffee$/.test(filename)) {
      return 'coffeescript';
    }
    return 'javascript';
  };

  isArray = function isArray(obj) {
    if (Array.isArray) {
      return Array.isArray(obj);
    }
    return Object.prototype.toString.call(arg) === '[object Array]';
  };

  isObject = function isObject(obj) {
    var type;
    type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
    return type === 'function' || type === 'object' && !!obj;
  };

  unique = function unique(array) {
    var k, key, output, ref, results, value;
    output = {};
    for (key = k = 0, ref = array.length; 0 <= ref ? k < ref : k > ref; key = 0 <= ref ? ++k : --k) {
      output[array[key]] = array[key];
    }
    results = [];
    for (key in output) {
      value = output[key];
      results.push(value);
    }
    return results;
  };

  optimizeCb = function optimizeCb(func, context, argCount) {
    if (context === void 0) {
      return func;
    }
    switch (argCount === null ? 3 : argCount) {
      case 1:
        return function (value) {
          return func.call(context, value);
        };
      case 2:
        return function (value, other) {
          return func.call(context, value, other);
        };
      case 3:
        return function (value, index, collection) {
          return func.call(context, value, index, collection);
        };
      case 4:
        return function (accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection);
        };
    }
    return function () {
      return func.apply(context, arguments);
    };
  };

  createReduce = function createReduce(dir) {
    var iterator;
    iterator = function iterator(obj, iteratee, memo, keys, index, length) {
      var currentKey;
      while (index >= 0 && index < length) {
        currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
        index += dir;
      }
      return memo;
    };
    return function (obj, iteratee, memo, context) {
      var index, keys, length;
      iteratee = optimizeCb(iteratee, context, 4);
      keys = Object.keys(obj);
      length = (keys || obj).length;
      index = dir > 0 ? 0 : length - 1;
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  };

  reduceRight = createReduce(-1);

  debounce = function debounce(func, wait, immediate) {
    var args, context, _later, result, timeout, timestamp;
    timeout = void 0;
    args = void 0;
    context = void 0;
    timestamp = void 0;
    result = void 0;
    _later = function later() {
      var last;
      last = Date.now - timestamp;
      if (last < wait && last >= 0) {
        timeout = setTimeout(_later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) {
            context = args = null;
          }
        }
      }
    };
    return function () {
      var callNow;
      context = this;
      args = arguments;
      timestamp = Date.now;
      callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(_later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };
  };

  getKeys = function getKeys(obj) {
    var key, keys;
    if (!isObject(obj)) {
      return [];
    }
    if (Object.keys) {
      return Object.keys(obj);
    }
    keys = [];
    for (key in obj) {
      if (obj.has(key)) {
        keys.push(key);
      }
    }
    return keys;
  };

  getValues = function getValues(obj) {
    var i, keys, length, values;
    keys = getKeys(obj);
    length = keys.length;
    values = Array(length);
    i = 0;
    while (i < length) {
      values[i] = obj[keys[i]];
      i++;
    }
    return values;
  };

  contains = function contains(obj, item, fromIndex) {
    if (!isArray(obj)) {
      obj = getValues(obj);
    }
    if (typeof fromIndex !== 'number' || guard) {
      fromIndex = 0;
    }
    return obj.indexOf(item) >= 0;
  };

  intersection = function intersection(array) {
    var argsLength, i, item, j, k, l, ref, ref1, result;
    result = [];
    argsLength = arguments.length;
    for (i = k = 0, ref = array.length; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      item = array[i];
      if (contains(result, item)) {
        continue;
      }
      for (j = l = 1, ref1 = argsLength; 1 <= ref1 ? l <= ref1 : l >= ref1; j = 1 <= ref1 ? ++l : --l) {
        if (!contains(arguments[j], item)) {
          break;
        }
      }
      if (j === argsLength) {
        result.push(item);
      }
    }
    return result;
  };

  exports.clone = _clone;

  exports.guessLanguageFromFilename = guessLanguageFromFilename;

  exports.optimizeCb = optimizeCb;

  exports.reduceRight = reduceRight;

  exports.debounce = debounce;

  exports.unique = unique;

  exports.intersection = intersection;

  exports.getValues = getValues;
}).call(undefined);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var Component,
      EventEmitter,
      IP,
      ProcessContext,
      ProcessInput,
      ProcessOutput,
      debug,
      debugBrackets,
      debugSend,
      ports,
      bind = function bind(fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  },
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty,
      slice = [].slice;

  EventEmitter = __webpack_require__(0).EventEmitter;

  ports = __webpack_require__(17);

  IP = __webpack_require__(2);

  debug = __webpack_require__(6)('noflo:component');

  debugBrackets = __webpack_require__(6)('noflo:component:brackets');

  debugSend = __webpack_require__(6)('noflo:component:send');

  Component = function (superClass) {
    extend(Component, superClass);

    Component.prototype.description = '';

    Component.prototype.icon = null;

    function Component(options) {
      this.error = bind(this.error, this);
      var ref, ref1, ref2;
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
      this.ordered = (ref = options.ordered) != null ? ref : false;
      this.autoOrdering = (ref1 = options.autoOrdering) != null ? ref1 : null;
      this.outputQ = [];
      this.bracketContext = {
        "in": {},
        out: {}
      };
      this.activateOnInput = (ref2 = options.activateOnInput) != null ? ref2 : true;
      this.forwardBrackets = {
        "in": ['out', 'error']
      };
      if ('forwardBrackets' in options) {
        this.forwardBrackets = options.forwardBrackets;
      }
      if (typeof options.process === 'function') {
        this.process(options.process);
      }
    }

    Component.prototype.getDescription = function () {
      return this.description;
    };

    Component.prototype.isReady = function () {
      return true;
    };

    Component.prototype.isSubgraph = function () {
      return false;
    };

    Component.prototype.setIcon = function (icon) {
      this.icon = icon;
      return this.emit('icon', this.icon);
    };

    Component.prototype.getIcon = function () {
      return this.icon;
    };

    Component.prototype.error = function (e, groups, errorPort, scope) {
      var group, i, j, len1, len2;
      if (groups == null) {
        groups = [];
      }
      if (errorPort == null) {
        errorPort = 'error';
      }
      if (scope == null) {
        scope = null;
      }
      if (this.outPorts[errorPort] && (this.outPorts[errorPort].isAttached() || !this.outPorts[errorPort].isRequired())) {
        for (i = 0, len1 = groups.length; i < len1; i++) {
          group = groups[i];
          this.outPorts[errorPort].openBracket(group, {
            scope: scope
          });
        }
        this.outPorts[errorPort].data(e, {
          scope: scope
        });
        for (j = 0, len2 = groups.length; j < len2; j++) {
          group = groups[j];
          this.outPorts[errorPort].closeBracket(group, {
            scope: scope
          });
        }
        return;
      }
      throw e;
    };

    Component.prototype.setUp = function (callback) {
      return callback();
    };

    Component.prototype.tearDown = function (callback) {
      return callback();
    };

    Component.prototype.start = function (callback) {
      if (this.isStarted()) {
        return callback();
      }
      return this.setUp(function (_this) {
        return function (err) {
          if (err) {
            return callback(err);
          }
          _this.started = true;
          _this.emit('start');
          return callback(null);
        };
      }(this));
    };

    Component.prototype.shutdown = function (callback) {
      var finalize;
      finalize = function (_this) {
        return function () {
          var inPort, inPorts, portName;
          inPorts = _this.inPorts.ports || _this.inPorts;
          for (portName in inPorts) {
            inPort = inPorts[portName];
            if (typeof inPort.clear !== 'function') {
              continue;
            }
            inPort.clear();
          }
          _this.bracketContext = {
            "in": {},
            out: {}
          };
          if (!_this.isStarted()) {
            return callback();
          }
          _this.started = false;
          _this.emit('end');
          return callback();
        };
      }(this);
      return this.tearDown(function (_this) {
        return function (err) {
          var _checkLoad;
          if (err) {
            return callback(err);
          }
          if (_this.load > 0) {
            _checkLoad = function checkLoad(load) {
              if (load > 0) {
                return;
              }
              this.removeListener('deactivate', _checkLoad);
              return finalize();
            };
            _this.on('deactivate', _checkLoad);
            return;
          }
          return finalize();
        };
      }(this));
    };

    Component.prototype.isStarted = function () {
      return this.started;
    };

    Component.prototype.prepareForwarding = function () {
      var i, inPort, len1, outPort, outPorts, ref, results, tmp;
      ref = this.forwardBrackets;
      results = [];
      for (inPort in ref) {
        outPorts = ref[inPort];
        if (!(inPort in this.inPorts.ports)) {
          delete this.forwardBrackets[inPort];
          continue;
        }
        tmp = [];
        for (i = 0, len1 = outPorts.length; i < len1; i++) {
          outPort = outPorts[i];
          if (outPort in this.outPorts.ports) {
            tmp.push(outPort);
          }
        }
        if (tmp.length === 0) {
          results.push(delete this.forwardBrackets[inPort]);
        } else {
          results.push(this.forwardBrackets[inPort] = tmp);
        }
      }
      return results;
    };

    Component.prototype.isLegacy = function () {
      if (this.handle) {
        return false;
      }
      if (this._wpData) {
        return false;
      }
      return true;
    };

    Component.prototype.process = function (handle) {
      var fn, name, port, ref;
      if (typeof handle !== 'function') {
        throw new Error("Process handler must be a function");
      }
      if (!this.inPorts) {
        throw new Error("Component ports must be defined before process function");
      }
      this.prepareForwarding();
      this.handle = handle;
      ref = this.inPorts.ports;
      fn = function (_this) {
        return function (name, port) {
          if (!port.name) {
            port.name = name;
          }
          return port.on('ip', function (ip) {
            return _this.handleIP(ip, port);
          });
        };
      }(this);
      for (name in ref) {
        port = ref[name];
        fn(name, port);
      }
      return this;
    };

    Component.prototype.isForwardingInport = function (port) {
      var portName;
      if (typeof port === 'string') {
        portName = port;
      } else {
        portName = port.name;
      }
      if (portName in this.forwardBrackets) {
        return true;
      }
      return false;
    };

    Component.prototype.isForwardingOutport = function (inport, outport) {
      var inportName, outportName;
      if (typeof inport === 'string') {
        inportName = inport;
      } else {
        inportName = inport.name;
      }
      if (typeof outport === 'string') {
        outportName = outport;
      } else {
        outportName = outport.name;
      }
      if (!this.forwardBrackets[inportName]) {
        return false;
      }
      if (this.forwardBrackets[inportName].indexOf(outportName) !== -1) {
        return true;
      }
      return false;
    };

    Component.prototype.isOrdered = function () {
      if (this.ordered) {
        return true;
      }
      if (this.autoOrdering) {
        return true;
      }
      return false;
    };

    Component.prototype.handleIP = function (ip, port) {
      var buf, context, dataPackets, e, error1, input, output, result;
      if (!port.options.triggering) {
        return;
      }
      if (ip.type === 'openBracket' && this.autoOrdering === null && !this.ordered) {
        debug(this.nodeId + " port '" + port.name + "' entered auto-ordering mode");
        this.autoOrdering = true;
      }
      result = {};
      if (this.isForwardingInport(port)) {
        if (ip.type === 'openBracket') {
          return;
        }
        if (ip.type === 'closeBracket') {
          buf = port.getBuffer(ip.scope, ip.index);
          dataPackets = buf.filter(function (ip) {
            return ip.type === 'data';
          });
          if (this.outputQ.length >= this.load && dataPackets.length === 0) {
            if (buf[0] !== ip) {
              return;
            }
            port.get(ip.scope, ip.index);
            context = this.getBracketContext('in', port.name, ip.scope, ip.index).pop();
            context.closeIp = ip;
            debugBrackets(this.nodeId + " closeBracket-C from '" + context.source + "' to " + context.ports + ": '" + ip.data + "'");
            result = {
              __resolved: true,
              __bracketClosingAfter: [context]
            };
            this.outputQ.push(result);
            this.processOutputQueue();
          }
          if (!dataPackets.length) {
            return;
          }
        }
      }
      context = new ProcessContext(ip, this, port, result);
      input = new ProcessInput(this.inPorts, context);
      output = new ProcessOutput(this.outPorts, context);
      try {
        this.handle(input, output, context);
      } catch (error1) {
        e = error1;
        this.deactivate(context);
        output.sendDone(e);
      }
      if (context.activated) {
        return;
      }
      if (port.isAddressable()) {
        debug(this.nodeId + " packet on '" + port.name + "[" + ip.index + "]' didn't match preconditions: " + ip.type);
        return;
      }
      debug(this.nodeId + " packet on '" + port.name + "' didn't match preconditions: " + ip.type);
    };

    Component.prototype.getBracketContext = function (type, port, scope, idx) {
      var index, name, portsList, ref;
      ref = ports.normalizePortName(port), name = ref.name, index = ref.index;
      if (idx != null) {
        index = idx;
      }
      portsList = type === 'in' ? this.inPorts : this.outPorts;
      if (portsList[name].isAddressable()) {
        port = name + "[" + index + "]";
      }
      if (!this.bracketContext[type][port]) {
        this.bracketContext[type][port] = {};
      }
      if (!this.bracketContext[type][port][scope]) {
        this.bracketContext[type][port][scope] = [];
      }
      return this.bracketContext[type][port][scope];
    };

    Component.prototype.addToResult = function (result, port, ip, before) {
      var idx, index, method, name, ref;
      if (before == null) {
        before = false;
      }
      ref = ports.normalizePortName(port), name = ref.name, index = ref.index;
      method = before ? 'unshift' : 'push';
      if (this.outPorts[name].isAddressable()) {
        idx = index ? parseInt(index) : ip.index;
        if (!result[name]) {
          result[name] = {};
        }
        if (!result[name][idx]) {
          result[name][idx] = [];
        }
        ip.index = idx;
        result[name][idx][method](ip);
        return;
      }
      if (!result[name]) {
        result[name] = [];
      }
      return result[name][method](ip);
    };

    Component.prototype.getForwardableContexts = function (inport, outport, contexts) {
      var forwardable, index, name, ref;
      ref = ports.normalizePortName(outport), name = ref.name, index = ref.index;
      forwardable = [];
      contexts.forEach(function (_this) {
        return function (ctx, idx) {
          var outContext;
          if (!_this.isForwardingOutport(inport, name)) {
            return;
          }
          if (ctx.ports.indexOf(outport) !== -1) {
            return;
          }
          outContext = _this.getBracketContext('out', name, ctx.ip.scope, index)[idx];
          if (outContext) {
            if (outContext.ip.data === ctx.ip.data && outContext.ports.indexOf(outport) !== -1) {
              return;
            }
          }
          return forwardable.push(ctx);
        };
      }(this));
      return forwardable;
    };

    Component.prototype.addBracketForwards = function (result) {
      var context, i, ipClone, j, k, l, len1, len2, len3, len4, port, ref, ref1, ref2, ref3, ref4, ref5;
      if ((ref = result.__bracketClosingBefore) != null ? ref.length : void 0) {
        ref1 = result.__bracketClosingBefore;
        for (i = 0, len1 = ref1.length; i < len1; i++) {
          context = ref1[i];
          debugBrackets(this.nodeId + " closeBracket-A from '" + context.source + "' to " + context.ports + ": '" + context.closeIp.data + "'");
          if (!context.ports.length) {
            continue;
          }
          ref2 = context.ports;
          for (j = 0, len2 = ref2.length; j < len2; j++) {
            port = ref2[j];
            ipClone = context.closeIp.clone();
            this.addToResult(result, port, ipClone, true);
            this.getBracketContext('out', port, ipClone.scope).pop();
          }
        }
      }
      if (result.__bracketContext) {
        Object.keys(result.__bracketContext).reverse().forEach(function (_this) {
          return function (inport) {
            var ctx, datas, forwardedOpens, idx, idxIps, ip, ips, k, l, len3, len4, len5, m, outport, portIdentifier, results, unforwarded;
            context = result.__bracketContext[inport];
            if (!context.length) {
              return;
            }
            results = [];
            for (outport in result) {
              ips = result[outport];
              if (outport.indexOf('__') === 0) {
                continue;
              }
              if (_this.outPorts[outport].isAddressable()) {
                for (idx in ips) {
                  idxIps = ips[idx];
                  datas = idxIps.filter(function (ip) {
                    return ip.type === 'data';
                  });
                  if (!datas.length) {
                    continue;
                  }
                  portIdentifier = outport + "[" + idx + "]";
                  unforwarded = _this.getForwardableContexts(inport, portIdentifier, context);
                  if (!unforwarded.length) {
                    continue;
                  }
                  forwardedOpens = [];
                  for (k = 0, len3 = unforwarded.length; k < len3; k++) {
                    ctx = unforwarded[k];
                    debugBrackets(_this.nodeId + " openBracket from '" + inport + "' to '" + portIdentifier + "': '" + ctx.ip.data + "'");
                    ipClone = ctx.ip.clone();
                    ipClone.index = parseInt(idx);
                    forwardedOpens.push(ipClone);
                    ctx.ports.push(portIdentifier);
                    _this.getBracketContext('out', outport, ctx.ip.scope, idx).push(ctx);
                  }
                  forwardedOpens.reverse();
                  for (l = 0, len4 = forwardedOpens.length; l < len4; l++) {
                    ip = forwardedOpens[l];
                    _this.addToResult(result, outport, ip, true);
                  }
                }
                continue;
              }
              datas = ips.filter(function (ip) {
                return ip.type === 'data';
              });
              if (!datas.length) {
                continue;
              }
              unforwarded = _this.getForwardableContexts(inport, outport, context);
              if (!unforwarded.length) {
                continue;
              }
              forwardedOpens = [];
              for (m = 0, len5 = unforwarded.length; m < len5; m++) {
                ctx = unforwarded[m];
                debugBrackets(_this.nodeId + " openBracket from '" + inport + "' to '" + outport + "': '" + ctx.ip.data + "'");
                forwardedOpens.push(ctx.ip.clone());
                ctx.ports.push(outport);
                _this.getBracketContext('out', outport, ctx.ip.scope).push(ctx);
              }
              forwardedOpens.reverse();
              results.push(function () {
                var len6, n, results1;
                results1 = [];
                for (n = 0, len6 = forwardedOpens.length; n < len6; n++) {
                  ip = forwardedOpens[n];
                  results1.push(this.addToResult(result, outport, ip, true));
                }
                return results1;
              }.call(_this));
            }
            return results;
          };
        }(this));
      }
      if ((ref3 = result.__bracketClosingAfter) != null ? ref3.length : void 0) {
        ref4 = result.__bracketClosingAfter;
        for (k = 0, len3 = ref4.length; k < len3; k++) {
          context = ref4[k];
          debugBrackets(this.nodeId + " closeBracket-B from '" + context.source + "' to " + context.ports + ": '" + context.closeIp.data + "'");
          if (!context.ports.length) {
            continue;
          }
          ref5 = context.ports;
          for (l = 0, len4 = ref5.length; l < len4; l++) {
            port = ref5[l];
            ipClone = context.closeIp.clone();
            this.addToResult(result, port, ipClone, false);
            this.getBracketContext('out', port, ipClone.scope).pop();
          }
        }
      }
      delete result.__bracketClosingBefore;
      delete result.__bracketContext;
      return delete result.__bracketClosingAfter;
    };

    Component.prototype.processOutputQueue = function () {
      var idx, idxIps, ip, ips, port, portIdentifier, result, results;
      results = [];
      while (this.outputQ.length > 0) {
        if (!this.outputQ[0].__resolved) {
          break;
        }
        result = this.outputQ.shift();
        this.addBracketForwards(result);
        results.push(function () {
          var i, len1, results1;
          results1 = [];
          for (port in result) {
            ips = result[port];
            if (port.indexOf('__') === 0) {
              continue;
            }
            if (this.outPorts.ports[port].isAddressable()) {
              for (idx in ips) {
                idxIps = ips[idx];
                idx = parseInt(idx);
                if (!this.outPorts.ports[port].isAttached(idx)) {
                  continue;
                }
                for (i = 0, len1 = idxIps.length; i < len1; i++) {
                  ip = idxIps[i];
                  portIdentifier = port + "[" + ip.index + "]";
                  if (ip.type === 'openBracket') {
                    debugSend(this.nodeId + " sending " + portIdentifier + " < '" + ip.data + "'");
                  } else if (ip.type === 'closeBracket') {
                    debugSend(this.nodeId + " sending " + portIdentifier + " > '" + ip.data + "'");
                  } else {
                    debugSend(this.nodeId + " sending " + portIdentifier + " DATA");
                  }
                  this.outPorts[port].sendIP(ip);
                }
              }
              continue;
            }
            if (!this.outPorts.ports[port].isAttached()) {
              continue;
            }
            results1.push(function () {
              var j, len2, results2;
              results2 = [];
              for (j = 0, len2 = ips.length; j < len2; j++) {
                ip = ips[j];
                portIdentifier = port;
                if (ip.type === 'openBracket') {
                  debugSend(this.nodeId + " sending " + portIdentifier + " < '" + ip.data + "'");
                } else if (ip.type === 'closeBracket') {
                  debugSend(this.nodeId + " sending " + portIdentifier + " > '" + ip.data + "'");
                } else {
                  debugSend(this.nodeId + " sending " + portIdentifier + " DATA");
                }
                results2.push(this.outPorts[port].sendIP(ip));
              }
              return results2;
            }.call(this));
          }
          return results1;
        }.call(this));
      }
      return results;
    };

    Component.prototype.activate = function (context) {
      if (context.activated) {
        return;
      }
      context.activated = true;
      context.deactivated = false;
      this.load++;
      this.emit('activate', this.load);
      if (this.ordered || this.autoOrdering) {
        return this.outputQ.push(context.result);
      }
    };

    Component.prototype.deactivate = function (context) {
      if (context.deactivated) {
        return;
      }
      context.deactivated = true;
      context.activated = false;
      if (this.isOrdered()) {
        this.processOutputQueue();
      }
      this.load--;
      return this.emit('deactivate', this.load);
    };

    return Component;
  }(EventEmitter);

  exports.Component = Component;

  ProcessContext = function () {
    function ProcessContext(ip1, nodeInstance, port1, result1) {
      this.ip = ip1;
      this.nodeInstance = nodeInstance;
      this.port = port1;
      this.result = result1;
      this.scope = this.ip.scope;
      this.activated = false;
      this.deactivated = false;
    }

    ProcessContext.prototype.activate = function () {
      if (this.result.__resolved || this.nodeInstance.outputQ.indexOf(this.result) === -1) {
        this.result = {};
      }
      return this.nodeInstance.activate(this);
    };

    ProcessContext.prototype.deactivate = function () {
      if (!this.result.__resolved) {
        this.result.__resolved = true;
      }
      return this.nodeInstance.deactivate(this);
    };

    return ProcessContext;
  }();

  ProcessInput = function () {
    function ProcessInput(ports1, context1) {
      this.ports = ports1;
      this.context = context1;
      this.nodeInstance = this.context.nodeInstance;
      this.ip = this.context.ip;
      this.port = this.context.port;
      this.result = this.context.result;
      this.scope = this.context.scope;
    }

    ProcessInput.prototype.activate = function () {
      if (this.context.activated) {
        return;
      }
      if (this.nodeInstance.isOrdered()) {
        this.result.__resolved = false;
      }
      this.nodeInstance.activate(this.context);
      if (this.port.isAddressable()) {
        return debug(this.nodeInstance.nodeId + " packet on '" + this.port.name + "[" + this.ip.index + "]' caused activation " + this.nodeInstance.load + ": " + this.ip.type);
      } else {
        return debug(this.nodeInstance.nodeId + " packet on '" + this.port.name + "' caused activation " + this.nodeInstance.load + ": " + this.ip.type);
      }
    };

    ProcessInput.prototype.attached = function () {
      var args, i, len1, port, res;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!args.length) {
        args = ['in'];
      }
      res = [];
      for (i = 0, len1 = args.length; i < len1; i++) {
        port = args[i];
        res.push(this.ports[port].listAttached());
      }
      if (args.length === 1) {
        return res.pop();
      }
      return res;
    };

    ProcessInput.prototype.has = function () {
      var args, i, len1, port, validate;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!args.length) {
        args = ['in'];
      }
      if (typeof args[args.length - 1] === 'function') {
        validate = args.pop();
      } else {
        validate = function validate() {
          return true;
        };
      }
      for (i = 0, len1 = args.length; i < len1; i++) {
        port = args[i];
        if (Array.isArray(port)) {
          if (!this.ports[port[0]].isAddressable()) {
            throw new Error("Non-addressable ports, access must be with string " + port[0]);
          }
          if (!this.ports[port[0]].has(this.scope, port[1], validate)) {
            return false;
          }
          continue;
        }
        if (this.ports[port].isAddressable()) {
          throw new Error("For addressable ports, access must be with array [" + port + ", idx]");
        }
        if (!this.ports[port].has(this.scope, validate)) {
          return false;
        }
      }
      return true;
    };

    ProcessInput.prototype.hasData = function () {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!args.length) {
        args = ['in'];
      }
      args.push(function (ip) {
        return ip.type === 'data';
      });
      return this.has.apply(this, args);
    };

    ProcessInput.prototype.hasStream = function () {
      var args, dataBrackets, hasData, i, len1, port, portBrackets, validate, validateStream;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!args.length) {
        args = ['in'];
      }
      if (typeof args[args.length - 1] === 'function') {
        validateStream = args.pop();
      } else {
        validateStream = function validateStream() {
          return true;
        };
      }
      for (i = 0, len1 = args.length; i < len1; i++) {
        port = args[i];
        portBrackets = [];
        dataBrackets = [];
        hasData = false;
        validate = function validate(ip) {
          if (ip.type === 'openBracket') {
            portBrackets.push(ip.data);
            return false;
          }
          if (ip.type === 'data') {
            hasData = validateStream(ip, portBrackets);
            if (!portBrackets.length) {
              return hasData;
            }
            return false;
          }
          if (ip.type === 'closeBracket') {
            portBrackets.pop();
            if (portBrackets.length) {
              return false;
            }
            if (!hasData) {
              return false;
            }
            return true;
          }
        };
        if (!this.has(port, validate)) {
          return false;
        }
      }
      return true;
    };

    ProcessInput.prototype.get = function () {
      var args, i, idx, ip, len1, port, portname, res;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      this.activate();
      if (!args.length) {
        args = ['in'];
      }
      res = [];
      for (i = 0, len1 = args.length; i < len1; i++) {
        port = args[i];
        if (Array.isArray(port)) {
          portname = port[0], idx = port[1];
          if (!this.ports[portname].isAddressable()) {
            throw new Error('Non-addressable ports, access must be with string portname');
          }
        } else {
          portname = port;
          if (this.ports[portname].isAddressable()) {
            throw new Error('For addressable ports, access must be with array [portname, idx]');
          }
        }
        if (this.nodeInstance.isForwardingInport(portname)) {
          ip = this.__getForForwarding(portname, idx);
          res.push(ip);
          continue;
        }
        ip = this.ports[portname].get(this.scope, idx);
        res.push(ip);
      }
      if (args.length === 1) {
        return res[0];
      } else {
        return res;
      }
    };

    ProcessInput.prototype.__getForForwarding = function (port, idx) {
      var context, dataIp, i, ip, len1, prefix;
      prefix = [];
      dataIp = null;
      while (true) {
        ip = this.ports[port].get(this.scope, idx);
        if (!ip) {
          break;
        }
        if (ip.type === 'data') {
          dataIp = ip;
          break;
        }
        prefix.push(ip);
      }
      for (i = 0, len1 = prefix.length; i < len1; i++) {
        ip = prefix[i];
        if (ip.type === 'closeBracket') {
          if (!this.result.__bracketClosingBefore) {
            this.result.__bracketClosingBefore = [];
          }
          context = this.nodeInstance.getBracketContext('in', port, this.scope, idx).pop();
          context.closeIp = ip;
          this.result.__bracketClosingBefore.push(context);
          continue;
        }
        if (ip.type === 'openBracket') {
          this.nodeInstance.getBracketContext('in', port, this.scope, idx).push({
            ip: ip,
            ports: [],
            source: port
          });
          continue;
        }
      }
      if (!this.result.__bracketContext) {
        this.result.__bracketContext = {};
      }
      this.result.__bracketContext[port] = this.nodeInstance.getBracketContext('in', port, this.scope, idx).slice(0);
      return dataIp;
    };

    ProcessInput.prototype.getData = function () {
      var args, datas, i, len1, packet, port;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!args.length) {
        args = ['in'];
      }
      datas = [];
      for (i = 0, len1 = args.length; i < len1; i++) {
        port = args[i];
        packet = this.get(port);
        if (packet == null) {
          datas.push(packet);
          continue;
        }
        while (packet.type !== 'data') {
          packet = this.get(port);
          if (!packet) {
            break;
          }
        }
        datas.push(packet.data);
      }
      if (args.length === 1) {
        return datas.pop();
      }
      return datas;
    };

    ProcessInput.prototype.getStream = function () {
      var args, datas, hasData, i, ip, len1, port, portBrackets, portPackets;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (!args.length) {
        args = ['in'];
      }
      datas = [];
      for (i = 0, len1 = args.length; i < len1; i++) {
        port = args[i];
        portBrackets = [];
        portPackets = [];
        hasData = false;
        ip = this.get(port);
        if (!ip) {
          datas.push(void 0);
        }
        while (ip) {
          if (ip.type === 'openBracket') {
            if (!portBrackets.length) {
              portPackets = [];
              hasData = false;
            }
            portBrackets.push(ip.data);
            portPackets.push(ip);
          }
          if (ip.type === 'data') {
            portPackets.push(ip);
            hasData = true;
            if (!portBrackets.length) {
              break;
            }
          }
          if (ip.type === 'closeBracket') {
            portPackets.push(ip);
            portBrackets.pop();
            if (hasData && !portBrackets.length) {
              break;
            }
          }
          ip = this.get(port);
        }
        datas.push(portPackets);
      }
      if (args.length === 1) {
        return datas.pop();
      }
      return datas;
    };

    return ProcessInput;
  }();

  ProcessOutput = function () {
    function ProcessOutput(ports1, context1) {
      this.ports = ports1;
      this.context = context1;
      this.nodeInstance = this.context.nodeInstance;
      this.ip = this.context.ip;
      this.result = this.context.result;
      this.scope = this.context.scope;
    }

    ProcessOutput.prototype.isError = function (err) {
      return err instanceof Error || Array.isArray(err) && err.length > 0 && err[0] instanceof Error;
    };

    ProcessOutput.prototype.error = function (err) {
      var e, i, j, len1, len2, multiple, results;
      multiple = Array.isArray(err);
      if (!multiple) {
        err = [err];
      }
      if ('error' in this.ports && (this.ports.error.isAttached() || !this.ports.error.isRequired())) {
        if (multiple) {
          this.sendIP('error', new IP('openBracket'));
        }
        for (i = 0, len1 = err.length; i < len1; i++) {
          e = err[i];
          this.sendIP('error', e);
        }
        if (multiple) {
          return this.sendIP('error', new IP('closeBracket'));
        }
      } else {
        results = [];
        for (j = 0, len2 = err.length; j < len2; j++) {
          e = err[j];
          throw e;
        }
        return results;
      }
    };

    ProcessOutput.prototype.sendIP = function (port, packet) {
      var ip;
      if (!IP.isIP(packet)) {
        ip = new IP('data', packet);
      } else {
        ip = packet;
      }
      if (this.scope !== null && ip.scope === null) {
        ip.scope = this.scope;
      }
      if (this.nodeInstance.outPorts[port].isAddressable() && ip.index === null) {
        throw new Error('Sending packets to addressable ports requires specifying index');
      }
      if (this.nodeInstance.isOrdered()) {
        this.nodeInstance.addToResult(this.result, port, ip);
        return;
      }
      return this.nodeInstance.outPorts[port].sendIP(ip);
    };

    ProcessOutput.prototype.send = function (outputMap) {
      var componentPorts, i, len1, mapIsInPorts, packet, port, ref, results;
      if (this.isError(outputMap)) {
        return this.error(outputMap);
      }
      componentPorts = [];
      mapIsInPorts = false;
      ref = Object.keys(this.ports.ports);
      for (i = 0, len1 = ref.length; i < len1; i++) {
        port = ref[i];
        if (port !== 'error' && port !== 'ports' && port !== '_callbacks') {
          componentPorts.push(port);
        }
        if (!mapIsInPorts && outputMap != null && (typeof outputMap === 'undefined' ? 'undefined' : _typeof(outputMap)) === 'object' && Object.keys(outputMap).indexOf(port) !== -1) {
          mapIsInPorts = true;
        }
      }
      if (componentPorts.length === 1 && !mapIsInPorts) {
        this.sendIP(componentPorts[0], outputMap);
        return;
      }
      if (componentPorts.length > 1 && !mapIsInPorts) {
        throw new Error('Port must be specified for sending output');
      }
      results = [];
      for (port in outputMap) {
        packet = outputMap[port];
        results.push(this.sendIP(port, packet));
      }
      return results;
    };

    ProcessOutput.prototype.sendDone = function (outputMap) {
      this.send(outputMap);
      return this.done();
    };

    ProcessOutput.prototype.pass = function (data, options) {
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

    ProcessOutput.prototype.done = function (error) {
      var buf, context, contexts, ctx, ip, isLast, nodeContext, port, ref;
      this.result.__resolved = true;
      this.nodeInstance.activate(this.context);
      if (error) {
        this.error(error);
      }
      isLast = function (_this) {
        return function () {
          var len, load, pos, resultsOnly;
          resultsOnly = _this.nodeInstance.outputQ.filter(function (q) {
            if (!q.__resolved) {
              return true;
            }
            if (Object.keys(q).length === 2 && q.__bracketClosingAfter) {
              return false;
            }
            return true;
          });
          pos = resultsOnly.indexOf(_this.result);
          len = resultsOnly.length;
          load = _this.nodeInstance.load;
          if (pos === len - 1) {
            return true;
          }
          if (pos === -1 && load === len + 1) {
            return true;
          }
          if (len <= 1 && load === 1) {
            return true;
          }
          return false;
        };
      }(this);
      if (this.nodeInstance.isOrdered() && isLast()) {
        ref = this.nodeInstance.bracketContext["in"];
        for (port in ref) {
          contexts = ref[port];
          if (!contexts[this.scope]) {
            continue;
          }
          nodeContext = contexts[this.scope];
          if (!nodeContext.length) {
            continue;
          }
          context = nodeContext[nodeContext.length - 1];
          buf = this.nodeInstance.inPorts[context.source].getBuffer(context.ip.scope, context.ip.index);
          while (true) {
            if (!buf.length) {
              break;
            }
            if (buf[0].type !== 'closeBracket') {
              break;
            }
            ip = this.nodeInstance.inPorts[context.source].get(context.ip.scope, context.ip.index);
            ctx = nodeContext.pop();
            ctx.closeIp = ip;
            if (!this.result.__bracketClosingAfter) {
              this.result.__bracketClosingAfter = [];
            }
            this.result.__bracketClosingAfter.push(ctx);
          }
        }
      }
      debug(this.nodeInstance.nodeId + " finished processing " + this.nodeInstance.load);
      return this.nodeInstance.deactivate(this.context);
    };

    return ProcessOutput;
  }();
}).call(undefined);

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var EventEmitter,
      InPort,
      InPorts,
      OutPort,
      OutPorts,
      Ports,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(0).EventEmitter;

  InPort = __webpack_require__(18);

  OutPort = __webpack_require__(20);

  Ports = function (superClass) {
    extend(Ports, superClass);

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

    Ports.prototype.add = function (name, options, process) {
      if (name === 'add' || name === 'remove') {
        throw new Error('Add and remove are restricted port names');
      }
      if (!name.match(/^[a-z0-9_\.\/]+$/)) {
        throw new Error("Port names can only contain lowercase alphanumeric characters and underscores. '" + name + "' not allowed");
      }
      if (this.ports[name]) {
        this.remove(name);
      }
      if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' && options.canAttach) {
        this.ports[name] = options;
      } else {
        this.ports[name] = new this.model(options, process);
      }
      this[name] = this.ports[name];
      this.emit('add', name);
      return this;
    };

    Ports.prototype.remove = function (name) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not defined");
      }
      delete this.ports[name];
      delete this[name];
      this.emit('remove', name);
      return this;
    };

    return Ports;
  }(EventEmitter);

  exports.InPorts = InPorts = function (superClass) {
    extend(InPorts, superClass);

    function InPorts() {
      return InPorts.__super__.constructor.apply(this, arguments);
    }

    InPorts.prototype.on = function (name, event, callback) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].on(event, callback);
    };

    InPorts.prototype.once = function (name, event, callback) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].once(event, callback);
    };

    return InPorts;
  }(Ports);

  exports.OutPorts = OutPorts = function (superClass) {
    extend(OutPorts, superClass);

    function OutPorts() {
      return OutPorts.__super__.constructor.apply(this, arguments);
    }

    OutPorts.prototype.model = OutPort;

    OutPorts.prototype.connect = function (name, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].connect(socketId);
    };

    OutPorts.prototype.beginGroup = function (name, group, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].beginGroup(group, socketId);
    };

    OutPorts.prototype.send = function (name, data, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].send(data, socketId);
    };

    OutPorts.prototype.endGroup = function (name, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].endGroup(socketId);
    };

    OutPorts.prototype.disconnect = function (name, socketId) {
      if (!this.ports[name]) {
        throw new Error("Port " + name + " not available");
      }
      return this.ports[name].disconnect(socketId);
    };

    return OutPorts;
  }(Ports);

  exports.normalizePortName = function (name) {
    var matched, port;
    port = {
      name: name
    };
    if (name.indexOf('[') === -1) {
      return port;
    }
    matched = name.match(/(.*)\[([0-9]+)\]/);
    if (!(matched != null ? matched.length : void 0)) {
      return name;
    }
    port.name = matched[1];
    port.index = matched[2];
    return port;
  };
}).call(undefined);

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var BasePort,
      IP,
      InPort,
      platform,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  BasePort = __webpack_require__(19);

  IP = __webpack_require__(2);

  platform = __webpack_require__(3);

  InPort = function (superClass) {
    extend(InPort, superClass);

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
      if (options.scoped == null) {
        options.scoped = true;
      }
      if (options.triggering == null) {
        options.triggering = true;
      }
      if (!process && options && options.process) {
        process = options.process;
        delete options.process;
      }
      if (process) {
        platform.deprecated('InPort process callback is deprecated. Please use Process API or the InPort handle option');
        if (typeof process !== 'function') {
          throw new Error('process must be a function');
        }
        this.process = process;
      }
      if (options.handle) {
        platform.deprecated('InPort handle callback is deprecated. Please use Process API');
        if (typeof options.handle !== 'function') {
          throw new Error('handle must be a function');
        }
        this.handle = options.handle;
        delete options.handle;
      }
      InPort.__super__.constructor.call(this, options);
      this.prepareBuffer();
    }

    InPort.prototype.attachSocket = function (socket, localId) {
      if (localId == null) {
        localId = null;
      }
      if (this.hasDefault()) {
        if (this.handle) {
          socket.setDataDelegate(function (_this) {
            return function () {
              return new IP('data', _this.options["default"]);
            };
          }(this));
        } else {
          socket.setDataDelegate(function (_this) {
            return function () {
              return _this.options["default"];
            };
          }(this));
        }
      }
      socket.on('connect', function (_this) {
        return function () {
          return _this.handleSocketEvent('connect', socket, localId);
        };
      }(this));
      socket.on('begingroup', function (_this) {
        return function (group) {
          return _this.handleSocketEvent('begingroup', group, localId);
        };
      }(this));
      socket.on('data', function (_this) {
        return function (data) {
          _this.validateData(data);
          return _this.handleSocketEvent('data', data, localId);
        };
      }(this));
      socket.on('endgroup', function (_this) {
        return function (group) {
          return _this.handleSocketEvent('endgroup', group, localId);
        };
      }(this));
      socket.on('disconnect', function (_this) {
        return function () {
          return _this.handleSocketEvent('disconnect', socket, localId);
        };
      }(this));
      return socket.on('ip', function (_this) {
        return function (ip) {
          return _this.handleIP(ip, localId);
        };
      }(this));
    };

    InPort.prototype.handleIP = function (ip, id) {
      var buf;
      if (this.process) {
        return;
      }
      if (this.options.control && ip.type !== 'data') {
        return;
      }
      ip.owner = this.nodeInstance;
      if (this.isAddressable()) {
        ip.index = id;
      }
      if (ip.datatype === 'all') {
        ip.datatype = this.getDataType();
      }
      if (this.getSchema() && !ip.schema) {
        ip.schema = this.getSchema();
      }
      buf = this.prepareBufferForIP(ip);
      buf.push(ip);
      if (this.options.control && buf.length > 1) {
        buf.shift();
      }
      if (this.handle) {
        this.handle(ip, this.nodeInstance);
      }
      return this.emit('ip', ip, id);
    };

    InPort.prototype.handleSocketEvent = function (event, payload, id) {
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

    InPort.prototype.hasDefault = function () {
      return this.options["default"] !== void 0;
    };

    InPort.prototype.prepareBuffer = function () {
      this.buffer = [];
      if (this.isAddressable()) {
        this.indexedBuffer = {};
      }
      this.scopedBuffer = {};
      return this.iipBuffer = this.isAddressable() ? {} : [];
    };

    InPort.prototype.prepareBufferForIP = function (ip) {
      if (this.isAddressable()) {
        if (ip.scope != null && this.options.scoped) {
          if (!(ip.scope in this.scopedBuffer)) {
            this.scopedBuffer[ip.scope] = [];
          }
          if (!(ip.index in this.scopedBuffer[ip.scope])) {
            this.scopedBuffer[ip.scope][ip.index] = [];
          }
          return this.scopedBuffer[ip.scope][ip.index];
        }
        if (ip.initial) {
          if (!(ip.index in this.iipBuffer)) {
            this.iipBuffer[ip.index] = [];
          }
          return this.iipBuffer[ip.index];
        }
        if (!(ip.index in this.indexedBuffer)) {
          this.indexedBuffer[ip.index] = [];
        }
        return this.indexedBuffer[ip.index];
      }
      if (ip.scope != null && this.options.scoped) {
        if (!(ip.scope in this.scopedBuffer)) {
          this.scopedBuffer[ip.scope] = [];
        }
        return this.scopedBuffer[ip.scope];
      }
      if (ip.initial) {
        return this.iipBuffer;
      }
      return this.buffer;
    };

    InPort.prototype.validateData = function (data) {
      if (!this.options.values) {
        return;
      }
      if (this.options.values.indexOf(data) === -1) {
        throw new Error("Invalid data='" + data + "' received, not in [" + this.options.values + "]");
      }
    };

    InPort.prototype.receive = function () {
      platform.deprecated('InPort.receive is deprecated. Use InPort.get instead');
      if (!this.isBuffered()) {
        throw new Error('Receive is only possible on buffered ports');
      }
      return this.buffer.shift();
    };

    InPort.prototype.contains = function () {
      platform.deprecated('InPort.contains is deprecated. Use InPort.has instead');
      if (!this.isBuffered()) {
        throw new Error('Contains query is only possible on buffered ports');
      }
      return this.buffer.filter(function (packet) {
        if (packet.event === 'data') {
          return true;
        }
      }).length;
    };

    InPort.prototype.getBuffer = function (scope, idx, initial) {
      if (initial == null) {
        initial = false;
      }
      if (this.isAddressable()) {
        if (scope != null && this.options.scoped) {
          if (!(scope in this.scopedBuffer)) {
            return void 0;
          }
          if (!(idx in this.scopedBuffer[scope])) {
            return void 0;
          }
          return this.scopedBuffer[scope][idx];
        }
        if (initial) {
          if (!(idx in this.iipBuffer)) {
            return void 0;
          }
          return this.iipBuffer[idx];
        }
        if (!(idx in this.indexedBuffer)) {
          return void 0;
        }
        return this.indexedBuffer[idx];
      }
      if (scope != null && this.options.scoped) {
        if (!(scope in this.scopedBuffer)) {
          return void 0;
        }
        return this.scopedBuffer[scope];
      }
      if (initial) {
        return this.iipBuffer;
      }
      return this.buffer;
    };

    InPort.prototype.getFromBuffer = function (scope, idx, initial) {
      var buf;
      if (initial == null) {
        initial = false;
      }
      buf = this.getBuffer(scope, idx, initial);
      if (!(buf != null ? buf.length : void 0)) {
        return void 0;
      }
      if (this.options.control) {
        return buf[buf.length - 1];
      } else {
        return buf.shift();
      }
    };

    InPort.prototype.get = function (scope, idx) {
      var res;
      res = this.getFromBuffer(scope, idx);
      if (res !== void 0) {
        return res;
      }
      return this.getFromBuffer(null, idx, true);
    };

    InPort.prototype.hasIPinBuffer = function (scope, idx, validate, initial) {
      var buf, i, len, packet;
      if (initial == null) {
        initial = false;
      }
      buf = this.getBuffer(scope, idx, initial);
      if (!(buf != null ? buf.length : void 0)) {
        return false;
      }
      for (i = 0, len = buf.length; i < len; i++) {
        packet = buf[i];
        if (validate(packet)) {
          return true;
        }
      }
      return false;
    };

    InPort.prototype.hasIIP = function (idx, validate) {
      return this.hasIPinBuffer(null, idx, validate, true);
    };

    InPort.prototype.has = function (scope, idx, validate) {
      if (!this.isAddressable()) {
        validate = idx;
        idx = null;
      }
      if (this.hasIPinBuffer(scope, idx, validate)) {
        return true;
      }
      if (this.hasIIP(idx, validate)) {
        return true;
      }
      return false;
    };

    InPort.prototype.length = function (scope, idx) {
      var buf;
      buf = this.getBuffer(scope, idx);
      if (!buf) {
        return 0;
      }
      return buf.length;
    };

    InPort.prototype.ready = function (scope, idx) {
      return this.length(scope) > 0;
    };

    InPort.prototype.clear = function () {
      return this.prepareBuffer();
    };

    return InPort;
  }(BasePort);

  module.exports = InPort;
}).call(undefined);

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var BasePort,
      EventEmitter,
      validTypes,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(0).EventEmitter;

  validTypes = ['all', 'string', 'number', 'int', 'object', 'array', 'boolean', 'color', 'date', 'bang', 'function', 'buffer', 'stream'];

  BasePort = function (superClass) {
    extend(BasePort, superClass);

    function BasePort(options) {
      this.handleOptions(options);
      this.sockets = [];
      this.node = null;
      this.name = null;
    }

    BasePort.prototype.handleOptions = function (options) {
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
        throw new Error("Invalid port datatype '" + options.datatype + "' specified, valid are " + validTypes.join(', '));
      }
      if (options.type && !options.schema) {
        options.schema = options.type;
        delete options.type;
      }
      if (options.schema && options.schema.indexOf('/') === -1) {
        throw new Error("Invalid port schema '" + options.schema + "' specified. Should be URL or MIME type");
      }
      return this.options = options;
    };

    BasePort.prototype.getId = function () {
      if (!(this.node && this.name)) {
        return 'Port';
      }
      return this.node + " " + this.name.toUpperCase();
    };

    BasePort.prototype.getDataType = function () {
      return this.options.datatype;
    };

    BasePort.prototype.getSchema = function () {
      return this.options.schema || null;
    };

    BasePort.prototype.getDescription = function () {
      return this.options.description;
    };

    BasePort.prototype.attach = function (socket, index) {
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

    BasePort.prototype.attachSocket = function () {};

    BasePort.prototype.detach = function (socket) {
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

    BasePort.prototype.isAddressable = function () {
      if (this.options.addressable) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isBuffered = function () {
      if (this.options.buffered) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isRequired = function () {
      if (this.options.required) {
        return true;
      }
      return false;
    };

    BasePort.prototype.isAttached = function (socketId) {
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

    BasePort.prototype.listAttached = function () {
      var attached, i, idx, len, ref, socket;
      attached = [];
      ref = this.sockets;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        socket = ref[idx];
        if (!socket) {
          continue;
        }
        attached.push(idx);
      }
      return attached;
    };

    BasePort.prototype.isConnected = function (socketId) {
      var connected;
      if (socketId == null) {
        socketId = null;
      }
      if (this.isAddressable()) {
        if (socketId === null) {
          throw new Error(this.getId() + ": Socket ID required");
        }
        if (!this.sockets[socketId]) {
          throw new Error(this.getId() + ": Socket " + socketId + " not available");
        }
        return this.sockets[socketId].isConnected();
      }
      connected = false;
      this.sockets.forEach(function (socket) {
        if (!socket) {
          return;
        }
        if (socket.isConnected()) {
          return connected = true;
        }
      });
      return connected;
    };

    BasePort.prototype.canAttach = function () {
      return true;
    };

    return BasePort;
  }(EventEmitter);

  module.exports = BasePort;
}).call(undefined);

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var BasePort,
      IP,
      OutPort,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  BasePort = __webpack_require__(19);

  IP = __webpack_require__(2);

  OutPort = function (superClass) {
    extend(OutPort, superClass);

    function OutPort(options) {
      this.cache = {};
      OutPort.__super__.constructor.call(this, options);
    }

    OutPort.prototype.attach = function (socket, index) {
      if (index == null) {
        index = null;
      }
      OutPort.__super__.attach.call(this, socket, index);
      if (this.isCaching() && this.cache[index] != null) {
        return this.send(this.cache[index], index);
      }
    };

    OutPort.prototype.connect = function (socketId) {
      var i, len, results, socket, sockets;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      results = [];
      for (i = 0, len = sockets.length; i < len; i++) {
        socket = sockets[i];
        if (!socket) {
          continue;
        }
        results.push(socket.connect());
      }
      return results;
    };

    OutPort.prototype.beginGroup = function (group, socketId) {
      var sockets;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      return sockets.forEach(function (socket) {
        if (!socket) {
          return;
        }
        return socket.beginGroup(group);
      });
    };

    OutPort.prototype.send = function (data, socketId) {
      var sockets;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      if (this.isCaching() && data !== this.cache[socketId]) {
        this.cache[socketId] = data;
      }
      return sockets.forEach(function (socket) {
        if (!socket) {
          return;
        }
        return socket.send(data);
      });
    };

    OutPort.prototype.endGroup = function (socketId) {
      var i, len, results, socket, sockets;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      results = [];
      for (i = 0, len = sockets.length; i < len; i++) {
        socket = sockets[i];
        if (!socket) {
          continue;
        }
        results.push(socket.endGroup());
      }
      return results;
    };

    OutPort.prototype.disconnect = function (socketId) {
      var i, len, results, socket, sockets;
      if (socketId == null) {
        socketId = null;
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      results = [];
      for (i = 0, len = sockets.length; i < len; i++) {
        socket = sockets[i];
        if (!socket) {
          continue;
        }
        results.push(socket.disconnect());
      }
      return results;
    };

    OutPort.prototype.sendIP = function (type, data, options, socketId, autoConnect) {
      var i, ip, len, pristine, ref, socket, sockets;
      if (autoConnect == null) {
        autoConnect = true;
      }
      if (IP.isIP(type)) {
        ip = type;
        socketId = ip.index;
      } else {
        ip = new IP(type, data, options);
      }
      sockets = this.getSockets(socketId);
      this.checkRequired(sockets);
      if (ip.datatype === 'all') {
        ip.datatype = this.getDataType();
      }
      if (this.getSchema() && !ip.schema) {
        ip.schema = this.getSchema();
      }
      if (this.isCaching() && data !== ((ref = this.cache[socketId]) != null ? ref.data : void 0)) {
        this.cache[socketId] = ip;
      }
      pristine = true;
      for (i = 0, len = sockets.length; i < len; i++) {
        socket = sockets[i];
        if (!socket) {
          continue;
        }
        if (pristine) {
          socket.post(ip, autoConnect);
          pristine = false;
        } else {
          if (ip.clonable) {
            ip = ip.clone();
          }
          socket.post(ip, autoConnect);
        }
      }
      return this;
    };

    OutPort.prototype.openBracket = function (data, options, socketId) {
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

    OutPort.prototype.data = function (data, options, socketId) {
      if (options == null) {
        options = {};
      }
      if (socketId == null) {
        socketId = null;
      }
      return this.sendIP('data', data, options, socketId);
    };

    OutPort.prototype.closeBracket = function (data, options, socketId) {
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

    OutPort.prototype.checkRequired = function (sockets) {
      if (sockets.length === 0 && this.isRequired()) {
        throw new Error(this.getId() + ": No connections available");
      }
    };

    OutPort.prototype.getSockets = function (socketId) {
      if (this.isAddressable()) {
        if (socketId === null) {
          throw new Error(this.getId() + " Socket ID required");
        }
        if (!this.sockets[socketId]) {
          return [];
        }
        return [this.sockets[socketId]];
      }
      return this.sockets;
    };

    OutPort.prototype.isCaching = function () {
      if (this.options.caching) {
        return true;
      }
      return false;
    };

    return OutPort;
  }(BasePort);

  module.exports = OutPort;
}).call(undefined);

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var exported = {
  noflo: __webpack_require__(11),
  fbp: __webpack_require__(13)
};

if (window) {
  window.require = function (moduleName) {
    if (exported[moduleName]) {
      return exported[moduleName];
    }
    throw new Error('Module ' + moduleName + ' not available');
  };
}




/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var EventEmitter,
      Graph,
      clone,
      mergeResolveTheirsNaive,
      platform,
      resetGraph,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(0).EventEmitter;

  clone = __webpack_require__(12);

  platform = __webpack_require__(28);

  Graph = function (superClass) {
    extend(Graph, superClass);

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

    function Graph(name1, options) {
      this.name = name1 != null ? name1 : '';
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

    Graph.prototype.getPortName = function (port) {
      if (this.caseSensitive) {
        return port;
      } else {
        return port.toLowerCase();
      }
    };

    Graph.prototype.startTransaction = function (id, metadata) {
      if (this.transaction.id) {
        throw Error("Nested transactions not supported");
      }
      this.transaction.id = id;
      this.transaction.depth = 1;
      return this.emit('startTransaction', id, metadata);
    };

    Graph.prototype.endTransaction = function (id, metadata) {
      if (!this.transaction.id) {
        throw Error("Attempted to end non-existing transaction");
      }
      this.transaction.id = null;
      this.transaction.depth = 0;
      return this.emit('endTransaction', id, metadata);
    };

    Graph.prototype.checkTransactionStart = function () {
      if (!this.transaction.id) {
        return this.startTransaction('implicit');
      } else if (this.transaction.id === 'implicit') {
        return this.transaction.depth += 1;
      }
    };

    Graph.prototype.checkTransactionEnd = function () {
      if (this.transaction.id === 'implicit') {
        this.transaction.depth -= 1;
      }
      if (this.transaction.depth === 0) {
        return this.endTransaction('implicit');
      }
    };

    Graph.prototype.setProperties = function (properties) {
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

    Graph.prototype.addExport = function (publicPort, nodeKey, portKey, metadata) {
      var exported;
      if (metadata == null) {
        metadata = {
          x: 0,
          y: 0
        };
      }
      platform.deprecated('fbp-graph.Graph exports is deprecated: please use specific inport or outport instead');
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

    Graph.prototype.removeExport = function (publicPort) {
      var exported, found, i, idx, len, ref;
      platform.deprecated('fbp-graph.Graph exports is deprecated: please use specific inport or outport instead');
      publicPort = this.getPortName(publicPort);
      found = null;
      ref = this.exports;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        exported = ref[idx];
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

    Graph.prototype.addInport = function (publicPort, nodeKey, portKey, metadata) {
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

    Graph.prototype.removeInport = function (publicPort) {
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

    Graph.prototype.renameInport = function (oldPort, newPort) {
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

    Graph.prototype.setInportMetadata = function (publicPort, metadata) {
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

    Graph.prototype.addOutport = function (publicPort, nodeKey, portKey, metadata) {
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

    Graph.prototype.removeOutport = function (publicPort) {
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

    Graph.prototype.renameOutport = function (oldPort, newPort) {
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

    Graph.prototype.setOutportMetadata = function (publicPort, metadata) {
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

    Graph.prototype.addGroup = function (group, nodes, metadata) {
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

    Graph.prototype.renameGroup = function (oldName, newName) {
      var group, i, len, ref;
      this.checkTransactionStart();
      ref = this.groups;
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
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

    Graph.prototype.removeGroup = function (groupName) {
      var group, i, len, ref;
      this.checkTransactionStart();
      ref = this.groups;
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
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

    Graph.prototype.setGroupMetadata = function (groupName, metadata) {
      var before, group, i, item, len, ref, val;
      this.checkTransactionStart();
      ref = this.groups;
      for (i = 0, len = ref.length; i < len; i++) {
        group = ref[i];
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

    Graph.prototype.addNode = function (id, component, metadata) {
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

    Graph.prototype.removeNode = function (id) {
      var edge, exported, group, i, index, initializer, j, k, l, len, len1, len2, len3, len4, len5, len6, len7, len8, m, n, node, o, p, priv, pub, q, ref, ref1, ref2, ref3, ref4, ref5, toRemove;
      node = this.getNode(id);
      if (!node) {
        return;
      }
      this.checkTransactionStart();
      toRemove = [];
      ref = this.edges;
      for (i = 0, len = ref.length; i < len; i++) {
        edge = ref[i];
        if (edge.from.node === node.id || edge.to.node === node.id) {
          toRemove.push(edge);
        }
      }
      for (j = 0, len1 = toRemove.length; j < len1; j++) {
        edge = toRemove[j];
        this.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
      }
      toRemove = [];
      ref1 = this.initializers;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        initializer = ref1[k];
        if (initializer.to.node === node.id) {
          toRemove.push(initializer);
        }
      }
      for (l = 0, len3 = toRemove.length; l < len3; l++) {
        initializer = toRemove[l];
        this.removeInitial(initializer.to.node, initializer.to.port);
      }
      toRemove = [];
      ref2 = this.exports;
      for (m = 0, len4 = ref2.length; m < len4; m++) {
        exported = ref2[m];
        if (this.getPortName(id) === exported.process) {
          toRemove.push(exported);
        }
      }
      for (n = 0, len5 = toRemove.length; n < len5; n++) {
        exported = toRemove[n];
        this.removeExport(exported["public"]);
      }
      toRemove = [];
      ref3 = this.inports;
      for (pub in ref3) {
        priv = ref3[pub];
        if (priv.process === id) {
          toRemove.push(pub);
        }
      }
      for (o = 0, len6 = toRemove.length; o < len6; o++) {
        pub = toRemove[o];
        this.removeInport(pub);
      }
      toRemove = [];
      ref4 = this.outports;
      for (pub in ref4) {
        priv = ref4[pub];
        if (priv.process === id) {
          toRemove.push(pub);
        }
      }
      for (p = 0, len7 = toRemove.length; p < len7; p++) {
        pub = toRemove[p];
        this.removeOutport(pub);
      }
      ref5 = this.groups;
      for (q = 0, len8 = ref5.length; q < len8; q++) {
        group = ref5[q];
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

    Graph.prototype.getNode = function (id) {
      var i, len, node, ref;
      ref = this.nodes;
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        if (!node) {
          continue;
        }
        if (node.id === id) {
          return node;
        }
      }
      return null;
    };

    Graph.prototype.renameNode = function (oldId, newId) {
      var edge, exported, group, i, iip, index, j, k, l, len, len1, len2, len3, node, priv, pub, ref, ref1, ref2, ref3, ref4, ref5;
      this.checkTransactionStart();
      node = this.getNode(oldId);
      if (!node) {
        return;
      }
      node.id = newId;
      ref = this.edges;
      for (i = 0, len = ref.length; i < len; i++) {
        edge = ref[i];
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
      ref1 = this.initializers;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        iip = ref1[j];
        if (!iip) {
          continue;
        }
        if (iip.to.node === oldId) {
          iip.to.node = newId;
        }
      }
      ref2 = this.inports;
      for (pub in ref2) {
        priv = ref2[pub];
        if (priv.process === oldId) {
          priv.process = newId;
        }
      }
      ref3 = this.outports;
      for (pub in ref3) {
        priv = ref3[pub];
        if (priv.process === oldId) {
          priv.process = newId;
        }
      }
      ref4 = this.exports;
      for (k = 0, len2 = ref4.length; k < len2; k++) {
        exported = ref4[k];
        if (exported.process === oldId) {
          exported.process = newId;
        }
      }
      ref5 = this.groups;
      for (l = 0, len3 = ref5.length; l < len3; l++) {
        group = ref5[l];
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

    Graph.prototype.setNodeMetadata = function (id, metadata) {
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

    Graph.prototype.addEdge = function (outNode, outPort, inNode, inPort, metadata) {
      var edge, i, len, ref;
      if (metadata == null) {
        metadata = {};
      }
      outPort = this.getPortName(outPort);
      inPort = this.getPortName(inPort);
      ref = this.edges;
      for (i = 0, len = ref.length; i < len; i++) {
        edge = ref[i];
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

    Graph.prototype.addEdgeIndex = function (outNode, outPort, outIndex, inNode, inPort, inIndex, metadata) {
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

    Graph.prototype.removeEdge = function (node, port, node2, port2) {
      var edge, i, index, j, k, len, len1, len2, ref, ref1, toKeep, toRemove;
      this.checkTransactionStart();
      port = this.getPortName(port);
      port2 = this.getPortName(port2);
      toRemove = [];
      toKeep = [];
      if (node2 && port2) {
        ref = this.edges;
        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          edge = ref[index];
          if (edge.from.node === node && edge.from.port === port && edge.to.node === node2 && edge.to.port === port2) {
            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
            toRemove.push(edge);
          } else {
            toKeep.push(edge);
          }
        }
      } else {
        ref1 = this.edges;
        for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
          edge = ref1[index];
          if (edge.from.node === node && edge.from.port === port || edge.to.node === node && edge.to.port === port) {
            this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
            toRemove.push(edge);
          } else {
            toKeep.push(edge);
          }
        }
      }
      this.edges = toKeep;
      for (k = 0, len2 = toRemove.length; k < len2; k++) {
        edge = toRemove[k];
        this.emit('removeEdge', edge);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.getEdge = function (node, port, node2, port2) {
      var edge, i, index, len, ref;
      port = this.getPortName(port);
      port2 = this.getPortName(port2);
      ref = this.edges;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        edge = ref[index];
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

    Graph.prototype.setEdgeMetadata = function (node, port, node2, port2, metadata) {
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

    Graph.prototype.addInitial = function (data, node, port, metadata) {
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

    Graph.prototype.addInitialIndex = function (data, node, port, index, metadata) {
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

    Graph.prototype.addGraphInitial = function (data, node, metadata) {
      var inport;
      inport = this.inports[node];
      if (!inport) {
        return;
      }
      return this.addInitial(data, inport.process, inport.port, metadata);
    };

    Graph.prototype.addGraphInitialIndex = function (data, node, index, metadata) {
      var inport;
      inport = this.inports[node];
      if (!inport) {
        return;
      }
      return this.addInitialIndex(data, inport.process, inport.port, index, metadata);
    };

    Graph.prototype.removeInitial = function (node, port) {
      var edge, i, index, j, len, len1, ref, toKeep, toRemove;
      port = this.getPortName(port);
      this.checkTransactionStart();
      toRemove = [];
      toKeep = [];
      ref = this.initializers;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        edge = ref[index];
        if (edge.to.node === node && edge.to.port === port) {
          toRemove.push(edge);
        } else {
          toKeep.push(edge);
        }
      }
      this.initializers = toKeep;
      for (j = 0, len1 = toRemove.length; j < len1; j++) {
        edge = toRemove[j];
        this.emit('removeInitial', edge);
      }
      return this.checkTransactionEnd();
    };

    Graph.prototype.removeGraphInitial = function (node) {
      var inport;
      inport = this.inports[node];
      if (!inport) {
        return;
      }
      return this.removeInitial(inport.process, inport.port);
    };

    Graph.prototype.toDOT = function () {
      var cleanID, cleanPort, data, dot, edge, i, id, initializer, j, k, len, len1, len2, node, ref, ref1, ref2;
      cleanID = function cleanID(id) {
        return id.replace(/\s*/g, "");
      };
      cleanPort = function cleanPort(port) {
        return port.replace(/\./g, "");
      };
      dot = "digraph {\n";
      ref = this.nodes;
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        dot += "    " + cleanID(node.id) + " [label=" + node.id + " shape=box]\n";
      }
      ref1 = this.initializers;
      for (id = j = 0, len1 = ref1.length; j < len1; id = ++j) {
        initializer = ref1[id];
        if (typeof initializer.from.data === 'function') {
          data = 'Function';
        } else {
          data = initializer.from.data;
        }
        dot += "    data" + id + " [label=\"'" + data + "'\" shape=plaintext]\n";
        dot += "    data" + id + " -> " + cleanID(initializer.to.node) + "[headlabel=" + cleanPort(initializer.to.port) + " labelfontcolor=blue labelfontsize=8.0]\n";
      }
      ref2 = this.edges;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        edge = ref2[k];
        dot += "    " + cleanID(edge.from.node) + " -> " + cleanID(edge.to.node) + "[taillabel=" + cleanPort(edge.from.port) + " headlabel=" + cleanPort(edge.to.port) + " labelfontcolor=blue labelfontsize=8.0]\n";
      }
      dot += "}";
      return dot;
    };

    Graph.prototype.toYUML = function () {
      var edge, i, initializer, j, len, len1, ref, ref1, yuml;
      yuml = [];
      ref = this.initializers;
      for (i = 0, len = ref.length; i < len; i++) {
        initializer = ref[i];
        yuml.push("(start)[" + initializer.to.port + "]->(" + initializer.to.node + ")");
      }
      ref1 = this.edges;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        edge = ref1[j];
        yuml.push("(" + edge.from.node + ")[" + edge.from.port + "]->(" + edge.to.node + ")");
      }
      return yuml.join(",");
    };

    Graph.prototype.toJSON = function () {
      var connection, edge, exported, group, groupData, i, initializer, j, json, k, l, len, len1, len2, len3, len4, m, node, priv, property, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, value;
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
      ref = this.properties;
      for (property in ref) {
        value = ref[property];
        json.properties[property] = value;
      }
      ref1 = this.inports;
      for (pub in ref1) {
        priv = ref1[pub];
        json.inports[pub] = priv;
      }
      ref2 = this.outports;
      for (pub in ref2) {
        priv = ref2[pub];
        json.outports[pub] = priv;
      }
      ref3 = this.exports;
      for (i = 0, len = ref3.length; i < len; i++) {
        exported = ref3[i];
        if (!json.exports) {
          json.exports = [];
        }
        json.exports.push(exported);
      }
      ref4 = this.groups;
      for (j = 0, len1 = ref4.length; j < len1; j++) {
        group = ref4[j];
        groupData = {
          name: group.name,
          nodes: group.nodes
        };
        if (Object.keys(group.metadata).length) {
          groupData.metadata = group.metadata;
        }
        json.groups.push(groupData);
      }
      ref5 = this.nodes;
      for (k = 0, len2 = ref5.length; k < len2; k++) {
        node = ref5[k];
        json.processes[node.id] = {
          component: node.component
        };
        if (node.metadata) {
          json.processes[node.id].metadata = node.metadata;
        }
      }
      ref6 = this.edges;
      for (l = 0, len3 = ref6.length; l < len3; l++) {
        edge = ref6[l];
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
      ref7 = this.initializers;
      for (m = 0, len4 = ref7.length; m < len4; m++) {
        initializer = ref7[m];
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

    Graph.prototype.save = function (file, callback) {
      var json;
      if (platform.isBrowser()) {
        return callback(new Error("Saving graphs not supported on browser"));
      }
      json = JSON.stringify(this.toJSON(), null, 4);
      return __webpack_require__(7).writeFile(file + ".json", json, "utf-8", function (err, data) {
        if (err) {
          throw err;
        }
        return callback(file);
      });
    };

    return Graph;
  }(EventEmitter);

  exports.Graph = Graph;

  exports.createGraph = function (name, options) {
    return new Graph(name, options);
  };

  exports.loadJSON = function (definition, callback, metadata) {
    var caseSensitive, conn, def, exported, graph, group, i, id, j, k, len, len1, len2, portId, priv, processId, properties, property, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, split, value;
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
    ref = definition.properties;
    for (property in ref) {
      value = ref[property];
      if (property === 'name') {
        continue;
      }
      properties[property] = value;
    }
    graph.setProperties(properties);
    ref1 = definition.processes;
    for (id in ref1) {
      def = ref1[id];
      if (!def.metadata) {
        def.metadata = {};
      }
      graph.addNode(id, def.component, def.metadata);
    }
    ref2 = definition.connections;
    for (i = 0, len = ref2.length; i < len; i++) {
      conn = ref2[i];
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
      ref3 = definition.exports;
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        exported = ref3[j];
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
      ref4 = definition.inports;
      for (pub in ref4) {
        priv = ref4[pub];
        graph.addInport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
      }
    }
    if (definition.outports) {
      ref5 = definition.outports;
      for (pub in ref5) {
        priv = ref5[pub];
        graph.addOutport(pub, priv.process, graph.getPortName(priv.port), priv.metadata);
      }
    }
    if (definition.groups) {
      ref6 = definition.groups;
      for (k = 0, len2 = ref6.length; k < len2; k++) {
        group = ref6[k];
        graph.addGroup(group.name, group.nodes, group.metadata || {});
      }
    }
    graph.endTransaction('loadJSON');
    return callback(null, graph);
  };

  exports.loadFBP = function (fbpData, callback, metadata, caseSensitive) {
    var definition, e, error;
    if (metadata == null) {
      metadata = {};
    }
    if (caseSensitive == null) {
      caseSensitive = false;
    }
    try {
      definition = __webpack_require__(13).parse(fbpData, {
        caseSensitive: caseSensitive
      });
    } catch (error) {
      e = error;
      return callback(e);
    }
    return exports.loadJSON(definition, callback, metadata);
  };

  exports.loadHTTP = function (url, callback) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = function () {
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

  exports.loadFile = function (file, callback, metadata, caseSensitive) {
    if (metadata == null) {
      metadata = {};
    }
    if (caseSensitive == null) {
      caseSensitive = false;
    }
    if (platform.isBrowser()) {
      exports.loadHTTP(file, function (err, data) {
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
    return __webpack_require__(7).readFile(file, "utf-8", function (err, data) {
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

  resetGraph = function resetGraph(graph) {
    var edge, exp, group, i, iip, j, k, l, len, len1, len2, len3, len4, m, node, port, ref, ref1, ref2, ref3, ref4, ref5, ref6, results, v;
    ref = clone(graph.groups).reverse();
    for (i = 0, len = ref.length; i < len; i++) {
      group = ref[i];
      if (group != null) {
        graph.removeGroup(group.name);
      }
    }
    ref1 = clone(graph.outports);
    for (port in ref1) {
      v = ref1[port];
      graph.removeOutport(port);
    }
    ref2 = clone(graph.inports);
    for (port in ref2) {
      v = ref2[port];
      graph.removeInport(port);
    }
    ref3 = clone(graph.exports.reverse());
    for (j = 0, len1 = ref3.length; j < len1; j++) {
      exp = ref3[j];
      graph.removeExport(exp["public"]);
    }
    graph.setProperties({});
    ref4 = clone(graph.initializers).reverse();
    for (k = 0, len2 = ref4.length; k < len2; k++) {
      iip = ref4[k];
      graph.removeInitial(iip.to.node, iip.to.port);
    }
    ref5 = clone(graph.edges).reverse();
    for (l = 0, len3 = ref5.length; l < len3; l++) {
      edge = ref5[l];
      graph.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
    }
    ref6 = clone(graph.nodes).reverse();
    results = [];
    for (m = 0, len4 = ref6.length; m < len4; m++) {
      node = ref6[m];
      results.push(graph.removeNode(node.id));
    }
    return results;
  };

  mergeResolveTheirsNaive = function mergeResolveTheirsNaive(base, to) {
    var edge, exp, group, i, iip, j, k, l, len, len1, len2, len3, len4, m, node, priv, pub, ref, ref1, ref2, ref3, ref4, ref5, ref6, results;
    resetGraph(base);
    ref = to.nodes;
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      base.addNode(node.id, node.component, node.metadata);
    }
    ref1 = to.edges;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      edge = ref1[j];
      base.addEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port, edge.metadata);
    }
    ref2 = to.initializers;
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      iip = ref2[k];
      base.addInitial(iip.from.data, iip.to.node, iip.to.port, iip.metadata);
    }
    ref3 = to.exports;
    for (l = 0, len3 = ref3.length; l < len3; l++) {
      exp = ref3[l];
      base.addExport(exp["public"], exp.node, exp.port, exp.metadata);
    }
    base.setProperties(to.properties);
    ref4 = to.inports;
    for (pub in ref4) {
      priv = ref4[pub];
      base.addInport(pub, priv.process, priv.port, priv.metadata);
    }
    ref5 = to.outports;
    for (pub in ref5) {
      priv = ref5[pub];
      base.addOutport(pub, priv.process, priv.port, priv.metadata);
    }
    ref6 = to.groups;
    results = [];
    for (m = 0, len4 = ref6.length; m < len4; m++) {
      group = ref6[m];
      results.push(base.addGroup(group.name, group.nodes, group.metadata));
    }
    return results;
  };

  exports.equivalent = function (a, b, options) {
    var A, B;
    if (options == null) {
      options = {};
    }
    A = JSON.stringify(a);
    B = JSON.stringify(b);
    return A === B;
  };

  exports.mergeResolveTheirs = mergeResolveTheirsNaive;
}).call(undefined);

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(25)
var ieee754 = __webpack_require__(26)
var isArray = __webpack_require__(27)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)))

/***/ }),
/* 24 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 26 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 27 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

(function () {
  exports.isBrowser = function () {
    if (typeof process !== 'undefined' && process.execPath && process.execPath.match(/node|iojs/)) {
      return false;
    }
    return true;
  };

  exports.deprecated = function (message) {
    if (exports.isBrowser()) {
      if (window.NOFLO_FATAL_DEPRECATED) {
        throw new Error(message);
      }
      console.warn(message);
      return;
    }
    if (process.env.NOFLO_FATAL_DEPRECATED) {
      throw new Error(message);
    }
    return console.warn(message);
  };
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = {"$schema":"http://json-schema.org/draft-04/schema","id":"graph.json","title":"FBP graph","description":"A graph of FBP processes and connections between them.\nThis is the primary way of specifying FBP programs.\n","name":"graph","type":"object","additionalProperties":false,"properties":{"caseSensitive":{"type":"boolean","description":"Whether the graph port identifiers should be treated as case-sensitive"},"properties":{"type":"object","description":"User-defined properties attached to the graph.","additionalProperties":true,"properties":{"name":{"type":"string","description":"Name of the graph"},"environment":{"type":"object","description":"Information about the execution environment for the graph","additionalProperties":true,"required":["type"],"properties":{"type":{"type":"string","description":"Runtime type the graph is for","example":"noflo-nodejs"},"content":{"type":"string","description":"HTML fixture for browser-based graphs"}}},"description":{"type":"string","description":"Graph description"},"icon":{"type":"string","description":"Name of the icon that can be used for depicting the graph"}}},"inports":{"type":["object","undefined"],"description":"Exported inports of the graph","additionalProperties":true,"patternProperties":{"[a-z0-9]+":{"type":"object","properties":{"process":{"type":"string"},"port":{"type":"string"},"metadata":{"type":"object","additionalProperties":true,"required":[],"properties":{"x":{"type":"integer","description":"X coordinate of a graph inport"},"y":{"type":"integer","description":"Y coordinate of a graph inport"}}}}}}},"outports":{"type":["object","undefined"],"description":"Exported outports of the graph","additionalProperties":true,"patternProperties":{"[a-z0-9]+":{"type":"object","properties":{"process":{"type":"string"},"port":{"type":"string"},"metadata":{"type":"object","required":[],"additionalProperties":true,"properties":{"x":{"type":"integer","description":"X coordinate of a graph outport"},"y":{"type":"integer","description":"Y coordinate of a graph outport"}}}}}}},"groups":{"type":"array","description":"List of groups of processes","items":{"type":"object","additionalProperties":false,"properties":{"name":{"type":"string"},"nodes":{"type":"array","items":{"type":"string"}},"metadata":{"type":"object","additionalProperties":true,"required":[],"properties":{"description":{"type":"string"}}}}}},"processes":{"type":"object","description":"The processes of this graph.\nEach process is an instance of a component.\n","additionalProperties":false,"patternProperties":{"[a-zA-Z0-9_]+":{"type":"object","properties":{"component":{"type":"string"},"metadata":{"type":"object","additionalProperties":true,"required":[],"properties":{"x":{"type":"integer","description":"X coordinate of a graph node"},"y":{"type":"integer","description":"Y coordinate of a graph node"}}}}}}},"connections":{"type":"array","description":"Connections of the graph.\nA connection either connects ports of two processes, or specifices an IIP as initial input packet to a port.\n","items":{"type":"object","additionalProperties":false,"properties":{"src":{"type":"object","additionalProperties":false,"properties":{"process":{"type":"string"},"port":{"type":"string"},"index":{"type":"integer"}}},"tgt":{"type":"object","additionalProperties":false,"properties":{"process":{"type":"string"},"port":{"type":"string"},"index":{"type":"integer"}}},"data":{},"metadata":{"type":"object","additionalProperties":true,"required":[],"properties":{"route":{"type":"integer","description":"Route identifier of a graph edge"},"schema":{"type":"string","format":"uri","description":"JSON schema associated with a graph edge"},"secure":{"type":"boolean","description":"Whether edge data should be treated as secure"}}}}}}}}

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var EventEmitter,
      Journal,
      JournalStore,
      MemoryJournalStore,
      calculateMeta,
      clone,
      entryToPrettyString,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty,
      bind = function bind(fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  };

  EventEmitter = __webpack_require__(0).EventEmitter;

  clone = __webpack_require__(12);

  entryToPrettyString = function entryToPrettyString(entry) {
    var a;
    a = entry.args;
    switch (entry.cmd) {
      case 'addNode':
        return a.id + "(" + a.component + ")";
      case 'removeNode':
        return "DEL " + a.id + "(" + a.component + ")";
      case 'renameNode':
        return "RENAME " + a.oldId + " " + a.newId;
      case 'changeNode':
        return "META " + a.id;
      case 'addEdge':
        return a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
      case 'removeEdge':
        return a.from.node + " " + a.from.port + " -X> " + a.to.port + " " + a.to.node;
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

  calculateMeta = function calculateMeta(oldMeta, newMeta) {
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

  JournalStore = function (superClass) {
    extend(JournalStore, superClass);

    JournalStore.prototype.lastRevision = 0;

    function JournalStore(graph1) {
      this.graph = graph1;
      this.lastRevision = 0;
    }

    JournalStore.prototype.putTransaction = function (revId, entries) {
      if (revId > this.lastRevision) {
        this.lastRevision = revId;
      }
      return this.emit('transaction', revId);
    };

    JournalStore.prototype.fetchTransaction = function (revId, entries) {};

    return JournalStore;
  }(EventEmitter);

  MemoryJournalStore = function (superClass) {
    extend(MemoryJournalStore, superClass);

    function MemoryJournalStore(graph) {
      MemoryJournalStore.__super__.constructor.call(this, graph);
      this.transactions = [];
    }

    MemoryJournalStore.prototype.putTransaction = function (revId, entries) {
      MemoryJournalStore.__super__.putTransaction.call(this, revId, entries);
      return this.transactions[revId] = entries;
    };

    MemoryJournalStore.prototype.fetchTransaction = function (revId) {
      return this.transactions[revId];
    };

    return MemoryJournalStore;
  }(JournalStore);

  Journal = function (superClass) {
    extend(Journal, superClass);

    Journal.prototype.graph = null;

    Journal.prototype.entries = [];

    Journal.prototype.subscribed = true;

    function Journal(graph, metadata, store) {
      this.endTransaction = bind(this.endTransaction, this);
      this.startTransaction = bind(this.startTransaction, this);
      var edge, group, iip, j, k, l, len, len1, len2, len3, m, n, node, ref, ref1, ref2, ref3, ref4, ref5, v;
      this.graph = graph;
      this.entries = [];
      this.subscribed = true;
      this.store = store || new MemoryJournalStore(this.graph);
      if (this.store.transactions.length === 0) {
        this.currentRevision = -1;
        this.startTransaction('initial', metadata);
        ref = this.graph.nodes;
        for (j = 0, len = ref.length; j < len; j++) {
          node = ref[j];
          this.appendCommand('addNode', node);
        }
        ref1 = this.graph.edges;
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          edge = ref1[l];
          this.appendCommand('addEdge', edge);
        }
        ref2 = this.graph.initializers;
        for (m = 0, len2 = ref2.length; m < len2; m++) {
          iip = ref2[m];
          this.appendCommand('addInitial', iip);
        }
        if (Object.keys(this.graph.properties).length > 0) {
          this.appendCommand('changeProperties', this.graph.properties, {});
        }
        ref3 = this.graph.inports;
        for (k in ref3) {
          v = ref3[k];
          this.appendCommand('addInport', {
            name: k,
            port: v
          });
        }
        ref4 = this.graph.outports;
        for (k in ref4) {
          v = ref4[k];
          this.appendCommand('addOutport', {
            name: k,
            port: v
          });
        }
        ref5 = this.graph.groups;
        for (n = 0, len3 = ref5.length; n < len3; n++) {
          group = ref5[n];
          this.appendCommand('addGroup', group);
        }
        this.endTransaction('initial', metadata);
      } else {
        this.currentRevision = this.store.lastRevision;
      }
      this.graph.on('addNode', function (_this) {
        return function (node) {
          return _this.appendCommand('addNode', node);
        };
      }(this));
      this.graph.on('removeNode', function (_this) {
        return function (node) {
          return _this.appendCommand('removeNode', node);
        };
      }(this));
      this.graph.on('renameNode', function (_this) {
        return function (oldId, newId) {
          var args;
          args = {
            oldId: oldId,
            newId: newId
          };
          return _this.appendCommand('renameNode', args);
        };
      }(this));
      this.graph.on('changeNode', function (_this) {
        return function (node, oldMeta) {
          return _this.appendCommand('changeNode', {
            id: node.id,
            "new": node.metadata,
            old: oldMeta
          });
        };
      }(this));
      this.graph.on('addEdge', function (_this) {
        return function (edge) {
          return _this.appendCommand('addEdge', edge);
        };
      }(this));
      this.graph.on('removeEdge', function (_this) {
        return function (edge) {
          return _this.appendCommand('removeEdge', edge);
        };
      }(this));
      this.graph.on('changeEdge', function (_this) {
        return function (edge, oldMeta) {
          return _this.appendCommand('changeEdge', {
            from: edge.from,
            to: edge.to,
            "new": edge.metadata,
            old: oldMeta
          });
        };
      }(this));
      this.graph.on('addInitial', function (_this) {
        return function (iip) {
          return _this.appendCommand('addInitial', iip);
        };
      }(this));
      this.graph.on('removeInitial', function (_this) {
        return function (iip) {
          return _this.appendCommand('removeInitial', iip);
        };
      }(this));
      this.graph.on('changeProperties', function (_this) {
        return function (newProps, oldProps) {
          return _this.appendCommand('changeProperties', {
            "new": newProps,
            old: oldProps
          });
        };
      }(this));
      this.graph.on('addGroup', function (_this) {
        return function (group) {
          return _this.appendCommand('addGroup', group);
        };
      }(this));
      this.graph.on('renameGroup', function (_this) {
        return function (oldName, newName) {
          return _this.appendCommand('renameGroup', {
            oldName: oldName,
            newName: newName
          });
        };
      }(this));
      this.graph.on('removeGroup', function (_this) {
        return function (group) {
          return _this.appendCommand('removeGroup', group);
        };
      }(this));
      this.graph.on('changeGroup', function (_this) {
        return function (group, oldMeta) {
          return _this.appendCommand('changeGroup', {
            name: group.name,
            "new": group.metadata,
            old: oldMeta
          });
        };
      }(this));
      this.graph.on('addExport', function (_this) {
        return function (exported) {
          return _this.appendCommand('addExport', exported);
        };
      }(this));
      this.graph.on('removeExport', function (_this) {
        return function (exported) {
          return _this.appendCommand('removeExport', exported);
        };
      }(this));
      this.graph.on('addInport', function (_this) {
        return function (name, port) {
          return _this.appendCommand('addInport', {
            name: name,
            port: port
          });
        };
      }(this));
      this.graph.on('removeInport', function (_this) {
        return function (name, port) {
          return _this.appendCommand('removeInport', {
            name: name,
            port: port
          });
        };
      }(this));
      this.graph.on('renameInport', function (_this) {
        return function (oldId, newId) {
          return _this.appendCommand('renameInport', {
            oldId: oldId,
            newId: newId
          });
        };
      }(this));
      this.graph.on('changeInport', function (_this) {
        return function (name, port, oldMeta) {
          return _this.appendCommand('changeInport', {
            name: name,
            "new": port.metadata,
            old: oldMeta
          });
        };
      }(this));
      this.graph.on('addOutport', function (_this) {
        return function (name, port) {
          return _this.appendCommand('addOutport', {
            name: name,
            port: port
          });
        };
      }(this));
      this.graph.on('removeOutport', function (_this) {
        return function (name, port) {
          return _this.appendCommand('removeOutport', {
            name: name,
            port: port
          });
        };
      }(this));
      this.graph.on('renameOutport', function (_this) {
        return function (oldId, newId) {
          return _this.appendCommand('renameOutport', {
            oldId: oldId,
            newId: newId
          });
        };
      }(this));
      this.graph.on('changeOutport', function (_this) {
        return function (name, port, oldMeta) {
          return _this.appendCommand('changeOutport', {
            name: name,
            "new": port.metadata,
            old: oldMeta
          });
        };
      }(this));
      this.graph.on('startTransaction', function (_this) {
        return function (id, meta) {
          return _this.startTransaction(id, meta);
        };
      }(this));
      this.graph.on('endTransaction', function (_this) {
        return function (id, meta) {
          return _this.endTransaction(id, meta);
        };
      }(this));
    }

    Journal.prototype.startTransaction = function (id, meta) {
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

    Journal.prototype.endTransaction = function (id, meta) {
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

    Journal.prototype.appendCommand = function (cmd, args, rev) {
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

    Journal.prototype.executeEntry = function (entry) {
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

    Journal.prototype.executeEntryInversed = function (entry) {
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

    Journal.prototype.moveToRevision = function (revId) {
      var entries, entry, i, j, l, len, m, n, r, ref, ref1, ref2, ref3, ref4, ref5;
      if (revId === this.currentRevision) {
        return;
      }
      this.subscribed = false;
      if (revId > this.currentRevision) {
        for (r = j = ref = this.currentRevision + 1, ref1 = revId; ref <= ref1 ? j <= ref1 : j >= ref1; r = ref <= ref1 ? ++j : --j) {
          ref2 = this.store.fetchTransaction(r);
          for (l = 0, len = ref2.length; l < len; l++) {
            entry = ref2[l];
            this.executeEntry(entry);
          }
        }
      } else {
        for (r = m = ref3 = this.currentRevision, ref4 = revId + 1; m >= ref4; r = m += -1) {
          entries = this.store.fetchTransaction(r);
          for (i = n = ref5 = entries.length - 1; n >= 0; i = n += -1) {
            this.executeEntryInversed(entries[i]);
          }
        }
      }
      this.currentRevision = revId;
      return this.subscribed = true;
    };

    Journal.prototype.undo = function () {
      if (!this.canUndo()) {
        return;
      }
      return this.moveToRevision(this.currentRevision - 1);
    };

    Journal.prototype.canUndo = function () {
      return this.currentRevision > 0;
    };

    Journal.prototype.redo = function () {
      if (!this.canRedo()) {
        return;
      }
      return this.moveToRevision(this.currentRevision + 1);
    };

    Journal.prototype.canRedo = function () {
      return this.currentRevision < this.store.lastRevision;
    };

    Journal.prototype.toPrettyString = function (startRev, endRev) {
      var e, entry, j, l, len, lines, r, ref, ref1;
      startRev |= 0;
      endRev |= this.store.lastRevision;
      lines = [];
      for (r = j = ref = startRev, ref1 = endRev; ref <= ref1 ? j < ref1 : j > ref1; r = ref <= ref1 ? ++j : --j) {
        e = this.store.fetchTransaction(r);
        for (l = 0, len = e.length; l < len; l++) {
          entry = e[l];
          lines.push(entryToPrettyString(entry));
        }
      }
      return lines.join('\n');
    };

    Journal.prototype.toJSON = function (startRev, endRev) {
      var entries, entry, j, l, len, r, ref, ref1, ref2;
      startRev |= 0;
      endRev |= this.store.lastRevision;
      entries = [];
      for (r = j = ref = startRev, ref1 = endRev; j < ref1; r = j += 1) {
        ref2 = this.store.fetchTransaction(r);
        for (l = 0, len = ref2.length; l < len; l++) {
          entry = ref2[l];
          entries.push(entryToPrettyString(entry));
        }
      }
      return entries;
    };

    Journal.prototype.save = function (file, success) {
      var json;
      json = JSON.stringify(this.toJSON(), null, 4);
      return __webpack_require__(7).writeFile(file + ".json", json, "utf-8", function (err, data) {
        if (err) {
          throw err;
        }
        return success(file);
      });
    };

    return Journal;
  }(EventEmitter);

  exports.Journal = Journal;

  exports.JournalStore = JournalStore;

  exports.MemoryJournalStore = MemoryJournalStore;
}).call(undefined);

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// File generated by noflo-component-loader on 2017-11-17T16:27:34.596Z
var baseLoader = __webpack_require__(32);
var sources = {};

exports.setSource = function (loader, packageId, name, source, language, callback) {
  baseLoader.setSource(sources, loader, packageId, name, source, language, callback);
};
exports.getSource = function (loader, name, callback) {
  baseLoader.getSource(sources, loader, name, callback);
};

exports.register = function (loader, callback) {

  loader.registerComponent(null, "Graph", __webpack_require__(33));
  var loaders = [];

  baseLoader.registerCustomLoaders(loader, loaders, callback);
};

/***/ }),
/* 32 */
/***/ (function(module, exports) {

/* eslint-disable */
exports.registerCustomLoaders = function (loader, loaders, callback) {
  if (!loaders.length) {
    return callback();
  }
  var customLoader = loaders.shift();
  loader.registerLoader(customLoader, function (err) {
    if (err) {
      return callback(err);
    }
    exports.registerCustomLoaders(loader, loaders, callback);
  });
};


exports.setSource = function (sources, loader, packageId, name, source, language, callback) {
  var implementation;
  var originalSource = source;
  // Transpiling
  if (language === 'coffeescript') {
    if (!window.CoffeeScript) {
      return callback(new Error('CoffeeScript compiler not available'));
    }
    try {
      source = window.CoffeeScript.compile(source, {
        bare: true
      });
    } catch (e) {
      return callback(e);
    }
  }
  if (language === 'es6' || language === 'es2015') {
    if (!window.babel) {
      return callback(new Error('Babel compiler not available'));
    }
    try {
      source = window.babel.transform(source).code;
    } catch (e) {
      return callback(e);
    }
  }
  // Eval the contents to get a runnable component
  try {
    var withExports = '(function () { var exports = {}; ' + source + '; return exports; })();';
    implementation = eval(withExports);
  } catch (e) {
    return callback(e);
  }

  if (typeof implementation !== 'function' && (!implementation.getComponent || typeof implementation.getComponent !== 'function')) {
    return callback(new Error('Provided source failed to create a runnable component'));
  }

  var fullName = packageId + '/' + name;
  sources[fullName] = {
    language: language,
    source: originalSource
  };

  loader.registerComponent(packageId, name, implementation, callback);
};

exports.getSource = function (sources, loader, name, callback) {
  if (!loader.components[name]) {
    return callback(new Error('Component ' + name + ' not available'));
  }
  var component = loader.components[name];
  var nameParts = name.split('/');
  var componentData = {
    name: nameParts[1],
    library: nameParts[0]
  };
  if (loader.isGraph(component)) {
    componentData.code = JSON.stringify(component, null, 2);
    componentData.language = 'json';
    return callback(null, componentData);
  } else if (sources[name]) {
    componentData.code = sources[name].source;
    componentData.language = sources[name].language;
    return callback(null, componentData);
  } else if (typeof component === 'function') {
    componentData.code = component.toString();
    componentData.language = 'javascript';
    return callback(null, componentData);
  } else if (typeof component.getComponent === 'function') {
    componentData.code = component.getComponent.toString();
    componentData.language = 'javascript';
    return callback(null, componentData);
  }
  return callback(new Error('Unable to get sources for ' + name));
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var Graph,
      noflo,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  noflo = __webpack_require__(11);

  Graph = function (superClass) {
    extend(Graph, superClass);

    function Graph(metadata1) {
      this.metadata = metadata1;
      this.network = null;
      this.ready = true;
      this.started = false;
      this.starting = false;
      this.baseDir = null;
      this.loader = null;
      this.load = 0;
      this.inPorts = new noflo.InPorts({
        graph: {
          datatype: 'all',
          description: 'NoFlo graph definition to be used with the subgraph component',
          required: true
        }
      });
      this.outPorts = new noflo.OutPorts();
      this.inPorts.graph.on('ip', function (_this) {
        return function (packet) {
          if (packet.type !== 'data') {
            return;
          }
          return _this.setGraph(packet.data, function (err) {
            if (err) {
              return _this.error(err);
            }
          });
        };
      }(this));
    }

    Graph.prototype.setGraph = function (graph, callback) {
      this.ready = false;
      if ((typeof graph === 'undefined' ? 'undefined' : _typeof(graph)) === 'object') {
        if (typeof graph.addNode === 'function') {
          this.createNetwork(graph, callback);
          return;
        }
        noflo.graph.loadJSON(graph, function (_this) {
          return function (err, instance) {
            if (err) {
              return callback(err);
            }
            instance.baseDir = _this.baseDir;
            return _this.createNetwork(instance, callback);
          };
        }(this));
        return;
      }
      if (graph.substr(0, 1) !== "/" && graph.substr(1, 1) !== ":" && process && process.cwd) {
        graph = process.cwd() + "/" + graph;
      }
      return noflo.graph.loadFile(graph, function (_this) {
        return function (err, instance) {
          if (err) {
            return callback(err);
          }
          instance.baseDir = _this.baseDir;
          return _this.createNetwork(instance, callback);
        };
      }(this));
    };

    Graph.prototype.createNetwork = function (graph, callback) {
      this.description = graph.properties.description || '';
      this.icon = graph.properties.icon || this.icon;
      if (!graph.name) {
        graph.name = this.nodeId;
      }
      graph.componentLoader = this.loader;
      return noflo.createNetwork(graph, function (_this) {
        return function (err, network1) {
          _this.network = network1;
          if (err) {
            return callback(err);
          }
          _this.emit('network', _this.network);
          _this.subscribeNetwork(_this.network);
          return _this.network.connect(function (err) {
            var name, node, ref;
            if (err) {
              return callback(err);
            }
            ref = _this.network.processes;
            for (name in ref) {
              node = ref[name];
              _this.findEdgePorts(name, node);
            }
            _this.setToReady();
            return callback();
          });
        };
      }(this), true);
    };

    Graph.prototype.subscribeNetwork = function (network) {
      var contexts;
      contexts = [];
      this.network.on('start', function (_this) {
        return function () {
          var ctx;
          ctx = {};
          contexts.push(ctx);
          return _this.activate(ctx);
        };
      }(this));
      return this.network.on('end', function (_this) {
        return function () {
          var ctx;
          ctx = contexts.pop();
          if (!ctx) {
            return;
          }
          return _this.deactivate(ctx);
        };
      }(this));
    };

    Graph.prototype.isExportedInport = function (port, nodeName, portName) {
      var exported, i, len, priv, pub, ref, ref1;
      ref = this.network.graph.inports;
      for (pub in ref) {
        priv = ref[pub];
        if (!(priv.process === nodeName && priv.port === portName)) {
          continue;
        }
        return pub;
      }
      ref1 = this.network.graph.exports;
      for (i = 0, len = ref1.length; i < len; i++) {
        exported = ref1[i];
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

    Graph.prototype.isExportedOutport = function (port, nodeName, portName) {
      var exported, i, len, priv, pub, ref, ref1;
      ref = this.network.graph.outports;
      for (pub in ref) {
        priv = ref[pub];
        if (!(priv.process === nodeName && priv.port === portName)) {
          continue;
        }
        return pub;
      }
      ref1 = this.network.graph.exports;
      for (i = 0, len = ref1.length; i < len; i++) {
        exported = ref1[i];
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

    Graph.prototype.setToReady = function () {
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        return process.nextTick(function (_this) {
          return function () {
            _this.ready = true;
            return _this.emit('ready');
          };
        }(this));
      } else {
        return setTimeout(function (_this) {
          return function () {
            _this.ready = true;
            return _this.emit('ready');
          };
        }(this), 0);
      }
    };

    Graph.prototype.findEdgePorts = function (name, process) {
      var inPorts, outPorts, port, portName, targetPortName;
      inPorts = process.component.inPorts.ports || process.component.inPorts;
      outPorts = process.component.outPorts.ports || process.component.outPorts;
      for (portName in inPorts) {
        port = inPorts[portName];
        targetPortName = this.isExportedInport(port, name, portName);
        if (targetPortName === false) {
          continue;
        }
        this.inPorts.add(targetPortName, port);
        this.inPorts[targetPortName].once('connect', function (_this) {
          return function () {
            if (_this.starting) {
              return;
            }
            if (_this.isStarted()) {
              return;
            }
            return _this.start(function () {});
          };
        }(this));
      }
      for (portName in outPorts) {
        port = outPorts[portName];
        targetPortName = this.isExportedOutport(port, name, portName);
        if (targetPortName === false) {
          continue;
        }
        this.outPorts.add(targetPortName, port);
      }
      return true;
    };

    Graph.prototype.isReady = function () {
      return this.ready;
    };

    Graph.prototype.isSubgraph = function () {
      return true;
    };

    Graph.prototype.setUp = function (callback) {
      this.starting = true;
      if (!this.isReady()) {
        this.once('ready', function (_this) {
          return function () {
            return _this.setUp(callback);
          };
        }(this));
        return;
      }
      if (!this.network) {
        return callback(null);
      }
      return this.network.start(function (err) {
        if (err) {
          return callback(err);
        }
        this.starting = false;
        return callback();
      });
    };

    Graph.prototype.tearDown = function (callback) {
      this.starting = false;
      if (!this.network) {
        return callback(null);
      }
      return this.network.stop(function (err) {
        if (err) {
          return callback(err);
        }
        return callback();
      });
    };

    return Graph;
  }(noflo.Component);

  exports.getComponent = function (metadata) {
    return new Graph(metadata);
  };
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(35);

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),
/* 35 */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

(function () {
  var AsyncComponent,
      component,
      platform,
      port,
      bind = function bind(fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  },
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  port = __webpack_require__(9);

  component = __webpack_require__(16);

  platform = __webpack_require__(3);

  AsyncComponent = function (superClass) {
    extend(AsyncComponent, superClass);

    function AsyncComponent(inPortName, outPortName, errPortName) {
      this.inPortName = inPortName != null ? inPortName : "in";
      this.outPortName = outPortName != null ? outPortName : "out";
      this.errPortName = errPortName != null ? errPortName : "error";
      this.error = bind(this.error, this);
      platform.deprecated('noflo.AsyncComponent is deprecated. Please port to Process API');
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
      this.inPorts[this.inPortName].on("begingroup", function (_this) {
        return function (group) {
          if (_this.load > 0) {
            return _this.q.push({
              name: "begingroup",
              data: group
            });
          }
          _this.errorGroups.push(group);
          return _this.outPorts[_this.outPortName].beginGroup(group);
        };
      }(this));
      this.inPorts[this.inPortName].on("endgroup", function (_this) {
        return function () {
          if (_this.load > 0) {
            return _this.q.push({
              name: "endgroup"
            });
          }
          _this.errorGroups.pop();
          return _this.outPorts[_this.outPortName].endGroup();
        };
      }(this));
      this.inPorts[this.inPortName].on("disconnect", function (_this) {
        return function () {
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
      }(this));
      this.inPorts[this.inPortName].on("data", function (_this) {
        return function (data) {
          if (_this.q.length > 0) {
            return _this.q.push({
              name: "data",
              data: data
            });
          }
          return _this.processData(data);
        };
      }(this));
    }

    AsyncComponent.prototype.processData = function (data) {
      this.incrementLoad();
      return this.doAsync(data, function (_this) {
        return function (err) {
          if (err) {
            _this.error(err, _this.errorGroups, _this.errPortName);
          }
          return _this.decrementLoad();
        };
      }(this));
    };

    AsyncComponent.prototype.incrementLoad = function () {
      this.load++;
      if (this.outPorts.load.isAttached()) {
        this.outPorts.load.send(this.load);
      }
      if (this.outPorts.load.isAttached()) {
        return this.outPorts.load.disconnect();
      }
    };

    AsyncComponent.prototype.doAsync = function (data, callback) {
      return callback(new Error("AsyncComponents must implement doAsync"));
    };

    AsyncComponent.prototype.decrementLoad = function () {
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
        return process.nextTick(function (_this) {
          return function () {
            return _this.processQueue();
          };
        }(this));
      } else {
        return setTimeout(function (_this) {
          return function () {
            return _this.processQueue();
          };
        }(this), 0);
      }
    };

    AsyncComponent.prototype.processQueue = function () {
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

    AsyncComponent.prototype.tearDown = function (callback) {
      this.q = [];
      this.errorGroups = [];
      return callback();
    };

    AsyncComponent.prototype.error = function (e, groups, errorPort) {
      var group, i, j, len, len1;
      if (groups == null) {
        groups = [];
      }
      if (errorPort == null) {
        errorPort = 'error';
      }
      if (this.outPorts[errorPort] && (this.outPorts[errorPort].isAttached() || !this.outPorts[errorPort].isRequired())) {
        for (i = 0, len = groups.length; i < len; i++) {
          group = groups[i];
          this.outPorts[errorPort].beginGroup(group);
        }
        this.outPorts[errorPort].send(e);
        for (j = 0, len1 = groups.length; j < len1; j++) {
          group = groups[j];
          this.outPorts[errorPort].endGroup();
        }
        this.outPorts[errorPort].disconnect();
        return;
      }
      throw e;
    };

    return AsyncComponent;
  }(component.Component);

  exports.AsyncComponent = AsyncComponent;
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var IP,
      InternalSocket,
      OutPortWrapper,
      StreamReceiver,
      StreamSender,
      checkDeprecation,
      checkWirePatternPreconditions,
      checkWirePatternPreconditionsInput,
      checkWirePatternPreconditionsParams,
      debug,
      getGroupContext,
      getInputData,
      getOutputProxy,
      handleInputCollation,
      isArray,
      legacyWirePattern,
      platform,
      populateParams,
      processApiWirePattern,
      reorderBuffer,
      setupBracketForwarding,
      setupControlPorts,
      setupErrorHandler,
      setupSendDefaults,
      utils,
      slice = [].slice,
      hasProp = {}.hasOwnProperty;

  StreamSender = __webpack_require__(10).StreamSender;

  StreamReceiver = __webpack_require__(10).StreamReceiver;

  InternalSocket = __webpack_require__(4);

  IP = __webpack_require__(2);

  platform = __webpack_require__(3);

  utils = __webpack_require__(15);

  debug = __webpack_require__(6)('noflo:helpers');

  isArray = function isArray(obj) {
    if (Array.isArray) {
      return Array.isArray(obj);
    }
    return Object.prototype.toString.call(arg) === '[object Array]';
  };

  exports.MapComponent = function (component, func, config) {
    platform.deprecated('noflo.helpers.MapComponent is deprecated. Please port to Process API');
    if (!config) {
      config = {};
    }
    if (!config.inPort) {
      config.inPort = 'in';
    }
    if (!config.outPort) {
      config.outPort = 'out';
    }
    if (!component.forwardBrackets) {
      component.forwardBrackets = {};
    }
    component.forwardBrackets[config.inPort] = [config.outPort];
    return component.process(function (input, output) {
      var data, groups, outProxy;
      if (!input.hasData(config.inPort)) {
        return;
      }
      data = input.getData(config.inPort);
      groups = getGroupContext(component, config.inPort, input);
      outProxy = getOutputProxy([config.outPort], output);
      func(data, groups, outProxy);
      return output.done();
    });
  };

  exports.WirePattern = function (component, config, proc) {
    var inPorts, outPorts, ref, setup;
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
    if (config.forwardGroups) {
      if (typeof config.forwardGroups === 'string') {
        config.forwardGroups = [config.forwardGroups];
      }
      if (typeof config.forwardGroups === 'boolean') {
        config.forwardGroups = inPorts;
      }
    }
    if (!('receiveStreams' in config)) {
      config.receiveStreams = false;
    }
    if (config.receiveStreams) {
      throw new Error('WirePattern receiveStreams is deprecated');
    }
    if (!('sendStreams' in config)) {
      config.sendStreams = false;
    }
    if (config.sendStreams) {
      throw new Error('WirePattern sendStreams is deprecated');
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
    config.inPorts = inPorts;
    config.outPorts = outPorts;
    checkDeprecation(config, proc);
    if (config.legacy || (typeof process !== "undefined" && process !== null ? (ref = process.env) != null ? ref.NOFLO_WIREPATTERN_LEGACY : void 0 : void 0)) {
      platform.deprecated('noflo.helpers.WirePattern legacy mode is deprecated');
      setup = legacyWirePattern;
    } else {
      setup = processApiWirePattern;
    }
    return setup(component, config, proc);
  };

  processApiWirePattern = function processApiWirePattern(component, config, func) {
    setupControlPorts(component, config);
    setupSendDefaults(component);
    setupBracketForwarding(component, config);
    component.ordered = config.ordered;
    return component.process(function (input, output, context) {
      var data, errorHandler, groups, outProxy, postpone, resume;
      if (!checkWirePatternPreconditions(config, input, output)) {
        return;
      }
      component.params = populateParams(config, input);
      data = getInputData(config, input);
      groups = getGroupContext(component, config.inPorts[0], input);
      outProxy = getOutputProxy(config.outPorts, output);
      debug("WirePattern Process API call with", data, groups, component.params, context.scope);
      postpone = function postpone() {
        throw new Error('noflo.helpers.WirePattern postpone is deprecated');
      };
      resume = function resume() {
        throw new Error('noflo.helpers.WirePattern resume is deprecated');
      };
      if (!config.async) {
        errorHandler = setupErrorHandler(component, config, output);
        func.call(component, data, groups, outProxy, postpone, resume, input.scope);
        if (output.result.__resolved) {
          return;
        }
        errorHandler();
        output.done();
        return;
      }
      errorHandler = setupErrorHandler(component, config, output);
      return func.call(component, data, groups, outProxy, function (err) {
        errorHandler();
        return output.done(err);
      }, postpone, resume, input.scope);
    });
  };

  checkDeprecation = function checkDeprecation(config, func) {
    if (config.group) {
      platform.deprecated('noflo.helpers.WirePattern group option is deprecated. Please port to Process API');
    }
    if (config.field) {
      platform.deprecated('noflo.helpers.WirePattern field option is deprecated. Please port to Process API');
    }
    if (func.length > 4) {
      platform.deprecated('noflo.helpers.WirePattern postpone and resume are deprecated. Please port to Process API');
    }
    if (!config.async) {
      platform.deprecated('noflo.helpers.WirePattern synchronous is deprecated. Please port to Process API');
    }
    if (config.error !== 'error') {
      platform.deprecated('noflo.helpers.WirePattern custom error port name is deprecated. Please switch to "error" or port to WirePattern');
    }
  };

  setupControlPorts = function setupControlPorts(component, config) {
    var j, len, param, ref, results;
    ref = config.params;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      results.push(component.inPorts[param].options.control = true);
    }
    return results;
  };

  setupBracketForwarding = function setupBracketForwarding(component, config) {
    var inPort, inPorts, j, k, len, len1, outPort, ref;
    component.forwardBrackets = {};
    if (!config.forwardGroups) {
      return;
    }
    inPorts = config.inPorts;
    if (isArray(config.forwardGroups)) {
      inPorts = config.forwardGroups;
    }
    for (j = 0, len = inPorts.length; j < len; j++) {
      inPort = inPorts[j];
      component.forwardBrackets[inPort] = [];
      ref = config.outPorts;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        outPort = ref[k];
        component.forwardBrackets[inPort].push(outPort);
      }
      if (component.outPorts.error) {
        component.forwardBrackets[inPort].push('error');
      }
    }
  };

  setupErrorHandler = function setupErrorHandler(component, config, output) {
    var errorHandler, errors, failHandler, sendErrors;
    errors = [];
    errorHandler = function errorHandler(e, groups) {
      if (groups == null) {
        groups = [];
      }
      platform.deprecated('noflo.helpers.WirePattern error method is deprecated. Please send error to callback instead');
      errors.push({
        err: e,
        groups: groups
      });
      return component.hasErrors = true;
    };
    failHandler = function failHandler(e, groups) {
      if (e == null) {
        e = null;
      }
      if (groups == null) {
        groups = [];
      }
      platform.deprecated('noflo.helpers.WirePattern fail method is deprecated. Please send error to callback instead');
      if (e) {
        errorHandler(e, groups);
      }
      sendErrors();
      return output.done();
    };
    sendErrors = function sendErrors() {
      if (!errors.length) {
        return;
      }
      if (config.name) {
        output.sendIP('error', new IP('openBracket', config.name));
      }
      errors.forEach(function (e) {
        var grp, j, k, len, len1, ref, ref1, results;
        ref = e.groups;
        for (j = 0, len = ref.length; j < len; j++) {
          grp = ref[j];
          output.sendIP('error', new IP('openBracket', grp));
        }
        output.sendIP('error', new IP('data', e.err));
        ref1 = e.groups;
        results = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          grp = ref1[k];
          results.push(output.sendIP('error', new IP('closeBracket', grp)));
        }
        return results;
      });
      if (config.name) {
        output.sendIP('error', new IP('closeBracket', config.name));
      }
      component.hasErrors = false;
      return errors = [];
    };
    component.hasErrors = false;
    component.error = errorHandler;
    component.fail = failHandler;
    return sendErrors;
  };

  setupSendDefaults = function setupSendDefaults(component) {
    var portsWithDefaults;
    portsWithDefaults = Object.keys(component.inPorts.ports).filter(function (p) {
      if (!component.inPorts[p].options.control) {
        return false;
      }
      if (!component.inPorts[p].hasDefault()) {
        return false;
      }
      return true;
    });
    return component.sendDefaults = function () {
      platform.deprecated('noflo.helpers.WirePattern sendDefaults method is deprecated. Please start with a Network');
      return portsWithDefaults.forEach(function (port) {
        var tempSocket;
        tempSocket = InternalSocket.createSocket();
        component.inPorts[port].attach(tempSocket);
        tempSocket.send();
        tempSocket.disconnect();
        return component.inPorts[port].detach(tempSocket);
      });
    };
  };

  populateParams = function populateParams(config, input) {
    var idx, j, k, len, len1, paramPort, params, ref, ref1;
    if (!config.params.length) {
      return {};
    }
    params = {};
    ref = config.params;
    for (j = 0, len = ref.length; j < len; j++) {
      paramPort = ref[j];
      if (input.ports[paramPort].isAddressable()) {
        params[paramPort] = {};
        ref1 = input.attached(paramPort);
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          idx = ref1[k];
          if (!input.hasData([paramPort, idx])) {
            continue;
          }
          params[paramPort][idx] = input.getData([paramPort, idx]);
        }
        continue;
      }
      params[paramPort] = input.getData(paramPort);
    }
    return params;
  };

  reorderBuffer = function reorderBuffer(buffer, matcher) {
    var brackets, idx, ip, j, k, len, len1, results, substream, substreamBrackets, substreamIdx;
    substream = null;
    brackets = [];
    substreamBrackets = [];
    for (idx = j = 0, len = buffer.length; j < len; idx = ++j) {
      ip = buffer[idx];
      if (ip.type === 'openBracket') {
        brackets.push(ip.data);
        substreamBrackets.push(ip);
        continue;
      }
      if (ip.type === 'closeBracket') {
        brackets.pop();
        if (substream) {
          substream.push(ip);
        }
        if (substreamBrackets.length) {
          substreamBrackets.pop();
        }
        if (substream && !substreamBrackets.length) {
          break;
        }
        continue;
      }
      if (!matcher(ip, brackets)) {
        substreamBrackets = [];
        continue;
      }
      substream = substreamBrackets.slice(0);
      substream.push(ip);
    }
    substreamIdx = buffer.indexOf(substream[0]);
    if (substreamIdx === 0) {
      return;
    }
    buffer.splice(substreamIdx, substream.length);
    substream.reverse();
    results = [];
    for (k = 0, len1 = substream.length; k < len1; k++) {
      ip = substream[k];
      results.push(buffer.unshift(ip));
    }
    return results;
  };

  handleInputCollation = function handleInputCollation(data, config, input, port, idx) {
    var buf;
    if (!config.group && !config.field) {
      return;
    }
    if (config.group) {
      buf = input.ports[port].getBuffer(input.scope, idx);
      reorderBuffer(buf, function (ip, brackets) {
        var grp, j, len, ref;
        ref = input.collatedBy.brackets;
        for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
          grp = ref[idx];
          if (brackets[idx] !== grp) {
            return false;
          }
        }
        return true;
      });
    }
    if (config.field) {
      data[config.field] = input.collatedBy.field;
      buf = input.ports[port].getBuffer(input.scope, idx);
      return reorderBuffer(buf, function (ip) {
        return ip.data[config.field] === data[config.field];
      });
    }
  };

  getInputData = function getInputData(config, input) {
    var data, idx, j, k, len, len1, port, ref, ref1;
    data = {};
    ref = config.inPorts;
    for (j = 0, len = ref.length; j < len; j++) {
      port = ref[j];
      if (input.ports[port].isAddressable()) {
        data[port] = {};
        ref1 = input.attached(port);
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          idx = ref1[k];
          if (!input.hasData([port, idx])) {
            continue;
          }
          handleInputCollation(data, config, input, port, idx);
          data[port][idx] = input.getData([port, idx]);
        }
        continue;
      }
      if (!input.hasData(port)) {
        continue;
      }
      handleInputCollation(data, config, input, port);
      data[port] = input.getData(port);
    }
    if (config.inPorts.length === 1) {
      return data[config.inPorts[0]];
    }
    return data;
  };

  getGroupContext = function getGroupContext(component, port, input) {
    var ref, ref1;
    if (((ref = input.result.__bracketContext) != null ? ref[port] : void 0) == null) {
      return [];
    }
    if ((ref1 = input.collatedBy) != null ? ref1.brackets : void 0) {
      return input.collatedBy.brackets;
    }
    return input.result.__bracketContext[port].filter(function (c) {
      return c.source === port;
    }).map(function (c) {
      return c.ip.data;
    });
  };

  getOutputProxy = function getOutputProxy(ports, output) {
    var outProxy;
    outProxy = {};
    ports.forEach(function (port) {
      return outProxy[port] = {
        connect: function connect() {},
        beginGroup: function beginGroup(group, idx) {
          var ip;
          ip = new IP('openBracket', group);
          ip.index = idx;
          return output.sendIP(port, ip);
        },
        send: function send(data, idx) {
          var ip;
          ip = new IP('data', data);
          ip.index = idx;
          return output.sendIP(port, ip);
        },
        endGroup: function endGroup(group, idx) {
          var ip;
          ip = new IP('closeBracket', group);
          ip.index = idx;
          return output.sendIP(port, ip);
        },
        disconnect: function disconnect() {}
      };
    });
    if (ports.length === 1) {
      return outProxy[ports[0]];
    }
    return outProxy;
  };

  checkWirePatternPreconditions = function checkWirePatternPreconditions(config, input, output) {
    var attached, idx, inputsOk, j, k, len, len1, packetsDropped, paramsOk, port, ref;
    paramsOk = checkWirePatternPreconditionsParams(config, input);
    inputsOk = checkWirePatternPreconditionsInput(config, input);
    if (config.dropInput && !paramsOk) {
      packetsDropped = false;
      ref = config.inPorts;
      for (j = 0, len = ref.length; j < len; j++) {
        port = ref[j];
        if (input.ports[port].isAddressable()) {
          attached = input.attached(port);
          if (!attached.length) {
            continue;
          }
          for (k = 0, len1 = attached.length; k < len1; k++) {
            idx = attached[k];
            while (input.has([port, idx])) {
              packetsDropped = true;
              input.get([port, idx]).drop();
            }
          }
          continue;
        }
        while (input.has(port)) {
          packetsDropped = true;
          input.get(port).drop();
        }
      }
      if (packetsDropped) {
        output.done();
      }
    }
    return inputsOk && paramsOk;
  };

  checkWirePatternPreconditionsParams = function checkWirePatternPreconditionsParams(config, input) {
    var attached, j, len, param, ref, withData;
    ref = config.params;
    for (j = 0, len = ref.length; j < len; j++) {
      param = ref[j];
      if (!input.ports[param].isRequired()) {
        continue;
      }
      if (input.ports[param].isAddressable()) {
        attached = input.attached(param);
        if (!attached.length) {
          return false;
        }
        withData = attached.filter(function (idx) {
          return input.hasData([param, idx]);
        });
        if (config.arrayPolicy.params === 'all') {
          if (withData.length !== attached.length) {
            return false;
          }
          continue;
        }
        if (!withData.length) {
          return false;
        }
        continue;
      }
      if (!input.hasData(param)) {
        return false;
      }
    }
    return true;
  };

  checkWirePatternPreconditionsInput = function checkWirePatternPreconditionsInput(config, input) {
    var attached, bracketsAtPorts, checkBrackets, checkPacket, checkPort, j, len, port, ref, withData;
    if (config.group) {
      bracketsAtPorts = {};
      input.collatedBy = {
        brackets: [],
        ready: false
      };
      checkBrackets = function checkBrackets(left, right) {
        var bracket, idx, j, len;
        for (idx = j = 0, len = left.length; j < len; idx = ++j) {
          bracket = left[idx];
          if (right[idx] !== bracket) {
            return false;
          }
        }
        return true;
      };
      checkPacket = function checkPacket(ip, brackets) {
        var bracketId, bracketsToCheck;
        bracketsToCheck = brackets.slice(0);
        if (config.group instanceof RegExp) {
          bracketsToCheck = bracketsToCheck.slice(0, 1);
          if (!bracketsToCheck.length) {
            return false;
          }
          if (!config.group.test(bracketsToCheck[0])) {
            return false;
          }
        }
        if (input.collatedBy.ready) {
          return checkBrackets(input.collatedBy.brackets, bracketsToCheck);
        }
        bracketId = bracketsToCheck.join(':');
        if (!bracketsAtPorts[bracketId]) {
          bracketsAtPorts[bracketId] = [];
        }
        if (bracketsAtPorts[bracketId].indexOf(port) === -1) {
          bracketsAtPorts[bracketId].push(port);
        }
        if (config.inPorts.indexOf(port) !== config.inPorts.length - 1) {
          return true;
        }
        if (bracketsAtPorts[bracketId].length !== config.inPorts.length) {
          return false;
        }
        if (input.collatedBy.ready) {
          return false;
        }
        input.collatedBy.ready = true;
        input.collatedBy.brackets = bracketsToCheck;
        return true;
      };
    }
    if (config.field) {
      input.collatedBy = {
        field: void 0,
        ready: false
      };
    }
    checkPort = function checkPort(port) {
      var buf, dataBrackets, hasData, hasMatching, ip, j, len, portBrackets;
      if (!config.group && !config.field) {
        return input.hasData(port);
      }
      if (config.group) {
        portBrackets = [];
        dataBrackets = [];
        hasMatching = false;
        buf = input.ports[port].getBuffer(input.scope);
        for (j = 0, len = buf.length; j < len; j++) {
          ip = buf[j];
          if (ip.type === 'openBracket') {
            portBrackets.push(ip.data);
            continue;
          }
          if (ip.type === 'closeBracket') {
            portBrackets.pop();
            if (portBrackets.length) {
              continue;
            }
            if (!hasData) {
              continue;
            }
            hasMatching = true;
            continue;
          }
          hasData = checkPacket(ip, portBrackets);
          continue;
        }
        return hasMatching;
      }
      if (config.field) {
        return input.hasStream(port, function (ip) {
          if (!input.collatedBy.ready) {
            input.collatedBy.field = ip.data[config.field];
            input.collatedBy.ready = true;
            return true;
          }
          return ip.data[config.field] === input.collatedBy.field;
        });
      }
    };
    ref = config.inPorts;
    for (j = 0, len = ref.length; j < len; j++) {
      port = ref[j];
      if (input.ports[port].isAddressable()) {
        attached = input.attached(port);
        if (!attached.length) {
          return false;
        }
        withData = attached.filter(function (idx) {
          return checkPort([port, idx]);
        });
        if (config.arrayPolicy['in'] === 'all') {
          if (withData.length !== attached.length) {
            return false;
          }
          continue;
        }
        if (!withData.length) {
          return false;
        }
        continue;
      }
      if (!checkPort(port)) {
        return false;
      }
    }
    return true;
  };

  OutPortWrapper = function () {
    function OutPortWrapper(port1, scope1) {
      this.port = port1;
      this.scope = scope1;
    }

    OutPortWrapper.prototype.connect = function (socketId) {
      if (socketId == null) {
        socketId = null;
      }
      return this.port.openBracket(null, {
        scope: this.scope
      }, socketId);
    };

    OutPortWrapper.prototype.beginGroup = function (group, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      return this.port.openBracket(group, {
        scope: this.scope
      }, socketId);
    };

    OutPortWrapper.prototype.send = function (data, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      return this.port.sendIP('data', data, {
        scope: this.scope
      }, socketId, false);
    };

    OutPortWrapper.prototype.endGroup = function (group, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      return this.port.closeBracket(group, {
        scope: this.scope
      }, socketId);
    };

    OutPortWrapper.prototype.disconnect = function (socketId) {
      if (socketId == null) {
        socketId = null;
      }
      return this.endGroup(socketId);
    };

    OutPortWrapper.prototype.isConnected = function () {
      return this.port.isConnected();
    };

    OutPortWrapper.prototype.isAttached = function () {
      return this.port.isAttached();
    };

    return OutPortWrapper;
  }();

  legacyWirePattern = function legacyWirePattern(component, config, proc) {
    var _wp, baseTearDown, closeGroupOnOuts, collectGroups, disconnectOuts, fn, fn1, gc, j, k, l, len, len1, len2, len3, len4, m, n, name, port, processQueue, ref, ref1, ref2, ref3, ref4, resumeTaskQ, sendGroupToOuts, setParamsScope;
    if (!('gcFrequency' in config)) {
      config.gcFrequency = 100;
    }
    if (!('gcTimeout' in config)) {
      config.gcTimeout = 300;
    }
    collectGroups = config.forwardGroups;
    if (collectGroups !== false && config.group) {
      collectGroups = true;
    }
    ref = config.inPorts;
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      if (!component.inPorts[name]) {
        throw new Error("no inPort named '" + name + "'");
      }
    }
    ref1 = config.outPorts;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      name = ref1[k];
      if (!component.outPorts[name]) {
        throw new Error("no outPort named '" + name + "'");
      }
    }
    disconnectOuts = function disconnectOuts() {
      var l, len2, p, ref2, results;
      ref2 = config.outPorts;
      results = [];
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        p = ref2[l];
        if (component.outPorts[p].isConnected()) {
          results.push(component.outPorts[p].disconnect());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    sendGroupToOuts = function sendGroupToOuts(grp) {
      var l, len2, p, ref2, results;
      ref2 = config.outPorts;
      results = [];
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        p = ref2[l];
        results.push(component.outPorts[p].beginGroup(grp));
      }
      return results;
    };
    closeGroupOnOuts = function closeGroupOnOuts(grp) {
      var l, len2, p, ref2, results;
      ref2 = config.outPorts;
      results = [];
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        p = ref2[l];
        results.push(component.outPorts[p].endGroup(grp));
      }
      return results;
    };
    component.requiredParams = [];
    component.defaultedParams = [];
    component.gcCounter = 0;
    component._wpData = {};
    _wp = function _wp(scope) {
      if (!(scope in component._wpData)) {
        component._wpData[scope] = {};
        component._wpData[scope].groupedData = {};
        component._wpData[scope].groupedGroups = {};
        component._wpData[scope].groupedDisconnects = {};
        component._wpData[scope].outputQ = [];
        component._wpData[scope].taskQ = [];
        component._wpData[scope].params = {};
        component._wpData[scope].completeParams = [];
        component._wpData[scope].receivedParams = [];
        component._wpData[scope].defaultsSent = false;
        component._wpData[scope].disconnectData = {};
        component._wpData[scope].disconnectQ = [];
        component._wpData[scope].groupBuffers = {};
        component._wpData[scope].keyBuffers = {};
        component._wpData[scope].gcTimestamps = {};
      }
      return component._wpData[scope];
    };
    component.params = {};
    setParamsScope = function setParamsScope(scope) {
      return component.params = _wp(scope).params;
    };
    processQueue = function processQueue(scope) {
      var flushed, key, stream, streams, tmp;
      while (_wp(scope).outputQ.length > 0) {
        streams = _wp(scope).outputQ[0];
        flushed = false;
        if (streams === null) {
          disconnectOuts();
          flushed = true;
        } else {
          if (config.outPorts.length === 1) {
            tmp = {};
            tmp[config.outPorts[0]] = streams;
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
          _wp(scope).outputQ.shift();
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
      component.beforeProcess = function (scope, outs) {
        if (config.ordered) {
          _wp(scope).outputQ.push(outs);
        }
        component.load++;
        component.emit('activate', component.load);
        if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
          component.outPorts.load.send(component.load);
          return component.outPorts.load.disconnect();
        }
      };
      component.afterProcess = function (scope, err, outs) {
        processQueue(scope);
        component.load--;
        if ('load' in component.outPorts && component.outPorts.load.isAttached()) {
          component.outPorts.load.send(component.load);
          component.outPorts.load.disconnect();
        }
        return component.emit('deactivate', component.load);
      };
    }
    component.sendDefaults = function (scope) {
      var l, len2, param, ref2, tempSocket;
      if (component.defaultedParams.length > 0) {
        ref2 = component.defaultedParams;
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          param = ref2[l];
          if (_wp(scope).receivedParams.indexOf(param) === -1) {
            tempSocket = InternalSocket.createSocket();
            component.inPorts[param].attach(tempSocket);
            tempSocket.send();
            tempSocket.disconnect();
            component.inPorts[param].detach(tempSocket);
          }
        }
      }
      return _wp(scope).defaultsSent = true;
    };
    resumeTaskQ = function resumeTaskQ(scope) {
      var results, task, temp;
      if (_wp(scope).completeParams.length === component.requiredParams.length && _wp(scope).taskQ.length > 0) {
        temp = _wp(scope).taskQ.slice(0);
        _wp(scope).taskQ = [];
        results = [];
        while (temp.length > 0) {
          task = temp.shift();
          results.push(task());
        }
        return results;
      }
    };
    ref2 = config.params;
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      port = ref2[l];
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
    ref3 = config.params;
    fn = function fn(port) {
      var inPort;
      inPort = component.inPorts[port];
      return inPort.handle = function (ip) {
        var event, index, payload, scope;
        event = ip.type;
        payload = ip.data;
        scope = ip.scope;
        index = ip.index;
        if (event !== 'data') {
          return;
        }
        if (inPort.isAddressable()) {
          if (!(port in _wp(scope).params)) {
            _wp(scope).params[port] = {};
          }
          _wp(scope).params[port][index] = payload;
          if (config.arrayPolicy.params === 'all' && Object.keys(_wp(scope).params[port]).length < inPort.listAttached().length) {
            return;
          }
        } else {
          _wp(scope).params[port] = payload;
        }
        if (_wp(scope).completeParams.indexOf(port) === -1 && component.requiredParams.indexOf(port) > -1) {
          _wp(scope).completeParams.push(port);
        }
        _wp(scope).receivedParams.push(port);
        return resumeTaskQ(scope);
      };
    };
    for (m = 0, len3 = ref3.length; m < len3; m++) {
      port = ref3[m];
      fn(port);
    }
    component.dropRequest = function (scope, key) {
      if (key in _wp(scope).disconnectData) {
        delete _wp(scope).disconnectData[key];
      }
      if (key in _wp(scope).groupedData) {
        delete _wp(scope).groupedData[key];
      }
      if (key in _wp(scope).groupedGroups) {
        return delete _wp(scope).groupedGroups[key];
      }
    };
    gc = function gc() {
      var current, key, len4, n, ref4, results, scope, val;
      component.gcCounter++;
      if (component.gcCounter % config.gcFrequency === 0) {
        ref4 = Object.keys(component._wpData);
        results = [];
        for (n = 0, len4 = ref4.length; n < len4; n++) {
          scope = ref4[n];
          current = new Date().getTime();
          results.push(function () {
            var ref5, results1;
            ref5 = _wp(scope).gcTimestamps;
            results1 = [];
            for (key in ref5) {
              val = ref5[key];
              if (current - val > config.gcTimeout * 1000) {
                component.dropRequest(scope, key);
                results1.push(delete _wp(scope).gcTimestamps[key]);
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }());
        }
        return results;
      }
    };
    ref4 = config.inPorts;
    fn1 = function fn1(port) {
      var inPort, needPortGroups;
      inPort = component.inPorts[port];
      needPortGroups = collectGroups instanceof Array && collectGroups.indexOf(port) !== -1;
      return inPort.handle = function (ip) {
        var data, foundGroup, g, groupLength, groups, grp, i, index, key, len5, len6, len7, len8, o, obj, out, outs, payload, postpone, postponedToQ, q, r, ref5, ref6, ref7, ref8, reqId, requiredLength, resume, s, scope, t, task, tmp, u, whenDone, whenDoneGroups, wrp;
        index = ip.index;
        payload = ip.data;
        scope = ip.scope;
        if (!(port in _wp(scope).groupBuffers)) {
          _wp(scope).groupBuffers[port] = [];
        }
        if (!(port in _wp(scope).keyBuffers)) {
          _wp(scope).keyBuffers[port] = null;
        }
        switch (ip.type) {
          case 'openBracket':
            if (payload === null) {
              return;
            }
            _wp(scope).groupBuffers[port].push(payload);
            if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
              return sendGroupToOuts(payload);
            }
            break;
          case 'closeBracket':
            _wp(scope).groupBuffers[port] = _wp(scope).groupBuffers[port].slice(0, _wp(scope).groupBuffers[port].length - 1);
            if (config.forwardGroups && (collectGroups === true || needPortGroups) && !config.async) {
              closeGroupOnOuts(payload);
            }
            if (_wp(scope).groupBuffers[port].length === 0) {
              if (config.inPorts.length === 1) {
                if (config.async || config.StreamSender) {
                  if (config.ordered) {
                    _wp(scope).outputQ.push(null);
                    return processQueue(scope);
                  } else {
                    return _wp(scope).disconnectQ.push(true);
                  }
                } else {
                  return disconnectOuts();
                }
              } else {
                foundGroup = false;
                key = _wp(scope).keyBuffers[port];
                if (!(key in _wp(scope).disconnectData)) {
                  _wp(scope).disconnectData[key] = [];
                }
                for (i = o = 0, ref5 = _wp(scope).disconnectData[key].length; 0 <= ref5 ? o < ref5 : o > ref5; i = 0 <= ref5 ? ++o : --o) {
                  if (!(port in _wp(scope).disconnectData[key][i])) {
                    foundGroup = true;
                    _wp(scope).disconnectData[key][i][port] = true;
                    if (Object.keys(_wp(scope).disconnectData[key][i]).length === config.inPorts.length) {
                      _wp(scope).disconnectData[key].shift();
                      if (config.async || config.StreamSender) {
                        if (config.ordered) {
                          _wp(scope).outputQ.push(null);
                          processQueue(scope);
                        } else {
                          _wp(scope).disconnectQ.push(true);
                        }
                      } else {
                        disconnectOuts();
                      }
                      if (_wp(scope).disconnectData[key].length === 0) {
                        delete _wp(scope).disconnectData[key];
                      }
                    }
                    break;
                  }
                }
                if (!foundGroup) {
                  obj = {};
                  obj[port] = true;
                  return _wp(scope).disconnectData[key].push(obj);
                }
              }
            }
            break;
          case 'data':
            if (config.inPorts.length === 1 && !inPort.isAddressable()) {
              data = payload;
              groups = _wp(scope).groupBuffers[port];
            } else {
              key = '';
              if (config.group && _wp(scope).groupBuffers[port].length > 0) {
                key = _wp(scope).groupBuffers[port].toString();
                if (config.group instanceof RegExp) {
                  reqId = null;
                  ref6 = _wp(scope).groupBuffers[port];
                  for (q = 0, len5 = ref6.length; q < len5; q++) {
                    grp = ref6[q];
                    if (config.group.test(grp)) {
                      reqId = grp;
                      break;
                    }
                  }
                  key = reqId ? reqId : '';
                }
              } else if (config.field && (typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) === 'object' && config.field in payload) {
                key = payload[config.field];
              }
              _wp(scope).keyBuffers[port] = key;
              if (!(key in _wp(scope).groupedData)) {
                _wp(scope).groupedData[key] = [];
              }
              if (!(key in _wp(scope).groupedGroups)) {
                _wp(scope).groupedGroups[key] = [];
              }
              foundGroup = false;
              requiredLength = config.inPorts.length;
              if (config.field) {
                ++requiredLength;
              }
              for (i = r = 0, ref7 = _wp(scope).groupedData[key].length; 0 <= ref7 ? r < ref7 : r > ref7; i = 0 <= ref7 ? ++r : --r) {
                if (!(port in _wp(scope).groupedData[key][i]) || component.inPorts[port].isAddressable() && config.arrayPolicy["in"] === 'all' && !(index in _wp(scope).groupedData[key][i][port])) {
                  foundGroup = true;
                  if (component.inPorts[port].isAddressable()) {
                    if (!(port in _wp(scope).groupedData[key][i])) {
                      _wp(scope).groupedData[key][i][port] = {};
                    }
                    _wp(scope).groupedData[key][i][port][index] = payload;
                  } else {
                    _wp(scope).groupedData[key][i][port] = payload;
                  }
                  if (needPortGroups) {
                    _wp(scope).groupedGroups[key][i] = utils.unique(slice.call(_wp(scope).groupedGroups[key][i]).concat(slice.call(_wp(scope).groupBuffers[port])));
                  } else if (collectGroups === true) {
                    _wp(scope).groupedGroups[key][i][port] = _wp(scope).groupBuffers[port];
                  }
                  if (component.inPorts[port].isAddressable() && config.arrayPolicy["in"] === 'all' && Object.keys(_wp(scope).groupedData[key][i][port]).length < component.inPorts[port].listAttached().length) {
                    return;
                  }
                  groupLength = Object.keys(_wp(scope).groupedData[key][i]).length;
                  if (groupLength === requiredLength) {
                    data = _wp(scope).groupedData[key].splice(i, 1)[0];
                    if (config.inPorts.length === 1 && inPort.isAddressable()) {
                      data = data[port];
                    }
                    groups = _wp(scope).groupedGroups[key].splice(i, 1)[0];
                    if (collectGroups === true) {
                      groups = utils.intersection.apply(null, utils.getValues(groups));
                    }
                    if (_wp(scope).groupedData[key].length === 0) {
                      delete _wp(scope).groupedData[key];
                    }
                    if (_wp(scope).groupedGroups[key].length === 0) {
                      delete _wp(scope).groupedGroups[key];
                    }
                    if (config.group && key) {
                      delete _wp(scope).gcTimestamps[key];
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
                if (config.inPorts.length === 1 && component.inPorts[port].isAddressable() && (config.arrayPolicy["in"] === 'any' || component.inPorts[port].listAttached().length === 1)) {
                  data = obj[port];
                  groups = _wp(scope).groupBuffers[port];
                } else {
                  _wp(scope).groupedData[key].push(obj);
                  if (needPortGroups) {
                    _wp(scope).groupedGroups[key].push(_wp(scope).groupBuffers[port]);
                  } else if (collectGroups === true) {
                    tmp = {};
                    tmp[port] = _wp(scope).groupBuffers[port];
                    _wp(scope).groupedGroups[key].push(tmp);
                  } else {
                    _wp(scope).groupedGroups[key].push([]);
                  }
                  if (config.group && key) {
                    _wp(scope).gcTimestamps[key] = new Date().getTime();
                  }
                  return;
                }
              }
            }
            if (config.dropInput && _wp(scope).completeParams.length !== component.requiredParams.length) {
              return;
            }
            outs = {};
            ref8 = config.outPorts;
            for (s = 0, len6 = ref8.length; s < len6; s++) {
              name = ref8[s];
              wrp = new OutPortWrapper(component.outPorts[name], scope);
              if (config.async || config.sendStreams && config.sendStreams.indexOf(name) !== -1) {
                wrp;
                outs[name] = new StreamSender(wrp, config.ordered);
              } else {
                outs[name] = wrp;
              }
            }
            if (config.outPorts.length === 1) {
              outs = outs[config.outPorts[0]];
            }
            if (!groups) {
              groups = [];
            }
            groups = function () {
              var len7, results, t;
              results = [];
              for (t = 0, len7 = groups.length; t < len7; t++) {
                g = groups[t];
                if (g !== null) {
                  results.push(g);
                }
              }
              return results;
            }();
            whenDoneGroups = groups.slice(0);
            whenDone = function whenDone(err) {
              var disconnect, len7, out, outputs, t;
              if (err) {
                component.error(err, whenDoneGroups, 'error', scope);
              }
              if (typeof component.fail === 'function' && component.hasErrors) {
                component.fail(null, [], scope);
              }
              outputs = outs;
              if (config.outPorts.length === 1) {
                outputs = {};
                outputs[port] = outs;
              }
              disconnect = false;
              if (_wp(scope).disconnectQ.length > 0) {
                _wp(scope).disconnectQ.shift();
                disconnect = true;
              }
              for (name in outputs) {
                out = outputs[name];
                if (config.forwardGroups && config.async) {
                  for (t = 0, len7 = whenDoneGroups.length; t < len7; t++) {
                    i = whenDoneGroups[t];
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
                return component.afterProcess(scope, err || component.hasErrors, outs);
              }
            };
            if (typeof component.beforeProcess === 'function') {
              component.beforeProcess(scope, outs);
            }
            if (config.forwardGroups && config.async) {
              if (config.outPorts.length === 1) {
                for (t = 0, len7 = groups.length; t < len7; t++) {
                  g = groups[t];
                  outs.beginGroup(g);
                }
              } else {
                for (name in outs) {
                  out = outs[name];
                  for (u = 0, len8 = groups.length; u < len8; u++) {
                    g = groups[u];
                    out.beginGroup(g);
                  }
                }
              }
            }
            exports.MultiError(component, config.name, config.error, groups, scope);
            debug("WirePattern Legacy API call with", data, groups, component.params, scope);
            if (config.async) {
              postpone = function postpone() {};
              resume = function resume() {};
              postponedToQ = false;
              task = function task() {
                setParamsScope(scope);
                return proc.call(component, data, groups, outs, whenDone, postpone, resume, scope);
              };
              postpone = function postpone(backToQueue) {
                if (backToQueue == null) {
                  backToQueue = true;
                }
                postponedToQ = backToQueue;
                if (backToQueue) {
                  return _wp(scope).taskQ.push(task);
                }
              };
              resume = function resume() {
                if (postponedToQ) {
                  return resumeTaskQ();
                } else {
                  return task();
                }
              };
            } else {
              task = function task() {
                setParamsScope(scope);
                proc.call(component, data, groups, outs, null, null, null, scope);
                return whenDone();
              };
            }
            _wp(scope).taskQ.push(task);
            resumeTaskQ(scope);
            return gc();
        }
      };
    };
    for (n = 0, len4 = ref4.length; n < len4; n++) {
      port = ref4[n];
      fn1(port);
    }
    baseTearDown = component.tearDown;
    component.tearDown = function (callback) {
      component.requiredParams = [];
      component.defaultedParams = [];
      component.gcCounter = 0;
      component._wpData = {};
      component.params = {};
      return baseTearDown.call(component, callback);
    };
    return component;
  };

  exports.GroupedInput = exports.WirePattern;

  exports.CustomError = function (message, options) {
    var err;
    err = new Error(message);
    return exports.CustomizeError(err, options);
  };

  exports.CustomizeError = function (err, options) {
    var key, val;
    for (key in options) {
      if (!hasProp.call(options, key)) continue;
      val = options[key];
      err[key] = val;
    }
    return err;
  };

  exports.MultiError = function (component, group, errorPort, forwardedGroups, scope) {
    var baseTearDown;
    if (group == null) {
      group = '';
    }
    if (errorPort == null) {
      errorPort = 'error';
    }
    if (forwardedGroups == null) {
      forwardedGroups = [];
    }
    if (scope == null) {
      scope = null;
    }
    platform.deprecated('noflo.helpers.MultiError is deprecated. Send errors to error port instead');
    component.hasErrors = false;
    component.errors = [];
    if (component.name && !group) {
      group = component.name;
    }
    if (!group) {
      group = 'Component';
    }
    component.error = function (e, groups) {
      if (groups == null) {
        groups = [];
      }
      component.errors.push({
        err: e,
        groups: forwardedGroups.concat(groups)
      });
      return component.hasErrors = true;
    };
    component.fail = function (e, groups) {
      var error, grp, j, k, l, len, len1, len2, ref, ref1, ref2;
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
        component.outPorts[errorPort].openBracket(group, {
          scope: scope
        });
      }
      ref = component.errors;
      for (j = 0, len = ref.length; j < len; j++) {
        error = ref[j];
        ref1 = error.groups;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          grp = ref1[k];
          component.outPorts[errorPort].openBracket(grp, {
            scope: scope
          });
        }
        component.outPorts[errorPort].data(error.err, {
          scope: scope
        });
        ref2 = error.groups;
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          grp = ref2[l];
          component.outPorts[errorPort].closeBracket(grp, {
            scope: scope
          });
        }
      }
      if (group) {
        component.outPorts[errorPort].closeBracket(group, {
          scope: scope
        });
      }
      component.hasErrors = false;
      return component.errors = [];
    };
    baseTearDown = component.tearDown;
    component.tearDown = function (callback) {
      component.hasErrors = false;
      component.errors = [];
      return baseTearDown.call(component, callback);
    };
    return component;
  };
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var ArrayPort,
      platform,
      port,
      extend = function extend(child, parent) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      hasProp = {}.hasOwnProperty;

  port = __webpack_require__(9);

  platform = __webpack_require__(3);

  ArrayPort = function (superClass) {
    extend(ArrayPort, superClass);

    function ArrayPort(type) {
      this.type = type;
      platform.deprecated('noflo.ArrayPort is deprecated. Please port to noflo.InPort/noflo.OutPort and use addressable: true');
      ArrayPort.__super__.constructor.call(this, this.type);
    }

    ArrayPort.prototype.attach = function (socket, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        socketId = this.sockets.length;
      }
      this.sockets[socketId] = socket;
      return this.attachSocket(socket, socketId);
    };

    ArrayPort.prototype.connect = function (socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error(this.getId() + ": No connections available");
        }
        this.sockets.forEach(function (socket) {
          if (!socket) {
            return;
          }
          return socket.connect();
        });
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error(this.getId() + ": No connection '" + socketId + "' available");
      }
      return this.sockets[socketId].connect();
    };

    ArrayPort.prototype.beginGroup = function (group, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error(this.getId() + ": No connections available");
        }
        this.sockets.forEach(function (_this) {
          return function (socket, index) {
            if (!socket) {
              return;
            }
            return _this.beginGroup(group, index);
          };
        }(this));
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error(this.getId() + ": No connection '" + socketId + "' available");
      }
      if (this.isConnected(socketId)) {
        return this.sockets[socketId].beginGroup(group);
      }
      this.sockets[socketId].once("connect", function (_this) {
        return function () {
          return _this.sockets[socketId].beginGroup(group);
        };
      }(this));
      return this.sockets[socketId].connect();
    };

    ArrayPort.prototype.send = function (data, socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error(this.getId() + ": No connections available");
        }
        this.sockets.forEach(function (_this) {
          return function (socket, index) {
            if (!socket) {
              return;
            }
            return _this.send(data, index);
          };
        }(this));
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error(this.getId() + ": No connection '" + socketId + "' available");
      }
      if (this.isConnected(socketId)) {
        return this.sockets[socketId].send(data);
      }
      this.sockets[socketId].once("connect", function (_this) {
        return function () {
          return _this.sockets[socketId].send(data);
        };
      }(this));
      return this.sockets[socketId].connect();
    };

    ArrayPort.prototype.endGroup = function (socketId) {
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error(this.getId() + ": No connections available");
        }
        this.sockets.forEach(function (_this) {
          return function (socket, index) {
            if (!socket) {
              return;
            }
            return _this.endGroup(index);
          };
        }(this));
        return;
      }
      if (!this.sockets[socketId]) {
        throw new Error(this.getId() + ": No connection '" + socketId + "' available");
      }
      return this.sockets[socketId].endGroup();
    };

    ArrayPort.prototype.disconnect = function (socketId) {
      var i, len, ref, socket;
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        if (!this.sockets.length) {
          throw new Error(this.getId() + ": No connections available");
        }
        ref = this.sockets;
        for (i = 0, len = ref.length; i < len; i++) {
          socket = ref[i];
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

    ArrayPort.prototype.isConnected = function (socketId) {
      var connected;
      if (socketId == null) {
        socketId = null;
      }
      if (socketId === null) {
        connected = false;
        this.sockets.forEach(function (socket) {
          if (!socket) {
            return;
          }
          if (socket.isConnected()) {
            return connected = true;
          }
        });
        return connected;
      }
      if (!this.sockets[socketId]) {
        return false;
      }
      return this.sockets[socketId].isConnected();
    };

    ArrayPort.prototype.isAddressable = function () {
      return true;
    };

    ArrayPort.prototype.isAttached = function (socketId) {
      var i, len, ref, socket;
      if (socketId === void 0) {
        ref = this.sockets;
        for (i = 0, len = ref.length; i < len; i++) {
          socket = ref[i];
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
  }(port.Port);

  exports.ArrayPort = ArrayPort;
}).call(undefined);

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var ComponentLoader, Graph, IP, Network, _getType, internalSocket, normalizeOptions, normalizeOutput, prepareInputMap, prepareNetwork, runNetwork, sendOutputMap;

  ComponentLoader = __webpack_require__(8).ComponentLoader;

  Network = __webpack_require__(14).Network;

  IP = __webpack_require__(2);

  internalSocket = __webpack_require__(4);

  Graph = __webpack_require__(5).Graph;

  normalizeOptions = function normalizeOptions(options, component) {
    if (!options) {
      options = {};
    }
    if (!options.name) {
      options.name = component;
    }
    if (options.loader) {
      options.baseDir = options.loader.baseDir;
    }
    if (!options.baseDir && process && process.cwd) {
      options.baseDir = process.cwd();
    }
    if (!options.loader) {
      options.loader = new ComponentLoader(options.baseDir);
    }
    if (!options.raw) {
      options.raw = false;
    }
    return options;
  };

  prepareNetwork = function prepareNetwork(component, options, callback) {
    return options.loader.load(component, function (err, instance) {
      var def, graph, inPorts, network, nodeName, outPorts, port;
      if (err) {
        return callback(err);
      }
      graph = new Graph(options.name);
      nodeName = options.name;
      graph.addNode(nodeName, component);
      inPorts = instance.inPorts.ports || instance.inPorts;
      outPorts = instance.outPorts.ports || instance.outPorts;
      for (port in inPorts) {
        def = inPorts[port];
        graph.addInport(port, nodeName, port);
      }
      for (port in outPorts) {
        def = outPorts[port];
        graph.addOutport(port, nodeName, port);
      }
      graph.componentLoader = options.loader;
      network = new Network(graph, options);
      return network.connect(function (err) {
        if (err) {
          return callback(err);
        }
        return callback(null, network);
      });
    });
  };

  runNetwork = function runNetwork(network, inputs, options, callback) {
    var inPorts, inSockets, outPorts, outSockets, process, received;
    process = network.getNode(options.name);
    inPorts = Object.keys(network.graph.inports);
    inSockets = {};
    inPorts.forEach(function (inport) {
      inSockets[inport] = internalSocket.createSocket();
      return process.component.inPorts[inport].attach(inSockets[inport]);
    });
    received = [];
    outPorts = Object.keys(network.graph.outports);
    outSockets = {};
    outPorts.forEach(function (outport) {
      outSockets[outport] = internalSocket.createSocket();
      process.component.outPorts[outport].attach(outSockets[outport]);
      return outSockets[outport].on('ip', function (ip) {
        var res;
        res = {};
        res[outport] = ip;
        return received.push(res);
      });
    });
    network.once('end', function () {
      var port, socket;
      for (port in outSockets) {
        socket = outSockets[port];
        process.component.outPorts[port].detach(socket);
      }
      outSockets = {};
      inSockets = {};
      return callback(null, received);
    });
    return network.start(function (err) {
      var i, inputMap, len, port, results, value;
      if (err) {
        return callback(err);
      }
      results = [];
      for (i = 0, len = inputs.length; i < len; i++) {
        inputMap = inputs[i];
        results.push(function () {
          var results1;
          results1 = [];
          for (port in inputMap) {
            value = inputMap[port];
            if (IP.isIP(value)) {
              inSockets[port].post(value);
              continue;
            }
            results1.push(inSockets[port].post(new IP('data', value)));
          }
          return results1;
        }());
      }
      return results;
    });
  };

  _getType = function getType(inputs, network) {
    var key, maps, value;
    if ((typeof inputs === 'undefined' ? 'undefined' : _typeof(inputs)) !== 'object') {
      return 'simple';
    }
    if (Array.isArray(inputs)) {
      maps = inputs.filter(function (entry) {
        return _getType(entry, network) === 'map';
      });
      if (maps.length === inputs.length) {
        return 'sequence';
      }
      return 'simple';
    }
    if (!Object.keys(inputs).length) {
      return 'simple';
    }
    for (key in inputs) {
      value = inputs[key];
      if (!network.graph.inports[key]) {
        return 'simple';
      }
    }
    return 'map';
  };

  prepareInputMap = function prepareInputMap(inputs, inputType, network) {
    var inPort, map;
    if (inputType === 'sequence') {
      return inputs;
    }
    if (inputType === 'map') {
      return [inputs];
    }
    inPort = Object.keys(network.graph.inports)[0];
    if (network.graph.inports["in"]) {
      inPort = 'in';
    }
    map = {};
    map[inPort] = inputs;
    return [map];
  };

  normalizeOutput = function normalizeOutput(values, options) {
    var current, i, len, packet, previous, result;
    if (options.raw) {
      return values;
    }
    result = [];
    previous = null;
    current = result;
    for (i = 0, len = values.length; i < len; i++) {
      packet = values[i];
      if (packet.type === 'openBracket') {
        previous = current;
        current = [];
        previous.push(current);
      }
      if (packet.type === 'data') {
        current.push(packet.data);
      }
      if (packet.type === 'closeBracket') {
        current = previous;
      }
    }
    if (result.length === 1) {
      return result[0];
    }
    return result;
  };

  sendOutputMap = function sendOutputMap(outputs, resultType, options, callback) {
    var errors, i, key, len, map, mappedOutputs, outputKeys, packets, port, result, val, withValue;
    errors = outputs.filter(function (map) {
      return map.error != null;
    }).map(function (map) {
      return map.error;
    });
    if (errors.length) {
      return callback(normalizeOutput(errors, options));
    }
    if (resultType === 'sequence') {
      return callback(null, outputs.map(function (map) {
        var key, res, val;
        res = {};
        for (key in map) {
          val = map[key];
          if (options.raw) {
            res[key] = val;
            continue;
          }
          res[key] = normalizeOutput([val], options);
        }
        return res;
      }));
    }
    mappedOutputs = {};
    for (i = 0, len = outputs.length; i < len; i++) {
      map = outputs[i];
      for (key in map) {
        val = map[key];
        if (!mappedOutputs[key]) {
          mappedOutputs[key] = [];
        }
        mappedOutputs[key].push(val);
      }
    }
    outputKeys = Object.keys(mappedOutputs);
    withValue = outputKeys.filter(function (outport) {
      return mappedOutputs[outport].length > 0;
    });
    if (withValue.length === 0) {
      return callback(null);
    }
    if (withValue.length === 1 && resultType === 'simple') {
      return callback(null, normalizeOutput(mappedOutputs[withValue[0]], options));
    }
    result = {};
    for (port in mappedOutputs) {
      packets = mappedOutputs[port];
      result[port] = normalizeOutput(packets, options);
    }
    return callback(null, result);
  };

  exports.asCallback = function (component, options) {
    options = normalizeOptions(options, component);
    return function (inputs, callback) {
      return prepareNetwork(component, options, function (err, network) {
        var inputMap, resultType;
        if (err) {
          return callback(err);
        }
        resultType = _getType(inputs, network);
        inputMap = prepareInputMap(inputs, resultType, network);
        return runNetwork(network, inputMap, options, function (err, outputMap) {
          if (err) {
            return callback(err);
          }
          return sendOutputMap(outputMap, resultType, options, callback);
        });
      });
    };
  };
}).call(undefined);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ })
/******/ ]);