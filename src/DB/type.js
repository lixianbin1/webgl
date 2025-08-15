export const tabletype = {
  //id 名称，性别，年龄，生日，余额，声望
  users: '++id, name, sex, age, birthday, money, reputation,x, z',

  //id x, z, 类型,类型名称，等级 归属
  maps: '++id, x, z,[x+z],type,typeName, level,belong,monsters,stationed',
  
  //id, 表名，注释，创建时间，创建用户
  tableComments: '++id, name, comment, createTime, createUser',

  //id, 名称，uid，武力，防御，速度，法术，射程，被动，主动，指挥，兵种
  daobing: '++id, name, rank, ack, defense, speed, spell, range, modela, modelb, modelc, arm',

  //id，名称，daobing_id, 等级，经验
  wujiang: '++id, name, u_id, daobing_id, level, exp',

  //id 名称 队伍 wujiang_id 等级 兵力 伤兵
  duiwu: '++id, name, type , wujiang_id, troops,ingured',
}
export const mapType = {
  '1': '平地',
  '2': '农田',
  '3': '森林',
  '4': '石矿',
  '5': '铁矿'
}