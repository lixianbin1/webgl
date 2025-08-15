import {db} from './db.js';

const a = [
    {
        leader:{
          name:'醉灵猴', //名字
          u_id:'N_190829004', //卡片ID
          grade:1,      //等级
          exp:100,      //经验
          ack:60,       //武力
          defense:40,   //防御
          speed:70,     //速度
          spell:10,     //法术
          range:3,      //射程
          modela:[],  //被动 必放
          modelb:[],  //主动 几率
          modelc:[],  //指挥 
        },
        type:'3',      //大营
        troops:100,   //兵力
        ingured:0,    //伤兵 //没弄
        arm:'兽'      //兵种 兽->精->诡->
      },
      {
        leader:{
          name:'黑虎', //名字
          u_id:'N_190829005', //卡片ID
          grade:1,      //等级
          exp:100,      //经验
          ack:70,       //武力
          defense:60,   //防御
          speed:40,     //速度
          spell:20,     //法术
          range:2,      //射程
          modela:[],  //被动 必放
          modelb:[],  //主动 几率
          modelc:[],  //指挥 
        },
        type:'2',      //中
        troops:100,   //兵力
        ingured:0,    //伤兵 //没弄
        arm:'兽'      //兵种 兽->精->诡->
      },
      {
        leader:{
          name:'龟虽寿', //名字
          u_id:'N_190829006', //卡片ID
          grade:1,      //等级
          exp:100,      //经验
          ack:30,       //武力
          defense:92,   //防御
          speed:30,     //速度
          spell:40,     //法术
          range:1,      //射程
          modela:[],  //被动 必放
          modelb:[],  //主动 几率
          modelc:[],  //指挥 
        },
        type:'1',
        troops:100,   //兵力
        ingured:0,    //伤兵 //没弄
        arm:'兽'      //兵种 兽->精->诡->
      },
]

const b = [
    {
        leader:{
          name:'鬼', //名字
          u_id:'N_190829001', //卡片ID
          grade:10,      //等级
          exp:100,      //经验
          ack:10,       //武力
          defense:10,   //防御
          speed:10,     //速度
          spell:10,     //法术
          range:3,      //射程
          modela:[],  //被动 必放
          modelb:[],  //主动 几率
          modelc:[],  //指挥 
        },
        type:'3',      //大营
        troops:200,   //兵力
        ingured:0,    //伤兵 //没弄
        arm:'诡'      //兵种 兽->精->诡->
      },
      {
        leader:{
          name:'蛇', //名字
          u_id:'N_190829002', //卡片ID
          grade:10,      //等级
          exp:100,      //经验
          ack:10,       //武力
          defense:10,   //防御
          speed:10,     //速度
          spell:10,     //法术
          range:2,      //射程
          modela:[],  //被动 必放
          modelb:[],  //主动 几率
          modelc:[],  //指挥 
        },
        type:'2',      //中
        troops:200,   //兵力
        ingured:0,    //伤兵 //没弄
        arm:'兽'      //兵种 兽->精->诡->
      },
      {
        leader:{
          name:'狼', //名字
          u_id:'N_190829003', //卡片ID
          grade:10,      //等级
          exp:100,      //经验
          ack:10,       //武力
          defense:12,   //防御
          speed:10,     //速度
          spell:40,     //法术
          range:1,      //射程
          modela:[],  //被动 必放
          modelb:[],  //主动 几率
          modelc:[],  //指挥 
        },
        type:'1',
        troops:200,   //兵力
        ingured:0,    //伤兵 //没弄
        arm:'兽'      //兵种 兽->精->诡->
      },
]

// 对象拷贝
function DeepClone(source){
  const targetObj = source.constructor === Array ? [] : {};
  for(let keys in source){
    if(source.hasOwnProperty(keys)){
      if(source[keys] && typeof source[keys] === 'object'){
        targetObj[keys] = source[keys].constructor === Array ? [] : {};
        targetObj[keys] = DeepClone(source[keys]);
      }else{
        targetObj[keys] = source[keys];
      }
    }
  }
  return targetObj;
}
// 战斗回合(所以人,回合数)
function Round(arr,num=8){
  console.log('----------------------------战斗开始---------------------')
  const initialState = DeepClone(arr);
  let queue=Queue(arr) //获取战斗顺序
  for(let i=1;i<=num;i++){
    console.log('----------------------------第'+i+'回合---------------------')

    Combat(queue,arr)
    let type=Winlose(arr,i)
    if(type){
      break;
    }
  }
  console.log('---------------------------战斗结束----------------------')
  PrintResults(arr, initialState)
}
// 战斗顺序（战斗队伍）
function Queue(arr){
    let array=[]
    for(let i=0;i<arr.length;i++){
        let [...arr1]=arr[i];
        for(let k=0;k<arr1.length;k++){
        array.push(arr1[k])
        }
    }
    for(let i=0;i<array.length;i++){
        array[i].leader.speed=(array[i].leader.speed+Math.random()).toFixed(3)
    }
    array.sort(function(a,b){
        return b.leader.speed - a.leader.speed
    })
    return array
}
  
