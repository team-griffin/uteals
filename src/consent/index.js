// @flow
import cookies from 'browser-cookies';

import consent from './consent';
import identityConsent from './identity';
import createCookie from './cookie';

const cookieConsent = createCookie(cookies, window.location.hostname);

export {
  consent,
  identityConsent,
  cookieConsent,
};
