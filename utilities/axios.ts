import Axios from "axios";
import { SECONDS } from "./constants";

const axios = Axios.create({ timeout: 30 * SECONDS });

export default axios;
