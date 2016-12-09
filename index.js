(function () {
  var vue;
  
  var noopStrategy = function(initOptions) {
    return function(keyOptions) {
      return function(vm, path) {
        
        // Set up incoming changes FROM remote
        
        vm.$watch(path, function(val1, val2) {
          // Send changes to remote
        });
        
        return function() {
          // Stop syncing, deconstruct, etc.
        }
      }
    }
  }
  
  var localStrategy = function() {
    return function(storageName) {
      return function(vm, path) {
        
        var currentlyUpdating = false;
        window.addEventListener('storage', function(event) {
          if (event.key == storageName + path && !currentlyUpdating) vue.set(vm, event.key.replace(storageName, ''), JSON.parse(event.newValue));
          currentlyUpdating = true
          vm.$nextTick(function() { currentlyUpdating = false; })
        })
        
        var existingValue = localStorage.getItem(storageName+path);
        if (existingValue) vue.set(vm, path, JSON.parse(existingValue));
        
        vm.$watch(path, function(newVal, oldVal) {
          if (currentlyUpdating) return;
          currentlyUpdating = true;
          // console.log('adasd', storageName + path, JSON.stringify(newVal));
          localStorage.setItem(storageName + path, JSON.stringify(newVal));
          vm.$nextTick(function() { currentlyUpdating = false; })
        },
        {
          deep: true,
          immidiate: true
        });
        
        return function() {
          // Stop syncing, deconstruct, etc.
        }
      }
    }
  }
  
  var websocketStrategy = function(serverAddr) {
    if (typeof serverAddr == 'undefined') serverAddr = 'ws://' + window.location.host;
    
    var socket = new WebSocket(serverAddr)
    
    return function(keyOptions) {
      return function(vm, path) {
        var currentlyUpdatingFromServer = false
        
        socket.addEventListener('message', function(event) {
          currentlyUpdatingFromServer = true
          var message = JSON.parse(event.data);
          if (message[0] == path) vue.set(vm, message[0], message[1]);
          vm.$nextTick(function() { currentlyUpdatingFromServer = false; })
          // currentlyUpdatingFromServer = false; 
        })
        
        vm.$watch(path,
          function(newVal, oldVal) {
            if (!currentlyUpdatingFromServer) socket.send(JSON.stringify([path, newVal]));
          },
          {
            deep: true,
            immidiate: true
          }
        );
        
        return function() {
          // Stop syncing, deconstruct, etc.
        }
      }
    }
  }
  
  var webrtcStrategy = function(remoteAddr) {
    if (typeof webkitRTCPeerConnection !== 'undefined') var RTCPeerConnection = webkitRTCPeerConnection;
    var connection = new RTCPeerConnection(null);
    var sendChannel = connection.createDataChannel("sendChannel");
    
    function handleSendChannelStatusChange(s) { console.log(s) };
    function receiveChannelCallback() {};
    function handleAddCandidateError(e) { console.error(e); }
    
    connection.onicecandidate = function(e) {
      return !e.candidate || connection.addIceCandidate(e.candidate).catch(handleAddCandidateError);
    }
    
    connection.ondatachannel = receiveChannelCallback;
    
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;
    
    connection.createOffer().then(function(offer) {
      connection.setLocalDescription(offer)
    })
    
    return function() {
      return function(vm, path) {    
        // Set up incoming changes FROM remote
        
        vm.$watch(path, function(val1, val2) {
          // Send changes to remote
        });
        return function() {
          // Stop syncing, deconstruct, etc.
        }
      }
    }
  }
  
  
  var locationStrategy = function() {
    
    var changeUrl, duringPopState, findParam, newValue, popHandler;
    changeUrl = function(paramName, paramValue) {
      var pattern, url;
      if (typeof(paramValue) == 'object') {
        paramValue = JSON.stringify(paramValue);
      }
      paramValue = encodeURIComponent(paramValue);
      url = window.location.toString();
      pattern = new RegExp('\\b(' + paramName + '=).*?(&|$)');
      if (url.search(pattern) >= 0) {
        return url.replace(pattern, '$1' + paramValue + '$2');
      } else {
        return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
      }
    };

    findParam = function(paramName) {
      var pattern, result, url;
      url = window.location.toString();
      pattern = new RegExp('\\b' + paramName + '=(.*?)(&|$)');
      result = pattern.exec(url);
      if ((result != null ? result.length : void 0) >= 1) {
        var val = decodeURIComponent(result[1]);
        try {
          val = JSON.parse(val);
        }
        catch (e) {
          // Wasnt json. Do nothing.
        }
        if (val == 'false') return false;
        return val;
      }
    };

    duringPopState = false;


    
    return function(param, noHistory) {
      return function(vm, path) {
        popHandler = function() {
          duringPopState = true;
          newValue = findParam(param);
          if (newValue) {
            vue.set(vm, path, newValue);
          }
          vm.$nextTick(function() {
            duringPopState = false;
          });
        };  

        window.addEventListener('popstate', popHandler);
        
        newValue = findParam(param);

        if (newValue) {
          vue.set(vm, path, newValue);
        }
        else {
          var newUrl = changeUrl(param, vm[path]);
          history.replaceState(null, '', newUrl);
        }
        
        vm.$watch(path, function(val1, val2) {
          var newUrl;
          if (duringPopState) {
            return;
          }
          newUrl = changeUrl(param, val1);
          
          if (noHistory) {
            history.replaceState(null, '', newUrl);
          }
          else {
            history.pushState(null, '', newUrl);  
          }
        }, {deep: true});
        return function() {
          // STOP syncing
        }
      }
    }
  }
  


  var sync = {
    created: function () {
      if (!vue) {
        console.warn('[vue-sync] not installed!')
        return
      }
    },
    mounted: function() {
      var syncOptions = this.$options.sync;
      if (typeof syncOptions == 'function') syncOptions = syncOptions();
      if (syncOptions) {
        for (var key in syncOptions) {
          if (syncOptions.hasOwnProperty(key)) {
            var syncFn = syncOptions[key]
            var stopFunc = syncFn(this, key);
          } 
        }   
      }
    }
  }

  var api = {
    locationStrategy: locationStrategy,
    webrtcStrategy: webrtcStrategy,
    websocketStrategy: websocketStrategy,
    localStrategy: localStrategy,
    mixin: sync,
    install: function (Vue, options) {
      vue = Vue
      Vue.options = Vue.util.mergeOptions(Vue.options, sync)
    }
  }

  if(typeof exports === 'object' && typeof module === 'object') {
    module.exports = api
  } else if(typeof define === 'function' && define.amd) {
    define(function () { return api })
  } else if (typeof window !== 'undefined') {
    window.VueSync = api
  }
})()
