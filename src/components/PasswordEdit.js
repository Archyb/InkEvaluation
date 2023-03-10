import React, {useCallback, useEffect, useState} from 'react';

import Icon from '../atoms/Icon';
import LabelledIconButton from './LabelledIconButton';
import classes from './PasswordEdit.module.css';
import Labelled from '../atoms/Labelled';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import List from '../atoms/List';
import ListItem from '../atoms/ListItem';
import clsx from 'clsx';
import TextArea from '../atoms/TextArea';
import use from "use";

const UrlList = ({urls, onDelete}) => {

    return (
        <List className={classes.urlList}>
            {urls?.map((urlEntry, index) => (
                <ListItem dense className={classes.urlListItem} key={index}>
                    <input autoFocus value={urlEntry}/>
                    <Icon onClick={() => onDelete(index)} size="small" className="fas fa-times"/>
                </ListItem>
            ))}
            {urls?.length === 0 && (
                <ListItem dense className={clsx(classes.urlListItem, classes.urlListItemEmpty)}>
                    No urls added
                </ListItem>
            )}
        </List>
    )

}

function PasswordEdit({password, onSave, onDelete, onCancel}) {
    const [values, setValues] = useState(password);

    const [urlInput, setUrlInput] = useState('');
    const [urlHasChanged, setUrlHasChanged] = useState(true)

    function change(partial) {
        setValues((values) => ({
            ...values,
            ...partial,
        }));
    }

    function handleChange(e) {
        change({[e.target.name]: e.target.value});
    }

    function handleSaveClick() {
        onSave({
            ...password,
            ...values,
        });
    }

    function handleDeleteClick() {
        onDelete();
    }

    function handleCancelClick() {
        onCancel();
    }

    function handleUrlAdd() {
        const urls = values.url || [];
        urls.unshift(urlInput);
        setUrlHasChanged((url) => url = !url)
        change({url: urls});

        setUrlInput('');
    }

    const handleUrlDelete = (index) => {
        const urls = values.url || []
        urls.splice(index, 1);
        change({url: urls});
        setUrlHasChanged((url) => url =!url)
    }

    useEffect(() => {

    }, [urlHasChanged])
    return (
        <div className={classes.container}>
            <h2 className={classes.title}>
                <input
                    autoFocus
                    className={classes.titleInput}
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                />
            </h2>
            <div className={classes.content}>
                <Labelled label="description">
                    <TextArea name="description" value={values.description} onChange={handleChange}/>
                </Labelled>

                <Labelled label="value">
                    <Input name="value" value={values.value} onChange={handleChange}/>
                </Labelled>

                <Labelled label="url">
                    <div>
                        <Input
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            style={{marginRight: 4}}
                        />

                        <Button onClick={handleUrlAdd}>Add</Button>
                    </div>

                    <UrlList urls={values.url} onDelete={handleUrlDelete}/>
                </Labelled>
            </div>
            <div className={classes.controls}>
                <LabelledIconButton
                    label="Cancel"
                    className={classes.cancel}
                    onClick={handleCancelClick}
                    icon={<Icon size="small" className="fas fa-times"/>}
                />

                <LabelledIconButton
                    label="Save"
                    onClick={handleSaveClick}
                    icon={<Icon size="small" className="fas fa-save"/>}
                />

                <LabelledIconButton
                    label="Delete"
                    className={classes.delete}
                    onClick={handleDeleteClick}
                    icon={<Icon size="small" className="fas fa-trash"/>}
                />
            </div>
        </div>
    );
}

export default PasswordEdit;
