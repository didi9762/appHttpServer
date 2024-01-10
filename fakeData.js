const sends = [{
id:'1234',
name:'burger',
phone:'0504445555',
groupId:'0000',
address:'103 str',
partners:3,
group:[
    '1111','2222','3333'
],
type:'long distance'
},
{
    id:'5678',
    name:'pizza',
    phone:'0504446666',
    groupId:'9999',
    address:'101 str',
    partners:3,
    group:[
        '1111','2222','3333'
    ],
    type:'internal'
}]

const users =[{
    id:'1111',
    userName:'didi9762',
    password:'12345',
    name:'didi',
    lastName:'katz',
    phone:'0583672131',
    listGroups:[{type:'long distance',name:'burger',groupId:'0000'},{type:'internal',name:'pizza',groupId:'9999'}]
},
{
    id:'2222',
    userName:'moshe1234',
    password:'97654',
    name:'moshe',
    lastName:'hadad',
    phone:'0583453322',
    listGroups:[{type:'long distance',name:'burger',groupId:'0000'},{type:'internal',name:'pizza',groupId:'9999'}]
},]
export {users,sends}