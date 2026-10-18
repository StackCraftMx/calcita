import {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {initialsOf, useToolkitTranslation} from '@stackcraftmx/calcita';

const FOLDERS = [
    {key: 'inbox', Icon: InboxOutlinedIcon},
    {key: 'drafts', Icon: DraftsOutlinedIcon},
    {key: 'sent', Icon: SendOutlinedIcon},
];
const SAMPLE_CONTACTS = ['Ana Martínez', 'Luis Herrera', 'Mónica Vega'];
const SETTINGS = ['profile', 'security', 'preferences'];
const NARROW_LIST_WIDTH = 220;
const WIDE_LIST_WIDTH = 320;

const ListKinds = () => {
    const {t} = useToolkitTranslation('catalog');
    const [selectedFolder, setSelectedFolder] = useState(FOLDERS[0].key);

    return (
        <Stack direction="row" spacing={3} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
            {/* para navegar: lo elegido va en su gota con vidrio */}
            <List sx={{width: NARROW_LIST_WIDTH}}
                  subheader={<ListSubheader disableSticky sx={{bgcolor: 'transparent'}}>{t('surfaces.lists.mailboxes')}</ListSubheader>}>
                {FOLDERS.map(({key, Icon}) => (
                    <ListItemButton key={key} selected={selectedFolder === key} onClick={() => setSelectedFolder(key)} sx={{borderRadius: 1.5}}>
                        <ListItemIcon><Icon /></ListItemIcon>
                        <ListItemText primary={t(`surfaces.lists.folders.${key}`)} />
                    </ListItemButton>
                ))}
            </List>
            <List sx={{width: WIDE_LIST_WIDTH}}>
                {SAMPLE_CONTACTS.map((person) => (
                    <ListItem key={person} disableGutters
                              secondaryAction={<IconButton edge="end" aria-label={t('samples.deleteNamed', {name: person})}><DeleteOutlineIcon /></IconButton>}>
                        <ListItemAvatar><Avatar>{initialsOf(person)}</Avatar></ListItemAvatar>
                        <ListItemText primary={person} secondary={t('surfaces.lists.lastOrder')} />
                    </ListItem>
                ))}
            </List>
            {/* el renglón que lleva a otra pantalla termina en › */}
            <List dense sx={{width: NARROW_LIST_WIDTH}}>
                {SETTINGS.map((key) => (
                    <ListItemButton key={key} sx={{borderRadius: 1.5}}>
                        <ListItemText primary={t(`surfaces.lists.settings.${key}`)} />
                        <ChevronRightIcon fontSize="small" color="action" aria-hidden />
                    </ListItemButton>
                ))}
            </List>
        </Stack>
    );
};

export default ListKinds;
