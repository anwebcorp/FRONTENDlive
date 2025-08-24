import axios from "axios";
const BASE_URL = 'http://45.130.229.161';

// Only export the default axios instance for public requests
export default axios.create({
    baseURL: BASE_URL
});