import PouchDB from 'pouchdb';

const db = new PouchDB('my_db'); // 获取数据库

// 只在第一次启动时写入示例数据
async function initData() {
  try {
    // 如果已经有数据就不重复写
    const info = await db.info();
    if (info.doc_count === 0) {
      await db.bulkDocs([
        { _id: 'user:1', name: '张三', age: 28 },
        { _id: 'user:2', name: '李四', age: 25 }
      ]);
      console.log('初始化数据已写入');
    }
  } catch (err) {
    console.error(err);
  }
}

initData();