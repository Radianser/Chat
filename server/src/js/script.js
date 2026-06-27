import * as CryptoJS from './crypto.js';

console.log('CryptoJS: ', CryptoJS);

const CryptoUtils = {
    SHA256: (message) => CryptoJS.default.SHA256(message),
    AES: {
        encrypt: (data, secret) => CryptoJS.default.AES.encrypt(data, secret),
        decrypt: (encrypted, secret) => CryptoJS.default.AES.decrypt(encrypted, secret)
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let arr = [
        { name: 'John' },
        { name: 'Kate' },
        { name: 'Mike' }
    ];
    console.table(arr);

    if(window.location.pathname == '/test/') {
        let key = "very_secret_key";
        let storage_key = CryptoUtils.SHA256("currentUser").toString();
        localStorage.setItem(
            storage_key,
            CryptoUtils.AES.encrypt(
                JSON.stringify(JSON.stringify({ name: 'RadianserGames' })),
                key
            ).toString()
        );

        console.log('token: ', localStorage.getItem(storage_key));
    }
});