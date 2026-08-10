const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");


// =====================================
// GET DASHBOARD ANALYTICS
// =====================================

router.get("/", async (req, res) => {

  try {


    // ===============================
    // TOTALS
    // ===============================

    const totalUsers =
      await prisma.user.count();


    const totalBooks =
      await prisma.book.count();


    const totalExams =
      await prisma.exam.count();



    const activeUsers =
      await prisma.user.count({
        where:{
          status:"ACTIVE"
        }
      });



    // ===============================
    // STATISTICS
    // ===============================


    const bookStats =
      await prisma.book.aggregate({

        _sum:{
          views:true,
          downloads:true
        }

      });



    const examStats =
      await prisma.exam.aggregate({

        _sum:{
          views:true,
          downloads:true
        }

      });





    // ===============================
    // RECENT USERS
    // ===============================

    const recentUsers =
      await prisma.user.findMany({

        take:5,

        orderBy:{
          createdAt:"desc"
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





    // ===============================
    // RECENT BOOKS
    // ===============================

    const recentBooks =
      await prisma.book.findMany({

        take:5,

        orderBy:{
          createdAt:"desc"
        }

      });






    // ===============================
    // RECENT EXAMS
    // ===============================

    const recentExams =
      await prisma.exam.findMany({

        take:5,

        orderBy:{
          createdAt:"desc"
        }

      });






    // ===============================
    // CHART DATA
    // ===============================


    const months = [

      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"

    ];



    const chartData = [];



    for(
      let i = 0;
      i < months.length;
      i++
    ){


      chartData.push({

        month:months[i],


        users:
        0,


        books:
        0,


        exams:
        0

      });


    }





    // USER MONTH DATA

    const usersMonth =
      await prisma.user.findMany({

        select:{
          createdAt:true
        }

      });



    usersMonth.forEach(user=>{


      const month =
      user.createdAt.getMonth();


      chartData[month].users++;


    });






    // BOOK MONTH DATA

    const booksMonth =
      await prisma.book.findMany({

        select:{
          createdAt:true
        }

      });



    booksMonth.forEach(book=>{


      const month =
      book.createdAt.getMonth();


      chartData[month].books++;


    });







    // EXAM MONTH DATA

    const examsMonth =
      await prisma.exam.findMany({

        select:{
          createdAt:true
        }

      });



    examsMonth.forEach(exam=>{


      const month =
      exam.createdAt.getMonth();


      chartData[month].exams++;


    });







    res.json({


      totals:{


        users:
        totalUsers,


        books:
        totalBooks,


        exams:
        totalExams,


        activeUsers:
        activeUsers,


        views:
        (bookStats._sum.views || 0)
        +
        (examStats._sum.views || 0),



        downloads:
        (bookStats._sum.downloads || 0)
        +
        (examStats._sum.downloads || 0)

      },



      recentUsers,


      recentBooks,


      recentExams,


      chartData



    });



  }
  catch(error){


    console.error(
      "ANALYTICS ERROR",
      error
    );


    res.status(500).json({

      message:
      "Analytics failed",

      error:
      error.message

    });


  }


});



module.exports = router;