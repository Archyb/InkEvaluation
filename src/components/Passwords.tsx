import React from 'react';
import clsx from 'clsx';

import { Password } from '../models';
import List from '../atoms/List';
import PasswordListItem from './PasswordListItem';
import classes from './Passwords.module.css';

interface Props {
    editing: boolean;
    passwords: { [key: string]: Password };
    onSelectPassword: (id: string) => void;
    selectPassword: string | null;
}

function Passwords({ editing, passwords, onSelectPassword, selectPassword }: Props) {
    function renderListItem(password: Password) {
        function handleClick() {

            onSelectPassword(password.id);
        }

        return (
            <PasswordListItem
                key={password.id}
                name={password.name}
                disabled={editing}
                onClick={handleClick}
                vulnerable={password.value.length < 2}
                isActive={selectPassword == password.id}
            />
        );
    }

    return (
        <List className={clsx(classes.passwords, { [classes.disabled]: editing })}>
            {
                Object.values(passwords).map((pw: Password) => renderListItem(pw))
            }
        </List>
    );
}

export default Passwords;
