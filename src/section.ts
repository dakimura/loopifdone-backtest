import Decimal from "decimal.js";

export function getSectionCrossedPrices(priceBefore: Decimal, priceAfter: Decimal, diff: Decimal): Decimal[] {
    // 区切れとなる値段を横切った場合は横切った区切れの価格のリストを返却する
    // 区切れとなる値段 = diffの倍数
    const sectionBefore: Decimal = Decimal.floor(priceBefore.dividedBy(diff))
    const sectionAfter: Decimal = Decimal.floor(priceAfter.dividedBy(diff))
    if (sectionBefore === sectionAfter) {
        return []
    }

    let response: Decimal[] = []
    if (sectionBefore < sectionAfter) {
        for (let i: Decimal = sectionBefore.add(1); i <= sectionAfter; i.add(1)) {
            response.push(new Decimal(i).times(diff))
        }
    } else {
        for (let i: Decimal = sectionBefore.minus(1); i >= sectionAfter; i.minus(1)) {
            response.push(new Decimal(i).times(diff))
        }
    }

    return response
}

/**

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

 */
