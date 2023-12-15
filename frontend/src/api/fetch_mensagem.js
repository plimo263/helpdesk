import axios from "axios";
// Para recuperar dados das mensagens
const fetchGet = async (url) => {
  const resp = await axios.get(url);
  return resp.data;
};

export default fetchGet;
