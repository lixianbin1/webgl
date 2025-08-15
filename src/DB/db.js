import Dexie from 'dexie';
import initdb from './initdb.js'
// 定义数据库和表结构
export let db = new Dexie('MyAppDB');

/* 初始化数据库数据 */
await initdb(db)

/* 查询：数据库表的列表 */
export const getTable = async({page,size}) => {
  console.log('查询数据库表列表','tableComments')
  return await getTableData({name:'tableComments',page,size})
}

/* 添加：数据库的新表 */
export const addTable = async ({ name, comment, keys }) => {
  console.log('添加数据库表',name)
  let schemaStr = Array.isArray(keys) ? keys.join(', ') : String(keys);
  schemaStr = '++id,' + schemaStr;

  // 检查表是否存在
  const existingTables = db.tables.map(t => t.name);
  if (existingTables.includes(name)) {
    return { code: 400, message: '表已存在' };
  }

  // 记录版本号及更新
  const Version = db.verno || 1;
  const newVersion = Version + 0.1;

  // 获取旧数据库架构
  let obj = {};
  db.tables.forEach(table => {
    let schema = table.schema;
    let str = schema.primKey.src;
    schema.indexes.forEach(item => {
      str += `,${item.name}`;
    });
    obj[table.name] = str;
  });
  const oldObj = { ...obj };
  obj[name] = schemaStr;

  // 创建新的数据库实例
  try {
    db.close();
    db = new Dexie('MyAppDB');
    db.version(newVersion).stores(obj);
    await db.open();
    await db.table('tableComments').add({ name, comment, createTime: formatDate(), createUser: 'admin' });
    return { code: 200, message: '创建成功' };
  } catch (error) {
    db = new Dexie('MyAppDB');
    db.version(Version).stores(oldObj);
    await db.open();
    return { code: 500, message: '创建失败' };
  }
};

/* 删除: 删除数据库表 */
export const delTable = async({name,id}) => { 
  console.log('删除数据库表',name)
  const Version = db.verno || 1;
  const newVersion = Version + 1;

  let obj = {}
  db.tables.map(table => {
    if(table.name !== name) {
      let schema = table.schema
      let str = schema.primKey.src
      schema.indexes.map(item => {
        str += `,${item.name}`
      })
      obj[table.name] = str
    }
  })

  try {
    // 打开新的数据库实例
    db.close();
    db = new Dexie('MyAppDB');
    db.version(newVersion).stores(obj);
    await db.table('tableComments').delete(id);
    return { code: 200, message: '删除成功' };
  } catch (error) {
    console.error('删除表失败:', error);
    return { code: 500, message: '删除失败' };
  }
};

/* 修改: 修改数据库表 */
export const upTable = async({oldName,name,comment,keys}) => {
  console.log('修改数据库表',name) 
  let schemaStr = Array.isArray(keys) ? keys.join(', ') : String(keys);
  schemaStr = '++id,' + schemaStr;

  // 检查表是否存在
  console.log(db.isOpen())
  const existingTables = db.tables.map(t => t.name);
  console.log(existingTables,name)
  if (!existingTables.includes(name)) {
    return { code: 400, message: '表不存在' };
  }
  // 记录版本号及更新
  const Version = db.verno || 1;
  const newVersion = Version + 0.1;

  // 获取旧数据库架构
  let obj = {};
  db.tables.forEach(table => {
    let schema = table.schema;
    let str = schema.primKey.src;
    schema.indexes.forEach(item => {
      str += `,${item.name}`;
    });
    obj[table.name] = str;
  });
  const oldObj = { ...obj };
  if(oldName) obj[oldName] = undefined
  const oldData = db.table('tableComments').where('name').equals(oldName);
  obj[name] = schemaStr;

  console.log(obj)
  // 创建新的数据库实例
  try {
    oldData.delete()
    db.close();
    db = new Dexie('MyAppDB');
    db.version(newVersion).stores(obj);
    await db.open();
    await db.table('tableComments').add({ name, comment, createTime: formatDate(), createUser: 'admin' });
    return { code: 200, message: '修改成功' };
  } catch (error) {
    db = new Dexie('MyAppDB');
    db.version(Version).stores(oldObj);
    await db.open();
    
    return { code: 500, message: '修改失败' };
  }
}

/* 导出：整个数据库*/
export async function exportDB() { 
  const tables = db.tables;
  const databaseData = {};

  for (const table of tables) {
    const tableName = table.name;
    const data = await table.toArray();
    databaseData[tableName] = data;
  }
  const jsonData = JSON.stringify(databaseData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  console.log(jsonData)
  return  blob
}

/* 查询：单个表的数据 */
export const getTableData = async({name,page=1,size=Infinity}) => {
    console.log('查询单个表数据',name)
    let table = db.table(name);
    let indexes = table.schema.indexes
    let columes = [{label:'ID',prop:'id',}] //表头
    if (indexes.length > 0) {
      indexes.forEach(index => {
        columes.push({label:index.name, prop:index.name,})
      });
    }
    if (size === Infinity) { //查询所有数据
      const res = await table.toArray();
      return {code:200,data:res,columes}
    } else { //分页查询
      const offset = (page - 1) * size;
      const res = await table.offset(offset).limit(size).toArray();
      return {code:200,data:res,columes,page:page,size:size,total:await table.count()}
    }
}

/* 添加：单个表添加数据 */
export const addTableData = async(name, schema) => {
  console.log('添加表数据',schema)
  let table = db.table(name);
  await table.add(schema);
  return {code:200,message:'添加成功'};
}
/* 删除：单个表删除数据 */
export const deleteTableData = async(name, id) => {
  let table = db.table(name);
  await table.delete(id);
  return {code:200,message:'删除成功'};
}
/* 修改：单个表修改数据 */
export const updateTableData = async({name,id}, schema) => { 
  let table = db.table(name);
  const data = await table.update(id,schema);
  console.log(data,{name,id}, schema);
  if(data > 0) {
    return {code:200,message:'修改成功'};
  } else {
    return {code:500,message:'修改失败'};
  }
}

/* 导出：导出单个表数据*/
export const exportTableData = async(name) => { 
  let table = db.table(name);
  const data = await table.toArray();
  const databaseData ={}
  databaseData[name] = data;
  const jsonData = JSON.stringify(databaseData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  console.log(jsonData);
  return blob;
}

/* 函数集合 */
// 时间格式化
function formatDate(format = 'YYYY/MM/DD hh:mm:ss',date = new Date()) {
  const map = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    hh: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
  };
  return format.replace(/YYYY|MM|DD|hh|mm|ss/g, (match) => map[match]);
}