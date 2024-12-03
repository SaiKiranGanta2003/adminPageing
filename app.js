const app=require('express')();
const http=require('http').Server(app);



const mongoose=require('mongoose');

mongoose.connect('mongodb+srv://root:Root123@medicingcluster.cfdca.mongodb.net/?retryWrites=true&w=majority&appName=medicingCluster');

const userSchema=require('./models/userModel');

async function insert(){
    await userSchema.create({
        name:"saiKiran",
        email:"sai@gmail.com",
        role:"Admin",
        password:"sai123"
})
}
insert();

http.listen(3000,()=>{
    console.log('Server started on port 3000');    
});
// mongo1();
