"use strict";

const $ = require('jquery');
const Majiang = { View: { pai: require('./pai') } };

module.exports = class Shoupai {

constructor(root, shoupai, open) {
  this._node = {
    shouli: $('.shouli', root),
    fulou: $('.fulou', root)
  }
  this._shoupai = shoupai;
  this._open = open;
}

redraw(open) {
  if (open != null) this._open = open;

  this._node.shouli.empty();
  let zimo = this._shoupai._zimo;
  for (let s of ['m', 'p', 's', 'z', 'h']) {
    let shouli = this._shoupai._shouli[s];
    for (let n = 1; n < shouli.length; n++) {
      let n_pai = shouli[n];
      if (s + n == this._shoupai._zimo) n_pai--;
      for (let i = 0; i < n_pai; i++) {
        let p = s;
        this._node.shouli.append(Majiang.View.pai(this._open ? s + n : '_'));
      }
    }
  }
  if (zimo && zimo.length == 2) {
    this._node.shouli
      .append($('<span class="zimo">')
            .append(Majiang.View.pai(this._open ? zimo : '_')));
  }

  this._node.fulou.empty();
  for (let m of this._shoupai._fulou) {
    let mianzi = $('<span class="mianzi">');
    let [s] = m;
    if (m.match(/^[mpsz](\d)\1\1\1$/)) {
      let nn = m.match(/\d/g);
      mianzi.append(Majiang.View.pai('_'))
          .append(Majiang.View.pai('_'))
          .append(Majiang.View.pai('_'));
      this._open ? mianzi.append(Majiang.View.pai(m[0] + m[1])) : mianzi.append(Majiang.View.pai('_'));
    }
    else if (m.match(/^[mpsz](\d)\1\1\1?[\+\=\-]\1?$/)) {
      let jiagang = m.match(/[\+\=\-]\d$/);
      let d = m.match(/[\+\=\-]/)[0];
      let pai = m.match(/\d/g).map(n => Majiang.View.pai(s+n));
      let pai_r = $('<span class="rotate">')
              .append(jiagang ? [ pai[2], pai[3] ]
                      : pai[pai.length - 1]);
      let pai_l = (!jiagang && pai.length == 4)
                ? [ pai[1], pai[2] ] : pai[1];
      if (d == '+') mianzi.append(pai[0]).append(pai_l).append(pai_r);
      if (d == '=') mianzi.append(pai[0]).append(pai_r).append(pai_l);
      if (d == '-') mianzi.append(pai_r).append(pai[0]).append(pai_l);
    }
    else {
      let nn = m.match(/\d(?=\-)/).concat(m.match(/\d(?!\-)/g));
      mianzi.append($('<span class="rotate">')
              .append(Majiang.View.pai(s + nn[0])))
              .append(Majiang.View.pai(s + nn[1]))
              .append(Majiang.View.pai(s + nn[2]));
        }
    this._node.fulou.append(mianzi);
  }

  return this;
}

dapai(p) {
  let dapai = $('.pai.dapai', this._node.shouli);
  if (!dapai.length) {
    if (p[2] == '_') dapai = $('.zimo .pai', this._node.shouli);
  }
  if (!dapai.length) {
    if (this._open) {
      p = p.substr(0, 2);
      dapai = $(`.pai[data-pai="${p}"]`, this._node.shouli).eq(0);
    } else {
      dapai = $('.pai', this._node.shouli);
      dapai = dapai.eq(Math.floor(Math.random() * (dapai.length - 1)));
    }
  }
  dapai.addClass('deleted');

  return this;
}

buhua(p) {
  p = p.substr(0, 2);
  let buhua = $(`.pai[data-pai="${p}"]`, this._node.shouli).eq(0);
  buhua.addClass('deleted');

  return this;
}

}
