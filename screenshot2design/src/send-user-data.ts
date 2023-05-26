import { SERVER, Preference, Survey, Reason } from "./common";

const sendUserData = async (userData: Preference | Survey | Reason) => {
  const apiKey: string = await figma.clientStorage.getAsync("apiKey");

  const userDataBody = {
    apiKey,
    userData,
  };

  await fetch(`${SERVER}/data/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDataBody),
  })
    .then((fetchResponse) => {
      console.log(`Set user data status: ${fetchResponse.status}`);
    })
    .catch((error) => {
      console.log(`Set user data Error: ${error.message}`);
    });
};

export default sendUserData;
