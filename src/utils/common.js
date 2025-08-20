/* 函数集合 */
// 时间格式化
export function formatDate(format = 'YYYY/MM/DD hh:mm:ss',date = new Date()) {
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