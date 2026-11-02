// Una imagen con su vista previa: la foto de una persona (círculo, con sus iniciales mientras no hay foto) o la de un
// producto (recuadro). Se pica la vista previa o el botón, o se suelta la imagen encima. La vista previa se pinta en el
// navegador sin subir nada; value es el File nuevo, la dirección de la imagen guardada o null.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {FormSection, IMAGE_SHAPE, ImageInput} from '@stackcraftmx/calcita';

// ─── Una imagen «guardada» de mentira (en su proyecto NO va: es la dirección que manda su API) ───
const SAVED_PRODUCT_IMAGE = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#E8590C"/>'
    + '<rect x="30" y="38" width="60" height="44" rx="6" fill="#FFF4E6"/><circle cx="60" cy="60" r="12" fill="#E8590C"/></svg>',
)}`;

const ImageInputDemo = () => {
    const [photo, setPhoto] = useState<File | string | null>(null);
    const [productImage, setProductImage] = useState<File | string | null>(SAVED_PRODUCT_IMAGE);

    return (
        <FormSection title="Imágenes">
            {/* 1. Una persona: círculo con sus iniciales mientras no hay foto */}
            <ImageInput label="Foto de perfil" value={photo} onChange={setPhoto} maxSize="2 MB" helperText="JPG o PNG de hasta 2 MB."
                        placeholder={<Typography variant="h5" component="span">AM</Typography>} />
            {/* 2. Un producto: recuadro, con la imagen que ya estaba guardada */}
            <ImageInput label="Imagen del producto" value={productImage} onChange={setProductImage} shape={IMAGE_SHAPE.rounded} size={112}
                        alt="Lámpara de escritorio" />
            {/* 3. Lo que viaja al guardar */}
            <Stack sx={{px: 2, py: 1}}>
                <Typography variant="body2" color="text.secondary">
                    Viaja: {photo instanceof File ? `«${photo.name}» (nuevo)` : 'sin foto'} · {productImage instanceof File ? `«${productImage.name}» (nuevo)` : productImage ? 'la guardada' : 'sin imagen'}
                </Typography>
            </Stack>
        </FormSection>
    );
};

export default ImageInputDemo;
