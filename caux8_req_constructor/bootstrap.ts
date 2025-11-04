import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { appendDefaultBasicInfo, appendDefaultDescription, appendDefaultOJSettings } from './types/defaults.ts';
import { Cookie, CookieJar } from 'tough-cookie';

const jar = new CookieJar();

jar.setCookie(new Cookie({ "key": "MoodleSession", "value": "76iuuf6rr0tvrgcq23g2leo0b2", "domain": "page.cau.edu.cn", "path": "/", "httpOnly": true, "secure": false }), 'http://page.cau.edu.cn/');
const client = wrapper(axios.create({
    withCredentials: true,
    jar: jar,
}));

const url = 'http://page.cau.edu.cn/course/modedit.php'

const form = new FormData();
appendDefaultBasicInfo({ courseId: 141, section: 1, sesskey: 'T72pRCtqOa', name: 'Test Assignment' }, form);
appendDefaultDescription('This is a test description.', form);
appendDefaultOJSettings(form);

const req = client.post(url, form, {
    beforeRedirect: (options, res) => {
        console.log('Redirecting to:', res.headers.location);
    }
});

try {
    const res = await req;
    console.log(res.status)
    console.log(res.headers)
} catch (err) {
    if (err instanceof Error) {
        console.error(err);
    }
}
