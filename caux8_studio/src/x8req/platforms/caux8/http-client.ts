import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { Cookie, CookieJar } from "tough-cookie";
import { CAU_BASE_URL } from "./config.js";

export function createHttpClient(moodleSession: string) {
  const jar = new CookieJar();

  jar.setCookieSync(
    new Cookie({
      key: "MoodleSession",
      value: moodleSession,
      domain: "page.cau.edu.cn",
      path: "/",
      httpOnly: true,
      secure: false,
    }),
    `${CAU_BASE_URL}/`,
  );

  return wrapper(
    axios.create({
      withCredentials: true,
      jar,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    }),
  );
}
