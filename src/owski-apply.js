
var expose = require('owski-expose');
var argList = require('owski-arglist');
require('owski-curry').mport(function(curry,applyStrict,arrayFunction,mportFn){

  var
  
  //applyStrict is just Function.prototype.apply iirc
  apply = curry(applyStrict),
  
  head = function(arr){
    return arr[0];
  },
  
  //A tail is the last bit, we want all bits after the first bit, so a more appropriate name would be 'rest'
  rest = function(arr){
    arr.shift();
    return arr;
  },
  
  //Take a callback, and a list, and call the cb with the head and tail of that list, 
  //respectively. This method is useful for writing recursive [head|tail] style functions.
  headRest = curry(function(fn,argsArray){
    return apply(fn,this,[
      head(argsArray),
      rest(argsArray)
    ]);
  }),
  
  //As you would expect, although we should probably avoid the side effect of Array.prototype.pop
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
  }),
  
  //The binary compose implementation upon which the recursive compose definition below depends
  //Does as it says, composes 2 functions into one function
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
  
  //Intercepts the arguments object, reverses the elements, then defers to the cb
  reverseArguments = function(fn){
    return arrayFunction(function(args){
      return apply(fn,this,args.reverse());
    });
  },
  
  //proxy, in the sense of the word used by jquery
  //really its just a Function.prototype.bind
  proxy = curry(function(fn,obj){
    //apply:: function -> context -> argArray -> result
    //apply(fn,obj) :: argArray -> result
    //arrayFunction :: ([arg] -> resultB) -> (arg1 -> .. -> argN -> resultB)
    return arrayFunction(apply(fn,obj));
  }),
  proxied = curry(function(obj,fnName){
    return proxy(obj[fnName],obj);
  }),
  
  //Extracts a method from a prototype, for auto-curry-able use, iirc
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
  
  //parses the arglist of fn, then, assumes any additional arguments 
  //beyond those originally specified should be stuffed into an array 
  //in place of the last argument.
  //USAGE: var myFn = splat(function(first,second,etc){...//etc === [3,4,5]...})(1,2,3,4,5);
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
  
  //Applies a a function("adapter") to each argument destined for the "target" but intercepted,
  //then takes those intermediate results as the arguments for the target
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
