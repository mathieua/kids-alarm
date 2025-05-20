import { makeStyles } from '@fluentui/react-components';
import type { JSX } from 'react';

type PlaylistProps = {};

export const Playlist = ({ }: PlaylistProps): JSX.Element => {
    const classes = useStyles();
    return <div className={classes.playlist}></div>;
};

const useStyles = makeStyles({
    playlist: {},
});