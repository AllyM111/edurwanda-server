const prisma = require("../lib/prisma");


async function main(){


console.log(
"🎥 Seeding YouTube channels..."
);



// ======================================
// Rwanda Lyrics Channel
// ======================================


await prisma.youtubeChannel.upsert({

where:{
slug:"rwanda-lyrics"
},


update:{},


create:{


slug:
"rwanda-lyrics",


name:
"Rwanda Lyrics",


description:
"Discover Rwandan music, lyrics, artists and culture. Enjoy songs, translations and African music content.",


icon:
"🎵",


youtubeUrl:
"https://www.youtube.com/@YOUR_CHANNEL",


category:
"MUSIC",


active:
true


}


});






// ======================================
// Ally Cyber Rwanda Channel
// ======================================


await prisma.youtubeChannel.upsert({

where:{
slug:"ally-cyber-rwanda"
},


update:{},


create:{


slug:
"ally-cyber-rwanda",


name:
"Ally Cyber Rwanda",


description:
"Cybersecurity, ethical hacking, programming and technology tutorials.",


icon:
"💻",


youtubeUrl:
"https://www.youtube.com/@YOUR_CHANNEL",


category:
"TECHNOLOGY",


active:
true


}


});






console.log(
"✅ YouTube channels seeded successfully"
);



}



main()

.catch((error)=>{


console.error(
"❌ Seed error:",
error
);


process.exit(1);


})


.finally(async()=>{


await prisma.$disconnect();


});