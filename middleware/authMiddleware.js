const jwt = require("jsonwebtoken");

const prisma = require("../lib/prisma");




// =================================
// PROTECT USER ROUTES
// =================================

const protect = async (
req,
res,
next
)=>{


try{


const authHeader =
req.headers.authorization;



if(
!authHeader ||
!authHeader.startsWith("Bearer ")
){


return res.status(401).json({

success:false,

message:
"No token provided"

});


}



const token =
authHeader.split(" ")[1];




const decoded =
jwt.verify(
token,
process.env.JWT_SECRET
);




const user =
await prisma.user.findUnique({

where:{

id:decoded.id

},


select:{

id:true,

name:true,

email:true,

role:true,

status:true,

avatar:true

}


});





if(!user){


return res.status(401).json({

success:false,

message:
"User not found"

});


}




req.user = user;



next();



}catch(error){



console.log(
"AUTH ERROR:",
error.message
);



return res.status(401).json({

success:false,

message:
"Invalid or expired token"

});



}



};








// =================================
// ADMIN CHECK
// =================================


const adminOnly = (
req,
res,
next
)=>{


if(
req.user &&
req.user.role === "ADMIN"
){


return next();


}



return res.status(403).json({

success:false,

message:
"Admin access required"

});


};






module.exports = {

protect,

adminOnly

};