import axios from "axios";

export async function getAPI(url, token) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function putAPI(url, data, token) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function postAPI(url, data, token) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteApi(url, id, token) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(`${url}/${id}`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function checkDuplicate(url, value, token) {
  try {
    const response = await axios.get(`${url}${value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status;
  } catch (error) {
    return error.response.status;
  }
}
