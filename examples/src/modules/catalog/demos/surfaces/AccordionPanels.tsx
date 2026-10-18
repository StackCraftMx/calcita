import {useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const PANELS = ['shipping', 'returns', 'invoices'];

// uno abierto a la vez: al abrir otro, el anterior se cierra
const AccordionPanels = () => {
    const {t} = useToolkitTranslation('catalog');
    const [expandedPanel, setExpandedPanel] = useState<string | null>(PANELS[0]);

    return (
        <Box>
            {PANELS.map((panel) => (
                <Accordion key={panel} expanded={expandedPanel === panel} onChange={(event, isExpanded) => setExpandedPanel(isExpanded ? panel : null)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{fontWeight: 600}}>{t(`surfaces.accordion.panels.${panel}.title`)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">{t(`surfaces.accordion.panels.${panel}.text`)}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
            <Accordion disabled>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{t('surfaces.accordion.disabled')}</Typography></AccordionSummary>
            </Accordion>
        </Box>
    );
};

export default AccordionPanels;
