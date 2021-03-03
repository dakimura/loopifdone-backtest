


export default class Reader{

    private

    constructor() {

    }
}


/**
 # -*- coding:utf-8 -*-

 import math
 from typing import List
 from price_util import Price, price_from_float, price_from_int

 """
 https://forextester.jp/data/datasources
 から手に入れた過去の各為替ペア(USDJPY, GBPJPYなど)の分足データから、
 最もコスパのいいdiffを求める。
 bidスプレッドは0.009
 コスパ = 利益 / 30円の値動きに耐えるために必要な証拠金額(=1/diff * 1 * 30 * 30/2 * 2 = 900/diff)
 """

 """
 split -b 100mb optimal_diff/USDJPY.txt
 """

 """
 <TICKER>,<DTYYYYMMDD>,<TIME>,<OPEN>,<HIGH>,<LOW>,<CLOSE>,<VOL>
 """


 class PairConfig:
 def __init__(self, csv:str, spread: float, trade_unit: int, accept_volatility_yen: float):
 self.csv = csv
 # 各通貨ペアのスプレッド. SBI FXトレードの公式ページ上のスプレッド実績から
 # https://www.sbifxt.co.jp/service/detailedspread.html
 self.spread = spread
 # 取引通貨数
 self.trade_unit = trade_unit
 # 何円の価格変動を見越すか(必要資産の計算に使う)
 self.accept_volatility_yen = accept_volatility_yen


 configs = {
    # 見越すレート変動幅は、アイネット証券のページのレート変動幅5年から
    # https://inet-sec.co.jp/systrd/information/
    # スプレッドシートに起こした
    # https://docs.google.com/spreadsheets/d/1uczMyuU4wKTk9dRBfBV3b3xjhRgXzD4UyDbXJ2LVNig/edit?usp=sharing
    "USDJPY": PairConfig(csv="/Users/dakimura/Downloads/USDJPY_2019.txt",
                         spread=0.0020, trade_unit=1000, accept_volatility_yen=24.1),
    "GBPJPY": PairConfig(csv="/Users/dakimura/Downloads/GBPJPY_2019.txt",
                         spread=0.0069, trade_unit=1000, accept_volatility_yen=62.4),
    "EURJPY": PairConfig(csv="/Users/dakimura/Downloads/EURJPY_2019.txt",
                         spread=0.003, trade_unit=1000, accept_volatility_yen=28.2),
    "AUDJPY": PairConfig(csv="/Users/dakimura/Downloads/AUDJPY_2019.txt",
                         spread=0.004, trade_unit=1000, accept_volatility_yen=30.8),
    "NZDJPY": PairConfig(csv="/Users/dakimura/Downloads/NZDJPY_2019.txt",
                         spread=0.009, trade_unit=1000, accept_volatility_yen=24.4),
    "CADJPY": PairConfig(csv="/Users/dakimura/Downloads/CADJPY_2019.txt",
                         spread=0.014, trade_unit=1000, accept_volatility_yen=19.0),
    "CHFJPY": PairConfig(csv="/Users/dakimura/Downloads/CHFJPY_2019.txt",
                         spread=0.014, trade_unit=1000, accept_volatility_yen=22.1),
}


 def crossed_kugiri_prices(price_before: float, price_after: float, diff: float) -> List[float]:
 """
 区切れとなる値段を横切った場合は横切った区切れの価格のリストを返却する
 :param price_before:
 :param price_after:
 :return:
 """
 # 区切れとなる値段 = diffの倍数
 before_kugiri = math.floor(price_before / diff)
 after_kugiri = math.floor(price_after / diff)
 if before_kugiri == after_kugiri:
 return []

 res = []
 if before_kugiri < after_kugiri:
 for k in range(before_kugiri + 1, after_kugiri + 1):
 res.append(price_from_int(k).multiply_price(price_from_float(diff)).to_float())
 else:
 for k in range(after_kugiri + 1, before_kugiri + 1):
 res.append(price_from_int(k).multiply_price(price_from_float(diff)).to_float())
 res.sort(reverse=True)

 return res


 if __name__ == "__main__":
 # 分析対象の通貨ペア
 target_pair = "USDJPY"
 config = configs[target_pair]

 spread = config.spread
 # spread = 0.02 # アイネット証券の場合も分析してみるか

 for diff in [diff * 0.05 for diff in range(1, 20)]:
 # for diff in [k * 0.03 for k in range(1, 2)]:
 rieki = 0.0
 last_kugire_price = 0.0

 f = open(str(config.csv), "r")

 for line in f:
 l = line.rstrip().split(",")
 pair = l[0]
 date = l[1]
 time = l[2]
 open_price = float(l[3])
 high_price = float(l[4])
 low_price = float(l[5])
 close_price = float(l[6])
 # pair,date,time,open_price,high_price,low_price,close_price,volume = line.rstrip().split(",")

 # crossed, new_kugire_price = cross_kugire(open, close, diff)
 crossed_kugire_prices = crossed_kugiri_prices(open_price, close_price, diff)

 for crossed_kugiri_price in crossed_kugire_prices:
 # print("crossed_kugiri_price={}".format(crossed_kugiri_price))
 if last_kugire_price != 0.0 and last_kugire_price < crossed_kugiri_price:
 rieki += diff - spread
 # print("利益確定.time={}/{},old_kugire={},new_kugire={}".format(date, time,kugire_price, crossed_kugiri_price))
 last_kugire_price = crossed_kugiri_price

 # print("pair={}, date={}, open={}, close={}, kugire={}".format(pair, date, open_price, close_price,
 #                                                              last_kugire_price))

 f.close()

 # print("diff={:4},最終利益={:10},コスパ={:10}".format(diff, rieki, rieki/900.0*diff))
 vola_yen = config.accept_volatility_yen
 total_rieki = int(rieki * config.trade_unit)
 necessary_source = int(1 / diff * vola_yen * vola_yen * config.trade_unit / 2)
 cost_performance = total_rieki / necessary_source
 print("pair={}, コスパ={:5}, diff={:10}円, rieki={:10}円, {}円の値動きに耐えるお金={:10}".format(
 target_pair, cost_performance, diff, total_rieki, vola_yen, necessary_source)
 )
**/