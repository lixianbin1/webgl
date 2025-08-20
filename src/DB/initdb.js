import {mapType,tabletype} from './type.js';
import {formatDate} from '@/utils/common.js'
/*初始化数据库*/
const initdb = async (db) => { 
  try {
    // 尝试打开现有数据库
    await db.open(); 
    // 如果数据库已存在，Dexie会自动处理版本
    console.log("已有数据库版本:", db.verno);

    const data = await setMonsters(db,{x:0,z:0,level:1})
    console.log(data)
  } catch (error) {
    // 如果是全新数据库，定义初始结构
    if(db.verno < 0.1){
      db.version(0.1).stores(tabletype)
      console.log("新创建数据库版本:", db.verno, db.tables);
      await db.open();
      // 添加用户数据
      await db.users.add({ u_id:'001',name: 'admin', sex: '男', age: '18',color:'#6fcefd', birthday: '2025/08/11 09:00:00', money: '1000', reputation: '1000',x:'0', z:'0' })
      // 添加表注释
      await db.tableNames.add({ name: 'users', comment: '用户表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableNames.add({ name: 'maps', comment: '地图表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableNames.add({ name: 'daobing', comment: '道兵表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableNames.add({ name: 'wujiang', comment: '道兵仓库',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableNames.add({ name: 'duiwu', comment: '队伍组成',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableNames.add({ name: 'domain', comment: '领地表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      // 用户表
      await db.fields.add({ tableId: 'users', key: 'u_id', name: '用户ID' });
      await db.fields.add({ tableId: 'users', key: 'name', name: '名称' });
      await db.fields.add({ tableId: 'users', key: 'color', name: '势力颜色' });
      await db.fields.add({ tableId: 'users', key: 'sex', name: '性别' });
      await db.fields.add({ tableId: 'users', key: 'age', name: '年龄' });
      await db.fields.add({ tableId: 'users', key: 'birthday', name: '生日' });
      await db.fields.add({ tableId: 'users', key: 'money', name: '金额' });
      await db.fields.add({ tableId: 'users', key: 'reputation', name: '声望' });
      await db.fields.add({ tableId: 'users', key: 'x', name: 'X坐标' });
      await db.fields.add({ tableId: 'users', key: 'z', name: 'Z坐标' });
      // 地图表
      await db.fields.add({ tableId: 'maps', key: 'type', name: '地块类型' });
      await db.fields.add({ tableId: 'maps', key: 'typeName', name: '类型名称' });
      await db.fields.add({ tableId: 'maps', key: 'level', name: '等级' });
      await db.fields.add({ tableId: 'maps', key: 'belong', name: '归属' });
      await db.fields.add({ tableId: 'maps', key: 'monsters', name: '野怪' });
      await db.fields.add({ tableId: 'maps', key: 'stationed', name: '驻扎' });
      await db.fields.add({ tableId: 'maps', key: 'lastTime', name: '最后重置时间' });
      await db.fields.add({ tableId: 'maps', key: 'x', name: 'X坐标' });
      await db.fields.add({ tableId: 'maps', key: 'z', name: 'Z坐标' });
      // 兵种表
      await db.fields.add({ tableId: 'daobing', key: 'u_id', name: 'ID' });
      await db.fields.add({ tableId: 'daobing', key: 'name', name: '名称' });
      await db.fields.add({ tableId: 'daobing', key: 'rank', name: '等级' });
      await db.fields.add({ tableId: 'daobing', key: 'arm', name: '兵种' });
      await db.fields.add({ tableId: 'daobing', key: 'ack', name: '攻击' });
      await db.fields.add({ tableId: 'daobing', key: 'defense', name: '防御' });
      await db.fields.add({ tableId: 'daobing', key: 'speed', name: '速度' });
      await db.fields.add({ tableId: 'daobing', key: 'spell', name: '法术' });
      await db.fields.add({ tableId: 'daobing', key: 'range', name: '射程' });
      await db.fields.add({ tableId: 'daobing', key: 'modela', name: '主动' });
      await db.fields.add({ tableId: 'daobing', key: 'modelb', name: '被动' });
      await db.fields.add({ tableId: 'daobing', key: 'modelc', name: '指挥' });
      // 武将表
      await db.fields.add({ tableId: 'wujiang', key: 'name', name: '名称' });
      await db.fields.add({ tableId: 'wujiang', key: 'u_id', name: 'ID' });
      await db.fields.add({ tableId: 'wujiang', key: 'user_id', name: '所属用户' });
      await db.fields.add({ tableId: 'wujiang', key: 'daobing_id', name: '卡池表UID' });
      await db.fields.add({ tableId: 'wujiang', key: 'level', name: '等级' });
      await db.fields.add({ tableId: 'wujiang', key: 'exp', name: '经验' });
      // 队伍表
      await db.fields.add({ tableId: 'duiwu', key: 'name', name: '队伍名称' });
      await db.fields.add({ tableId: 'duiwu', key: 'type', name: '队伍站位' });
      await db.fields.add({ tableId: 'duiwu', key: 'team', name: '队伍编号' });
      await db.fields.add({ tableId: 'duiwu', key: 'wujiang_id', name: '武将表UID' });
      await db.fields.add({ tableId: 'duiwu', key: 'troops', name: '兵力' });
      await db.fields.add({ tableId: 'duiwu', key: 'ingured', name: '伤兵' });
      await db.fields.add({ tableId: 'duiwu', key: 'status', name: '状态' });
      await db.fields.add({ tableId: 'duiwu', key: 'ps', name: '体力' });
      await db.fields.add({ tableId: 'duiwu', key: 'x', name: 'X坐标' });
      await db.fields.add({ tableId: 'duiwu', key: 'z', name: 'Z坐标' });
      //势力表
      await db.fields.add({ tableId: 'domain', key: 'user_id', name: '用户id' });
      await db.fields.add({ tableId: 'domain', key: 'status', name: '状态' });
      await db.fields.add({ tableId: 'domain', key: 'lastTime', name: '最后重置时间' });
      await db.fields.add({ tableId: 'domain', key: 'x', name: 'X坐标' });
      await db.fields.add({ tableId: 'domain', key: 'z', name: 'Z坐标' });

      // 添加N兵种数据
      await db.daobing.add({ name: '鬼', u_id: 'N_190829001',rank:"N",ack:'10',defense:'10',speed:'10',spell:'10',range:'3',modela:[], modelb:[], modelc:[], arm:'诡'});
      await db.daobing.add({ name: '蛇', u_id: 'N_190829002',rank:"N",ack:'10',defense:'10',speed:'10',spell:'12',range:'1',modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '狼', u_id: 'N_190829003',rank:"N",ack:'10',defense:'12',speed:'10',spell:'10',range:'2',modela:[], modelb:[], modelc:[], arm:'兽'});
      // 添加R兵种数据
      await db.daobing.add({ name: '醉灵猴', u_id: 'N_190829004',rank:"R",ack:'60',defense:'40',speed:'70',spell:'10',range:'3',modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '黑虎', u_id: 'N_190829005',rank:"R",ack:'70',defense:'60',speed:'40',spell:'20',range:'2',modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '龟虽寿', u_id: 'N_190829006',rank:"R",ack:'30',defense:'92',speed:'30',spell:'40',range:'1',modela:[], modelb:[], modelc:[], arm:'兽'});
      // 添加S兵种数据
      await db.daobing.add({ name: '白虎', u_id: 'N_190829007',rank:"S",ack:'70',defense:'70',speed:'70',spell:'20',range:'3',modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '白狼', u_id: 'N_190829008',rank:"S",ack:'70',defense:'70',speed:'70',spell:'20',range:'2',modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '白蛇', u_id: 'N_190829009',rank:"S",ack:'70',defense:'70',speed:'70',spell:'20',range:'1',modela:[], modelb:[], modelc:[], arm:'兽'});
      // 添加SR兵种数据
      await db.daobing.add({ name: '白鬼', u_id: 'N_190829010',rank:"SR",ack:'70',defense:'70',speed:'70',spell:'20',range:'3',modela:[], modelb:[], modelc:[], arm:'诡'});
      await db.daobing.add({ name: '蛇蛊', u_id: 'N_190829011',rank:"SR",ack:'70',defense:'70',speed:'70',spell:'20',range:'1',modela:[], modelb:[], modelc:[], arm:'诡'});
      await db.daobing.add({ name: '飞虎', u_id: 'N_190829012',rank:"SR",ack:'70',defense:'70',speed:'70',spell:'20',range:'2',modela:[], modelb:[], modelc:[], arm:'诡'});
      // 添加SS兵种数据
      await db.daobing.add({ name: '树龙', u_id: 'N_190829013',rank:"SS",ack:'70',defense:'70',speed:'70',spell:'20',range:'3',modela:[], modelb:[], modelc:[], arm:'兽'});
      // 添加SSS兵种数据
      await db.daobing.add({ name: '六耳猕猴', u_id: 'N_190829014',rank:"SSS",ack:'70',defense:'70',speed:'70',spell:'20',range:'3',modela:[], modelb:[], modelc:[], arm:'兽'});
      // 添加队伍数据
      await db.wujiang.add({ name: '鬼',u_id:'D_190829003', user_id:'001',daobing_id: 'N_190829001',level:'10',exp:'10'});
      await db.wujiang.add({ name: '蛇',u_id:'D_190829002',user_id:'001',daobing_id: 'N_190829002',level:'10',exp:'10'});
      await db.wujiang.add({ name: '狼',u_id:'D_190829001',user_id:'001',daobing_id: 'N_190829003',level:'10',exp:'12'});
      // 添加队伍数据
      await db.duiwu.add({ name: '鬼', type:'3',team:'1',wujiang_id: 'D_190829003',troops:'1000',ingured:'0',status:'1',ps:'100',x:'0',z:'0'});
      await db.duiwu.add({ name: '蛇', type:'2',team:'1',wujiang_id: 'D_190829002',troops:'1000',ingured:'0',status:'1',ps:'100',x:'0',z:'0'});
      await db.duiwu.add({ name: '狼', type:'1',team:'1',wujiang_id: 'D_190829001',troops:'1000',ingured:'0',status:'1',ps:'100',x:'0',z:'0'});

      initmapData(db)
      initDomain(db)


    }
  }
  // battleing()
}

/*初始化地图数据*/
export const initmapData = async (db,length = 3) => {
  try {
    await db.table('maps').clear();
    const halfSize = Math.floor(length / 2);
    // 生成地图数据
    const mapsData = [];
    for (let x = -halfSize; x <= halfSize; x++) {
      for (let z = -halfSize; z <= halfSize; z++) {
        // 随机生成类型和等级
        const type = Math.floor(Math.random() * 5) + 1;
        const level = Math.floor(Math.random() * 5) + 1;
        // const data = setMonsters(db,{x,z})
        mapsData.push({
          x: x,
          z: z,
          type: type,
          typeName: `${mapType[type]}`,
          level: level,
          belong:null,
          monsters:'',
          stationed:null,
        });
      }
    }

    // 批量插入到 maps 表中
    await db.table('maps').bulkAdd(mapsData);
  } catch (error) {
    console.error("生成 Maps 数据时出错:", error);
  }
};
/*初始化领地数据*/
export const initDomain = async (db) => { 
  const users = await db.table('users').toArray();
  for (const user of users) { 
    // 计算查询范围
    const minX = user.x - 1;
    const maxX = user.x + 1;
    const minZ = user.z - 1;
    const maxZ = user.z + 1;
    console.log(minX);
    console.log(await db.table('maps').toArray())
    // 查询数据库，获取范围内的所有数据
    const results = await db.table('maps')
    .where('[x+z]')
    .between([minX, minZ], [maxX, maxZ])
    .toArray();

    // 将结果存入 Map
    await db.table('domain').where('user_id').equals(user.u_id).delete();
    results.forEach(async(result) => {
      console.log(result);
      db.table('domain').add({ user_id:user.u_id, status:'1', lastTime: formatDate(), x:result.x,z:result.z });
    });
  }
};
export default initdb;