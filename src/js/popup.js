import _msg from './modules/msg';

const msg = _msg.init('popup');

msg.bg('getUser', (username) => {
  console.log(username);
});
