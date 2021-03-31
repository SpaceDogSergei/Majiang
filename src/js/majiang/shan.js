"use strict";

const Majiang = {
  Shoupai: require('./shoupai')
};

module.exports = class Shan {

constructor(pai) {
  if (pai) {
    // 牌山
    this._pai = pai;
  } else {
    let pai = [];
    for (let s of ['m', 'p', 's', 'z', 'h']) {
      let n0 = 9;
      if (s == 'z') n0 = 7;
      else if (s == 'h') n0 = 8;

      for (let n = 1; n <= n0; n++) {
        for (let i = 0; i < 4; i++) {
          pai.push(s+n);
        }
      }
    }
    // 牌山
    this._pai = [];
    while (pai.length > 0) {
      var r = Math.floor(Math.random() * pai.length);
      var p = pai[r];
      pai.splice(r, 1);
      this._pai.push(p);
    }
  }
  // 是否处于开杠（摸牌）后的瞬间
  this._isKaigang = false;
}

// 剩余牌数
paishu() {
  return this._pai.length;
}

// 删除并返回最后一张牌作为自摸牌
zimo() {
  if (this.paishu() == 0) throw new Error(this);
  if (this._isKaigang) throw new Error(this);
  return this._pai.pop();
}

// 删除并返回第一张牌作为岭上牌
buhua() {
  if (this.paishu() == 0) throw new Error(this);
  return this._pai.shift();
}

// 删除并返回第一张牌作为岭上牌，同时改变开杠状态
gangzimo() {
  if (this.paishu() == 0) throw new Error(this);
  if (this._isKaigang) throw new Error(this);
  this._isKaigang = true;
  return this._pai.shift();
}

// 改变开杠状态
kaigang() {
  if (!this._isKaigang) throw new Error(this);
  this._isKaigang = false;
}

}
