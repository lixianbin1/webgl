import {db} from './db.js';

export const queryXZData = async ({ x, z, range }) => {
  try {
      console.log('查询范围:', x, z, range);
      // 创建一个 Map 来存储查询结果
      const dataMap = new Map();

      // 计算查询范围
      const minX = user.x - range;
      const maxX = user.x + range;
      const minZ = user.z - range;
      const maxZ = user.z + range;

      // 查询数据库，获取范围内的所有数据
      const results = await db.table('maps')
      .where('[x+z]')
      .between([minX, minZ], [maxX, maxZ], true, true)
      .toArray();

      // 将结果存入 Map
      results.forEach(result => {
          const key = `${result.x},${result.z}`;
          dataMap.set(key, result);
      });

      return dataMap;
  } catch (error) {
      console.error('查询失败', error);
      return { code: 500, message: '查询失败', error };
  }
};

export const createDomain = async ({x,z}) => { 
    const users = await db.table('users').toArray();
    for (const user of users) { 
      // 计算查询范围
      const minX = x - 1;
      const maxX = x + 1;
      const minZ = z - 1;
      const maxZ = z + 1;

      // 查询数据库，获取范围内的所有数据
      const results = await db.table('maps')
      .where('[x+z]')
      .between([minX, minZ], [maxX, maxZ], true, true)
      .toArray();

      // 将结果存入 Map
      results.forEach(result => {
        db.table('domain').add({ user_id:user.u_id, status:'1', lastTime: formatDate(), x:result.x,z:result.z });
      });
    }
};