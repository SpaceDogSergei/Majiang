from time import sleep
import os
import sys
import time
import json
import logging
import numpy as np
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.select import Select

ms_arr = [
  'em', # 0
  '1b', '2b', '3b', '4b', '5b', '6b', '7b', '8b', '9b', # 1~9
  '1c', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', # 10~18
  '1d', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', # 19~27
  'we', 'ws', 'ww', 'wn', 'dr', 'dg', 'dw', # 28~34
  'f1', 'f2', 'f3', 'f4', 's1', 's2', 's3', 's4' # 35~42
]
ms_to_pai = {
  '1b': 's1',
  '2b': 's2',
  '3b': 's3',
  '4b': 's4',
  '5b': 's5',
  '6b': 's6',
  '7b': 's7',
  '8b': 's8',
  '9b': 's9',
  '1c': 'm1',
  '2c': 'm2',
  '3c': 'm3',
  '4c': 'm4',
  '5c': 'm5',
  '6c': 'm6',
  '7c': 'm7',
  '8c': 'm8',
  '9c': 'm9',
  '1d': 'p1',
  '2d': 'p2',
  '3d': 'p3',
  '4d': 'p4',
  '5d': 'p5',
  '6d': 'p6',
  '7d': 'p7',
  '8d': 'p8',
  '9d': 'p9',
  'we': 'z1',
  'ws': 'z2',
  'ww': 'z3',
  'wn': 'z4',
  'dr': 'z5',
  'dg': 'z6',
  'dw': 'z7',
  'f1': 'h1',
  'f2': 'h2',
  'f3': 'h3',
  'f4': 'h4',
  's1': 'h5',
  's2': 'h6',
  's3': 'h7',
  's4': 'h8',
}
ms_to_chi = {
  '2b': 's123',
  '3b': 's234',
  '4b': 's345',
  '5b': 's456',
  '6b': 's567',
  '7b': 's678',
  '8b': 's789',
  '2c': 'm123',
  '3c': 'm234',
  '4c': 'm345',
  '5c': 'm456',
  '6c': 'm567',
  '7c': 'm678',
  '8c': 'm789',
  '2d': 'p123',
  '3d': 'p234',
  '4d': 'p345',
  '5d': 'p456',
  '6d': 'p567',
  '7d': 'p678',
  '8d': 'p789',
}
ms_to_peng = {
  '1b': 's111',
  '2b': 's222',
  '3b': 's333',
  '4b': 's444',
  '5b': 's555',
  '6b': 's666',
  '7b': 's777',
  '8b': 's888',
  '9b': 's999',
  '1c': 'm111',
  '2c': 'm222',
  '3c': 'm333',
  '4c': 'm444',
  '5c': 'm555',
  '6c': 'm666',
  '7c': 'm777',
  '8c': 'm888',
  '9c': 'm999',
  '1d': 'p111',
  '2d': 'p222',
  '3d': 'p333',
  '4d': 'p444',
  '5d': 'p555',
  '6d': 'p666',
  '7d': 'p777',
  '8d': 'p888',
  '9d': 'p999',
  'we': 'z111',
  'ws': 'z222',
  'ww': 'z333',
  'wn': 'z444',
  'dr': 'z555',
  'dg': 'z666',
  'dw': 'z777',
}
ms_to_gang = {
  '1b': 's1111',
  '2b': 's2222',
  '3b': 's3333',
  '4b': 's4444',
  '5b': 's5555',
  '6b': 's6666',
  '7b': 's7777',
  '8b': 's8888',
  '9b': 's9999',
  '1c': 'm1111',
  '2c': 'm2222',
  '3c': 'm333',
  '4c': 'm4444',
  '5c': 'm5555',
  '6c': 'm6666',
  '7c': 'm7777',
  '8c': 'm8888',
  '9c': 'm9999',
  '1d': 'p1111',
  '2d': 'p2222',
  '3d': 'p3333',
  '4d': 'p4444',
  '5d': 'p5555',
  '6d': 'p6666',
  '7d': 'p7777',
  '8d': 'p8888',
  '9d': 'p9999',
  'we': 'z1111',
  'ws': 'z2222',
  'ww': 'z3333',
  'wn': 'z4444',
  'dr': 'z5555',
  'dg': 'z6666',
  'dw': 'z7777',
}
fulou_dir = ['-', '=', '+']

