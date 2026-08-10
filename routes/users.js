const express = require("express");

const router = express.Router();

const prisma = require("../lib/prisma");


const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");



const MAIN_ADMIN_EMAIL =
"allymutabazi11@gmail.com";





// ========================================
// GET ALL USERS
// ========================================

router.get(
"/",
protect,
adminOnly,
async(req,res)=>{


try{


const users =
await prisma.user.findMany({

orderBy:{
createdAt:"desc"
},


select:{

id:true,
name:true,
email:true,
role:true,
status:true,
lastLogin:true,
createdAt:true

}


});


res.json(users);



}catch(error){


console.log(error);


res.status(500).json({

message:"Failed to fetch users"

});


}


}

);









// ========================================
// UPDATE ROLE
// ========================================

router.put(
"/:id",
protect,
adminOnly,
async(req,res)=>{


try{


const {
role
}=req.body;



const user =
await prisma.user.findUnique({

where:{
id:req.params.id
}

});




if(!user){

return res.status(404).json({

message:"User not found"

});

}




if(
user.email === MAIN_ADMIN_EMAIL &&
role !== "ADMIN"
){


return res.status(403).json({

message:
"Main admin role cannot be changed"

});


}






const updatedUser =
await prisma.user.update({

where:{
id:user.id
},


data:{
role
},


select:{

id:true,
name:true,
email:true,
role:true,
status:true

}


});





res.json({

message:"Role updated",

user:updatedUser

});





}catch(error){


console.log(error);


res.status(500).json({

message:"Update failed"

});


}


}

);









// ========================================
// UPDATE USER STATUS
// ========================================

router.put(
"/status/:id",
protect,
adminOnly,
async(req,res)=>{


try{


const {
status
}=req.body;



const user =
await prisma.user.findUnique({

where:{
id:req.params.id
}

});



if(!user){


return res.status(404).json({

message:"User not found"

});


}





if(
user.email === MAIN_ADMIN_EMAIL &&
status === "BLOCKED"
){


return res.status(403).json({

message:
"Main admin cannot be blocked"

});


}





const updatedUser =
await prisma.user.update({

where:{
id:user.id
},


data:{
status
},


select:{

id:true,
name:true,
email:true,
role:true,
status:true

}


});





res.json({

message:"Status updated",

user:updatedUser

});





}catch(error){


console.log(error);


res.status(500).json({

message:"Status update failed"

});


}


}

);









// ========================================
// DELETE USER
// ========================================

router.delete(
"/:id",
protect,
adminOnly,
async(req,res)=>{


try{


const user =
await prisma.user.findUnique({

where:{
id:req.params.id
}

});





if(!user){


return res.status(404).json({

message:"User not found"

});


}




if(
user.email === MAIN_ADMIN_EMAIL
){


return res.status(403).json({

message:
"Main admin cannot be deleted"

});


}





await prisma.user.delete({

where:{
id:user.id
}

});





res.json({

message:"User deleted successfully"

});





}catch(error){


console.log(error);


res.status(500).json({

message:"Delete failed"

});


}


}

);





module.exports = router;