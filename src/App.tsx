import React, {useState, useEffect} from 'react';

import {Password} from './models';
import * as storage from './storage';
import {encrypt, decrypt, getKey, base64StringToUint8Array} from './crypto';
import {wait} from './helpers';
import {CRYPTO_KEY_STORAGE_KEY, PASSWORDS_STORAGE_KEY,MASTERPASSWORD} from './constants';
import PasswordLockedContainer from './components/PasswordLockedContainer';
import PasswordMainContainer from './components/PasswordMainContainer';


function duplicateUrlsAmongPasswords(passwords: { [id: string]: Password }) {
    const urls:string[]=[]
    const checkSet = new Set();
    Object.entries(passwords).forEach(([id, password]) => {
        console.log(password.url)
        for (let i = 0; i <password.url.length; i++) {
            urls.push(password.url[i])
            checkSet.add(password.url[i])
        }
    })
    //get keys from duplicate urls
    const duplicateUrls = urls.filter((item, index) => urls.indexOf(item) !== index)
    console.log(duplicateUrls)
    return urls.length !== checkSet.size;
}

function App() {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [key, setKey] = useState<CryptoKey | null>(null);

    const [decryptedPasswords, setDecryptedPasswords] = useState<{ [id: string]: Password }>({});

    async function hydratePasswords(newKey: CryptoKey) {
        console.log(newKey)
        setKey(newKey);
        await wait(500);
        const encryptedPasswords = JSON.parse(storage.getItem(PASSWORDS_STORAGE_KEY));
        if (!encryptedPasswords) {
            return;
        }
        const decryptedPasswords = JSON.parse(await decrypt(newKey, encryptedPasswords));
        setDecryptedPasswords(decryptedPasswords);
    }

    function handleSuccess(newKey: CryptoKey) {

        const run = async () => {
            try {
                await hydratePasswords(newKey);
            } catch (e) {
                return;
            }
        };

        setLoading(true);
        run().finally(() => setLoading(false));
    }

    useEffect(() => {
        const rawCryptoKey = storage.getItem<string>(CRYPTO_KEY_STORAGE_KEY);

        if (!rawCryptoKey) {
            setLoading(false);
            return;
        }

        getKey(base64StringToUint8Array(rawCryptoKey)).then((storedKey) => {
            setKey(storedKey);
            handleSuccess(storedKey);
            setLoading(false);
        });
    }, []);
    useEffect(() => {
        console.log("isAuth")}, [setIsAuth]);
    useEffect(() => {
        async function sync() {
            if (!key) {
                return;
            }
            const data = JSON.stringify(decryptedPasswords);
            const encryptedPasswords = await encrypt(key, data);
            storage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(encryptedPasswords));
        }

        sync();
    }, [decryptedPasswords]);

    function handleLogout() {
        storage.removeItem(CRYPTO_KEY_STORAGE_KEY);
        setKey(null);
        setIsAuth(false);
        storage.setItem("isAuth", "false")
    }

    function handlePasswordCreated(password: Password) {
        setDecryptedPasswords((passwords) => ({
            ...passwords,
            [password.id]: password,
        }));
    }

    function handlePasswordEdited(password: Password) {
        const nextPasswords = {
            ...decryptedPasswords,
            [password.id]: {
                ...password,
                lastModifiedAt: Date.now(),
            },
        };

        const duplicateUrls = duplicateUrlsAmongPasswords(nextPasswords);

        if (duplicateUrls) {
            alert('Duplicate url found for passwords: you might have an outdated password ')
        }

        setDecryptedPasswords(nextPasswords);
    }

    function handlePasswordDeleted(id: string) {
        setDecryptedPasswords((passwords) => {
            const {[id]: deleted, ...remaining} = passwords;

            return remaining;
        });
    }

    if (loading) {
        return <>Loading</>;
    }


    const authorized = ()=>{
        if (isAuth) return true;
        if (storage.getItem("isAuth") === 'true') {
            setIsAuth(true);
            return true;
        }
        return false;
    };
    const Authentication=authorized()
    if (!Authentication) {
        return <PasswordLockedContainer isAuth={setIsAuth} onSuccess={handleSuccess}></PasswordLockedContainer>;
}
    return (
        <PasswordMainContainer
            decryptedPasswords={decryptedPasswords}
            onLogout={handleLogout}
            onPasswordCreated={handlePasswordCreated}
            onPasswordEdited={handlePasswordEdited}
            onPasswordDeleted={handlePasswordDeleted}
        />
    );
}

export default App;
