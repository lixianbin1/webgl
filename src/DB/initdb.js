import {mapType} from './type.js';
const initdb = async (db,start) => { 
  try {
    // 尝试打开现有数据库
    await db.open(); 
    // 如果数据库已存在，Dexie会自动处理版本
    console.log("已有数据库版本:", db.verno, db.tables);
  } catch (error) {
    // 如果是全新数据库，定义初始结构
    if(db.verno < 0.1){
      db.version(0.1).stores({
        users: '++id, name, sex, age, birthday, money, reputation,x, z,',
        // 名称，性别，年龄，生日，余额，声望
        maps: '++id, x, z, type,typeName, level',
        // x, z, 类型,类型名称，等级
        tableComments: '++id, name, comment, createTime, createUser'
        // 表名，注释，创建时间，创建用户
      })
      console.log("新创建数据库版本:", db.verno, db.tables);
      await db.open();
      await generateMapsData(db,3);
      await db.users.add({ name: 'admin', sex: '男', age: 18, birthday: '2025/08/11 09:00:00', money: 1000, reputation: 1000,x:0, z:0 })
      await db.tableComments.add({ name: 'users', comment: '用户表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
      await db.tableComments.add({ name: 'maps', comment: '地图表',createTime:'2025/08/11 09:00:00',createUser:'admin' });
    }
  }
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
        mapsData.push({
          x: x,
          z: z,
          type: type,
          typeName: `${mapType[type]}`,
          level: level
        });
      }
    }

    // 批量插入到 maps 表中
    await db.maps.bulkAdd(mapsData);
  } catch (error) {
    console.error("生成 Maps 数据时出错:", error);
  }
};

export default initdb;