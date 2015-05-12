
var expose = require('owski-expose');
require('owski-curry').mport(function(curry,applyStrict,arrayFunction,argList,mportFn){

  var
  apply = curry(applyStrict),
  head = function(arr){
    return arr[0];
  },
  rest = function(arr){
    arr.shift();
    return arr;
  },
  headRest = curry(function(fn,argsArray){
    return apply(fn,this,[
      head(argsArray),
      rest(argsArray)
    ]);
  }),
  init = function(arr){
    arr.pop();
    return arr;
  },
  tail = function(arr){
    return arr[arr.length-1];
  },
  initTail = curry(function(fn,args){
    var t = tail(args);
    return apply(fn,this,[
      init(args),
      t
    ]);
  })
  compose2 = function(fnA,fnB){
    return function(){
      return apply(fnA,this,[
        apply(fnB,this,arguments)
      ]);
    };
  },
  compose = arrayFunction(headRest(function(h,r){
    return r.length
      ? compose2(h,apply(compose,this,r))
      : h;
  })),
  reverseArguments = function(fn){
    return arrayFunction(function(args){
      return apply(fn,this,args.reverse());
    });
  },
  proxy = curry(function(fn,obj){
    return arrayFunction(apply(fn,obj));
  }),
  proxied = curry(function(obj,fnName){
    return proxy(obj[fnName],obj);
  }),
  antitotype = function(fn,property){
    return arrayFunction(function(args){
      if (typeof property === 'undefined') {
        args.push(this);
        return apply(fn,this,args);
      } else if(typeof property === 'string'){
        var
        passable = this[property];
        args.push(passable);
        var result = apply(fn,this,args);
        this[property] = result;
        return this;
      } else if(typeof property === 'function'){
        var
        passable = property(this);
        args.push(passable);
        var
        result = apply(fn,this,args);
        property(this,result);
        return this;
      }
    });
  },
  splat = function(fn){
    var
    breakPoint = argList(fn).length - 1;
    return arrayFunction(function(arr){
      var
      beginning = arr.slice(0,breakPoint),
      ending = arr.slice(breakPoint,arr.length),
      next = beginning.concat([ending]);
      return apply(fn,this,next);
    });
  },
  chew = function(target,adapters){
    return arrayFunction(function(args){
      for(var i in args){
        args[i] = (adapters[i] || I)(args[i]);
      }
      return apply(target,this,args);
    });
  };
  expose(module,{
    apply: apply,
    reverseArguments: reverseArguments,
    compose2: compose2,
    compose: compose,
    proxy: proxy,
    proxied: proxied,
    antitotype:antitotype,
    splat: splat,
    chew:chew,
    rest: rest,
    head: head,
    headRest: headRest,
    init: init,
    tail: tail,
    initTail: initTail
  });
});
