"use strict";

const Majiang = {
  Shoupai: require('./shoupai')
};

module.exports = class He {

constructor() {
  // 河牌
  this._pai = [];
  // 花牌
  this._huapai = 0;
  // 计数器（和绝张用）
  this._count = {};
}

// 打牌（改变河牌、计数器）
dapai(p) {
  if (!Majiang.Shoupai.valid_pai(p)) throw new Error(p);
  if (p.match(/[\+\=\-]$/)) throw new Error(p);
  this._pai.push(p);

  let _p = p.substr(0, 2)
  if (this._count[_p]) { this._count[_p]++; }
  else { this._count[_p] = 0; }
  return this;
}

// 补花（改变河牌、计数器）
buhua(p) {
  if (!p.match(/^h[1-8]$/)) throw new Error(p);
  this._huapai += 1;

  let _p = p.substr(0, 2)
  if (this._count[_p]) { this._count[_p]++; }
  else { this._count[_p] = 0; }
  return this;
}

fulou(f) {
  this._pai[this._pai.length - 1] += f;
}

// 计数
count(p) {
  return this._count[p.substr(0, 2)];
}

}
