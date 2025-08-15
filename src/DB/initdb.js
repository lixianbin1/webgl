import {mapType,tabletype,levelType} from './type.js';
import {battleing} from './battle.js';
const initdb = async (db,start) => { 
  try {
    // 尝试打开现有数据库
    await db.open(); 
    // 如果数据库已存在，Dexie会自动处理版本
    console.log("已有数据库版本:", db.verno);

    const data = setMonsters(db,{x:0,z:0,level:1})
  } catch (error) {
    // 如果是全新数据库，定义初始结构
    if(db.verno < 0.1){
      db.version(0.1).stores(tabletype)
      console.log("新创建数据库版本:", db.verno, db.tables);
      await db.open();
      await generateMapsData(db,5);

      await db.users.add({ name: 'admin', sex: '男', age: 18, birthday: '2025/08/11 09:00:00', money: 1000, reputation: 1000,x:0, z:0 })

      await db.tableComments.add({ name: 'users', comment: '用户表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableComments.add({ name: 'maps', comment: '地图表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableComments.add({ name: 'daobing', comment: '兵种表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableComments.add({ name: 'wujiang', comment: '武将',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableComments.add({ name: 'duiwu', comment: '队伍',createTime:'2025/08/11 09:00:00',createUser:'admin' });

      await db.daobing.add({ name: '醉灵猴', u_id: 'N_190829004',rank:"R",ack:60,defense:40,speed:70,spell:10,range:3,modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '黑虎', u_id: 'N_190829005',rank:"R",ack:70,defense:60,speed:40,spell:20,range:2,modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '龟虽寿', u_id: 'N_190829006',rank:"R",ack:30,defense:92,speed:30,spell:40,range:1,modela:[], modelb:[], modelc:[], arm:'兽'});

      await db.daobing.add({ name: '鬼', u_id: 'N_190829001',rank:"N",ack:10,defense:10,speed:10,spell:10,range:3,modela:[], modelb:[], modelc:[], arm:'诡'});
      await db.daobing.add({ name: '蛇', u_id: 'N_190829002',rank:"N",ack:10,defense:10,speed:10,spell:12,range:1,modela:[], modelb:[], modelc:[], arm:'兽'});
      await db.daobing.add({ name: '狼', u_id: 'N_190829003',rank:"N",ack:10,defense:12,speed:10,spell:10,range:2,modela:[], modelb:[], modelc:[], arm:'兽'});

      await db.wujiang.add({ name: '鬼',u_id:'D_190829003', daobing_id: 'N_190829001',level:10,exp:10});
      await db.wujiang.add({ name: '蛇',u_id:'D_190829002', daobing_id: 'N_190829002',level:10,exp:10});
      await db.wujiang.add({ name: '狼',u_id:'D_190829001', daobing_id: 'N_190829003',level:10,exp:12});

      await db.duiwu.add({ name: '鬼', type:'3',wujiang_id: 'D_190829003',troops:1000,ingured:0});
      await db.duiwu.add({ name: '蛇', type:'2',wujiang_id: 'D_190829002',troops:1000,ingured:0});
      await db.duiwu.add({ name: '狼', type:'1',wujiang_id: 'D_190829001',troops:1000,ingured:0});
    }
  }
  // battleing()
}

// 生成地图数据
export const generateMapsData = async (db,length = 3) => {
  try {
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
    await db.maps.bulkAdd(mapsData);
  } catch (error) {
    console.error("生成 Maps 数据时出错:", error);
  }
};

export const setMonsters = async (db,{x,z,level}) => {
  const team = []
  const rank = levelType[level]
  let data = db.table('daobing').where('[rank+range]').between([rank,3],[rank,5]).toArray()
  console.log(111,data)
  let random = Math.floor(Math.random() * data.length);
  team.push(data[random])
  data = db.table('daobing').where('[rank+range]').between([rank,2],[rank,4]).toArray()
  random = Math.floor(Math.random() * data.length);
  team.push(data[random])
  data = db.table('daobing').where('[rank+range]').between([rank,1],[rank,3]).toArray()
  random = Math.floor(Math.random() * data.length);
  team.push(data[random])

  console.log(111,team)
  return data
};

export default initdb;