//普通攻击(顺序，所有，阵营，当前，对象，索引)
function Average(queue,array,camp,role,bei,len){
let modulus //伤害系数
let propert //属性
if(bei.length){
    if(role.leader.ack>bei[len].leader.defense){
    propert=role.leader.ack - bei[len].leader.defense
    }else{
    propert=0
    }
    //(Math.random()-0.5)*0.02 随机数,伤害误差
    if(role.troops.toString().length<=3){
    modulus=0.087+propert*0.0035+(Math.random()-0.5)*0.02
    }else if(role.troops.toString().length<=4){
    modulus=0.0876+propert*0.0035+(Math.random()-0.5)*0.02
    }else{
    modulus=0.08764+propert*0.0035+(Math.random()-0.5)*0.02
    }
    //兵种相克 伤害10% 被打10%
    let num=tackType(role,bei[len])
    let shahai=Math.ceil(modulus*role.troops*num)

    console.log(role.leader.name+'释放普通攻击,对'+bei[len].leader.name+',造成'+shahai)
    if(bei[len].troops - shahai<0){
    bei[len].troops=0
    for(let ka in array[1-camp]){ //删除死人
        if(!array[1-camp][ka].troops){
        array[1-camp].splice(ka,1)
        }
    }
    for(let ki in queue){ //删除排序
        if(!queue[ki].troops){
        queue.splice(ki,1)
        }
    }
    }else{
      bei[len].troops=bei[len].troops-shahai
    }
    console.log(bei[len].leader.name+'剩余'+bei[len].troops)
}
}
//兵种相克
function tackType(role,obj){
let arm=role.arm+obj.arm
switch(arm){
    case "兽精":case "精诡":case "诡兽":
    return 1.1
    case "兽兽":case "精精":case "诡诡":
    return 1
    case "兽诡":case "精兽":case "诡精":
    return 0.9
}
}
//判断输赢
function Winlose(array,i){
if(!i){i=1}
if(array[0].length<=0){
    if(!status){
    status=true
    console.log('失败')
    }
    return true
}else if(array[1].length<=0){
    if(!status){
    status=true
    console.log('胜利')
    }
    return true
}else if(i==8){
    if(!status){
    status=true
    console.log('平局')
    }
    return true
}
return false
}

//执行战斗（顺序，所有）
function Combat(queue,array){
for(let i=0;i<queue.length;i++){
    Winlose(array)
    let u_id=queue[i].leader.u_id //攻击者ID
    let camp,dist //camp阵营 dist无效射程 
    for(let x in array){
    for(let y in array[x]){
        if(u_id==array[x][y].leader.u_id){ //通过ID 获取阵营和站位被扣射程
        dist=array[x].length - y - 1
        camp=x
        }
    }
    }
    let cante //判断有效射程
    if(queue[i].leader.range>dist){ //射程大于被扣射程
    if(queue[i].leader.range - dist>array[1-camp].length){
        cante=array[1 - camp].length
    }else{
        cante=queue[i].leader.range - dist
    }
    }else{
    cante=0
    }
    let bei=[] //判断有效目标
    for(let i=0;i<cante;i++){
    let n=array[1-camp].length-i-1
    bei.push(array[1-camp][n])
    }
    //获取随机索引值，偏向第一人
    let len=Math.floor(Math.random()*bei.length)
    Average(queue,array,camp,queue[i],bei,len) //顺序，所有，阵营，当前，对象，索引
    let type=Winlose(array)
    if(type){
    return false
    }
}
}

// 打印所有队伍的结果
function PrintResults(currentState, initialState) {
  console.log('---------------------------战斗结果----------------------');
  for (let i = 0; i < currentState.length; i++) {
    console.log('队伍 ' + (i + 1) + ' 的结果:');
    for (let j = 0; j < initialState[i].length; j++) {
      const initialUnit = initialState[i][j];
      const currentUnit = currentState[i].find(unit => unit.leader.u_id === initialUnit.leader.u_id) || { troops: 0 };

      console.log(
        '  ' +
        initialUnit.leader.name +
        '（' +
        initialUnit.type +
        '）初始兵力: ' +
        initialUnit.troops +
        ', 剩余兵力: ' +
        currentUnit.troops
      );
    }
  }
}
export const battleing = () => {
  Round([a,b])
};