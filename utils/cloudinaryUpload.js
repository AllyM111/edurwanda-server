const cloudinary = require("../lib/cloudinary");

const streamifier = require("streamifier");



function cloudinaryUpload(
buffer,
resourceType,
originalName
){

return new Promise((resolve,reject)=>{


const uploadStream =
cloudinary.uploader.upload_stream(

{


resource_type:resourceType,


folder:"edurwanda",



public_id:
originalName
.replace(/\.[^/.]+$/,"")
.replace(/\s+/g,"-")

},


(error,result)=>{


if(error){

reject(error);

}

else{

resolve(result);

}


}


);



streamifier
.createReadStream(buffer)
.pipe(uploadStream);



});


}



module.exports =
cloudinaryUpload;