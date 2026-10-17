// Tira horizontal que se desliza, no que se envuelve (chips de filtros y accesos rápidos).
//
// Con muchos filtros puestos los chips se envolvían en varios renglones y empujaban la tabla fuera de la pantalla,
// justo cuando más falta hace ver el resultado. Encapsula lo que hace falta para que la tira se sienta nativa:
//   - overflow-x sin barra visible en los tres motores;
//   - arrastre con el mouse en escritorio (el deslizamiento táctil ya es gratis);
//   - la rueda vertical se convierte en desplazamiento horizontal;
//   - el borde por el que sigue habiendo contenido se DESVANECE: sin barra ni desvanecido, una tira cortada a la mitad
//     se lee como un chip mal pintado.
// Todo eso se activa SOLO cuando de verdad hay desbordamiento.
//
// OJO: el umbral de 5 px separa el arrastre del clic; mover más cancela el clic que venía detrás, para no borrar un
// filtro cuando lo que se quería era desplazar la tira.
//
// Genérico del paquete: function (regla de la casa).
import {Children, useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';

/** El mixin sin arrastre, para cuando no se puede envolver el elemento. */
export const scrollableRow = {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {display: 'none'},
};

const DRAG_THRESHOLD_PIXELS = 5;

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {number} [props.gap]
 * @param {number} [props.py]
 * @param {object} [props.sx]
 * @param {boolean} [props.enableDragScroll]
 * @param {boolean} [props.enableWheelToX]
 * @param {boolean} [props.fadeEdges]
 * @param {import('react').Ref<HTMLElement>} [props.ref]
 */
export default function ScrollableRow({
    children, gap = 1, py = 0.5, sx, enableDragScroll = true, enableWheelToX = true, fadeEdges = true, ref, ...boxProps
}) {
    const rowElement = useRef(null);
    // por dónde sigue habiendo contenido: decide de qué lado va el desvanecido
    const [edges, setEdges] = useState({overflow: false, start: false, end: false});

    const assignRef = (node) => {
        rowElement.current = node;
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref && typeof ref === 'object') {
            ref.current = node;
        }
    };

    // el número de hijos es la señal estable para revisar de nuevo (el padre agrega y quita chips)
    const childrenCount = Children.count(children);
    useEffect(() => {
        const element = rowElement.current;
        if (!element) {
            return undefined;
        }
        // el +1 evita el falso positivo por subpíxel
        const measureEdges = () => setEdges({
            overflow: element.scrollWidth > element.clientWidth + 1,
            start: element.scrollLeft > 1,
            end: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
        });
        measureEdges();

        const resizeObserver = new ResizeObserver(measureEdges);
        resizeObserver.observe(element);
        element.addEventListener('scroll', measureEdges, {passive: true});
        return () => {
            resizeObserver.disconnect();
            element.removeEventListener('scroll', measureEdges);
        };
    }, [childrenCount]);

    useEffect(() => {
        const element = rowElement.current;
        if (!element) {
            return undefined;
        }

        let isDragging = false;
        let hasMoved = false;
        let startX = 0;
        let scrollStart = 0;

        const isOverflowing = () => element.scrollWidth > element.clientWidth + 1;

        const handleMouseDown = (event) => {
            if (event.button !== 0 || !isOverflowing()) {
                return;
            }
            // arrastrar dentro de un campo de texto es seleccionar texto, no desplazar la tira
            if (['INPUT', 'TEXTAREA'].includes(event.target?.tagName)) {
                return;
            }
            isDragging = true;
            hasMoved = false;
            startX = event.pageX;
            scrollStart = element.scrollLeft;
        };

        const handleMouseMove = (event) => {
            if (!isDragging) {
                return;
            }
            const distance = event.pageX - startX;
            if (!hasMoved && Math.abs(distance) > DRAG_THRESHOLD_PIXELS) {
                hasMoved = true;
                element.style.cursor = 'grabbing';
            }
            if (hasMoved) {
                event.preventDefault();
                element.scrollLeft = scrollStart - distance;
            }
        };

        const stopDragging = () => {
            isDragging = false;
            element.style.cursor = '';
        };

        const handleClickCapture = (event) => {
            if (!hasMoved) {
                return;
            }
            // se arrastró: el clic que viene detrás NO es un clic
            event.preventDefault();
            event.stopPropagation();
            hasMoved = false;
        };

        const handleWheel = (event) => {
            if (isOverflowing() && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                event.preventDefault();
                element.scrollLeft += event.deltaY;
            }
        };

        if (enableDragScroll) {
            element.addEventListener('mousedown', handleMouseDown);
            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('mouseup', stopDragging);
            element.addEventListener('mouseleave', stopDragging);
            element.addEventListener('click', handleClickCapture, true);
        }
        if (enableWheelToX) {
            element.addEventListener('wheel', handleWheel, {passive: false});
        }

        return () => {
            element.removeEventListener('mousedown', handleMouseDown);
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseup', stopDragging);
            element.removeEventListener('mouseleave', stopDragging);
            element.removeEventListener('click', handleClickCapture, true);
            element.removeEventListener('wheel', handleWheel);
        };
    }, [enableDragScroll, enableWheelToX]);

    const isDragEnabled = enableDragScroll && edges.overflow;

    // máscara y no degradado encima: funciona sin saber de qué color es el fondo
    const fadeMask = fadeEdges && edges.overflow
        ? `linear-gradient(to right, ${[
            edges.start ? 'transparent 0, black 24px' : 'black 0',
            edges.end ? 'black calc(100% - 24px), transparent 100%' : 'black 100%',
        ].join(', ')})`
        : undefined;

    return (
        <Box ref={assignRef}
             sx={{
                 ...scrollableRow,
                 gap,
                 py,
                 cursor: isDragEnabled ? 'grab' : 'auto',
                 userSelect: isDragEnabled ? 'none' : 'auto',
                 ...(fadeMask && {maskImage: fadeMask, WebkitMaskImage: fadeMask}),
                 ...sx,
             }}
             {...boxProps}>
            {children}
        </Box>
    );
}
