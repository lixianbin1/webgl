const users = [ //用户表
  '++id', // id自增
  'u_id', // ID
  'name', // 名称
  'sex',  // 性别
  'age',  // 年龄
  'birthday',  // 生日
  'money',     // 金额
  'reputation',// 声望
  'x', // x坐标
  'z', // z坐标
  '[x+z]'
].toString()
const maps = [ //地图表
  '++id', // id自增
  'type',      // 地块类型
  'typeName',  // 类型名称
  'level',     // 等级
  'belong',    // 归属
  'monsters',  // 野怪
  'stationed', // 驻扎
  'lastTime',  // 最后重置时间'
  'x', // x坐标
  'z', // z坐标
  '[x+z]'
].toString()
const tableComments = [ //表注释
  '++id', // id自增
  'name', // 表名
  'comment', // 注释
  'createTime', // 创建时间
  'createUser'  // 创建用户
].toString()
const daobing = [ //兵种表
  '++id', // id自增
  'u_id', // ID
  'name', // 名称
  'rank', // 等级
  'arm',  // 兵种
  'ack',     // 攻击
  'defense', // 防御
  'speed',   // 速度
  'spell',   // 法术
  'range',   // 射程
  'modela',  // 主动
  'modelb',  // 被动
  'modelc',  // 指挥
  '[rank+range]'
].toString()
const wujiang = [ //武将表
  '++id', // id自增
  'name', // 名称
  'u_id', // ID
  'user_id',    //所属用户
  'daobing_id', //卡池表uid
  'level', // 等级
  'exp',   // 经验
].toString()
const duiwu = [ //队伍表
  '++id', // id自增
  'name', // 队伍名称
  'type', // 队伍站位
  'team', // 队伍编号
  'wujiang_id', //武将表uid
  'troops',  // 兵力
  'ingured', // 伤兵,
  'status',  // 状态, 1：正常, 2：疲劳 3: 受伤
  'ps',// 体力
  'x', // x坐标
  'z', // z坐标
  '[x+z]',
].toString()
export const tabletype = {
  users,
  maps,
  tableComments,
  daobing,
  wujiang,
  duiwu,
}
// 类型对应队伍
export const levelType = {
  '1': 'N', // 新手
  '2': 'R', // 菜鸟
  '3': 'S', // 正常
  '4': 'SR', // 精英
  '5': 'SS',// 宗师
  '6': 'SSS',// 大宗师
}
export const mapType = {
  '1': '平地',
  '2': '农田',
  '3': '森林',
  '4': '石矿',
  '5': '铁矿'
}