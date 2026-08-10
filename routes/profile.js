const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const prisma = require("../lib/prisma");


const {
  protect
} = require("../middleware/authMiddleware");




// ======================================
// GET CURRENT PROFILE
// ======================================

router.get(
"/",
protect,
async(req,res)=>{


try{


const user = await prisma.user.findUnique({

where:{
id:req.user.id
},


select:{


id:true,

name:true,

email:true,

role:true,

status:true,

createdAt:true


}


});



res.json(user);



}catch(error){


console.log(error);



res.status(500).json({

message:
"Failed to load profile"

});


}


}

);








// ======================================
// UPDATE PROFILE
// ======================================

router.put(
"/",
protect,
async(req,res)=>{


try{


const {

name,

email

}=req.body;




const user = await prisma.user.update({

where:{

id:req.user.id

},


data:{


name,

email


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

message:
"Profile updated",

user

});




}catch(error){


console.log(error);



res.status(500).json({

message:
"Profile update failed"

});


}


}

);










// ======================================
// CHANGE PASSWORD
// ======================================

router.put(
"/password",
protect,
async(req,res)=>{


try{


const {

oldPassword,

newPassword

}=req.body;




const user = await prisma.user.findUnique({

where:{
id:req.user.id
}

});





const match = await bcrypt.compare(

oldPassword,

user.password

);





if(!match){


return res.status(400).json({

message:
"Old password incorrect"

});


}






const hashedPassword = await bcrypt.hash(

newPassword,

10

);






await prisma.user.update({

where:{

id:user.id

},


data:{


password:hashedPassword


}


});





res.json({

message:
"Password changed successfully"

});




}catch(error){


console.log(error);



res.status(500).json({

message:
"Password change failed"

});


}


}

);






module.exports = router;