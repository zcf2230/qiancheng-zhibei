/* 实习网申通 · 第六批扩量：医药健康、建筑/土木/规划、旅游/酒店/会展、体育/赛事、农林/食品
 * 五个薄弱学科补量。与前面各批同结构，加载后并入 window.DATA。
 * 收录门槛：官网逐个 HTTP 实测，要求 200 且页面标题/正文命中机构名或英文别名；
 * 未通过的一律不收录（本轮剔除 65 家，含域名被抢注/停靠/指向他司的情况）。
 * 批次时间按行业往年规律估算并标注，用人要求为同类岗位通用规律，confidence=低。 */
window.INTERN_MORE5 = (function () {
  "use strict";
  var companies = [
  {
    "id": "med5-0",
    "name": "扬子江药业",
    "category": "医药健康",
    "subcategory": "中成药 / 化学药",
    "cities": [
      "泰州",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "中成药与化学药研发生产",
    "jobs": "研发、生产、质量、销售",
    "major": "药学/中药学/制药工程",
    "applyLink": "https://www.yangzijiang.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-1",
    "name": "广药白云山",
    "category": "医药健康",
    "subcategory": "中成药 / 大健康",
    "cities": [
      "广州",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "中成药、化药与大健康产品",
    "jobs": "研发、生产、质量、销售",
    "major": "药学/中药学/生物",
    "applyLink": "https://www.gpc.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-2",
    "name": "药明生物",
    "category": "医药健康",
    "subcategory": "生物药 CDMO",
    "cities": [
      "无锡",
      "上海",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "生物药发现开发与生产服务",
    "jobs": "细胞株、工艺、分析、生产",
    "major": "生物/药学/生物工程",
    "applyLink": "https://www.wuxibiologics.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-3",
    "name": "诺禾致源",
    "category": "医药健康",
    "subcategory": "基因测序服务",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "科研与临床测序服务",
    "jobs": "测序实验、生信分析、项目管理",
    "major": "生物/生信",
    "applyLink": "https://cn.novogene.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-4",
    "name": "威高集团",
    "category": "医药健康",
    "subcategory": "医用耗材",
    "cities": [
      "威海",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "输注、骨科、血液净化耗材",
    "jobs": "研发、生产、质量、销售",
    "major": "材料/机械/生物医学工程",
    "applyLink": "https://www.weigaoholding.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-5",
    "name": "爱美客",
    "category": "医药健康",
    "subcategory": "医美器械",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "注射用透明质酸等医美产品",
    "jobs": "研发、临床、生产、销售",
    "major": "生物/药学/临床医学",
    "applyLink": "https://www.imeik.com/cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-6",
    "name": "华熙生物",
    "category": "医药健康",
    "subcategory": "生物材料 / 医美",
    "cities": [
      "济南",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "透明质酸原料与终端产品",
    "jobs": "研发、生产、质量、品牌",
    "major": "生物/生物工程/药学/化学",
    "applyLink": "https://www.bloomage.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-7",
    "name": "新华医疗",
    "category": "医药健康",
    "subcategory": "医疗器械 / 制药装备",
    "cities": [
      "淄博",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "感染控制、放疗与制药装备",
    "jobs": "研发、生产、质量、销售",
    "major": "机械/生物医学工程/药学",
    "applyLink": "https://www.shinva.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-8",
    "name": "万孚生物",
    "category": "医药健康",
    "subcategory": "POCT",
    "cities": [
      "广州",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "快速诊断试剂与仪器",
    "jobs": "研发、生产、质量、海外销售",
    "major": "生物/药学/检验",
    "applyLink": "https://www.wondfo.com/index",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "med5-9",
    "name": "新产业生物",
    "category": "医药健康",
    "subcategory": "体外诊断",
    "cities": [
      "深圳",
      "全国"
    ],
    "disciplines": [
      "医药",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、临床、生产、质量岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期研发/临床实习，部分集团统一项目"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "化学发光免疫诊断",
    "jobs": "研发、生产、质量、海外销售",
    "major": "生物/药学/检验",
    "applyLink": "https://www.snibe.com/cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "arch5-10",
    "name": "北京建院",
    "category": "建筑/土木/规划",
    "subcategory": "建筑设计",
    "cities": [
      "北京"
    ],
    "disciplines": [
      "建筑",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "设计院/施工/咨询常年招聘实习生"
      },
      {
        "type": "暑期实习",
        "open": "约6-7月",
        "close": "约8月",
        "note": "暑期实习是设计院考察留用的主要入口"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，设计院多有快题/专业笔试"
      }
    ],
    "biz": "大型公共建筑与城市设计",
    "jobs": "建筑设计、结构、机电、规划",
    "major": "建筑学/土木/规划/机电",
    "applyLink": "https://www.biad.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "arch5-11",
    "name": "同济设计",
    "category": "建筑/土木/规划",
    "subcategory": "建筑设计",
    "cities": [
      "上海",
      "全国"
    ],
    "disciplines": [
      "建筑",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "设计院/施工/咨询常年招聘实习生"
      },
      {
        "type": "暑期实习",
        "open": "约6-7月",
        "close": "约8月",
        "note": "暑期实习是设计院考察留用的主要入口"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，设计院多有快题/专业笔试"
      }
    ],
    "biz": "建筑、规划与市政设计",
    "jobs": "建筑设计、规划、结构、景观",
    "major": "建筑学/规划/土木/景观",
    "applyLink": "http://www.tjad.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "arch5-12",
    "name": "奥雅设计",
    "category": "建筑/土木/规划",
    "subcategory": "景观设计",
    "cities": [
      "深圳",
      "全国"
    ],
    "disciplines": [
      "建筑",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "设计院/施工/咨询常年招聘实习生"
      },
      {
        "type": "暑期实习",
        "open": "约6-7月",
        "close": "约8月",
        "note": "暑期实习是设计院考察留用的主要入口"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，设计院多有快题/专业笔试"
      }
    ],
    "biz": "景观、文旅与儿童友好空间设计",
    "jobs": "景观设计、植物、施工图、文旅策划",
    "major": "景观/风景园林/规划/艺术",
    "applyLink": "https://www.aoya-hk.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "arch5-13",
    "name": "土人设计",
    "category": "建筑/土木/规划",
    "subcategory": "景观 / 生态规划",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "建筑",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "设计院/施工/咨询常年招聘实习生"
      },
      {
        "type": "暑期实习",
        "open": "约6-7月",
        "close": "约8月",
        "note": "暑期实习是设计院考察留用的主要入口"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，设计院多有快题/专业笔试"
      }
    ],
    "biz": "生态景观与海绵城市设计",
    "jobs": "景观设计、生态规划、植物",
    "major": "风景园林/景观/规划/生态",
    "applyLink": "https://www.turenscape.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "arch5-14",
    "name": "棕榈股份",
    "category": "建筑/土木/规划",
    "subcategory": "园林 / 生态",
    "cities": [
      "广州",
      "全国"
    ],
    "disciplines": [
      "建筑",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "设计院/施工/咨询常年招聘实习生"
      },
      {
        "type": "暑期实习",
        "open": "约6-7月",
        "close": "约8月",
        "note": "暑期实习是设计院考察留用的主要入口"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，设计院多有快题/专业笔试"
      }
    ],
    "biz": "园林景观与生态城镇",
    "jobs": "景观设计、施工、苗木、养护",
    "major": "风景园林/园林/土木",
    "applyLink": "https://www.palm-la.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "arch5-15",
    "name": "苏交科",
    "category": "建筑/土木/规划",
    "subcategory": "工程咨询 / 检测",
    "cities": [
      "南京",
      "全国"
    ],
    "disciplines": [
      "建筑",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "设计院/施工/咨询常年招聘实习生"
      },
      {
        "type": "暑期实习",
        "open": "约6-7月",
        "close": "约8月",
        "note": "暑期实习是设计院考察留用的主要入口"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，设计院多有快题/专业笔试"
      }
    ],
    "biz": "交通与市政勘察设计、检测",
    "jobs": "道路桥梁设计、检测、咨询",
    "major": "土木/交通/测绘",
    "applyLink": "https://www.jsti.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "tour5-16",
    "name": "首旅如家",
    "category": "旅游/酒店/会展",
    "subcategory": "酒店集团",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "旅游",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "酒店、景区、OTA 与会展岗位常年招聘"
      },
      {
        "type": "寒假实习",
        "open": "约12-2月",
        "close": "招满即止",
        "note": "寒假与春节旺季，酒店/景区用人需求集中"
      },
      {
        "type": "暑期实习",
        "open": "约6-8月",
        "close": "招满即止",
        "note": "暑期旅游旺季实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "如家、和颐、建国等品牌",
    "jobs": "管培生、运营、收益、开发",
    "major": "酒店管理/旅游/管理",
    "applyLink": "https://www.bthhotels.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "tour5-17",
    "name": "君澜酒店",
    "category": "旅游/酒店/会展",
    "subcategory": "度假酒店",
    "cities": [
      "杭州",
      "全国"
    ],
    "disciplines": [
      "旅游",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "酒店、景区、OTA 与会展岗位常年招聘"
      },
      {
        "type": "寒假实习",
        "open": "约12-2月",
        "close": "招满即止",
        "note": "寒假与春节旺季，酒店/景区用人需求集中"
      },
      {
        "type": "暑期实习",
        "open": "约6-8月",
        "close": "招满即止",
        "note": "暑期旅游旺季实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "君澜度假与君澜大饭店",
    "jobs": "管培生、运营、餐饮、康乐",
    "major": "酒店管理/旅游",
    "applyLink": "https://www.naradahotels.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "arch5-18",
    "name": "华设集团",
    "category": "建筑/土木/规划",
    "subcategory": "勘察设计",
    "cities": [
      "南京",
      "全国"
    ],
    "disciplines": [
      "建筑",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "设计院/施工/咨询常年招聘实习生"
      },
      {
        "type": "暑期实习",
        "open": "约6-7月",
        "close": "约8月",
        "note": "暑期实习是设计院考察留用的主要入口"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，设计院多有快题/专业笔试"
      }
    ],
    "biz": "交通、市政与水利勘察设计",
    "jobs": "道路桥梁、市政、水利设计",
    "major": "土木/交通/水利",
    "applyLink": "http://www.cdg.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "tour5-19",
    "name": "康辉旅游",
    "category": "旅游/酒店/会展",
    "subcategory": "旅行社",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "旅游",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "酒店、景区、OTA 与会展岗位常年招聘"
      },
      {
        "type": "寒假实习",
        "open": "约12-2月",
        "close": "招满即止",
        "note": "寒假与春节旺季，酒店/景区用人需求集中"
      },
      {
        "type": "暑期实习",
        "open": "约6-8月",
        "close": "招满即止",
        "note": "暑期旅游旺季实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "国内出境游与会奖",
    "jobs": "计调、产品、销售",
    "major": "旅游/管理",
    "applyLink": "https://www.cct.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "tour5-20",
    "name": "中国中免",
    "category": "旅游/酒店/会展",
    "subcategory": "旅游零售",
    "cities": [
      "北京",
      "三亚",
      "全国"
    ],
    "disciplines": [
      "旅游",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "酒店、景区、OTA 与会展岗位常年招聘"
      },
      {
        "type": "寒假实习",
        "open": "约12-2月",
        "close": "招满即止",
        "note": "寒假与春节旺季，酒店/景区用人需求集中"
      },
      {
        "type": "暑期实习",
        "open": "约6-8月",
        "close": "招满即止",
        "note": "暑期旅游旺季实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "免税商品零售与供应链",
    "jobs": "零售运营、采购、供应链、免税店管培",
    "major": "管理/旅游/经贸",
    "applyLink": "https://www.cdfg.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "tour5-21",
    "name": "美团旅行",
    "category": "旅游/酒店/会展",
    "subcategory": "OTA / 本地生活",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "旅游",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "酒店、景区、OTA 与会展岗位常年招聘"
      },
      {
        "type": "寒假实习",
        "open": "约12-2月",
        "close": "招满即止",
        "note": "寒假与春节旺季，酒店/景区用人需求集中"
      },
      {
        "type": "暑期实习",
        "open": "约6-8月",
        "close": "招满即止",
        "note": "暑期旅游旺季实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "酒店民宿与门票预订",
    "jobs": "产品、运营、商家运营、研发",
    "major": "旅游/管理/计算机",
    "applyLink": "https://www.meituan.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "sport5-22",
    "name": "安踏集团",
    "category": "体育/赛事",
    "subcategory": "运动品牌",
    "cities": [
      "厦门",
      "全国"
    ],
    "disciplines": [
      "体育",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "赛事、品牌、零售与媒体岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期赛事与训练营项目集中"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "安踏、FILA、迪桑特等品牌",
    "jobs": "管培生、商品、零售、供应链、品牌",
    "major": "体育/管理/设计/经贸",
    "applyLink": "https://www.anta.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "sport5-23",
    "name": "特步国际",
    "category": "体育/赛事",
    "subcategory": "运动品牌",
    "cities": [
      "厦门",
      "全国"
    ],
    "disciplines": [
      "体育",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "赛事、品牌、零售与媒体岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期赛事与训练营项目集中"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "特步、索康尼等品牌",
    "jobs": "管培生、商品、零售、供应链",
    "major": "体育/管理/经贸",
    "applyLink": "https://www.xtep.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "sport5-24",
    "name": "懂球帝",
    "category": "体育/赛事",
    "subcategory": "体育媒体",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "体育",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "赛事、品牌、零售与媒体岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期赛事与训练营项目集中"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "足球资讯与社区",
    "jobs": "内容、运营、产品、研发",
    "major": "体育/传媒/计算机",
    "applyLink": "https://www.dongqiudi.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "sport5-25",
    "name": "直播吧",
    "category": "体育/赛事",
    "subcategory": "体育媒体",
    "cities": [
      "厦门",
      "全国"
    ],
    "disciplines": [
      "体育",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "赛事、品牌、零售与媒体岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期赛事与训练营项目集中"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "赛事直播资讯与社区",
    "jobs": "内容、运营、产品、研发",
    "major": "体育/传媒/计算机",
    "applyLink": "https://www.zhibo8.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "sport5-26",
    "name": "CBA 公司",
    "category": "体育/赛事",
    "subcategory": "职业联赛",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "体育",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "赛事、品牌、零售与媒体岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期赛事与训练营项目集中"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "CBA 联赛运营与商务开发",
    "jobs": "联赛运营、商务、转播、品牌",
    "major": "体育/管理/传媒",
    "applyLink": "https://www.cbaleague.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-27",
    "name": "中储粮",
    "category": "农林/食品",
    "subcategory": "粮油储备",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "中央储备粮棉油经营管理",
    "jobs": "仓储、质检、物流、财务、信息化",
    "major": "农学/食品/物流/管理",
    "applyLink": "https://www.sinograin.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "sport5-28",
    "name": "莱茵体育",
    "category": "体育/赛事",
    "subcategory": "体育产业",
    "cities": [
      "杭州",
      "全国"
    ],
    "disciplines": [
      "体育",
      "经管"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "赛事、品牌、零售与媒体岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约5-7月",
        "close": "约8月",
        "note": "暑期赛事与训练营项目集中"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招/管培生"
      }
    ],
    "biz": "体育小镇、赛事与场馆运营",
    "jobs": "运营、策划、商务、工程",
    "major": "体育/管理/规划",
    "applyLink": "https://rhine-sports.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-29",
    "name": "粤海饲料",
    "category": "农林/食品",
    "subcategory": "水产饲料",
    "cities": [
      "湛江",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "特种水产饲料",
    "jobs": "研发、配方、生产、技术服务",
    "major": "水产/动物科学",
    "applyLink": "https://www.yuehaifeed.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-30",
    "name": "伊利集团",
    "category": "农林/食品",
    "subcategory": "乳业",
    "cities": [
      "呼和浩特",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "液态奶、奶粉、冷饮与奶酪",
    "jobs": "研发、生产、质量、供应链、牧场",
    "major": "食品/乳品/动物科学/管理",
    "applyLink": "https://www.yili.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-31",
    "name": "三元食品",
    "category": "农林/食品",
    "subcategory": "乳业",
    "cities": [
      "北京",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "液态奶、奶粉与奶酪",
    "jobs": "研发、生产、质量、供应链",
    "major": "食品/乳品",
    "applyLink": "https://www.sanyuan.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-32",
    "name": "君乐宝",
    "category": "农林/食品",
    "subcategory": "乳业",
    "cities": [
      "石家庄",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "奶粉、酸奶与液态奶",
    "jobs": "研发、生产、质量、牧场、销售",
    "major": "食品/乳品/动物科学",
    "applyLink": "https://www.junlebaoruye.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-33",
    "name": "澳优乳业",
    "category": "农林/食品",
    "subcategory": "乳业 / 营养",
    "cities": [
      "长沙",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "羊奶粉与营养品",
    "jobs": "研发、生产、质量、海外供应链",
    "major": "食品/乳品/营养",
    "applyLink": "https://www.ausnutria.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-34",
    "name": "康师傅",
    "category": "农林/食品",
    "subcategory": "方便食品 / 饮料",
    "cities": [
      "天津",
      "上海",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "方便面、饮品与糕饼",
    "jobs": "研发、生产、质量、供应链、销售",
    "major": "食品/管理",
    "applyLink": "https://www.masterkong.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-35",
    "name": "飞鹤乳业",
    "category": "农林/食品",
    "subcategory": "乳业 / 奶粉",
    "cities": [
      "齐齐哈尔",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "婴幼儿配方奶粉",
    "jobs": "研发、生产、质量、牧场、营养",
    "major": "食品/乳品/营养/动物科学",
    "applyLink": "https://www.feihe.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-36",
    "name": "统一企业",
    "category": "农林/食品",
    "subcategory": "方便食品 / 饮料",
    "cities": [
      "上海",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "方便面与饮料",
    "jobs": "研发、生产、质量、销售",
    "major": "食品/管理",
    "applyLink": "https://www.uni-president.com.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-37",
    "name": "金沙河",
    "category": "农林/食品",
    "subcategory": "面粉 / 挂面",
    "cities": [
      "邢台",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "面粉与挂面加工",
    "jobs": "生产、质量、研发、供应链",
    "major": "食品/粮食工程",
    "applyLink": "https://www.jinshahe.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-38",
    "name": "绝味食品",
    "category": "农林/食品",
    "subcategory": "卤味连锁",
    "cities": [
      "长沙",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "休闲卤制食品连锁",
    "jobs": "研发、生产、质量、供应链、加盟",
    "major": "食品/管理",
    "applyLink": "https://www.juewei.cn/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-39",
    "name": "紫燕食品",
    "category": "农林/食品",
    "subcategory": "卤味连锁",
    "cities": [
      "上海",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "佐餐卤制品",
    "jobs": "研发、生产、质量、供应链",
    "major": "食品/管理",
    "applyLink": "http://www.ziyan.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-40",
    "name": "甘源食品",
    "category": "农林/食品",
    "subcategory": "坚果炒货",
    "cities": [
      "萍乡",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "豆类与坚果炒货",
    "jobs": "研发、生产、质量、销售",
    "major": "食品/管理",
    "applyLink": "https://www.ganyuan.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-41",
    "name": "大疆农业",
    "category": "农林/食品",
    "subcategory": "农业无人机",
    "cities": [
      "深圳",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "植保无人机与智慧农业",
    "jobs": "研发、算法、飞防服务、销售",
    "major": "农机/自动化/计算机/农学",
    "applyLink": "https://www.dji.com/cn",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-42",
    "name": "潍柴雷沃",
    "category": "农林/食品",
    "subcategory": "农机装备",
    "cities": [
      "潍坊",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "拖拉机、收获机与农机具",
    "jobs": "研发、工艺、生产、试验、销售",
    "major": "农机/机械/车辆",
    "applyLink": "https://www.lovol.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": true,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-43",
    "name": "中国一拖",
    "category": "农林/食品",
    "subcategory": "农机装备",
    "cities": [
      "洛阳",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "东方红拖拉机与柴油机",
    "jobs": "研发、工艺、生产、试验",
    "major": "农机/机械/动力",
    "applyLink": "https://www.ytocorp.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  },
  {
    "id": "agri5-44",
    "name": "极飞科技",
    "category": "农林/食品",
    "subcategory": "农业无人机",
    "cities": [
      "广州",
      "全国"
    ],
    "disciplines": [
      "农学",
      "理工"
    ],
    "batches": [
      {
        "type": "日常实习",
        "open": "全年滚动",
        "close": "招满即止",
        "note": "研发、生产、质量、供应链与养殖岗位常年招聘"
      },
      {
        "type": "暑期实习",
        "open": "约4-6月",
        "close": "约7月",
        "note": "暑期研发/生产/田间实习"
      },
      {
        "type": "秋招",
        "open": "约9-11月",
        "close": "招满即止",
        "note": "2027 届校招，研发岗偏好硕博"
      }
    ],
    "biz": "农业无人机、机器人与智慧农业",
    "jobs": "研发、算法、农艺、飞防服务",
    "major": "农机/自动化/农学/计算机",
    "applyLink": "https://www.xa.com/",
    "linkVerified": true,
    "linkCheckedAt": "2026-11-11",
    "linkIsCareer": false,
    "tags": [],
    "scale": "",
    "note": "",
    "certs": "",
    "english": "",
    "writtenTest": "",
    "interviews": "",
    "salary": "",
    "housing": "",
    "retention": "",
    "degree": "",
    "skills": "",
    "referral": "官网招聘栏目 / 官方招聘公众号",
    "source": "机构官网实测（2026-11-11，HTTP 200 且页面标题命中机构名）；批次时间按行业往年规律估算，用人要求为同类岗位通用规律",
    "confidence": "低"
  }
];
  var patches = [
  {
    "id": "med2-34",
    "url": "https://www.tongrentang.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "中国北京同仁堂（集团）有限责任公司官方网站"
  },
  {
    "id": "med2-38",
    "url": "https://www.yiling.cn/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "以岭药业"
  },
  {
    "id": "med2-36",
    "url": "https://www.999.com.cn/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "华润三九欢迎您-华润三九医药股份有限公司"
  },
  {
    "id": "med2-47",
    "url": "https://www.taiji.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "太极集团主页"
  },
  {
    "id": "med2-44",
    "url": "https://www.crjz.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "华润江中"
  },
  {
    "id": "med2-43",
    "url": "http://www.renhe.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "仁和集团官方网站官网-仁和集团官方网站"
  },
  {
    "id": "med-0",
    "url": "https://www.junshipharma.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "君实生物"
  },
  {
    "id": "med-1",
    "url": "https://www.henlius.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "复宏汉霖官网（2696.HK）：国际化创新生物制药公司"
  },
  {
    "id": "med2-26",
    "url": "https://www.pharmaron.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "Life Science Contract Research Organization | Pharmaron"
  },
  {
    "id": "med-2",
    "url": "https://www.tigermedgrp.com/zh/homepage",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "泰格医药 - 领先的合同研究组织（CRO）"
  },
  {
    "id": "med2-25",
    "url": "https://www.joinn-lab.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "JOINN Laboratories"
  },
  {
    "id": "med-9",
    "url": "https://www.bgi.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "华大基因 - 基因科技造福人类"
  },
  {
    "id": "med2-73",
    "url": "https://www.berrygenomics.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "贝瑞基因 | 北京贝瑞和康生物技术有限公司"
  },
  {
    "id": "med2-18",
    "url": "https://www.genscript.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "GenScript - Scripting Possibilities - The leader in molecular cloning and gene synthesis, peptide synthesis, protein and antibody engineering."
  },
  {
    "id": "med-5",
    "url": "https://www.united-imaging.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "联影医疗官方网站"
  },
  {
    "id": "med2-59",
    "url": "https://www.yuwell.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "Yuwell Medical Official Website"
  },
  {
    "id": "med2-61",
    "url": "https://microport.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "MicroPort | Advancing Global Patient Care with Innovative Medical Devices &amp; Technical Solutions"
  },
  {
    "id": "med2-68",
    "url": "https://www.autobio.com.cn/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "首页-安图生物-致力于医学实验室技术的普及和提高，为人类健康服务-郑州安图生物工程股份有限公司-股票代码603658"
  },
  {
    "id": "med2-70",
    "url": "https://www.maccura.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "迈克生物企业网"
  },
  {
    "id": "arch-29",
    "url": "https://www.zhubo.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "首页-筑博设计股份有限公司"
  },
  {
    "id": "arch-28",
    "url": "https://www.capol.cn/index.aspx",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "深圳市华阳国际工程设计股份有限公司 ▎实现设计的价值"
  },
  {
    "id": "arch-35",
    "url": "http://www.arcplus.com.cn/cn/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "华东建筑集团股份有限公司(简称: 华建集团)"
  },
  {
    "id": "tourism-16",
    "url": "https://www.jinjianghotels.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "锦江酒店"
  },
  {
    "id": "tourism-25",
    "url": "https://www.kaiyuanhotels.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "开元酒店集团官网"
  },
  {
    "id": "arch-19",
    "url": "http://www.ccdi.com.cn/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "CCDI悉地国际(悉地工程设计与顾问（上海）股份有限公司)"
  },
  {
    "id": "tourism-1",
    "url": "https://www.fliggy.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "飞机票查询-机票预订、酒店预订查询、客栈民宿、旅游度假、门票签证【飞猪旅行】"
  },
  {
    "id": "tourism-0",
    "url": "https://www.ly.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "同程旅行_旅游_旅游线路_旅行_出国旅游_自驾游_周边游_旅游网站"
  },
  {
    "id": "tourism-11",
    "url": "https://www.caissa.com.cn/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "凯撒旅游-凯撒国旅,5A旅行社,中国百强国际旅行社,您的旅游专家"
  },
  {
    "id": "tourism-8",
    "url": "https://www.cyts.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "中青旅官网(600138)_品质生活系统提供者_中国光大集团成员企业"
  },
  {
    "id": "tourism-7",
    "url": "https://www.springtour.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "春秋旅游网_春秋旅游官方网_跟团游_自由行_国内游_出境游_周边游"
  },
  {
    "id": "tourism-54",
    "url": "https://www.chinaoct.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "华侨城集团欢迎您"
  },
  {
    "id": "tourism-57",
    "url": "https://www.chimelong.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "长隆旅游度假区"
  },
  {
    "id": "media4-52",
    "url": "https://www.songcn.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "宋城集团|宋城演艺|宋城景区|宋城千古情|三亚千古情|丽江千古情|九寨千古情|杭州乐园|烂苹果乐园|第一世界大酒店"
  },
  {
    "id": "tourism-27",
    "url": "https://www.atour.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "Assyrian Information Management (AIM)"
  },
  {
    "id": "sports-2",
    "url": "https://www.erke.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "鸿星尔克门户网站 TO BE No.1"
  },
  {
    "id": "sports-5",
    "url": "https://www.qiaodan.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "中乔体育"
  },
  {
    "id": "sports-30",
    "url": "https://www.gotokeep.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "Keep(卡路里科技)-自律给我自由: 健身跑步瑜伽,达人力荐的运动社区"
  },
  {
    "id": "sports-29",
    "url": "https://www.codoon.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "咕咚 - 要运动,用咕咚"
  },
  {
    "id": "sports-86",
    "url": "https://www.migu.cn/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "咪咕-焕彩美好生活"
  },
  {
    "id": "sports-87",
    "url": "https://sports.qq.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "腾讯体育 - 看NBA足球网球赛车NFL"
  },
  {
    "id": "agri-59",
    "url": "https://www.jssk.com/",
    "checkedAt": "2026-11-11",
    "career": false,
    "title": "JSSK"
  },
  {
    "id": "agri-84",
    "url": "https://www.517lppz.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "良品铺子股份有限公司"
  },
  {
    "id": "agri-86",
    "url": "https://www.laiyifen.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "来伊份 &mdash; 新鲜零食 来自上海 全国3600+家专卖店"
  },
  {
    "id": "agri-87",
    "url": "https://www.yanjinpuzi.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "盐津铺子食品股份有限公司"
  },
  {
    "id": "med2-40",
    "url": "https://www.tasly.com/",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "天士力集团"
  },
  {
    "id": "sports-1",
    "url": "https://361sport.com/zh-cn",
    "checkedAt": "2026-11-11",
    "career": true,
    "title": "361® Official Store | Basketball &amp; Running Shoes, Top Sport Brand &ndash; 361sport"
  }
];
  return { updatedAt: "2026-11-11", companies: companies, patches: patches };
})();

(function () {
  function merge() {
    var D = window.DATA;
    if (!D || !D.companies) return false;
    var M = window.INTERN_MORE5;
    var byId = {}, byName = {};
    D.companies.forEach(function (c) { byId[c.id] = c; byName[c.name] = c; });
    var added = 0;
    M.companies.forEach(function (c) {
      if (byId[c.id] || byName[c.name]) return;
      D.companies.push(c); byId[c.id] = c; byName[c.name] = c; added++;
    });
    var linked = 0;
    M.patches.forEach(function (p) {
      var c = byId[p.id];
      if (!c || c.applyLink) return;
      c.applyLink = p.url; c.linkVerified = true; c.linkCheckedAt = p.checkedAt; c.linkIsCareer = p.career;
      linked++;
    });
    window.__INTERN_MORE5__ = { added: added, linked: linked };
    return true;
  }
  if (!merge()) document.addEventListener("DOMContentLoaded", merge);
})();
