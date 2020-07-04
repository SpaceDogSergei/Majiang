"use strict";

const Majiang = {
  Util: require('../util'),
};

/**
 * @param {string} s 数牌花色。m, p, s
 * @param {array} shouli 花色s的手里牌
 * @param {number} n 回溯法位置
 *
 * @return {array[array]} 所有可能的面子组合
 *
 * @example mianzi('m', [0, 3, 4, 4, 1, 0, 0, 0, 0, 0]) -> [["m123", "m123", "m123", "m234"], ["m111", "m234", "m222", "m333"], ["m111", "m222", "m234", "m333"]]
 */
function mianzi(s, shouli, n = 1) {
  if (n > 9) return [[]];

  if (shouli[n] == 0) return mianzi(s, shouli, n+1);

  let shunzi = [];
  if (n <= 7 && shouli[n] > 0 && shouli[n+1] > 0 && shouli[n+2] > 0) {
    shouli[n]--; shouli[n+1]--; shouli[n+2]--;
    shunzi = mianzi(s, shouli, n);
    shouli[n]++; shouli[n+1]++; shouli[n+2]++;
    for (let s_mianzi of shunzi) {
      s_mianzi.unshift(s+(n)+(n+1)+(n+2));
    }
  }

  let kezi = [];
  if (shouli[n] >= 3) {
    shouli[n] -= 3;
    kezi = mianzi(s, shouli, n);
    shouli[n] += 3;
    for (let k_mianzi of kezi) {
      k_mianzi.unshift(s+n+n+n);
    }
  }

  return shunzi.concat(kezi);
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 *
 * @return {array[array]} 所有可能的面子组合
 *
 * @example mianzi_all(Majiang.Shoupai.fromString('m111222333p123')) -> [["m123", "m123", "m123", "p123"], ["m111", "m222", "m333", "p123"]]
 */
function mianzi_all(shoupai) {
  let shupai_all = [[]];
  for (let s of ['m', 'p', 's']) {
    let new_mianzi = [];
    for (let mm of shupai_all) {
      for (let nn of mianzi(s, shoupai._shouli[s])) {
        new_mianzi.push(mm.concat(nn));
      }
    }
    shupai_all = new_mianzi;
  }

  let zipai = [];
  for (let n = 1; n <= 7; n++) {
    if (shoupai._shouli.z[n] == 0) continue;
    if (shoupai._shouli.z[n] != 3) return [];
    zipai.push('z'+n+n+n);
  }

  let fulou = shoupai._fulou;

  return shupai_all.map(shupai => shupai.concat(zipai).concat(fulou));
}

/**
 * @param {array} mian 所有面子
 * @param {string} p 和了牌（包括点炮信息）
 *
 * @return {array} 加入了和了牌信息的面子组合
 *
 * @example add_hulepai(["m123", "m123", "m123", "p123"], 'm1-') -> [["m1-!23", "m123", "m123", "p123"]]
 */
function add_hulepai(mianzi, p) {
  let [s, n, d] = p;
  let regexp = new RegExp(`^(${s}.*${n})`);
  let replacer = `$1${d}!`;

  let new_mianzi = [];

  for (let i = 0; i < mianzi.length; i++) {
    // 不考虑副露面子
    if (mianzi[i].match(/[\+\=\-]/)) continue;
    // 不考虑重复面子
    if (i > 0 && mianzi[i] == mianzi[i-1]) continue;
    let m = mianzi[i].replace(regexp, replacer);
    if (m == mianzi[i]) continue;
    let tmp_mianzi = mianzi.concat();
    tmp_mianzi[i] = m;
    new_mianzi.push(tmp_mianzi);
  }

  return new_mianzi;
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 * @param {string} hulepai 和了牌（包括点炮信息）
 *
 * @return {array[array]} 一般和牌形所有可能的分割（包括将牌）
 *
 * @example hule_mianzi_yiban(Majiang.Shoupai.fromString('m111222333p123s11'), 'm1-') -> [["s11", "m1-!23", "m123", "m123", "p123"], ["s11", "m111-!", "m222", "m333", "p123"]]
 */
function hule_mianzi_yiban(shoupai, hulepai) {
  let mianzi = [];

  for (let s of ['m', 'p', 's', 'z']) {
    let shouli = shoupai._shouli[s];
    for (let n = 1; n < shouli.length; n++) {
      if (shouli[n] < 2) continue;
      shouli[n] -= 2;
      let jiangpai = s+n+n;
      for (let mm of mianzi_all(shoupai)) {
        mm.unshift(jiangpai);
        if (mm.length != 5) continue;
        mianzi = mianzi.concat(add_hulepai(mm, hulepai));
      }
      shouli[n] += 2;
    }
  }

  return mianzi;
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 * @param {string} hulepai 和了牌（包括点炮信息）
 *
 * @return {array[array]} 七对和牌形的分割
 *
 * @example hule_mianzi_qidui(Majiang.Shoupai.fromString('m111122223333s11'), 'm1-') -> [["m11-!", "m11", "m22", "m22", "m33", "m33", "s11"]]
 */
function hule_mianzi_qidui(shoupai, hulepai) {
  if (shoupai._fulou.length > 0) return [];

  let mianzi = [];

  for (let s of ['m', 'p', 's', 'z']) {
    let shouli = shoupai._shouli[s];
    for (let n = 1; n < shouli.length; n++) {
      if (shouli[n] == 0) continue;
      if (shouli[n] == 2 || shouli[n] == 4) {
        let m = (s+n == hulepai.substr(0,2))
              ? s+n+n + hulepai[2] + '!'
              : s+n+n;
        mianzi.push(m);
        if (shouli[n] == 4) { mianzi.push(s+n+n); }
      }
      else return [];
    }
  }

  return (mianzi.length == 7) ? [ mianzi ] : [];
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 * @param {string} hulepai 和了牌（包括点炮信息）
 *
 * @return {array[array]} 十三幺和牌形的分割
 *
 * @example hule_mianzi_shisanyao(Majiang.Shoupai.fromString('m19p19s19z11234567'), 'z3-') -> [["z11", "m1", "m9", "p1", "p9", "s1", "s9", "z2", "z3-!", "z4", "z5", "z6", "z7"]]
 */
function hule_mianzi_shisanyao(shoupai, hulepai) {
  if (shoupai._fulou.length > 0) return [];

  let mianzi = [];
  let n_duizi = 0;

  for (let s of ['m', 'p', 's', 'z']) {
    let shouli = shoupai._shouli[s];
    let nn = (s == 'z') ? [1,2,3,4,5,6,7] : [1,9];
    for (let n of nn) {
      if (shouli[n] == 2) {
        let m = (s+n == hulepai.substr(0,2))
              ? s+n+n + hulepai[2] + '!'
              : s+n+n;
        mianzi.unshift(m);
        n_duizi++;
      }
      else if (shouli[n] == 1) {
        let m = (s+n == hulepai.substr(0,2))
              ? s+n + hulepai[2] + '!'
              : s+n;
        mianzi.push(m);
      }
      else return [];
    }
  }

  return (n_duizi == 1) ? [ mianzi ] : [];
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 * @param {string} hulepai 和了牌（包括点炮信息）
 *
 * @return {array[array]} 不靠和牌形的分割
 *
 * @example hule_mianzi_bukao(Majiang.Shoupai.fromString('m39p147s258z123456'), 'z5-') -> [["p1", "p4", "p7", "s2", "s5", "s8", "m3", "m9", "z1", "z2", "z3", "z4", "z5-!", "z6"]]
 */
function hule_mianzi_bukao(shoupai, hulepai) {
  if (shoupai._fulou.length > 0) return [];

  let zipai = [];

  for (let n = 1; n <= 7; n++) {
    let shouli = shoupai._shouli.z;
    if (shouli[n] == 0) continue;

    if (shouli[n] == 1) {
      let m = ('z'+n == hulepai.substr(0,2))
            ? 'z'+n + hulepai[2] + '!'
            : 'z'+n;
      zipai.push(m);
    }
    else return [];
  }

  for (let s_ of ['mps', 'msp', 'pms', 'psm', 'smp', 'spm']) {
    let shupai = [];
    for (let n = 1; n <= 3; n++) {
      let s = s_[n - 1];
      let shouli = shoupai._shouli[s];
      for (let nn of [n, n + 3, n + 6]) {
        if (shouli[nn] == 0) continue;

        if (shouli[nn] == 1) {
          let m = (s+nn == hulepai.substr(0,2))
                ? s+nn + hulepai[2] + '!'
                : s+nn;
          shupai.push(m);
        }
        else return [];
      }
    }
    if (zipai.concat(shupai).length == 14) return [ zipai.concat(shupai) ];
  }

  return [];
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 * @param {string} hulepai 和了牌（包括点炮信息）
 *
 * @return {array[array]} 组合龙和牌形的分割（不含不靠）
 *
 * @example hule_mianzi_zuhelong(Majiang.Shoupai.fromString('m147p258s369m11123'), 'm1-') -> [["m1-!", "m4", "m7", "p2", "p5", "p8", "s3", "s6", "s9", "m11", "m123"]]
 */
function hule_mianzi_zuhelong(shoupai, hulepai) {
  let mianzi_zuhelong = [];
  let hulepai_zuhelong = false;

  loop1:
  for (let s_ of ['mps', 'msp', 'pms', 'psm', 'smp', 'spm']) {
    mianzi_zuhelong = [];
    for (let n = 1; n <= 3; n++) {
      let s = s_[n - 1];
      let shouli = shoupai._shouli[s];
      for (let nn of [n, n + 3, n + 6]) {
        if (shouli[nn] == 0) continue loop1;

        let m = s+nn;
        if (s+nn == hulepai.substr(0,2)) {
          hulepai_zuhelong = true;
          m += hulepai[2] + '!';
        }
        mianzi_zuhelong.push(m);
      }
    }
    if (mianzi_zuhelong.length == 9) break;
  }

  if (mianzi_zuhelong.length != 9) return [];

  for (let m of mianzi_zuhelong) {
    shoupai._shouli[m[0]][m[1]]--;
  }

  let mianzi = [];

  loop2:
  for (let s of ['m', 'p', 's', 'z']) {
    let shouli = shoupai._shouli[s];
    for (let n = 1; n < shouli.length; n++) {
      if (shouli[n] < 2) continue;

      shouli[n] -= 2;
      mianzi = [];
      let jiangpai = s+n+n;
      for (let mm of mianzi_all(shoupai)) {
        mm.unshift(jiangpai);
        if (mm.length != 2) continue;

        if (!hulepai_zuhelong) mianzi = mianzi.concat(add_hulepai(mm, hulepai)[0]);
        else mianzi = mianzi.concat(mm);

        for (let m of mianzi_zuhelong) {
          shoupai._shouli[m[0]][m[1]]++;
        }

        shouli[n] += 2;
        return [ mianzi_zuhelong.concat(mianzi) ];
      }
      shouli[n] += 2;
    }
  }

  for (let m of mianzi_zuhelong) {
    shoupai._shouli[m[0]][m[1]]++;
  }
  return [];
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 * @param {string} hulepai 和了牌（包括点炮信息）
 *
 * @return {array[array]} 九莲宝灯和牌形的分割
 *
 * @example hule_mianzi_jiulian(Majiang.Shoupai.fromString('m1112345678999m1'), 'm1-') -> [["m1112345678999m1-!"]]
 */
function hule_mianzi_jiulian(shoupai, hulepai) {
  if (shoupai._fulou.length > 0) return [];

  let s = hulepai[0];
  if (s == 'z') return [];

  let mianzi = s;
  let shouli = shoupai._shouli[s];
  for (let n = 1; n <= 9; n++) {
    if ((n == 1 || n == 9) && shouli[n] < 3) return [];
    if (shouli[n] == 0) return [];
    let n_pai = (n == hulepai[1]) ? shouli[n] - 1 : shouli[n];
    for (let i = 0; i < n_pai; i++) {
      mianzi += n;
    }
  }
  if (mianzi.length != 14) return [];
  if (!mianzi.match(/^[mps]1112345678999/)) return [];

  mianzi += hulepai + '!';

  return [ [mianzi] ];
}

/**
 * @param {Majiang.Shoupai} shoupai 手牌
 * @param {string} chongpai 铳牌（包括点炮信息）
 *
 * @return {array[array]} 所有和牌形的分割
 *
 * @example hule_mianzi(Majiang.Shoupai.fromString('m112233p99s77889s9'), 's9-') -> [["p99", "m123", "m123", "s789-!", "s789"], ["m11", "m22", "m33", "p99", "s77", "s88", "s99-!"]]
 */
function hule_mianzi(shoupai, chongpai) {
  if (!shoupai._zimo || shoupai._zimo.length > 2) return [];

  let hulepai = chongpai || shoupai._zimo + '_';

  return [].concat(hule_mianzi_yiban(shoupai, hulepai))
       .concat(hule_mianzi_qidui(shoupai, hulepai))
       .concat(hule_mianzi_zuhelong(shoupai, hulepai))
       .concat(hule_mianzi_shisanyao(shoupai, hulepai))
       .concat(hule_mianzi_bukao(shoupai, hulepai))
       .concat(hule_mianzi_jiulian(shoupai, hulepai));
}

function get_hudi(mianzi) {
  const danzhang = /^[mpsz]\d[\+\=\-\_]?\!?$/;
  const duizi = /^[mpsz](\d)\1[\+\=\-\_]?\!?$/;
  const kezi = /^[mpsz](\d)\1\1.*$/;
  const ankezi = /^[mpsz](\d)\1\1(?:\1|_\!)?$/;
  const gangzi = /^[mpsz](\d)\1\1.*\1.*$/;
  const angangzi = /^[mpsz](\d)\1\1\1$/;

  let hudi = {
    menqian:  true,
    zimo:     true,
    danzhang:   { m: [0,0,0,0,0,0,0,0,0,0],
            p: [0,0,0,0,0,0,0,0,0,0],
            s: [0,0,0,0,0,0,0,0,0,0],
            z: [0,0,0,0,0,0,0,0]    },
    duizi:    { m: [0,0,0,0,0,0,0,0,0,0],
            p: [0,0,0,0,0,0,0,0,0,0],
            s: [0,0,0,0,0,0,0,0,0,0],
            z: [0,0,0,0,0,0,0,0]    },
    shunzi:   { m: [0,0,0,0,0,0,0,0],
            p: [0,0,0,0,0,0,0,0],
            s: [0,0,0,0,0,0,0,0]  },
    kezi:     { m: [0,0,0,0,0,0,0,0,0,0],
            p: [0,0,0,0,0,0,0,0,0,0],
            s: [0,0,0,0,0,0,0,0,0,0],
            z: [0,0,0,0,0,0,0,0]    },
    n_danzhang: 0,
    n_duizi:  0,
    n_shunzi:   0,
    n_kezi:   0,
    n_anke:   0,
    n_gang:   0,
    n_angang:   0,
  };

  for (let m of mianzi) {
    if (m.match(/[\+\=\-]\!/))    hudi.zimo = false;
    if (m.match(/[\+\=\-](?!\!)/))  hudi.menqian = false;

    // 九莲宝灯
    if (mianzi.length == 1) continue;

    // 十三幺
    if (mianzi.length == 13) continue;

    // 不靠
    if (mianzi.length == 14) continue;

    if (m.match(danzhang)) {
      hudi.n_danzhang++;
      hudi.danzhang[m[0]][m[1]]++;
    }
    else if (m.match(duizi)) {
      hudi.n_duizi++;
      hudi.duizi[m[0]][m[1]]++;
    }
    else if (m.match(kezi)) {
      hudi.n_kezi++;
      let fu = 2;
      if (m.match(ankezi)) { hudi.n_anke++; }
      if (m.match(gangzi)) { hudi.n_gang++; }
      if (m.match(angangzi)) { hudi.n_angang++; }
      hudi.kezi[m[0]][m[1]]++;
    }
    else {
      hudi.n_shunzi++;
      hudi.shunzi[m[0]][m[1]]++;
    }
  }

  return hudi;
}

function get_fanzhong(mianzi, hudi, tingpai, param) {
  function dasixi() {
    const kezi = hudi.kezi;
    if (kezi.z[1] + kezi.z[2] + kezi.z[3] + kezi.z[4] == 4) return 1;
    return 0;
  }
  function dasanyuan() {
    const kezi = hudi.kezi;
    if (kezi.z[5] + kezi.z[6] + kezi.z[7] == 3) return 1;
    return 0;
  }
  function shisanyao() {
    if (mianzi.length == 13) return 1;
    return 0;
  }
  function lvyise() {
    if (mianzi.filter(m => m.match(/^[mp]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z[^6]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^s.*[1579]/)).length > 0) return 0;
    return 1;
  }
  // 九莲宝灯在后面特殊处理
  function jiulianbaodeng() {
    // if (mianzi[0].match(/^[mpsz]1112345678999/)) return 1;
    return 0;
  }
  function lianqidui() {
    const duizi = hudi.duizi;
    if (hudi.n_duizi != 7) return 0;
    for (let s of ['m', 'p', 's']) {
      if (duizi[s][3] && duizi[s][4] && duizi[s][5] && duizi[s][6] && duizi[s][7] && ((duizi[s][1] && duizi[s][2]) || (duizi[s][2] && duizi[s][8]) || (duizi[s][8] && duizi[s][9]))) return 1;
    }
    return 0;
  }
  function sigang() {
    if (hudi.n_gang == 4) return 1;
    return 0;
  }
  function xiaosixi() {
    const kezi = hudi.kezi;
    if (kezi.z[1] + kezi.z[2] + kezi.z[3] + kezi.z[4] == 3 && mianzi[0].match(/^z[1234]/)) return 1;
    return 0;
  }
  function xiaosanyuan() {
    const kezi = hudi.kezi;
    if (kezi.z[5] + kezi.z[6] + kezi.z[7] == 2 && mianzi[0].match(/^z[567]/)) return 1;
    return 0;
  }
  function ziyise() {
    const zipai = /^z/;
    if (mianzi.filter(m => m.match(zipai)).length == mianzi.length) return 1;
    return 0;
  }
  function yiseshuanglonghui() {
    const shunzi = hudi.shunzi;
    const duizi = hudi.duizi;
    for (let s of ['m', 'p', 's']) {
      if (shunzi[s][1] == 2 && shunzi[s][7] == 2 && duizi[s][5] == 1) return 1;
    }
    return 0;
  }
  function qingyaojiu() {
    const laotoupai = /^[mps]([19])\1\1*.*$/;
    if (mianzi.filter(m => m.match(laotoupai)).length == mianzi.length) return 1;
    return 0;
  }
  function sianke() {
    if (hudi.n_anke == 4) return 1;
    return 0;
  }
  function yisesitongshun() {
    const shunzi = hudi.shunzi;
    for (let s of ['m', 'p', 's']) {
      for (let n = 1; n <= 7; n++) {
        if (shunzi[s][n] == 4) return 1;
      }
    }
    return 0;
  }
  function yisesijiegao() {
    const kezi = hudi.kezi;
    for (let s of ['m', 'p', 's']) {
      for (let n = 1; n <= 6; n++) {
        if (kezi[s][n] && kezi[s][n + 1] && kezi[s][n + 2] && kezi[s][n + 3]) return 1;
      }
    }
    return 0;
  }
  function yisesibugao() {
    const shunzi = hudi.shunzi;
    for (let s of ['m', 'p', 's']) {
      if (shunzi[s][1] && shunzi[s][3] && shunzi[s][5] && shunzi[s][7]) return 1;
      for (let n = 1; n <= 4; n++) {
        if (shunzi[s][n] && shunzi[s][n + 1] && shunzi[s][n + 2] && shunzi[s][n + 3]) return 1;
      }
    }
    return 0;
  }
  function hunyaojiu() {
    const laotoupai_kezi = /^[mps]([19])\1\1*.*$/;
    const zipai_kezi = /^z([1-7])\1\1*.*$/;
    if (mianzi.filter(m => m.match(laotoupai_kezi) || m.match(zipai_kezi)).length == mianzi.length
        && mianzi.filter(m => m.match(laotoupai_kezi)).length > 0
        && mianzi.filter(m => m.match(zipai_kezi)).length > 0) return 1;
    return 0;
  }
  function sangang() {
    if (hudi.n_gang == 3) return 1;
    return 0;
  }
  function qidui() {
    if (hudi.n_duizi == 7) return 1;
    return 0;
  }
  function qixingbukao() {
    if (mianzi.length != 14) return 0;
    const zi= /^z/;
    if (mianzi.filter(m => m.match(zi)).length == 7) return 1;
    return 0;
  }
  function qingyise() {
    for (let s of ['m', 'p', 's']) {
      const yise = new RegExp(`^${s}`);
      if (mianzi.filter(m => m.match(yise)).length == mianzi.length) return 1;
    }
    return 0;
  }
  function yisesantongshun() {
    const shunzi = hudi.shunzi;
    for (let s of ['m', 'p', 's']) {
      for (let n = 1; n <= 7; n++) {
        if (shunzi[s][n] >= 3) return 1;
      }
    }
    return 0;
  }
  function yisesanjiegao() {
    const kezi = hudi.kezi;
    for (let s of ['m', 'p', 's']) {
      for (let n = 1; n <= 7; n++) {
        if (kezi[s][n] && kezi[s][n + 1] && kezi[s][n + 2]) return 1;
      }
    }
    return 0;
  }
  function quanda() {
    if (mianzi.filter(m => m.match(/^[mps].*[123456]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z/)).length > 0) return 0;
    return 1;
  }
  function quanzhong() {
    if (mianzi.filter(m => m.match(/^[mps].*[123789]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z/)).length > 0) return 0;
    return 1;
  }
  function quanxiao() {
    if (mianzi.filter(m => m.match(/^[mps].*[456789]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z/)).length > 0) return 0;
    return 1;
  }
  function quanshuangke() {
    if (mianzi.length != 5) return 0;
    if (mianzi.filter(m => m.match(/^[mps].*[13579]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z/)).length > 0) return 0;
    return 1;
  }
  function qinglong() {
    const shunzi = hudi.shunzi;
    for (let s of ['m', 'p', 's']) {
      if (shunzi[s][1] && shunzi[s][4] && shunzi[s][7]) return 1;
    }
    return 0;
  }
  function yisesanbugao() {
    const shunzi = hudi.shunzi;
    for (let s of ['m', 'p', 's']) {
      for (let n = 1; n <= 3; n++) {
        if (shunzi[s][n] && shunzi[s][n + 2] && shunzi[s][n + 4]) return 1;
      }
      for (let n = 1; n <= 5; n++) {
        if (shunzi[s][n] && shunzi[s][n + 1] && shunzi[s][n + 2]) return 1;
      }
    }
    return 0;
  }
  function sanseshuanglonghui() {
    const shunzi = hudi.shunzi;
    const duizi = hudi.duizi;
    for (let s_ of ['mps', 'msp', 'pms', 'psm', 'smp', 'spm']) {
      if (shunzi[s_[0]][1] == 2 && shunzi[s_[1]][7] == 2 && duizi[s_[2]][5] == 1) return 1;
    }
    return 0;
  }
  function quandaiwu() {
    if (mianzi.filter(m => m.match(/^[mps].*[5]/)).length == mianzi.length) return 1;
    return 0;
  }
  function santongke() {
    const kezi = hudi.kezi;
    for (let n = 1; n <= 9; n++) {
      if (kezi.m[n] && kezi.p[n] && kezi.s[n]) return 1;
    }
    return 0;
  }
  function sananke() {
    if (hudi.n_anke == 3) return 1;
    return 0;
  }
  function quanbukao() {
    if (mianzi.length != 14) return 0;
    const zi= /^z/;
    if (mianzi.filter(m => m.match(zi)).length <= 6) return 1;
    return 0;
  }
  function zuhelong() {
    if (mianzi.length == 11) return 1;
    if (mianzi.length == 14) {
      const zi= /^z/;
      if (mianzi.filter(m => m.match(zi)).length == 5) return 1;
    }
    return 0;
  }
  function dayuwu() {
    if (mianzi.filter(m => m.match(/^[mps].*[12345]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z/)).length > 0) return 0;
    return 1;
  }
  function xiaoyuwu() {
    if (mianzi.filter(m => m.match(/^[mps].*[56789]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z/)).length > 0) return 0;
    return 1;
  }
  function sanfengke() {
    const kezi = hudi.kezi;
    if (kezi.z[1] + kezi.z[2] + kezi.z[3] + kezi.z[4] == 3) return 1;
    return 0;
  }
  function hualong() {
    const shunzi = hudi.shunzi;
    for (let s_ of ['mps', 'msp', 'pms', 'psm', 'smp', 'spm']) {
      if (shunzi[s_[0]][1] && shunzi[s_[1]][4] && shunzi[s_[2]][7]) return 1;
    }
    return 0;
  }
  function sansesantongshun() {
    const shunzi = hudi.shunzi;
    for (let n = 1; n <= 7; n++) {
      if (shunzi.m[n] && shunzi.p[n] && shunzi.s[n]) return 1;
    }
    return 0;
  }
  function sansesanjiegao() {
    const kezi = hudi.kezi;
    for (let s_ of ['mps', 'msp', 'pms', 'psm', 'smp', 'spm']) {
      for (let n = 1; n <= 7; n++) {
        if (kezi[s_[0]][n] && kezi[s_[1]][n + 1] && kezi[s_[2]][n + 2]) return 1;
      }
    }
    return 0;
  }
  // 暂时先设为0，最后再调整
  function wufanhu() {
    return 0;
  }
  function tuibudao() {
    if (mianzi.filter(m => m.match(/^m/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^p.*[67]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^s.*[137]/)).length > 0) return 0;
    if (mianzi.filter(m => m.match(/^z.*[123456]/)).length > 0) return 0;
    return 1;
  }
  function miaoshouhuichun() {
    if (param.fanzhong.haidi == 1) return 1;
    return 0;
  }
  function haidilaoyue() {
    if (param.fanzhong.haidi == 2) return 1;
    return 0;
  }
  function gangshangkaihua() {
    if (param.fanzhong.gangkai) return 1;
    return 0;
  }
  function qiangganghu() {
    if (param.fanzhong.qianggang) return 1;
    return 0;
  }
  function pengpenghu() {
    if (hudi.n_kezi == 4) return 1;
    return 0;
  }
  function hunyise() {
    const zipai = new RegExp(`^z`);
    for (let s of ['m', 'p', 's']) {
      const yise = new RegExp(`^${s}`);
      if (mianzi.filter(m => m.match(yise) || m.match(zipai)).length == mianzi.length
        && mianzi.filter(m => m.match(yise)).length > 0
        && mianzi.filter(m => m.match(zipai)).length > 0) return 1;
    }
    return 0;
  }
  function quanqiuren() {
    const fulou = /[\+\=\-]/;
    if (mianzi.filter(m => m.match(fulou)).length == mianzi.length) return 1;
    return 0;
  }
  function sansesanbugao() {
    const shunzi = hudi.shunzi;
    for (let s_ of ['mps', 'msp', 'pms', 'psm', 'smp', 'spm']) {
      for (let n = 1; n <= 5; n++) {
        if (shunzi[s_[0]][n] && shunzi[s_[1]][n + 1] && shunzi[s_[2]][n + 2]) return 1;
      }
    }
    return 0;
  }
  function wumenqi() {
    if (mianzi.filter(m => m.match(/^m/)).length > 0
      && mianzi.filter(m => m.match(/^p/)).length > 0
      && mianzi.filter(m => m.match(/^s/)).length > 0
      && mianzi.filter(m => m.match(/^z[1234]/)).length > 0
      && mianzi.filter(m => m.match(/^z[567]/)).length > 0) return 1;
    return 0;
  }
  function shuangangang() {
    if (hudi.n_angang == 2) return 1;
    return 0;
  }
  function shuangjianke() {
    const kezi = hudi.kezi;
    if (kezi.z[5] + kezi.z[6] + kezi.z[7] == 2) return 1;
    return 0;
  }
  function buqiuren() {
    if (hudi.menqian && hudi.zimo) return 1;
    return 0;
  }
  function quandaiyao() {
    if (mianzi.filter(m => m.match(/^.*[z19].*$/)).length == mianzi.length) return 1;
    return 0;
  }
  function shuangminggang() {
    if (hudi.n_gang == 2 && hudi.n_angang == 0) return 1;
    return 0;
  }
  function hujuezhang() {
    if (param.fanzhong.juezhang) return 1;
    return 0;
  }
  function menqianqing() {
    if (hudi.menqian) return 1;
    return 0;
  }
  function duanyao() {
    if (mianzi.filter(m => m.match(/^.*[z19].*$/)).length == 0) return 1;
    return 0;
  }
  function pinghu() {
    if (hudi.n_shunzi != 4) return 0;
    if (mianzi[0].match(/^z/)) return 0;
    return 1;
  }
  function jianke() {
    const kezi = hudi.kezi;
    if (kezi.z[5] + kezi.z[6] + kezi.z[7] == 1) return 1;
    return 0;
  }
  function quanfengke() {
    if (hudi.kezi.z[param.quanfeng + 1]) return 1;
    return 0;
  }
  function menfengke() {
    if (hudi.kezi.z[param.menfeng + 1]) return 1;
    return 0;
  }
  function siguiyi() {
    let zhangshu = { m: [0,0,0,0,0,0,0,0,0,0],
              p: [0,0,0,0,0,0,0,0,0,0],
              s: [0,0,0,0,0,0,0,0,0,0],
              z: [0,0,0,0,0,0,0,0]    };
    for (let m of mianzi) {
      let s = m[0];
      for (let n of m) {
        if (isNaN(n)) continue;

        zhangshu[s][n]++;
      }
    }

    let result = -hudi.n_gang;

    for (let s of ['m', 'p', 's', 'z']) {
      result += zhangshu[s].filter(n => n == 4).length;
    }

    return result;
  }
  function shuangtongke() {
    let result = 0;
    const kezi = hudi.kezi;
    for (let n = 1; n <= 9; n++) {
      if (kezi.m[n] + kezi.p[n] + kezi.s[n] == 2) result++;
    }
    return result;
  }
  function shuanganke() {
    if (hudi.n_anke == 2) return 1;
    return 0;
  }
  function angang() {
    if (hudi.n_angang == 1) return 1;
    return 0;
  }
  function queyimen() {
    for (let s_ of ['mps', 'psm', 'smp']) {
      if (mianzi.filter(m => m.match(new RegExp(`^[${s_[0]}]`))).length > 0
        && mianzi.filter(m => m.match(new RegExp(`^[${s_[1]}]`))).length > 0
        && mianzi.filter(m => m.match(new RegExp(`^[${s_[2]}]`))).length == 0) return 1;
    }
    return 0;
  }
  function wuzi() {
    if (mianzi.filter(m => m.match(/^z/)).length == 0) return 1;
    return 0;
  }
  function yibangao() {
    const shunzi = hudi.shunzi;
    return shunzi.m.concat(shunzi.p).concat(shunzi.s).map(x => Math.max(0, x - 1)).reduce((a, b) => a + b);
  }
  function lianliu() {
    let result = 0;
    const shunzi = hudi.shunzi;
    for (let s of ['m', 'p', 's']) {
      for (let n = 1; n <= 4; n++) {
        if (shunzi[s][n] && shunzi[s][n + 3]) result++;
      }
    }
    return result;
  }
  function laoshaofu() {
    let result = 0;
    const shunzi = hudi.shunzi;
    for (let s of ['m', 'p', 's']) {
      if (shunzi[s][1] && shunzi[s][7]) result++;
    }
    return result;
  }
  function xixiangfeng() {
    let result = 0;
    const shunzi = hudi.shunzi;
    for (let s_ of ['mp', 'ps', 'sm']) {
      for (let n = 1; n <= 7; n++) {
        if (shunzi[s_[0]][n] && shunzi[s_[1]][n]) result++;
      }
    }
    return result;
  }
  function yaojiuke() {
    let result = 0;
    const laotoupai_kezi = /^[mps]([19])\1\1.*$/;
    const fengpai_kezi = /^z([1-4])\1\1.*$/;
    let n_yaojiukezi = mianzi.filter(m => m.match(laotoupai_kezi) || m.match(fengpai_kezi)).length;
    return n_yaojiukezi - hudi.kezi.z[param.quanfeng + 1] - hudi.kezi.z[param.menfeng + 1];
  }
  function minggang() {
    if (hudi.n_gang == 1 && hudi.n_angang == 0) return 1;
    return 0;
  }
  function bianzhang() {
    if (tingpai.length > 1) return 0;

    const bianzhang_ = /^[mps](123[\+\=\-\_]\!|7[\+\=\-\_]\!89)$/;
    if (mianzi.filter(m => m.match(bianzhang_)).length > 0) return 1;
    return 0;
  }
  function kanzhang() {
    if (tingpai.length > 1) return 0;

    const bianzhang_ = /^[mps]\d\d[\+\=\-\_]\!\d$/;
    if (mianzi.filter(m => m.match(bianzhang_)).length > 0) return 1;
    return 0;
  }
  function dandiaojiang() {
    if (tingpai.length > 1) return 0;

    const dandiaojiang_ = /^[mpsz](\d)\1[\+\=\-\_]\!$/;
    if (mianzi.filter(m => m.match(dandiaojiang_)).length > 0) return 1;
    return 0;
  }
  function mingangang() {
    if (hudi.n_gang == 2 && hudi.n_angang == 1) return 1;
    return 0;
  }
  function zimo() {
    if (hudi.zimo) return 1;
    return 0;
  }

  let fanzhong = [];

  const fanzhongs = [
    { name_zh: '大四喜', fenshu: 88 }, { name_zh: '大三元', fenshu: 88 }, { name_zh: '十三幺', fenshu: 88 }, { name_zh: '绿一色', fenshu: 88 },
    { name_zh: '九莲宝灯', fenshu: 88 }, { name_zh: '连七对', fenshu: 88 }, { name_zh: '四杠', fenshu: 88 }, { name_zh: '小四喜', fenshu: 64 },
    { name_zh: '小三元', fenshu: 64 }, { name_zh: '字一色', fenshu: 64 }, { name_zh: '一色双龙会', fenshu: 64 }, { name_zh: '清幺九', fenshu: 64 },
    { name_zh: '四暗刻', fenshu: 64 }, { name_zh: '一色四同顺', fenshu: 48 }, { name_zh: '一色四节高', fenshu: 48 }, { name_zh: '一色四步高', fenshu: 32 },
    { name_zh: '混幺九', fenshu: 32 }, { name_zh: '三杠', fenshu: 32 }, { name_zh: '七对', fenshu: 24 }, { name_zh: '七星不靠', fenshu: 24 },
    { name_zh: '清一色', fenshu: 24 }, { name_zh: '一色三同顺', fenshu: 24 }, { name_zh: '一色三节高', fenshu: 24 }, { name_zh: '全大', fenshu: 24 },
    { name_zh: '全中', fenshu: 24 }, { name_zh: '全小', fenshu: 24 }, { name_zh: '全双刻', fenshu: 24 }, { name_zh: '清龙', fenshu: 16 },
    { name_zh: '一色三步高', fenshu: 16 }, { name_zh: '三色双龙会', fenshu: 16 }, { name_zh: '全带五', fenshu: 16 }, { name_zh: '三同刻', fenshu: 16 },
    { name_zh: '三暗刻', fenshu: 16 }, { name_zh: '全不靠', fenshu: 12 }, { name_zh: '组合龙', fenshu: 12 }, { name_zh: '大于五', fenshu: 12 },
    { name_zh: '小于五', fenshu: 12 }, { name_zh: '三风刻', fenshu: 12 }, { name_zh: '花龙', fenshu: 8 }, { name_zh: '三色三同顺', fenshu: 8 },
    { name_zh: '三色三节高', fenshu: 8 }, { name_zh: '无番和', fenshu: 8 }, { name_zh: '推不倒', fenshu: 8 }, { name_zh: '妙手回春', fenshu: 8 },
    { name_zh: '海底捞月', fenshu: 8 }, { name_zh: '杠上开花', fenshu: 8 }, { name_zh: '抢杠和', fenshu: 8 }, { name_zh: '碰碰和', fenshu: 6 },
    { name_zh: '混一色', fenshu: 6 }, { name_zh: '全求人', fenshu: 6 }, { name_zh: '三色三步高', fenshu: 6 }, { name_zh: '五门齐', fenshu: 6 },
    { name_zh: '双暗杠', fenshu: 6 }, { name_zh: '双箭刻', fenshu: 6 }, { name_zh: '不求人', fenshu: 4 }, { name_zh: '全带幺', fenshu: 4 },
    { name_zh: '双明杠', fenshu: 4 }, { name_zh: '和绝张', fenshu: 4 }, { name_zh: '门前清', fenshu: 2 }, { name_zh: '断幺', fenshu: 2 },
    { name_zh: '平和', fenshu: 2 }, { name_zh: '箭刻', fenshu: 2 }, { name_zh: '圈风刻', fenshu: 2 }, { name_zh: '门风刻', fenshu: 2 },
    { name_zh: '四归一', fenshu: 2 }, { name_zh: '双同刻', fenshu: 2 }, { name_zh: '双暗刻', fenshu: 2 }, { name_zh: '暗杠', fenshu: 2 },
    { name_zh: '缺一门', fenshu: 1 }, { name_zh: '无字', fenshu: 1 }, { name_zh: '一般高', fenshu: 1 }, { name_zh: '连六', fenshu: 1 },
    { name_zh: '老少副', fenshu: 1 }, { name_zh: '喜相逢', fenshu: 1 }, { name_zh: '幺九刻', fenshu: 1 }, { name_zh: '明杠', fenshu: 1 },
    { name_zh: '边张', fenshu: 1 }, { name_zh: '坎张', fenshu: 1 }, { name_zh: '单钓将', fenshu: 1 }, { name_zh: '自摸', fenshu: 1 },
    { name_zh: '明暗杠', fenshu: 5 },
    // { name_zh: '花牌', fenshu: 1 },
  ];

  let fanzhong_nums = Array(fanzhongs.length).fill(0);

  // 九莲宝灯单独考虑
  if (mianzi.length == 1) {
    fanzhong_nums[4] = 1;
    let hulepai_shu = mianzi[0][15];
    switch (hulepai_shu) {
      case '1':
      case '9':
        fanzhong_nums[27] = 1; // 清龙
        fanzhong_nums[64] = 1; // 四归一
        break;
      case '2':
      case '8':
        fanzhong_nums[71] = 1; // 连六
        fanzhong_nums[74] = 1; // 幺九刻
        break;
      case '3':
      case '4':
      case '6':
      case '7':
        fanzhong_nums[71] = 1; // 连六
        break;
      case '5':
        fanzhong_nums[74] = 1; // 幺九刻
        break;
    }
    // TODO: 偶然番种（包括自摸）
  } else {
    let fanzhong_functions = [
      dasixi,
      dasanyuan,
      shisanyao,
      lvyise,
      jiulianbaodeng,
      lianqidui,
      sigang,
      xiaosixi,
      xiaosanyuan,
      ziyise,
      yiseshuanglonghui,
      qingyaojiu,
      sianke,
      yisesitongshun,
      yisesijiegao,
      yisesibugao,
      hunyaojiu,
      sangang,
      qidui,
      qixingbukao,
      qingyise,
      yisesantongshun,
      yisesanjiegao,
      quanda,
      quanzhong,
      quanxiao,
      quanshuangke,
      qinglong,
      yisesanbugao,
      sanseshuanglonghui,
      quandaiwu,
      santongke,
      sananke,
      quanbukao,
      zuhelong,
      dayuwu,
      xiaoyuwu,
      sanfengke,
      hualong,
      sansesantongshun,
      sansesanjiegao,
      wufanhu,
      tuibudao,
      miaoshouhuichun,
      haidilaoyue,
      gangshangkaihua,
      qiangganghu,
      pengpenghu,
      hunyise,
      quanqiuren,
      sansesanbugao,
      wumenqi,
      shuangangang,
      shuangjianke,
      buqiuren,
      quandaiyao,
      shuangminggang,
      hujuezhang,
      menqianqing,
      duanyao,
      pinghu,
      jianke,
      quanfengke,
      menfengke,
      siguiyi,
      shuangtongke,
      shuanganke,
      angang,
      queyimen,
      wuzi,
      yibangao,
      lianliu,
      laoshaofu,
      xixiangfeng,
      yaojiuke,
      minggang,
      bianzhang,
      kanzhang,
      dandiaojiang,
      zimo,
      mingangang,
    ];
    for (const [index, f] of fanzhong_functions.entries()) {
      fanzhong_nums[index] = f();
    }

    var fanzhong_chongfu_table = new Array(fanzhongs.length);
    for (let n = 0; n < fanzhongs.length; n++) {
      fanzhong_chongfu_table = new Array(fanzhongs.length).fill(0);
    }
    var fanzhong_chongfus = [
      [60, 69], [59, 69], [54, 58], [53, 61], [49, 78], [46, 57], [45, 79], [43, 79], [42, 68],
      [37, 74], // 需要推论
      [36, 69], [35, 69], [33, 58], [33, 54], [33, 51],
      [32, 66], [31, 65], [30, 69], // 可省略
      [30, 59], [29, 73], [29, 72], [29, 60], [26, 69], [26, 59], [26, 47], [25, 36], [24, 59], [23, 35],
      [25, 69], [24, 69], [23, 69], // 可省略
      [21, 70],
      [21, 69], // 可省略
      [20, 69], [19, 58], [19, 54], [19, 51], [18, 78], [18, 58], [18, 54], [18, 51], [16, 74], [16, 55], [16, 47], [15, 72], [15, 71], [15, 28], [14, 47], [14, 22],
      [13, 70], // 可省略
      [13, 64], [13, 21],
      [12, 66], // 可省略
      [12, 58], [12, 54], [12, 47],
      [12, 32], // 可省略
      [11, 74], [11, 69], [11, 55], [11, 47], [10, 72], [10, 70],
      [10, 69], // 可省略
      [10, 60], [10, 20], [10, 18], [9, 74],
      [9, 55], // 可省略
      [9, 47], [9, 16],
      [8, 61], [8, 53], // 可省略
      [7, 74], [7, 37], [6, 78], [6, 47],
      [5, 78], [5, 58], [5, 54], // 可省略
      [5, 20], [5, 18], [4, 58], [4, 54], [4, 20], [3, 48], [2, 78], [2, 58], [2, 55], [2, 54], [2, 51], [2, 16],
      [1, 61], [1, 53], // 可省略
      [0, 74], [0, 63], [0, 62], [0, 47], [0, 37],
      // 规定
      [39, 73], // 三色三同顺 喜相逢
      [38, 73], // 花龙 喜相逢
      // 杠 四杠、三杠、双杠系列、暗杠、明杠只计一个
      [56, 75], [52, 67], [80, 75], [80, 67],
      [17, 75], [17, 67], [17, 80], [17, 56], [17, 52],
      [6, 80], [6, 75], [6, 67], [6, 56], [6, 52], [6, 17],
      // 以下待定
      // [52, 66], 双暗杠 双暗刻
      // [11, 65], 清幺九 三同刻
      // [11, 31], 清幺九 双同刻
      // [3, 47], 绿一色 混一色
      // 只能门清的番种也可计自摸，所以[不求人 - 自摸]的关系放在最后
      [54, 79],
    ];
    for (let fc of fanzhong_chongfus) {
      if (fanzhong_nums[fc[0]] > 0) {
        fanzhong_nums[fc[1]] = 0;
      }
    }
  }

  for (const [index, f] of fanzhongs.entries()) {
    if (fanzhong_nums[index] == 0) continue;

    // 般老喜连最多 3 个
    if (index == 73 && fanzhong_nums[70] + fanzhong_nums[71] + fanzhong_nums[72] + fanzhong_nums[73] == 4) {
      if (fanzhong_nums[73] > 0) { fanzhong_nums[73]--; }
      else if (fanzhong_nums[72] > 0) { fanzhong_nums[72]--; }
      else if (fanzhong_nums[71] > 0) { fanzhong_nums[71]--; }
    }

    fanzhong = fanzhong.concat([{name_zh: f.name_zh, fenshu: f.fenshu * fanzhong_nums[index]}]);
  }

  if (fanzhong.length == 0) {
    fanzhong = [{name_zh: fanzhongs[41].name_zh, fenshu: fanzhongs[41].fenshu}];
  }

  return fanzhong;
}

function get_defen(fanzhong, chongpai, param) {
  const difen = 8;

  if (fanzhong.length == 0) return { zongfen: 0 };

  let menfeng = param.menfeng;
  let zongfen, chongjia;

  zongfen = fanzhong.map(h => h.fenshu).reduce((x, y) => x + y);

  let fenpei = [0, 0, 0, 0];
  for (let l = 0; l < 4; l++) {
    if (l == menfeng) fenpei[l] = difen * 3;
    else fenpei[l] = -difen;
  }

  if (chongpai) {
    chongjia = (menfeng + { '+': 1, '=': 2, '-': 3}[chongpai[2]]) % 4;
    fenpei[menfeng] += zongfen;
    fenpei[chongjia] -= zongfen;
  } else {
    for (let l = 0; l < 4; l++) {
      if (l == menfeng) fenpei[l] += zongfen * 3;
      else fenpei[l] -= zongfen;
    }
  }

  return {
    fanzhong: fanzhong,
    zongfen: zongfen,
    fenpei: fenpei
  };
}

function hule(shoupai, chongpai, param) {
  let max;

  let mianzis = hule_mianzi(shoupai, chongpai);

  let new_shoupai = shoupai.clone().dapai(shoupai._zimo);

  // TODO
  let tingpai = Majiang.Util.tingpai(new_shoupai);

  for (let mianzi of mianzis) {

    let hudi = get_hudi(mianzi);
    let fanzhong = get_fanzhong(mianzi, hudi, tingpai, param);
    let rv = get_defen(fanzhong, chongpai, param);

    if (!max || rv.zongfen > max.zongfen
      || rv.zongfen == max.zongfen
        && (!rv.fenshu || rv.fenshu > max.fenshu
          || rv.fenshu == max.fenshu && rv.fu > max.fu)) max = rv;
  }

  // console.log(max);
  return max;
}

module.exports = hule;
