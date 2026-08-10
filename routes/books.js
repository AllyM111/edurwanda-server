const express = require("express");

const router = express.Router();

const prisma = require("../lib/prisma");

const multer = require("multer");

const axios = require("axios");

const cloudinaryUpload =
require("../utils/cloudinaryUpload");




// ======================================
// MULTER
// ======================================

const upload = multer({

storage:
multer.memoryStorage()

});







// ======================================
// GET ALL BOOKS
// ======================================


router.get(
"/",
async(req,res)=>{


try{


const books =

await prisma.book.findMany({

orderBy:{
createdAt:"desc"
}

});


res.json(books);



}catch(error){


console.log(
"GET BOOKS ERROR:",
error
);



res.status(500).json({

message:
"Failed loading books"

});


}


});









// ======================================
// DOWNLOAD BOOK PDF
// MUST BE BEFORE /:id
// ======================================


router.get(
"/download/:id",

async(req,res)=>{


try{


const id =
Number(req.params.id);





const book =

await prisma.book.findUnique({

where:{
id
}

});






if(!book){


return res.status(404).json({

message:
"Book not found"

});


}







if(!book.pdfUrl){


return res.status(404).json({

message:
"PDF missing"

});


}








const response = await axios({

method:"GET",

url:book.pdfUrl,

responseType:"stream"

});







res.setHeader(

"Content-Type",

"application/pdf"

);




res.setHeader(

"Content-Disposition",

`attachment; filename="${book.title}.pdf"`

);








// update download count safely

try{


await prisma.book.update({

where:{
id
},

data:{


downloads:{


increment:1


}


}


});


}catch(err){


console.log(

"DOWNLOAD COUNT ERROR:",

err.message

);


}







response.data.pipe(res);







}catch(error){


console.log(

"BOOK DOWNLOAD ERROR:",

error

);



res.status(500).json({

message:
"Download failed",

error:
error.message

});


}



});











// ======================================
// GET SINGLE BOOK
// ======================================


router.get(
"/:id",

async(req,res)=>{


try{


const book =

await prisma.book.findUnique({

where:{
id:Number(req.params.id)
}

});





if(!book){


return res.status(404).json({

message:
"Book not found"

});


}





res.json(book);






}catch(error){


console.log(

"GET BOOK ERROR:",

error

);




res.status(500).json({

message:
"Failed loading book"

});


}



});












// ======================================
// CREATE BOOK
// ======================================


router.post(
"/",

upload.fields([

{
name:"pdf",
maxCount:1
},

{
name:"cover",
maxCount:1
}

]),


async(req,res)=>{


try{


const {


type,

title,

author,

category,

level,

subject,

className,

description,

year


}=req.body;






if(!title){


return res.status(400).json({

message:
"Title is required"

});


}







if(!req.files?.pdf){


return res.status(400).json({

message:
"PDF file required"

});


}








const pdfUpload =

await cloudinaryUpload(

req.files.pdf[0].buffer,

"raw",

req.files.pdf[0].originalname

);







let coverUrl=null;





if(req.files.cover){


const coverUpload =

await cloudinaryUpload(

req.files.cover[0].buffer,

"image",

req.files.cover[0].originalname

);



coverUrl =
coverUpload.secure_url;


}









const book =

await prisma.book.create({

data:{


type:
type || "EDUCATION_BOOK",


title,


author,


category,


level,


subject,


className,


description,



year:

year
?
Number(year)
:
null,



pdfUrl:

pdfUpload.secure_url,



coverUrl



}

});







res.status(201).json({

success:true,

data:book

});






}catch(error){


console.log(

"CREATE BOOK ERROR:",

error

);




res.status(500).json({

message:
"Book creation failed",

error:
error.message

});


}



});











// ======================================
// UPDATE BOOK
// ======================================


router.put(

"/:id",

upload.fields([

{
name:"pdf",
maxCount:1
},

{
name:"cover",
maxCount:1
}

]),


async(req,res)=>{


try{


const id =
Number(req.params.id);





const oldBook =

await prisma.book.findUnique({

where:{
id
}

});





if(!oldBook){


return res.status(404).json({

message:
"Book not found"

});


}






let pdfUrl =
oldBook.pdfUrl;



let coverUrl =
oldBook.coverUrl;






if(req.files?.pdf){


const pdfUpload =

await cloudinaryUpload(

req.files.pdf[0].buffer,

"raw",

req.files.pdf[0].originalname

);



pdfUrl =
pdfUpload.secure_url;


}







if(req.files?.cover){


const coverUpload =

await cloudinaryUpload(

req.files.cover[0].buffer,

"image",

req.files.cover[0].originalname

);



coverUrl =
coverUpload.secure_url;


}









const book =

await prisma.book.update({

where:{
id
},

data:{


title:
req.body.title,


author:
req.body.author,


category:
req.body.category,


level:
req.body.level,


subject:
req.body.subject,


className:
req.body.className,


description:
req.body.description,



year:

req.body.year
?
Number(req.body.year)
:
null,



pdfUrl,


coverUrl



}

});






res.json({

success:true,

data:book

});






}catch(error){


console.log(

"UPDATE BOOK ERROR:",

error

);




res.status(500).json({

message:
"Update failed"

});


}



});











// ======================================
// DELETE BOOK
// ======================================


router.delete(

"/:id",

async(req,res)=>{


try{


const id =
Number(req.params.id);





await prisma.book.delete({

where:{
id
}

});





res.json({

success:true,

message:
"Book deleted"

});






}catch(error){


console.log(

"DELETE BOOK ERROR:",

error

);




res.status(500).json({

message:
"Delete failed"

});


}



});









module.exports = router;