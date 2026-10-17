// «Perfiles y permisos» (RBAC): a la izquierda los perfiles, a la derecha los permisos del elegido con PermissionMatrix
// del framework. Los permisos no se escriben aquí: cada módulo los declara en su menu.js (`export const permissions`) y
// composePermissionGroups los junta, uno por módulo y en el orden del menú. Módulo nuevo = sus permisos salen solos.
//
// Al guardar los permisos del perfil de quien está dentro, se vuelve a leer la sesión y el menú cambia en ese momento.
// El perfil de administración no se puede cambiar (el servidor también lo rechaza): sin él, nadie podría volver aquí.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
    PageHeading, PermissionMatrix, SectionCard, composePermissionGroups, toastProblem, toastSuccess, useToolkitTranslation,
} from '@stackcraftmx/calcita';

import {useSession} from '@/core';
import {listProfiles, saveProfileAbilities} from '@/modules/profiles/profilesApi.js';

// los permisos que declara cada módulo junto a su entrada del menú
const MENU_MODULES = import.meta.glob('@/modules/*/menu.js', {eager: true});

/**
 * ¿Son los mismos permisos, sin importar el orden?
 *
 * @param {string[]} first
 * @param {string[]} second
 * @returns {boolean}
 */
const haveSameAbilities = (first, second) => first.length === second.length && first.every((ability) => second.includes(ability));

/** La lista de perfiles de la izquierda. */
const ProfileList = ({profiles, selectedKey, ownProfileKey, onSelect}) => {
    const {t} = useToolkitTranslation('profiles');
    return (
        <Paper variant="outlined">
            <List component="nav" aria-label={t('page.listLabel')} sx={{p: 1}}>
                {profiles.map((profile) => (
                    <ListItemButton key={profile.key} selected={profile.key === selectedKey} onClick={() => onSelect(profile.key)}
                                    sx={{borderRadius: 1.5, alignItems: 'flex-start', flexDirection: 'column', gap: 0.5}}>
                        <Stack direction="row" spacing={1} sx={{alignItems: 'center', width: '100%'}}>
                            <Typography variant="subtitle2" sx={{flexGrow: 1}}>{profile.name}</Typography>
                            {profile.key === ownProfileKey && <Chip size="small" color="primary" label={t('page.yours')} />}
                        </Stack>
                        <ListItemText sx={{m: 0}} primary={profile.description}
                                      secondary={t('page.usersCount', {count: profile.users_count})}
                                      slotProps={{primary: {variant: 'caption', color: 'text.secondary'}, secondary: {variant: 'caption'}}} />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    );
};

export const ProfilesPage = () => {
    const {t} = useToolkitTranslation('profiles');
    const {session, refreshSession} = useSession();
    const [profiles, setProfiles] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [selectedKey, setSelectedKey] = useState(null);
    const [draftAbilities, setDraftAbilities] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    // los grupos se arman con los textos del idioma activo
    const permissionGroups = useMemo(() => composePermissionGroups(MENU_MODULES, t), [t]);

    useEffect(() => {
        const abortController = new AbortController();
        listProfiles(abortController.signal)
            .then((response) => {
                setProfiles(response);
                setSelectedKey(response[0]?.key ?? null);
                setDraftAbilities(response[0]?.abilities ?? []);
            })
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    setLoadError(error);
                }
            });
        return () => abortController.abort();
    }, []);

    // guard clause: falló; el mensaje ya viene traducido
    if (loadError) {
        return <Alert severity="error" role="alert">{loadError.message}</Alert>;
    }

    // guard clause: todavía no llegan los perfiles
    if (!profiles) {
        return (
            <Box role="status" sx={{display: 'grid', placeItems: 'center', py: 8}}>
                <CircularProgress aria-label={t('page.loading')} />
            </Box>
        );
    }

    const selectedProfile = profiles.find((profile) => profile.key === selectedKey);
    const hasChanges = !haveSameAbilities(draftAbilities, selectedProfile.abilities);

    // elegir otro perfil descarta lo que no se guardó (el aviso de «cambios sin guardar» lo dice antes)
    const select = (profileKey) => {
        setSelectedKey(profileKey);
        setDraftAbilities(profiles.find((profile) => profile.key === profileKey).abilities);
    };

    const save = async () => {
        setIsSaving(true);
        try {
            const response = await saveProfileAbilities(selectedProfile.key, draftAbilities);
            setProfiles((current) => current.map((profile) => (profile.key === response.profile.key ? response.profile : profile)));
            // el perfil de quien está dentro: la sesión trae los permisos nuevos y el menú cambia ya
            if (selectedProfile.key === session.profile.key) {
                await refreshSession();
            }
            toastSuccess(response.message);
        } catch (error) {
            toastProblem(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} />
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 4}}>
                    <ProfileList profiles={profiles} selectedKey={selectedKey} ownProfileKey={session.profile.key} onSelect={select} />
                </Grid>
                <Grid size={{xs: 12, md: 8}}>
                    <SectionCard title={selectedProfile.name}
                                 action={selectedProfile.is_locked ? null : (
                                     <Stack direction="row" spacing={1}>
                                         <Button disabled={!hasChanges || isSaving} onClick={() => setDraftAbilities(selectedProfile.abilities)}>{t('page.discard')}</Button>
                                         <Button variant="contained" disabled={!hasChanges || isSaving} onClick={save}>{t('page.save')}</Button>
                                     </Stack>
                                 )}>
                        <Stack spacing={2}>
                            {selectedProfile.is_locked && <Alert severity="info">{t('page.locked')}</Alert>}
                            {hasChanges && <Alert severity="warning" role="status">{t('page.unsaved')}</Alert>}
                            <PermissionMatrix groups={permissionGroups} value={draftAbilities} onChange={setDraftAbilities} readOnly={selectedProfile.is_locked} />
                        </Stack>
                    </SectionCard>
                </Grid>
            </Grid>
        </>
    );
};
