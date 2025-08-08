import Dexie from 'dexie';

// 定义数据库和表结构
export const db = new Dexie('MyAppDB');
db.version(1).stores({
    users: '++id, title, price',
    friends: '++id, name, age',
    tableComments: '++id, tableName, comment' // 用于存储表的备注信息
}).upgrade(async (trans) => {
    console.log(trans);
    // 初始化数据
    await trans.table('users').add({ title: 'iPhone', price: 5999 });
    await trans.table('friends').add({ name: 'Alice', age: 25 });
    await trans.table('tableComments').add({ tableName: 'users', comment: '用户表' });
    await trans.table('tableComments').add({ tableName: 'friends', comment: '朋友表' });
});
console.log('Current Database Version:', db.verno)

// 获取表信息
export const getTable = async() => {
    const data = await getTableDate({name:'tableComments'})
    return {
        code:200,
        data
    }
}

export const addTable = async ({ name, comment }) => {
    // 表头
    const schemaStr = Array.isArray(comment) ? comment.join(', ') : String(comment);
  
    // 检查表是否存在
    const existingTables = db.tables.map(t => t.name);
    if (existingTables.includes(name)) {
      return { code: 400, message: '表已存在' };
    }
  
    // 版本号
    const currentVersion = db.verno || 1;
    const newVersion = currentVersion + 1;
    db.close();
  
    // 创建新数据库实例
    const newDb = new Dexie('MyAppDB');
    newDb.version(newVersion).stores({
      ...db.tables.reduce((acc, table) => ({ ...acc, [table.name]: table.schema.src }), {}),
      [name]: schemaStr
    });
  
    try {
      // 打开新的数据库实例
      await newDb.open();
      return { code: 200, message: '创建成功' };
    } catch (error) {
      console.error('创建表失败:', error);
      return { code: 500, message: '创建失败' };
    }
  };

// 获取表数据
export const getTableDate = async({name,page=1,size=Infinity}) => {
    let table = db.table(name);
    if (size === Infinity) {
        // 查询所有数据
        const res = await table.toArray();
        return {code:200,data:res}
      } else {
        // 分页查询
        const offset = (page - 1) * size;
        const res = await table.offset(offset).limit(size).toArray();
        return {code:200,data:res}
      }
}

// 添加表数据
export const addTableData = async(name, schema) => {
    let table = db.table(name);
    await table.add(schema);
    return {code:200,message:'添加成功'};
}


// 单表操作类
export class d {
  constructor() {
    this.table = db.friends;
  }

  add = (friend) => this.table.add(friend);
  remove = (id) => this.table.delete(id);
  get = (id) => this.table.get(id);
  getAll = () => this.table.toArray();
  getByName = (name) => this.table.where('name').equals(name).toArray();
  paginate = (page = 0, size = 10) =>
    this.table.offset(page * size).limit(size).toArray();
  fuzzySearch = (kw) =>
    this.table.where('name').startsWithIgnoreCase(kw).toArray();
  update = (id, changes) => this.table.update(id, changes);
}

// 动态表管理类
export class DbAdmin {
  constructor() {
    this.db = db;
  }

  async createOrMigrateTable(tableName, schema) {
    const schemaStr = Array.isArray(schema) ? schema.join(', ') : String(schema);

    const currentVersion = this.db.verno || 1;
    const newVersion = currentVersion + 1;

    this.db.close();

    const newDb = new Dexie('MyAppDB');
    newDb.version(newVersion).stores({
      ...this.db._dbSchema.stores,
      [tableName]: schemaStr
    });

    await newDb.open();
    this.db = newDb;

    console.log(`✅ ${tableName} 已创建/迁移到版本 ${newVersion}`);
  }

  clearTable = (name) => this.db.table(name).clear();
  dropDatabase = () => this.db.delete();

}