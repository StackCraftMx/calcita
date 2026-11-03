// La tarjeta de un registro: para listas donde una tabla se queda corta. Arriba quién es (avatar, folio, nombre) con su
// estatus, sus insignias y sus acciones; en medio sus datos en grupos y el dato principal grande; abajo lo que va a todo lo
// ancho y «Ver detalle», que despliega más. El orden es el que se da: nada se reacomoda solo. Mientras llega la lista,
// su esqueleto con la misma forma.
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import {Countdown, IconBadge, RECORD_CARD_FOOTER_ALIGN, RecordCard, RecordCardSkeleton, Tag, toastSuccess} from '@stackcraftmx/calcita';

// ─── Un registro de mentira (en su proyecto llega del API) ───
const inHours = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

const RecordCards = () => (
    <Stack spacing={1.5}>
        {/* 1. La tarjeta completa: identidad, datos en grupos, dato principal, abajo y detalle */}
        <RecordCard
            eyebrow="SOL-0042"
            title="Ferretería del Centro"
            subtitle="Solicitud de crédito · Monterrey"
            avatar="Ferretería del Centro"
            status={(
                <>
                    <Tag label="En revisión" color="warning" />
                    <IconBadge icon={VerifiedUserOutlinedIcon} label="Con aval" tone="success" variant="soft" />
                </>
            )}
            onOpen={() => toastSuccess('Abrir la solicitud')}
            openLabel="Abrir la solicitud SOL-0042"
            // el menú «⋯» con un título de sección y un submenú (se abre dentro del mismo menú, con «Regresar»)
            actions={[
                {type: 'section', key: 'request', label: 'Solicitud'},
                {key: 'copy', label: 'Copiar el folio', icon: <ContentCopyRoundedIcon fontSize="small" />, onClick: () => toastSuccess('Se copió SOL-0042')},
                {key: 'documents', label: 'Documentos', children: [
                    {key: 'id', label: 'Identificación', onClick: () => toastSuccess('Abrir la identificación')},
                    {key: 'proof', label: 'Comprobante de domicilio', description: 'Recibo de luz', onClick: () => toastSuccess('Abrir el comprobante')},
                ]},
            ]}
            groups={[
                {title: 'Crédito', facts: [{label: 'Solicitado', value: '$250,000.00'}, {label: 'Plazo', value: '12 meses'}, {label: 'Tasa', value: '18 % anual'}]},
                {title: 'Fechas', facts: [{label: 'Recibida', value: '28 oct 2026'}, {label: 'Vence la revisión', value: '4 nov 2026', emphasis: true}]},
            ]}
            highlight={{label: 'Pago mensual', value: '$22,920.00', caption: 'Con IVA de los intereses'}}
            footer={(
                <Typography variant="body2" color="text.secondary">
                    La revisión vence en <Countdown until={inHours(30)} showSeconds={false} label="Tiempo para que venza la revisión" />
                </Typography>
            )}
            details={<Typography variant="body2">Documentos: identificación, comprobante de domicilio y estados de cuenta.</Typography>}
        />
        {/* 2. Una sencilla: sin avatar ni dato principal */}
        <RecordCard eyebrow="SOL-0041" title="Papelería Juárez" status={<Tag label="Aprobada" color="success" />}
                    groups={[{facts: [{label: 'Solicitado', value: '$80,000.00'}, {label: 'Plazo', value: '6 meses'}]}]} />
        {/* 3. Un orden obligatorio (el de un sistema que ya existe): los grupos tal cual se dan y el estatus al final */}
        <RecordCard
            eyebrow="PM-0318"
            title="Distribuidora Norte"
            subtitle="Cliente"
            groups={[
                {title: 'Importe original', facts: [{label: 'Subtotal', value: '$100,000.00'}, {label: 'IVA', value: '$16,000.00'}, {label: 'Total', value: '$116,000.00', emphasis: true}]},
                {title: 'Importe con descuento', facts: [{label: 'Subtotal', value: '$97,000.00'}, {label: 'IVA', value: '$15,520.00'}, {label: 'Total', value: '$112,520.00', emphasis: true}]},
                {title: 'Descuento', facts: [{label: 'Inicial', value: '3 %'}, {label: 'Final', value: '3 %'}]},
                {title: 'Fechas', facts: [{label: 'Cierre', value: '30 oct 2026'}, {label: 'Pago', value: '29 nov 2026'}]},
            ]}
            trailing={<Tag label="Entregado" color="success" />}
            actions={[{key: 'copy', label: 'Copiar el folio', icon: <ContentCopyRoundedIcon fontSize="small" />, onClick: () => toastSuccess('Se copió PM-0318')}]}
        />
        {/* 4. Dos controles abajo, juntos a la derecha: en una tarjeta ancha, en orillas opuestas se ven sueltos */}
        <RecordCard eyebrow="SOL-0040" title="Mueblería Hidalgo" status={<Tag label="Por firmar" color="info" />}
                    groups={[{facts: [{label: 'Solicitado', value: '$120,000.00'}, {label: 'Plazo', value: '24 meses'}]}]}
                    footer={<Button size="small" variant="contained" onClick={() => toastSuccess('Mandar a firmar')}>Mandar a firmar</Button>}
                    footerAlign={RECORD_CARD_FOOTER_ALIGN.end}
                    details={<Typography variant="body2">Firma pendiente del representante legal.</Typography>} />
        {/* 5. Mientras llega la lista */}
        <RecordCardSkeleton groups={2} />
    </Stack>
);

export default RecordCards;
