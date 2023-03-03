import React, {useEffect, useState} from 'react';

import { CRYPTO_KEY_STORAGE_KEY, encryptedValidation } from '../constants';
import { wait } from '../helpers';
import {arrayBufferToBase64, decrypt, getDerivation, getKey, isMasterPasswordValid} from '../crypto';
import * as storage from '../storage';
import classes from './PasswordLockedContainer.module.css';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

interface Props {
    onSuccess: (password: CryptoKey) => void;
    isAuth: (isAuth: (current: boolean) => boolean) => void ;
}

const PasswordLockedContainer = ({ onSuccess,isAuth }: Props) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        const validate = async () => {
            const derivation = await getDerivation(password);
            const key = await getKey(derivation);
            await wait(500);
            await decrypt(key, encryptedValidation);
            const b = await isMasterPasswordValid(password);
            console.log(b)
            if (!b) {
                throw new Error('Invalid password');
            }
            storage.setItem("isAuth", "true");
            isAuth((current:boolean) => current= true)
            storage.setItem(CRYPTO_KEY_STORAGE_KEY, arrayBufferToBase64(derivation));
        };

        setLoading(true);
        validate().catch(() => setLoading(false));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };
    useEffect(() => {}, [loading]);
    return (
        <div className={classes.container}>
            <form className={classes.form} onSubmit={handleSubmit}>
                <h1>Enter your master password</h1>
                <label htmlFor="password-input">Password</label>
                <Input
                    id="password-input"
                    value={password}
                    onChange={handleChange}
                    type="password"
                    placeholder="***********"
                />
                <Button disabled={loading}>Submit</Button>
            </form>
        </div>
    );
};

export default PasswordLockedContainer;
