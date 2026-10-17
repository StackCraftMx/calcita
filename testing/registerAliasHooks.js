// Registra testing/aliasHooks.js antes de las pruebas: node --import ./resources/js/testing/registerAliasHooks.js --test
import {register} from 'node:module';

register('./aliasHooks.js', import.meta.url);
