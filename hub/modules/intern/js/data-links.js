/* 实习机构官网/网申链接补充（构建期核验后写入）。
 * 核验方式：逐个 HTTP 请求，要求 200 + 页面标题命中机构名或英文别名；未命中的不写入。
 * career=true 表示页面含招聘/实习/人才字样；false 表示只确认了机构官网首页，网申入口需站内找。
 * 核验日期 2026-11-10。链接会随时间失效，模块的巡检结果见 link-status.json。 */
(function () {
  var L = {
  "brokers-8": {
    "url": "https://ebscn.zhiye.com/campus",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "光大证券股份有限公司",
    "career": true
  },
  "buyout-2": {
    "url": "https://www.mhfunds.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "明汯投资——打造国际一流量化投资机构 - 明汯投资",
    "career": true
  },
  "more-62": {
    "url": "https://www.primavera-capital.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "Primavera Capital Group | Investing Where The Future Is",
    "career": false
  },
  "more-9": {
    "url": "https://www.fund001.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "交银施罗德基金官方网站,",
    "career": false
  },
  "big4-11": {
    "url": "http://www.zxhcpa.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中兴华会计师事务所（特殊普通合伙）",
    "career": true
  },
  "more-112": {
    "url": "http://www.abchinalife.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "农银人寿",
    "career": true
  },
  "more-121": {
    "url": "https://www.crctrust.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "华润信托--首页",
    "career": true
  },
  "more-113": {
    "url": "https://www.bocommlife.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "交银人寿",
    "career": false
  },
  "more-126": {
    "url": "https://www.bocommtrust.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "交银国际信托",
    "career": false
  },
  "more-127": {
    "url": "https://www.ciit.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "兴业国际信托有限公司",
    "career": true
  },
  "more-132": {
    "url": "https://www.sdictktrust.com/gttk/index.htm",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "国投泰康信托有限公司",
    "career": false
  },
  "more-136": {
    "url": "https://www.spdbfl.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "浦银金融租赁股份有限公司",
    "career": true
  },
  "more-153": {
    "url": "https://www.daxincpa.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "大信会计师事务所",
    "career": true
  },
  "more-85": {
    "url": "http://www.eximbank.gov.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中国进出口银行",
    "career": true
  },
  "more-125": {
    "url": "http://www.sitico.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "上海国际信托有限公司",
    "career": true
  },
  "more-274": {
    "url": "https://www.zhefu.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "首页 | 官网浙富控股",
    "career": true
  },
  "more-276": {
    "url": "https://www.600633.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "浙数文化",
    "career": false
  },
  "more-328": {
    "url": "https://www.zibchina.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "浙江省国际贸易集团有限公司",
    "career": true
  },
  "tech2-0": {
    "url": "https://www.megvii.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "MEGVII旷视",
    "career": false
  },
  "mfg-0": {
    "url": "https://www.crrcgc.cc/crrcgc/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中国中车股份有限公司-首页",
    "career": true
  },
  "more-146": {
    "url": "http://www.trout.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "特劳特中国官网_企业战略定位咨询规划_营销战略咨询_品牌战略定位分析",
    "career": true
  },
  "mfg-1": {
    "url": "https://www.comac.cc/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中国商飞公司门户网站",
    "career": true
  },
  "more-154": {
    "url": "http://www.tyqcpa.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "天圆全会计师事务所（特殊普通合伙）",
    "career": true
  },
  "mfg-3": {
    "url": "https://www.cetc.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中国电子科技集团有限公司-中国电子科技集团有限公司",
    "career": true
  },
  "mfg-6": {
    "url": "https://www.saicmotor.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "上汽集团官网",
    "career": true
  },
  "mfg-11": {
    "url": "https://www.gwm.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "长城汽车官方网站",
    "career": true
  },
  "mfg-9": {
    "url": "https://www.midea.com.cn/zh",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "美的首页",
    "career": true
  },
  "more-204": {
    "url": "https://www.zzpzh.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "漳州片仔癀药业股份有限公司",
    "career": true
  },
  "law-1": {
    "url": "https://www.zhonglun.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中伦律师事务所官方网站",
    "career": true
  },
  "law-3": {
    "url": "https://www.fangdalaw.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "首页_方达律师事务所",
    "career": true
  },
  "law-0": {
    "url": "https://www.kingandwood.com/cn/zh/home.html",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "根植亚洲，服务世界 – 金杜律师事务所",
    "career": true
  },
  "law-4": {
    "url": "http://www.haiwen-law.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "海问律师事务所，海问律所，海问律师事务所官网",
    "career": true
  },
  "law-2": {
    "url": "https://www.junhe.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "君合 | 首页",
    "career": true
  },
  "law-5": {
    "url": "https://www.tongshang.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "通商律师事务所",
    "career": true
  },
  "law-6": {
    "url": "https://www.glo.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "环球律师事务所",
    "career": true
  },
  "law-7": {
    "url": "https://www.allbrightlaw.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "首页 - 上海市锦天城律师事务所",
    "career": true
  },
  "law-8": {
    "url": "https://www.dachenglaw.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "大成律所",
    "career": false
  },
  "law-11": {
    "url": "https://www.jingtian.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "竞天公诚律师事务所",
    "career": false
  },
  "law-10": {
    "url": "https://www.hankunlaw.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "汉坤律师事务所",
    "career": true
  },
  "law-9": {
    "url": "https://www.grandall.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "国浩律师事务所",
    "career": true
  },
  "law2-0": {
    "url": "https://www.tylaw.com.cn/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "天元律师事务所",
    "career": false
  },
  "law2-3": {
    "url": "https://www.guantao.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "北京观韬律师事务所",
    "career": true
  },
  "law2-2": {
    "url": "https://www.dehenglaw.com/CN/index/0001.aspx",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "首页 - 德恒律师事务所",
    "career": false
  },
  "law2-4": {
    "url": "https://www.kangdalawyers.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "康达律师事务所",
    "career": true
  },
  "law2-6": {
    "url": "https://www.tclawfirm.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "天册律师事务所",
    "career": false
  },
  "law2-1": {
    "url": "https://www.zhongyinlawyer.com/",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中银律师事务所",
    "career": true
  },
  "more-333": {
    "url": "https://www.sihc.com.cn/sihc/index.html",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "深圳市投资控股有限公司",
    "career": false
  },
  "mfg-2": {
    "url": "https://www.spacechina.com/n25/index.html",
    "verified": true,
    "checkedAt": "2026-11-10",
    "title": "中国航天科技集团有限公司",
    "career": true
  }
};
  function apply() {
    var D = window.DATA;
    if (!D || !D.companies) return false;
    var n = 0;
    D.companies.forEach(function (c) {
      var e = L[c.id];
      if (!e) return;
      if (!c.applyLink) { c.applyLink = e.url; n++; }
      c.linkVerified = e.verified;
      c.linkCheckedAt = e.checkedAt;
      c.linkIsCareer = e.career;
    });
    window.__INTERN_LINKS_APPLIED__ = n;
    return true;
  }
  if (!apply()) { document.addEventListener('DOMContentLoaded', apply); }
})();
