"use strict";

module.exports = class Shoupai {

/**
 * @param {array} qipai 起牌
 *
 * @return {Shoupai} 将起牌的内容反映到手里牌的手牌
 *
 * @example new Shoupai(['m3', 'm3', 'm4', 'p2', 'p5', 'p6', 'p6', 'p8', 'p8', 's3', 's5', 's7', 's8', 'm7'])
 */
constructor(qipai) {
  this._shouli = {
    m: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    s: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    z: [0, 0, 0, 0, 0, 0, 0, 0],
    h: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
  this._fulou = [];
  this._zimo = null;

  if (!qipai) return;

  for (let p of qipai) {
    let [s, n] = p;
    this._shouli[s][n]++;
  }
}

/**
 * @param {string} p 单张牌
 *
 * @return {bool} 格式是否合法
 *
 * @example Shoupai.valid_pai('m1-') -> 'm1-'
 * @example Shoupai.valid_pai('m1_*') -> undefined
 */
static valid_pai(p) {
  /**
   * mpszh: 花色
   * \d: 数字
   * _: 摸切
   * +, =, -: 被副露（下家，对家，上家）
   */
  if (p.match(/^(?:[mps]\d|z[1-7]|h[1-8])_?[\+\=\-]?$/)) return p;
}

/**
 * @param {string} m 面子
 *
 * @return {bool} 格式是否合法
 *
 * @example Shoupai.valid_mianzi('m312-') -> 'm12-3'
 * @example Shoupai.valid_mianzi('m135-') -> undefined
 */
static valid_mianzi(m) {
  let h = (m[0] == 'z') ? m.replace(/[089]/g,'') : m;
  if (h.match(/^[mpsz](\d)\1\1[\+\=\-]\1?$/)) {
    return m;
  } else if (h.match(/^[mpsz](\d)\1\1\1[\+\=\-]?$/)) {
    return m[0] + m.match(/\d(?![\+\=\-])/g).sort().reverse().join('')
                + (m.match(/\d[\+\=\-]$/)||[''])[0];
  } else if (h.match(/^[mps]\d+\-\d*$/)) {
    let nn = h.match(/\d/g).sort();
    if (nn.length != 3) return;
    if (+nn[0] + 1 != +nn[1] || +nn[1] + 1 != +nn[2]) return;
    return h[0] + h.match(/\d[\+\=\-]?/g).sort().join('');
  }
}

/**
 * @param {string} paistr 手牌字符串
 *
 * @return {Shoupai} 包含所有信息的手牌（手里，副露，自摸牌）
 *
 * @example new Shoupai().fromString('m234p68s33p7,m5555,p555-');
 */
static fromString(paistr) {
  paistr = paistr || '';
  let qipai = [];
  let fulou = paistr.split(',');
  let shouli = fulou.shift();

  for (let suitstr of shouli.match(/[mpszh]\d+/g) || []) {
    let s = suitstr[0];
    for (let n of suitstr.match(/\d/g)) {
      if (s == 'z' && (n < 1 || 7 < n)) continue;
      if (s == 'h' && (n < 1 || 8 < n)) continue;
      qipai.push(s+n);
    }
  }
  while (qipai.length > 14 - fulou.filter(x => x).length * 3) { qipai.pop() };
  let zimo = (qipai.length - 2) % 3 == 0 && qipai.slice(-1)[0];
  const shoupai = new Shoupai(qipai);

  let last;
  for (let m of fulou) {
    if (!m) { shoupai._zimo = last; break }
    m = Shoupai.valid_mianzi(m);
    if (m) {
      shoupai._fulou.push(m);
      shoupai._zimo = null;
      last = m;
    }
  }

  shoupai._zimo = shoupai._zimo || zimo || null;
  return shoupai;
}

/**
 * @return {string} 手牌字符串
 *
 * @example new Shoupai(['m3', 'm3', 'm4', 'p2', 'p5', 'p6', 'p6', 'p8', 'p8', 's3',
                         's5', 's7', 's8', 'm7']).toString() -> 'm234p68s33p7,m5555,p555-'
 */
toString() {
  let paistr = '';

  for (let s of ['m', 'p', 's', 'z', 'h']) {
    let suitstr = s;
    let shouli = this._shouli[s];
    for (let n = 1; n < shouli.length; n++) {
      let n_pai = shouli[n];
      if (this._zimo && s + n == this._zimo) n_pai--;
      for (let i = 0; i < n_pai; i++) { suitstr += n; }
    }
    if (suitstr.length > 1) paistr += suitstr;
  }
  if (this._zimo && this._zimo.length == 2) paistr += this._zimo;

  for (let m of this._fulou) {
    paistr += ',' + m;
  }
  if (this._zimo && this._zimo.length > 2) paistr += ',';

  return paistr;
}

// 复制手牌（_shouli, _fulou, _zimo）
clone() {
  const shoupai = new Shoupai();

  shoupai._shouli = {
    m: this._shouli.m.concat(),
    p: this._shouli.p.concat(),
    s: this._shouli.s.concat(),
    z: this._shouli.z.concat(),
    h: this._shouli.h.concat(),
  };
  shoupai._fulou = this._fulou.concat();
  shoupai._zimo = this._zimo;

  return shoupai;
}

// 摸牌（手牌加 1 并设置 _zimo）
// TODO: name -> mopai
zimo(p) {
  if (!Shoupai.valid_pai(p)) throw new Error(p);
  if (this._zimo) throw new Error([this, p]);

  let [s, n] = p;
  let shouli = this._shouli[s];
  if (shouli[n] == 4) throw new Error([this, p]);

  // 开局补花时不设置 _zimo
  if (this.shouliPaishu() != 12) this._zimo = p.substr(0,  2);
  shouli[n]++;
  return this;
}

// 打牌（手牌减 1 并清除 _zimo）
dapai(p) {
  if (!Shoupai.valid_pai(p)) throw new Error(p);
  if (!this._zimo) throw new Error([this, p]);

  let [s, n] = p;
  let shouli = this._shouli[s];
  if (shouli[n] == 0) throw new Error([this, p]);

  shouli[n]--;
  this._zimo = null;
  return this;
}

// 补花（手牌减 1 并清除 _zimo）
buhua(p) {
  if (!Shoupai.valid_pai(p)) throw new Error(p);

  let [s, n] = p;
  let shouli = this._shouli[s];
  if (shouli[n] == 0) throw new Error([this, p]);

  shouli[n]--;
  this._zimo = null;
  return this;
}

// 副露（手牌减去副露牌并设置 _zimo。包括大明杠）
fulou(m) {
  if (m != Shoupai.valid_mianzi(m)) throw new Error(m);
  if (this._zimo) throw new Error([this, m]);

  let [s] = m;
  let shouli = this._shouli[s];
  for (let n of m.match(/\d(?![\+\=\-])/g)) {
    if (shouli[n] == 0) throw new Error([this, m]);

    shouli[n]--;
  }
  this._fulou.push(m);
  if (!m.match(/\d{4}/)) this._zimo = m;
  return this;
}

// 杠（手牌减 1(加杠) 或 3(暗杠) 并清除 _zimo）
gang(p) {
  if (!Shoupai.valid_pai(p)) throw new Error(p);
  if (!this._zimo || this._zimo.length != 2) throw new Error([this, p]);

  let [s, n] = p;
  let shouli = this._shouli[s];
  if (shouli[n] > 3) {
    // 暗杠
    let m = s + n + n + n + n;
    shouli[n] -= 4;
    this._fulou.push(m);
  } else {
    // 加杠
    if (shouli[n] == 0) throw new Error([this, p]);

    const regexp = new RegExp(`^${s}${n}{3}`);
    let i = this._fulou.findIndex(m => m.match(regexp));
    if (i < 0) throw new Error([this, p]);

    this._fulou[i] += n;
    shouli[n]--;
  }
  this._zimo = null;
  return this;
}

// 打牌候选（手牌数 > 0 的牌）
get_dapai() {
  if (!this._zimo) throw new Error([this, p]);

  let pai = [];
  for (let s of ['m', 'p', 's', 'z']) {
    let shouli = this._shouli[s];
    for (let n = 1; n < shouli.length; n++) {
      if (shouli[n] == 0) continue;
      pai.push(s + n);
    }
  }
  return pai;
}

/**
 * @param {string} p 他家舍牌
 *
 * @return {array} 吃牌面子候选
 *
 * @example new Shoupai().fromString('m123456789p33s23').get_chi_mianzi('m5-') -> ["m345-", "m45-6", "m5-67"]
 */
get_chi_mianzi(p) {
  if (!Shoupai.valid_pai(p)) throw new Error(p);
  if (this._zimo) throw new Error([this, p]);

  let mianzi = [];

  // 不能吃自己的打牌
  let [s, n, d] = p.replace(/[\_]/g,''); n = +n;
  if (!d) throw new Error([this, p]);
  // 不能吃字牌，只能吃上家
  if (s == 'z' || d != '-') return mianzi;

  let shouli = this._shouli[s];
  let [p0, p1, p2] = [p[1]];

  // n-2, n-1 吃 n
  if (3 <= n && shouli[n - 2] > 0 && shouli[n - 1] > 0) {
    p1 = n - 2;
    p2 = n - 1;
    mianzi.push(s + p1 + p2 + (p0 + d));
  }
  // n-1, n+1 吃 n
  if (2 <= n && n <= 8 && shouli[n - 1] > 0 && shouli[n + 1] > 0) {
    p1 = n - 1;
    p2 = n + 1;
     mianzi.push(s + p1 + (p0 + d) + p2);
  }
  // n+1, n+2 吃 n
  if (n <= 7 && shouli[n+1] > 0 && shouli[n+2] > 0) {
    p1 = n + 1;
    p2 = n + 2;
    mianzi.push(s + (p0 + d) + p1 + p2);
  }
  return mianzi;
}

/**
 * @param {string} p 他家舍牌
 *
 * @return {array} 碰牌面子候选
 *
 * @example new Shoupai().fromString('m123456789p33s23').get_peng_mianzi('p3=') -> ["p333="]
 */
get_peng_mianzi(p) {
  if (!Shoupai.valid_pai(p)) throw new Error(p);
  if (this._zimo) throw new Error([this, p]);

  let mianzi = [];

  // 不能碰自己的打牌
  let [s, n, d] = p.replace(/[\_]/g,'');
  if (!d) throw new Error([this, p]);

  let shouli = this._shouli[s];
  let [p0, p1, p2] = [p[1]];

  if (shouli[n] >= 2) {
    mianzi = [ s + n + n + (p0 + d) ];
  }

  return mianzi;
}

/**
 * @param {string} p 他家舍牌。null 为暗杠或加杠
 *
 * @return {array} 杠牌面子候选
 *
 * @example new Shoupai().fromString('m123456789p333s3').get_gang_mianzi('p3=') -> ["p3333="]
 * @example new Shoupai().fromString('m123459999p3s3,p333=').get_gang_mianzi() -> ["m9999", "p333=3"]
 */
get_gang_mianzi(p) {
  let mianzi = [];

  if (p) {
    // 大明杠
    if (!Shoupai.valid_pai(p)) throw new Error(p);
    if (this._zimo) throw new Error([this, p]);

    // 不能杠自己的打牌
    let [s, n, d] = p.replace(/[\_]/g,'');
    if (!d) throw new Error([this, p]);

    let shouli = this._shouli[s];
    let [p0, p1, p2, p3] = [p[1]];

    if (shouli[n] == 3) {
      mianzi = [ s + n + n + n + (p0 + d) ];
    }
  } else {
    if (!this._zimo) throw new Error([this, p]);
    if (this._zimo.length != 2) throw new Error([this, p]);

    for (let s of ['m', 'p', 's', 'z']) {
      let shouli = this._shouli[s];
      for (let n = 1; n < shouli.length; n++) {
        if (shouli[n] == 0) continue;
        if (shouli[n] == 4) {
          // 暗杠
          mianzi.push(s + n + n +n + n)
        }
        else {
          // 加杠
          for (let m of this._fulou) {
            if (m.substr(0, 4) == s + n + n + n) {
              mianzi.push(m + n);
            }
          }
        }
      }
    }
  }

  return mianzi;
}

shouliPaishu() {
  let paishu = 0;
  for (let s of ['m', 'p', 's', 'z', 'h']) {
    paishu += this._shouli[s].reduce(function(acc, val) { return acc + val; }, 0);
  }

  return paishu;
}

}
