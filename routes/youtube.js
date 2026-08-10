const express = require("express");

const router = express.Router();

const prisma = require("../lib/prisma");


// ===============================
// AUTH
// ===============================

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");







// ======================================
// GET ALL YOUTUBE VIDEOS
// PUBLIC
// ======================================

router.get(
"/",
async(req,res)=>{

try{


const videos =
await prisma.youtubeVideo.findMany({

orderBy:{
createdAt:"desc"
}

});



res.json({

success:true,

data:videos

});



}catch(error){


console.error(
"GET YOUTUBE ERROR:",
error
);



res.status(500).json({

success:false,

message:
"Failed to load videos"

});


}


});











// ======================================
// GET VIDEOS BY CHANNEL SLUG
// PUBLIC
// ======================================

router.get(
"/channel/:slug",
async(req,res)=>{


try{


const videos =

await prisma.youtubeVideo.findMany({


where:{

channel:
req.params.slug

},


orderBy:{

createdAt:
"desc"

}


});





res.json({

success:true,

data:videos

});





}catch(error){


console.error(
"CHANNEL VIDEOS ERROR:",
error
);



res.status(500).json({

success:false,

message:
"Failed loading channel videos"

});


}


});











// ======================================
// GET SINGLE VIDEO
// PUBLIC
// ======================================

router.get(
"/:id",
async(req,res)=>{


try{


const video =

await prisma.youtubeVideo.findUnique({

where:{

id:
Number(req.params.id)

}

});





if(!video){


return res.status(404).json({

success:false,

message:
"Video not found"

});


}






res.json({

success:true,

data:video

});






}catch(error){


console.error(
"GET VIDEO ERROR:",
error
);



res.status(500).json({

success:false,

message:
"Failed loading video"

});


}


});











// ======================================
// INCREMENT VIDEO VIEW
// PUBLIC
// ======================================

router.patch(
"/:id/view",
async(req,res)=>{


try{


const video =

await prisma.youtubeVideo.update({


where:{

id:
Number(req.params.id)

},



data:{


views:{

increment:1

}


}


});






res.json({

success:true,

data:video

});






}catch(error){


console.error(
"VIEW UPDATE ERROR:",
error
);



res.status(500).json({

success:false,

message:
"View update failed"

});


}


});












// ======================================
// CREATE YOUTUBE VIDEO
// ADMIN ONLY
// ======================================

router.post(
"/",
protect,
adminOnly,

async(req,res)=>{


try{



const {


title,

description,

channel,

youtubeUrl,

embedUrl,

thumbnail,

category,

featured



}=req.body;







// REQUIRED FIELDS

if(

!title ||

!channel ||

!youtubeUrl ||

!embedUrl

){


return res.status(400).json({

success:false,

message:
"Title, channel, youtubeUrl and embedUrl are required"

});


}







// CHECK CHANNEL EXISTS

const existingChannel =

await prisma.youtubeChannel.findUnique({

where:{

slug:channel

}

});





if(!existingChannel){


return res.status(400).json({

success:false,

message:
"Channel does not exist"

});


}








const video =

await prisma.youtubeVideo.create({

data:{



title,


description,


channel,


youtubeUrl,


embedUrl,


thumbnail,



category:

category ||
"EDUCATION",




featured:

featured === true ||
featured === "true"



}


});







res.status(201).json({

success:true,

message:
"Video created successfully",

data:video

});






}catch(error){


console.error(

"CREATE YOUTUBE ERROR:",

error

);




res.status(500).json({

success:false,

message:
"Video creation failed",

error:
error.message

});


}


});












// ======================================
// UPDATE VIDEO
// ADMIN ONLY
// ======================================

router.put(
"/:id",
protect,
adminOnly,

async(req,res)=>{


try{



const video =

await prisma.youtubeVideo.update({

where:{

id:
Number(req.params.id)

},


data:req.body


});







res.json({

success:true,

message:
"Video updated successfully",

data:video

});






}catch(error){


console.error(

"UPDATE YOUTUBE ERROR:",

error

);



res.status(500).json({

success:false,

message:
"Update failed"

});


}


});











// ======================================
// DELETE VIDEO
// ADMIN ONLY
// ======================================

router.delete(
"/:id",
protect,
adminOnly,

async(req,res)=>{


try{



await prisma.youtubeVideo.delete({

where:{

id:
Number(req.params.id)

}

});







res.json({

success:true,

message:
"Video deleted successfully"

});






}catch(error){


console.error(

"DELETE YOUTUBE ERROR:",

error

);




res.status(500).json({

success:false,

message:
"Delete failed"

});


}


});









module.exports = router;