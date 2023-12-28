import { Preference, SERVER, Survey } from "./common";

export const sendUserData = async (userData: Preference | Survey) => {
  const { email }: { email: string } = await figma.clientStorage.getAsync(
    "userData"
  );

  const userDataBody = {
    email,
    userData,
  };

  await fetch(`${SERVER}/handle_data/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDataBody),
  })
    .then(async (fetchResponse) => {
      console.log(
        `Set stat data status: ${await fetchResponse.text()} (${
          fetchResponse.status
        })`
      );
    })
    .catch((error) => {
      console.log(`Set user data Error: ${error.message} (${error.status})`);
    });
};

interface StatData {
  type: String;
  payload: Object;
}

export const sendStatData = async (statData: StatData) => {
  await fetch(`${SERVER}/handle_data/stat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(statData),
  })
    .then(async (fetchResponse) => {
      console.log(
        `Set stat data status: ${await fetchResponse.text()} (${
          fetchResponse.status
        })`
      );
    })
    .catch((error) => {
      console.log(`Set stat data Error: ${error.message} (${error.status})`);
    });
};
