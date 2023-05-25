import { SERVER, Preference, Survey } from "./common";

const sendUserData = async (userData: Preference | Survey) => {
  const apiKey: string = await figma.clientStorage.getAsync("apiKey");

  const userDataBody = {
    apiKey,
    userData,
  };

  fetch(`${SERVER}/data/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDataBody),
  })
    .then((fetchResponse) => {
      console.log(`Set Preference Status: ${fetchResponse.status}`);
    })
    .catch((error) => {
      console.log(`Set Preference Error: ${error}`);
    });
};

export default sendUserData;
