
require('must');
require('../apply').mport(function(proxy,proxied,compose2,reverseArguments,antitype,apply,splat,chew,compose,head,rest){
require('owski-primitives').mport(function(add,multiply,I){
require('owski-curry').mport(function(curry){

  describe('Apply',function(){
    var create = function(p,o){
      var Blank = function(){};
      Blank.prototype = p;
      var b = new Blank();
      for(var i in o){
        if(o.hasOwnProperty(i)){
          b[i] = o[i];
        }
      }
      return b;
    };
    it('compose2: should compose 2 functions',function(){
      compose2(add(1),add(2))(3).must.equal(6);
    });
    it('compose: should compose all functions',function(){
      compose(add(1))(2).must.equal(3);
      compose(add(1),add(2))(3).must.equal(6);
      compose(add(1),add(2),add(3),add(4))(5).must.equal(15);
    });
    it('reverseArguments: should alter a fn to reverse args input',function(){
      reverseArguments(add)('a','b')
      .must
      .equal('ba');
    });
    it('antitype: should make an fn monkey patchable',function(){
      var
      a = curry(function(num,value){
        return value + num;
      }),
      b = create({
        c: 6,
        d: antitype(a,'c')
      },{});
      b.d(5).c.must.equal(11);
    });
    it('antitype: should work without arguments',function(){
      var
      a = function(c){
        return c + 5;
      },
      b = create({
        c: 6,
        d: antitype(a,'c')
      },{
        e:8
      }),
      z;
      b.d().c.must.equal(11);
    });
    it('antitype: should work for both chaining, and curry-composing',function(){
      var
      a = curry(function(stored){
        return stored;
      }),
      b = curry(function(first,stored){
        return stored + first;
      }),
      c = curry(function(first,second,stored){
        return stored + first + second;
      }),
      obj = create({
        d: antitype(a,'value'),
        e: antitype(b,'value'),
        f: antitype(c,'value'),
      },{
        value: '0',
      });
      obj
        .d()
        .e('1')
        .f('2','3')
        .value
        .must.equal('0123');
    });
    it('apply: should not require arguments',function(){
      var
      partialAdd = add('56'),
      applied = apply(partialAdd,this,[]),
      applied2 = apply(partialAdd,this)(),
      z;
      applied.must.equal('56undefined');
      applied2.must.equal('56undefined');
    });
    it('splat: stuffs remaining args into array',function(){
      var
      sum = function(nums){
        var acc = 0;
        for(var i in nums){
          acc = acc + nums[i];
        }
        return acc;
      },
      fn = splat(function(a,b,c,stuff){
        return a + b + c + sum(stuff);
      });
      fn(1,2,3,4,5,6,7).must.equal(28);
    });
    it('chew: should preprocess arguments',function(){
      var linear = chew(add,[multiply(2),I]);
      linear(3,4).must.equal(10);
    });
    it('proxy: binds a fn to a context',function(){
      var a = function(c){
        return this.b + c;
      },
      d = proxy(a,{b:'b'});
      d('c').must.equal('bc');
      d.apply({c:'wtf'},['c']).must.equal('bc');
    });
    it('proxied: returns an fn already proxied',function(){
      var a = {
        d: 'd',
        b: function(c){
          return this.d + c;
        }
      },
      e = proxied(a,'b');
      e('c').must.equal('dc');
    });
    it('head should work',function(){
      head([1,2,3,4]).must.eql(1);
    });
    it('rest should work',function(){
      rest([1,2,3,4]).must.eql([2,3,4]);
    });
  });
});});});
