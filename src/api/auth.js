import axios from "axios";
export async function signIn(email, password) {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  try {
    // Send request
    const data = {
      userName: email,
      password: password
  };
  const response = await axios.post(`${baseUrl}Authenticate/Post`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  localStorage.setItem('token', response.data.AuthenticateToken);
  localStorage.setItem('UserName', response.data.UserName);
    return {
      isOk: true,
      data: response.data
    };
  }
  catch {
    return {
      isOk: false,
      message: "Authentication failed"
    };
  }
}

export async function getUser() {
  try {
    // Send request
    
    const token = localStorage.getItem("token");
    if(token){
    const UserName = localStorage.getItem("UserName");
    const data = {
      token:token,
      UserName:UserName
    }
    return {
      isOk: true,
     data:data
    };
  }
}
  catch {
    return {
      isOk: false
    };
  }
}

export async function createAccount(email, password) {
  try {
    // Send request
    console.log(email, password);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to create account"
    };
  }
}

export async function changePassword(email, recoveryCode) {
  try {
    // Send request
    console.log(email, recoveryCode);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to change password"
    }
  }
}

export async function resetPassword(email) {
  try {
    // Send request
    console.log(email);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to reset password"
    };
  }
}