def convert_pai_arr_to_str(pai_arr):
  qipais = ''
  m = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  p = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  s = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  z = [0, 0, 0, 0, 0, 0, 0]
  h = [0, 0, 0, 0, 0, 0, 0, 0]
  for pai in pai_arr:
    if pai <= 9:
      s[pai - 1] += 1
    elif pai <= 18:
      m[pai - 10] += 1
    elif pai <= 27:
      p[pai - 19] += 1
    elif pai <= 34:
      z[pai - 28] += 1
    else:
      h[pai - 35] += 1
  if sum(m):
    qipais += 'm'
    for i in range(9):
      while m[i]:
        qipais += str(i + 1)
        m[i] -= 1
  if sum(p):
    qipais += 'p'
    for i in range(9):
      while p[i]:
        qipais += str(i + 1)
        p[i] -= 1
  if sum(s):
    qipais += 's'
    for i in range(9):
      while s[i]:
        qipais += str(i + 1)
        s[i] -= 1
  if sum(z):
    qipais += 'z'
    for i in range(7):
      while z[i]:
        qipais += str(i + 1)
        z[i] -= 1
  if sum(h):
    qipais += 'h'
    for i in range(8):
      while h[i]:
        qipais += str(i + 1)
        h[i] -= 1
  return qipais

driver = webdriver.Chrome()
driver.get('https://mahjongsoft.com/sessions.php')
driver.delete_cookie('language')
driver.add_cookie({'name': 'language', 'value': 'cn'})
# link = driver.find_element_by_xpath('//table[@id="table_sessions"]/tbody/tr[1]/td[2]/a').text
# game_nums = driver.find_element_by_xpath('//table[@id="table_sessions"]/tbody/tr[1]/td[5]').text
# paipu_link = f'https://mahjongsoft.com/mcrm_replay.php?session={link}&game=1'
# paipu_link = 'https://mahjongsoft.com/mcrm_replay.php?session=7616&game=15'
# paipu_link = 'https://mahjongsoft.com/mcrm_replay.php?session=27543&game=10&table=4'
# paipu_link = 'https://mahjongsoft.com/mcrm_replay.php?session=26876&game=12'
# 27543, 27453
# 27341, 27090, 26984, 26764, 26574, 26484, 26324, 26254, 26133, 25991, 25927, 25777, 25705, 25450, 25305, 25258, 25186, 24935, 24796, 24748, 24660    , 24615, 24495, 24429, 24331, 24291, 24209, 24168, 23958, 23821, 23681, 23627, 23512, 23465, 23356, 23319
tour_sessions = [23244, 23198, 23055, 22974, 22861, 22818, 22687, 22642, 22532, 22478, 22379, 22323, 22234, 22044, 21953, 21821, 21780, 21642, 21581, 21440, 21364, 21127, 21074, 20943, 20833, 20703, 20561, 20517, 20426, 20383, 20267, 20127, 20077, 19963, 19894, 19810, 19808, 19626, 19476, 19412, 19299, 19241, 19174, 19126, 18987, 18848, 18667, 18619, 18535, 18410, 18383, 18381, 18366, 18203, 18202, 17992, 17848, 17809, 17711, 17651, 17560, 17487, 17355, 17310, 17250, 17209, 17052, 17016, 16994, 16993, 16812, 16760, 16708, 16619, 16502, 16473, 16353, 16172, 16095, 16062, 16009, 15963, 15922, 15889, 15799, 15660, 15622, 15570, 15504, 15378, 15266, 15224, 15116, 15090, 15050, 14957, 14928, 14918, 14850, 14849, 14703, 14617, 14542, 14541, 14431, 14432, 14301, 14300, 14100, 13931, 13919, 13918, 13779, 13778, 13773, 13654, 13653, 13589, 13537, 13470, 13469, 13342, 13341, 13110, 13109, 13111, 13108, 13025, 13024, 12859, 12860, 12858, 12755, 12754, 12757, 12752, 12647, 12613, 12612, 12357, 12355, 12356, 12354, 12333, 12332, 12150, 12149, 12148, 12167, 12034, 11921, 11922, 11823, 11824, 11740, 11570, 11446, 11447, 11384, 11266, 11258, 11135, 11131, 11065, 11027, 10831, 10829, 10830, 10828, 10715, 10714, 10632, 10631, 10547, 10548, 10468, 10467, 10466, 10465, 10413, 10412, 10351, 10350, 10287, 10286, 10209, 10208, 10102, 9980, 9938, 9871, 9830, 9789, 9620, 9567, 9519, 9486, 9448, 9331, 9308, 9244, 9208, 9157, 9027, 9007, 8940, 8886, 8839, 8691, 8652, 8614, 8567, 8528, 8474, 8458, 8465, 8409, 8360, 8321, 8304, 8245, 8200, 8163, 5737, 5340, 5007, 4961, 4915, 4831, 4728, 4723, 4716, 4643, 4642, 4594, 4438, 4506, 4471, 4458, 4441, 4440, 4361, 4341, 4290, 4289, 4248, 4247, 4250, 4179, 4116, 3945, 3937, 3899, 3910, 3884, 3871, 3873, 3830, 3750, 3705, 3645, 3466, 3128, 3080, 2971, 2963]

