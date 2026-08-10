const express = require("express");

const router = express.Router();

const prisma = require("../lib/prisma");

const {
  protect
} = require("../middleware/authMiddleware");





// ======================================================
// SAVE / UPDATE READING PROGRESS
// ======================================================

router.post(
"/progress",
protect,
async(req,res)=>{


try{


const {

bookId,

page,

progress

}=req.body;



if(!bookId){

return res.status(400).json({

message:"Book ID required"

});

}



const result =

await prisma.readingProgress.upsert({

where:{


userId_bookId:{


userId:req.user.id,


bookId:Number(bookId)


}


},



update:{


page:Number(page),


progress:Number(progress)


},



create:{


userId:req.user.id,


bookId:Number(bookId),


page:Number(page),


progress:Number(progress)


}



});




res.json({

success:true,

data:result

});





}catch(error){


console.log(
"PROGRESS ERROR:",
error
);


res.status(500).json({

message:
"Saving progress failed"

});


}


});









// ======================================================
// GET READING PROGRESS
// ======================================================


router.get(
"/progress/:bookId",
protect,
async(req,res)=>{


try{


const result =

await prisma.readingProgress.findUnique({

where:{


userId_bookId:{


userId:req.user.id,


bookId:Number(req.params.bookId)


}


}


});



res.json({

success:true,

data:
result || null

});



}catch(error){


console.log(error);


res.status(500).json({

message:
"Loading progress failed"

});


}


});









// ======================================================
// ADD BOOKMARK
// ======================================================


router.post(
"/bookmark",
protect,
async(req,res)=>{


try{


const {


bookId,


page


}=req.body;



const bookmark =

await prisma.bookmark.create({

data:{


userId:req.user.id,


bookId:Number(bookId),


page:Number(page)


}


});



res.json({

success:true,

data:bookmark

});



}catch(error){


console.log(
"BOOKMARK ERROR:",
error
);


res.status(500).json({

message:
"Creating bookmark failed"

});


}


});









// ======================================================
// GET BOOKMARKS
// ======================================================


router.get(
"/bookmarks/:bookId",
protect,
async(req,res)=>{


try{


const bookmarks =

await prisma.bookmark.findMany({

where:{


userId:req.user.id,


bookId:Number(req.params.bookId)


},


orderBy:{


page:"asc"


}


});



res.json({

success:true,

data:bookmarks

});



}catch(error){



res.status(500).json({

message:
"Loading bookmarks failed"

});


}


});









// ======================================================
// DELETE BOOKMARK
// ======================================================


router.delete(
"/bookmark/:id",
protect,
async(req,res)=>{


try{


await prisma.bookmark.delete({

where:{


id:Number(req.params.id)


}


});



res.json({

success:true,

message:
"Bookmark removed"

});



}catch(error){



res.status(500).json({

message:
"Deleting bookmark failed"

});


}


});









// ======================================================
// CREATE NOTE
// ======================================================


router.post(
"/note",
protect,
async(req,res)=>{


try{


const {


bookId,


page,


content


}=req.body;



const note =

await prisma.bookNote.create({

data:{


userId:req.user.id,


bookId:Number(bookId),


page:Number(page),


content


}


});




res.json({

success:true,

data:note

});




}catch(error){


console.log(
"NOTE ERROR:",
error
);



res.status(500).json({

message:
"Creating note failed"

});


}


});









// ======================================================
// GET NOTES
// ======================================================


router.get(
"/notes/:bookId",
protect,
async(req,res)=>{


try{


const notes =

await prisma.bookNote.findMany({

where:{


userId:req.user.id,


bookId:Number(req.params.bookId)


},


orderBy:{


page:"asc"


}


});



res.json({

success:true,

data:notes

});



}catch(error){



res.status(500).json({

message:
"Loading notes failed"

});


}


});









// ======================================================
// DELETE NOTE
// ======================================================


router.delete(
"/note/:id",
protect,
async(req,res)=>{


try{


await prisma.bookNote.delete({

where:{


id:Number(req.params.id)


}

});



res.json({

success:true,

message:
"Note deleted"

});



}catch(error){



res.status(500).json({

message:
"Deleting note failed"

});


}


});








module.exports = router;