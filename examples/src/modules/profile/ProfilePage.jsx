// «Mi perfil»: ProfileScreen del framework (sus datos, seguridad con la verificación en dos pasos, sesiones y bitácora, y
// preferencias). Lo del servidor sale del conector de la cuenta (app/accountConnector.js).
//
// Lo que el proyecto le suma, sin tocar el framework (así se ve lo que pide cada cliente «especial»):
//   - extraFields: «Área», un campo propio en «Sus datos», con su valor de inicio sacado de la sesión (department), su regla
//     de yup y su campo. Al guardar viaja al conector junto con el nombre y el teléfono (updateProfile);
//   - extraTabs: la pestaña «Notificaciones», con su propia llamada al servidor (profileApi.js).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo} from 'react';
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {ProfileScreen} from '@stackcraftmx/calcita/account';
import {FormSelectField, Yup} from '@stackcraftmx/calcita/forms';

import {NotificationsSection} from '@/modules/profile/NotificationsSection.jsx';
import {DEPARTMENT, departmentOptionsOf} from '@/modules/profile/profileDictionaries.js';

export const ProfilePage = () => {
    const {t} = useToolkitTranslation('profile');
    // con memoria: las reglas nuevas en cada pintada harían que el formulario rearme su esquema
    const extraFields = useMemo(() => ({
        initialValues: (user) => ({department: user.department ?? ''}),
        rules: {department: Yup.string().required().oneOf(Object.keys(DEPARTMENT))},
        fields: <FormSelectField name="department" label={t('fields.department')} helperText={t('fields.departmentHelp')} options={departmentOptionsOf(t)} />,
    }), [t]);
    const extraTabs = useMemo(() => [{key: 'notifications', label: t('notifications.tab'), content: <NotificationsSection />}], [t]);

    return <ProfileScreen extraFields={extraFields} extraTabs={extraTabs} />;
};