logging.basicConfig(filename='example.log', level=logging.ERROR)
for ssid in tour_sessions:
  tour_link = f'https://mahjongsoft.com/tourresults.php?id={ssid}'
  driver.get(tour_link)
  sleep(3)
  game_num = int(driver.execute_script('return tournament.numdeals'))
  table_num = int(driver.execute_script('return tournament.numplayers')) // 4
  for gid in range(game_num):
    for tid in range(table_num):
      try:
        paipu_link = f'https://mahjongsoft.com/mcrm_replay.php?session={ssid}&game={gid+1}&table={tid+1}'
        driver.get(paipu_link)

        num_to_fanzhong_name_zh = []
        for i in range(82):
          num_to_fanzhong_name_zh.append(driver.execute_script(f'return STR["mcrfan{i+1}"]'))
        fanzhong_value = driver.execute_script('return lb')

        actions = ActionChains(driver)
        paipu = {}

        session = int(driver.execute_script('return new URL(location.href).searchParams.get("session")'))
        game = int(driver.execute_script('return new URL(location.href).searchParams.get("game")'))
        title = f'mahjongsoft_com_session_{session}_game_{game}'
        table = driver.execute_script('return new URL(location.href).searchParams.get("table")')
        if table:
          title += f'_table_{table}'
        paipu['title'] = title
        player = []
        for i in range(4):
          player.append(driver.execute_script(f'return V.b[{i}].name'))
        paipu['player'] = player
        nation = []
        for i in range(4):
          nation.append(driver.execute_script(f'return V.b[{i}].qb'))
        paipu['nation'] = nation
        paipu['qijia'] = 0

        paipu['log'] = []

        log = []
        qipai = {}
        qipai['quanfeng'] = (game - 1) // 4
        qipai['jushu'] = (game - 1) % 4
        qipai['zuoci'] = [0, 1, 2, 3]
        defen = []
        mopai_first = 0
        for i in range(4):
          defen.append(driver.execute_script(f'return V.b[{i}].M'))
        qipai['defen'] = defen
        shoupai = []
        for i in range(4):
          peipai = driver.execute_script(f'return V.l[{i}].j')
          if i == 0:
            # 庄家14->13张
            mopai_first = peipai[-1]
            peipai = peipai[:-1]
          shoupai.append(convert_pai_arr_to_str(sorted(peipai)))
        qipai['shoupai'] = shoupai

        log.append({'qipai': qipai})
        log.append({'zimo': {'l': 0, 'p': ms_to_pai[ms_arr[mopai_first]]}})

        history = driver.execute_script('return V.history')

        def hule_json(l, chongjia):
          fanzhong = []
          zongfen = 0
          fanzhong_num = driver.execute_script(f'return V.b[{l}].l.Ba.Da[0]')
          if driver.execute_script(f'return V.b[{l}].l.Ba.hb') < 8:
            fanzhong_num = fanzhong_num[:-2] + fanzhong_num[-1:]
          for idx, f_num in enumerate(fanzhong_num):
            if f_num > 0:
              fanzhong.append({'name_zh': num_to_fanzhong_name_zh[idx], 'fenshu': fanzhong_value[idx] * f_num})
              zongfen += fanzhong_value[idx] * f_num

          h_pai = None
          hulepai = driver.execute_script(f'return V.b[{l}].l.h')
          if hulepai:
            h_pai = ms_to_pai[ms_arr[driver.execute_script(f'return V.b[{l}].l.h')]]
          else:
            h_pai = ms_to_pai[history[history_idx - 2:history_idx]]
          shoupai = convert_pai_arr_to_str(driver.execute_script(f'return V.l[{l}].j')) + h_pai
          fulou_types = driver.execute_script(f'return V.l[{l}].g')
          fulou_pais = driver.execute_script(f'return V.l[{l}].a')
          fulou_idx = driver.execute_script(f'return V.l[{l}].Db')
          for t, p, i in zip(fulou_types, fulou_pais, fulou_idx):
            if t == 1:
              # 吃
              fulou_str = ms_to_chi[ms_arr[p]]
              fulou_ = fulou_str[:i + 2] + '-' + fulou_str[i + 2:]
              shoupai += f',{fulou_}'
            elif t == 3:
              # 碰
              fulou_str = ms_to_peng[ms_arr[p]]
              fulou_ = fulou_str + fulou_dir[i]
              shoupai += f',{fulou_}'
            elif t == 6:
              # 加杠
              fulou_str = ms_to_gang[ms_arr[p]]
              fulou_ = fulou_str[:4] + fulou_dir[i] + fulou_str[4:]
              shoupai += f',{fulou_}'
            elif t == 7:
              # 暗杠
              fulou_= ms_to_gang[ms_arr[p]]
              shoupai += f',{fulou_}'
            else:
              shoupai += ','

          defen = driver.execute_script('return V.b')
          hulefen = [d['O'] for d in defen]
          fafen = [d['Ka'] for d in defen]
          fenpei = [d['O'] + d['Ka'] for d in defen]
          result = {'chongjia': chongjia, 'l': l, 'shoupai': shoupai, 'zongfen': zongfen, 'fanzhong': fanzhong, 'fenpei': fenpei}
          return result

        count = 0
        history_idx = 0
        l = 0
        gzimo = False

        def next_action():
          if driver.find_elements_by_xpath('//button[@id="nextaction_button"]'):
            driver.execute_script('document.getElementById("nextaction_button").click()')

        while history_idx < len(history):
          if history[history_idx:].startswith('RP'):
            # 途中补花
            buhua = {'l': l, 'p': ms_to_pai[history[history_idx + 2:history_idx + 4]]}
            log_ = {'buhua': buhua}
            log.append(log_)

            zimo = {'l': l, 'p': ms_to_pai[ms_arr[driver.execute_script('return V.V[0][V.V[0].length - 1]')]]}
            log_ = {'zimo': zimo}
            log.append(log_)
            history_idx += 4
            next_action()
          elif history[history_idx:].startswith('DR'):
            # 打牌
            next_action()
            dapai = {'l': l, 'p': ms_to_pai[history[history_idx + 2:history_idx + 4]]}
            log_ = {'dapai': dapai}
            log.append(log_)
            history_idx += 4
            l = (l + 1) % 4
          elif history[history_idx:].startswith('CK'):
            # 暗杠
            next_action()
            fuloupai = history[history_idx + 2:history_idx + 4]
            fulou_ = ms_to_gang[fuloupai]
            gang = {'l': l, 'm': fulou_}
            log_ = {'gang': gang}
            log.append(log_)
            history_idx += 4
            zimo = {'l': l, 'p': ms_to_pai[ms_arr[driver.execute_script('return V.Na')]]}
            log_ = {'gangzimo': zimo}
            log.append(log_)
          elif history[history_idx:].startswith('MK'):
            # 加杠
            next_action()
            fuloupai = history[history_idx + 2:history_idx + 4]
            fulou_ = ms_to_gang[fuloupai]
            gang = {'l': l, 'm': fulou_}
            log_ = {'gang': gang}
            log.append(log_)
            history_idx += 4
            gzimo = True
          elif history[history_idx:].startswith('MA'):
            # 自摸和
            next_action()
            log_ = {'hule': hule_json(l, None)}
            log.append(log_)
            history_idx += 2
          elif history[history_idx:].startswith('FM'):
            # 错和(自摸)
            next_action()
            log_ = {'cuohu': hule_json(l, None)}
            log.append(log_)
            history_idx += 2
          elif history[history_idx:].startswith('PA'):
            # 摸牌
            next_action()
            zimo = {'l': l, 'p': ms_to_pai[ms_arr[driver.execute_script('return V.Na')]]}
            if gzimo:
              log_ = {'gangzimo': zimo}
              gzimo = False
            else:
              log_ = {'zimo': zimo}
            log.append(log_)
            history_idx += 2
          elif history[history_idx:].startswith('R'):
            # 开局补花
            buhua = {'l': history[history_idx + 1], 'p': ms_to_pai[history[history_idx + 2:history_idx + 4]]}
            log_ = {'buhua': buhua}
            log.append(log_)

            zimo = {'l': history[history_idx + 1], 'p': ms_to_pai[ms_arr[driver.execute_script('return V.V[0][V.V[0].length - 1]')]]}
            log_ = {'zimo': zimo}
            log.append(log_)
            history_idx += 4
            next_action()
          elif history[history_idx:].startswith('M'):
            # 点和
            next_action()
            log_ = {'hule': hule_json(int(history[history_idx + 1]), l - 1)}
            log.append(log_)
            history_idx += 2
          elif history[history_idx:].startswith('F'):
            # 错和(点和)
            next_action()
            log_ = {'cuohu': hule_json(int(history[history_idx + 1]), l - 1)}
            log.append(log_)
            history_idx += 2
          elif history[history_idx:].startswith('C'):
            # 吃
            next_action()
            fuloupai = ms_to_pai[history[history_idx - 2:history_idx]]
            fulou_ = ms_to_chi[history[history_idx + 2:history_idx + 4]]
            fulou_idx = fulou_[1:].find(fuloupai[1:])
            fulou = {'l': history[history_idx + 1], 'm': fulou_[:fulou_idx + 2] + '-' + fulou_[fulou_idx + 2:]}
            log_ = {'fulou': fulou}
            log.append(log_)
            history_idx += 4
          elif history[history_idx:].startswith('P'):
            # 碰
            next_action()
            fuloupai = history[history_idx - 2:history_idx]
            fulou_ = ms_to_peng[fuloupai]
            fulou_l = int(history[history_idx + 1])
            fulou = {'l': fulou_l, 'm': fulou_ + fulou_dir[(fulou_l + 4 - l) % 4]}
            log_ = {'fulou': fulou}
            log.append(log_)
            history_idx += 2
            l = fulou_l
          elif history[history_idx:].startswith('K'):
            # 直杠
            next_action()
            fuloupai = history[history_idx - 2:history_idx]
            fulou_ = ms_to_gang[fuloupai]
            fulou_l = int(history[history_idx + 1])
            fulou = {'l': fulou_l, 'm': fulou_ + fulou_dir[(fulou_l + 4 - l) % 4]}
            log_ = {'fulou': fulou}
            log.append(log_)
            history_idx += 2
            l = fulou_l
            zimo = {'l': l, 'p': ms_to_pai[ms_arr[driver.execute_script('return V.Na')]]}
            log_ = {'gangzimo': zimo}
            log.append(log_)
          else:
            next_action()
            print(f'UNKNOWN ACTION!!! {history[history_idx:history_idx + 6]}')
          count += 1

        paipu['log'].append(log)
        # TODO:
        paipu['defen'] = defen
        paipu['point'] = defen
        paipu['rank'] = [1, 2, 3, 4]
      except Exception as e:
        logging.error(f'{e} {ssid}_{gid+1}_{tid+1}')
      else:
        with open(f'../../www/paipu/mahjongsoft_com/duplicate/{paipu["title"]}.json', mode='w') as f:
          f.write(json.dumps(paipu, ensure_ascii=False, separators=(',', ':')).encode('utf8').decode())
