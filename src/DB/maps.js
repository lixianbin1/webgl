import {db} from './db.js';

/* 查询表数据*/
// export const queryXZData = async({x,z})=>{
//   try {
//     const result = await db.table('maps').where('[x+z]').equals([x,z]).first();
//     return result;
//   } catch (error) {
//     return { code: 500, message: '查询失败',error };
//   }
// }

export const queryXZData = async ({ x, z, range }) => {
  try {
      console.log('查询范围:', x, z, range);
      // 创建一个 Map 来存储查询结果
      const dataMap = new Map();

      // 计算查询范围
      const minX = x - range;
      const maxX = x + range;
      const minZ = z - range;
      const maxZ = z + range;

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