import { SERVER } from "./common";

interface StatData {
  type: String;
  payload: Object;
}

const sendStatData = async (statData: StatData) => {
  await fetch(`${SERVER}/data/stat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(statData),
  })
    .then((fetchResponse) => {
      console.log(`Set stat data status: ${fetchResponse.status}`);
    })
    .catch((error) => {
      console.log(`Set stat data Error: ${error.message}`);
    });
};

export default sendStatData;
