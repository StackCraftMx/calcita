// Un cargador propio con useFilePicker: la misma revisión de tipo y peso, los mismos avisos y soltar encima, con el botón o la
// tarjeta que pida el diseño. Aquí, una tarjeta «Suelte la foto del ticket».
import {useState} from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import {useFilePicker} from '@stackcraftmx/calcita';

const OwnPickerDemo = () => {
    const [ticket, setTicket] = useState<File | null>(null);
    // 1. Las reglas y qué hacer con lo que pasa; lo que no pasa se avisa solo
    const picker = useFilePicker({accept: 'image', maxSize: '3 MB', onAccept: setTicket});

    return (
        <Card variant="outlined" sx={{maxWidth: 360, outline: picker.isDragging ? 2 : 0, outlineStyle: 'dashed', outlineColor: 'primary.main'}}>
            {/* 2. El input escondido y el área que lo abre o recibe lo que se suelta */}
            <input {...picker.inputProps} aria-label="Foto del ticket" />
            <CardActionArea onClick={picker.open} {...picker.dropHandlers} sx={{p: 3, textAlign: 'center'}}>
                <ReceiptLongOutlinedIcon color="primary" fontSize="large" />
                <Typography variant="subtitle1">{ticket ? ticket.name : 'Suelte aquí la foto del ticket'}</Typography>
                <Typography variant="body2" color="text.secondary">o pique para elegirla · imagen de hasta 3 MB</Typography>
            </CardActionArea>
        </Card>
    );
};

export default OwnPickerDemo;
