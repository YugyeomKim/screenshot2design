import { SERVER, Preference, Survey } from "./common";

const sendUserData = async (userData: Preference | Survey) => {
  const { email }: { email: string } = await figma.clientStorage.getAsync(
    "userData"
  );

  const userDataBody = {
    email,
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
