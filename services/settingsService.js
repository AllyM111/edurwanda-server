import api from "../api/axios";


// ======================================
// GET SETTINGS
// ======================================

export const getSettings = async () => {

  try {

    const response = await api.get(
      "/settings"
    );

    return response.data;


  } catch (error) {

    console.error(
      "GET SETTINGS ERROR:",
      error
    );

    throw error;

  }

};




// ======================================
// UPDATE SETTINGS
// ======================================

export const updateSettings = async (
  settingsData
) => {

  try {

    const response = await api.put(
      "/settings",
      settingsData
    );


    return response.data;


  } catch (error) {

    console.error(
      "UPDATE SETTINGS ERROR:",
      error
    );

    throw error;

  }

};




// ======================================
// UPLOAD LOGO
// ======================================

export const uploadLogo = async (
  file
) => {


  try {


    const formData =
      new FormData();


    formData.append(
      "logo",
      file
    );


    const response =
      await api.post(
        "/settings/logo",
        formData,
        {
          headers:{
            "Content-Type":
            "multipart/form-data",
          },
        }
      );


    return response.data;


  } catch(error){


    console.error(
      "UPLOAD LOGO ERROR:",
      error
    );


    throw error;


  }


};





// ======================================
// UPLOAD FAVICON
// ======================================


export const uploadFavicon = async (
  file
)=>{


  try{


    const formData =
      new FormData();



    formData.append(
      "favicon",
      file
    );



    const response =
      await api.post(
        "/settings/favicon",
        formData,
        {
          headers:{
            "Content-Type":
            "multipart/form-data",
          },
        }
      );



    return response.data;



  }catch(error){


    console.error(
      "UPLOAD FAVICON ERROR:",
      error
    );


    throw error;


  }


};