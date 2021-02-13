import axios from "axios";
import { setAlert } from "./alert";
import { GET_PROFILE, GET_PROFILES, PROFILE_ERROR, UPDATE_PROFILE, CLEAR_PROFILE, ACCOUNT_DELETED } from "./types";

//Get current users profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/profile/me");

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Get profiles
export const getProfiles = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/profile/");

    dispatch({
      type: GET_PROFILES,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Get profile by id
export const getProfileById = id => async dispatch => {
  try {
    const res = await axios.get(`/api/profile/user/${id}`);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};


//Create or update profile
export const createProfile = (formData, history, edit = false) => async (
  dispatch
) => {
  try {
    const config = {
      headers: {
        "Content-type": "application/json",
      },
    };

    const res = await axios.post("/api/profile", formData, config);

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert(edit ? 'Profile updated': 'Profile created', 'success'))

    if(!edit) {
        history.push('/dashboard')
    }

  } catch (err) {
    const errors = err.response.data.errors

    if (errors) {
        errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
    }

    dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
};

//Add experience
export const addExperience = (formData, history) => async dispatch => {
    try {
        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };
    
        const res = await axios.put("/api/profile/experience", formData, config);
    
        dispatch({
          type: UPDATE_PROFILE,
          payload: res.data,
        });
    
        dispatch(setAlert('Experiences updated', 'success'))
        history.push('/dashboard')
        
    
      } catch (err) {
        const errors = err.response.data.errors
    
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
    
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
      }  
}

//Add education
export const addEducation = (formData, history) => async dispatch => {
    try {
        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };
    
        const res = await axios.put("/api/profile/education", formData, config);

        dispatch({
          type: UPDATE_PROFILE,
          payload: res.data,
        });
    
        dispatch(setAlert('Education updated', 'success'))
        history.push('/dashboard')
        
    
      } catch (err) {
        const errors = err.response.data.errors
    
        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }
    
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
      }  
}

//Delete experience

export const deleteExperience = id => async dispatch => {
  try {
    const res = await axios.delete(`/api/profile/experience/${id}`)

    dispatch ({
      type: UPDATE_PROFILE,
      payload: res.data
    })

    dispatch(setAlert('Experience removed', 'success'))
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

//Delete education

export const deleteEducation = id => async dispatch => {
  try {
    const res = await axios.delete(`/api/profile/education/${id}`)

    dispatch ({
      type: UPDATE_PROFILE,
      payload: res.data
    })

    dispatch(setAlert('Education removed', 'success'))
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}

//Delete account & profile

export const deleteAccount = id => async dispatch => {
  if (window.confirm('Are you sure? This can NOT be undone!'))
  try {
    await axios.delete(`/api/profile`)

    dispatch ({type: CLEAR_PROFILE})
    dispatch({ type: ACCOUNT_DELETED })

    dispatch(setAlert('Your account has been permanently deleted!'))
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    })
  }
}