// La puerta principal del paquete: lo que casi todo proyecto usa y solo pide MUI, xstate y sonner.
//
// Lo que necesita otras librerías va en su propia puerta, para que un proyecto instale solo lo que usa:
//   @stackcraftmx/calcita/table         la tabla de servidor (MUI X DataGrid, nuqs)
//   @stackcraftmx/calcita/forms         campos, formulario por pasos y validación (pide formik y yup)
//   @stackcraftmx/calcita/charts        gráficas de barras y columnas (recharts)
//   @stackcraftmx/calcita/timeline      línea de tiempo por grupos (@mui/lab)
//   @stackcraftmx/calcita/excel         el reporte en Excel y CSV (exceljs, que se le pasa al llamarlo)
//   @stackcraftmx/calcita/react-router  el adaptador de navegación para react-router
//   @stackcraftmx/calcita/i18next       el adaptador de textos para i18next
//   @stackcraftmx/calcita/laravel       el reintento del 419 de Laravel (Sanctum)
//   @stackcraftmx/calcita/money         el dinero exacto en centavos enteros (sin librerías)
//   @stackcraftmx/calcita/filepond      la zona para soltar archivos con FilePond (filepond, react-filepond)
//   @stackcraftmx/calcita/react-hook-form  los mismos campos de /forms, conectados a react-hook-form
//   @stackcraftmx/calcita/next          la navegación de Next.js (App Router)
//   @stackcraftmx/calcita/date-pickers  la fecha con el DatePicker de MUI X (@mui/x-date-pickers, dayjs)

// ─── configuración: idioma, textos, zona, moneda y navegación ────────────────
export {ToolkitProvider} from '@/toolkit/ToolkitProvider.jsx';
export {useToolkitNavigation, useToolkitSettings} from '@/toolkit/toolkitContext.js';
export {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
export {default as ComponentTexts} from '@/toolkit/ComponentTexts.jsx';
export {DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_LANGUAGES, configureToolkit, toolkitSettings, translateToolkit} from '@/toolkit/toolkitSettings.js';
export {browserNavigation, createBrowserNavigation} from '@/toolkit/browserNavigation.js';
export {createHashNavigation} from '@/toolkit/hashNavigation.js';
export {default as toolkitTextsEs} from '@/locales/es.js';
export {default as toolkitTextsEn} from '@/locales/en.js';

// ─── avisos, confirmaciones y descargas ──────────────────────────────────────
export {
    ConfirmDialog, ModalWaiting, NEW_BUILD_NOTICE_VARIANT, NewBuildNotice, StaleBuildBoundary, TOAST_DEFAULT_OPTIONS, Toaster, confirmActionMachine, dismissToast, errorsObjectToMessage,
    toastDefault, toastError, toastInfo, toastLoading, toastProblem, toastPromise, toastSuccess, toastWarn, useConfirmAction,
} from '@/feedback/index.js';
export {
    DEFAULT_FILE_TYPES, DOWNLOAD_STATUS, DownloadManager, UNKNOWN_FILE_TYPE, cancelDownload, clearFinishedDownloads, downloadsMachine, startDownload,
    useFileTypes,
} from '@/downloads/index.js';

// ─── el tema (opcional): el estilo de Stackcraft, con claro / oscuro y vidrio líquido ─
export {THEME_LOOK, TOP_BAR, createToolkitTheme} from '@/theme/createToolkitTheme.js';
export {isAndroidDevice} from '@/theme/androidDevice.js';
export {MINIMAL_BACKGROUND, MINIMAL_TONES} from '@/theme/components/minimalComponents.js';
export {STACKCRAFT, stackcraftDarkPalette, stackcraftLightPalette} from '@/theme/stackcraftPalette.js';
export {toolkitComponents} from '@/theme/toolkitComponents.js';
export {mergeComponents} from '@/theme/mergeComponents.js';
export {
    GLASS_INSET_PIXELS, GLASS_MENU_RADIUS_PIXELS, GLASS_OPACITY, GLASS_PANEL_RADIUS_PIXELS, ambientBackgroundOf, glassDropOf, glassStylesOf, glassSurfaceOf,
    accentTextStylesOf, canvasFieldStylesOf, fieldWellStylesOf, fixedBackgroundLayerOf, isGlassTheme, materialBackgroundOf, materialStylesOf, materialSurfaceOf,
    scrollEdgeStylesOf,
} from '@/theme/glassSurface.js';

// ─── el marco de la app, el menú compuesto y los permisos (RBAC / ABAC del proyecto) ─
export {AppLayout, MENU_POSITION} from '@/appShell/AppLayout.jsx';
export {AuthLayout} from '@/appShell/AuthLayout.jsx';
export {default as BarActions} from '@/appShell/BarActions.jsx';
export {default as BarActionButton} from '@/appShell/BarActionButton.jsx';
export {default as BarSearch} from '@/appShell/BarSearch.jsx';
export {default as ActionsMenu} from '@/ui/actions/ActionsMenu.jsx';
export {SELECTION_PHONE_LAYOUT, default as SelectionActions, selectionFloatsOnPhone} from '@/ui/actions/SelectionActions.jsx';
export {BAR_ACTIONS_PLACEMENT, useBarActionsPlacement, useCloseBarActionsMenu} from '@/appShell/barActionsSlot.js';
export {BAR_CAPSULE_HEIGHT_PIXELS, default as BarCapsule} from '@/appShell/BarCapsule.jsx';
export {usesMobileTabBar} from '@/appShell/tabBarRule.js';
export {SettingSection, default as AppearanceSettings} from '@/appShell/AppearanceSettings.jsx';
export {barMenuPlacementOf} from '@/appShell/barMenuPlacement.js';
export {DRAWER_WIDTH_COLLAPSED, DRAWER_WIDTH_EXPANDED, MAIN_CONTENT_ID} from '@/appShell/shellSizes.js';
export {useAppMenu} from '@/appShell/appMenuContext.js';
export {usePageTitle} from '@/appShell/pageTitle.jsx';
export {initialsOf, menuItemDescriptionOf, menuItemLabelOf, menuItemSectionOf, menuSectionsOf} from '@/appShell/menuItemText.js';
export {
    activeMenuItemOf, composeMenu, menuBadgeOf, menuBreadcrumbsOf, menuItemsWithIconsOf, mobileTabsOf, parentMenuItemOf, screenMenuItemsOf,
} from '@/navigation/appMenu.js';
export {menuBadgesFrom, useMenuBadges} from '@/navigation/useMenuBadges.js';
export {allowOnlyUnrestricted, createAccessChecker} from '@/access/accessRules.js';
export {default as Can} from '@/access/Can.jsx';
export {default as RequireAccess} from '@/access/RequireAccess.jsx';
export {useAccessChecker, useCan} from '@/access/useCan.js';
export {default as PermissionMatrix} from '@/access/PermissionMatrix.jsx';
export {composePermissionGroups, groupStateOf, withPermission, withPermissionGroup} from '@/access/permissionGroups.js';

// ─── entrar: las reglas de una contraseña nueva y su lista palomeada (los formularios van en /forms) ─
export {DEFAULT_PASSWORD_POLICY, PASSWORD_RULE, isPasswordAccepted, passwordChecksOf} from '@/auth/passwordRules.js';
export {default as PasswordChecklist} from '@/auth/PasswordChecklist.jsx';
export {ERROR_PAGE_KIND, default as ErrorPage} from '@/ui/layout/ErrorPage.jsx';

// ─── subir archivos (la zona de MUI; la de FilePond va en su propia puerta) ──
export {default as FileDropzone} from '@/upload/FileDropzone.jsx';
export {FILE_ACCEPT_PRESETS, FILE_REJECTION, matchesAccept, parseFileSize, resolveAccept} from '@/upload/fileRules.js';
export {buildUploadActors, uploadMachine} from '@/upload/uploadMachine.js';
export {uploadWithProgress} from '@/upload/uploadWithProgress.js';

// ─── pantalla: esqueleto, navegación, filtros, etiquetas, acciones y métricas ─
export {
    APP_BAR_HEIGHT_CSS_VARIABLE, BackButton, CHART_VIEW, CalendarHeatmap, CollapsibleSection, ColorSchemeToggle, ContentDialog, CopyButton, DateRangeFilter,
    DefinitionList, DetailHeader, DictionaryText, DocumentTitle, DownloadMenu, FONT_SIZE_LEVELS, FontSizeToggle, FullPageLoader, GlassLensFilter, GlassPanel, LANGUAGES,
    LanguageToggle, MetricCard, PageBreadcrumbs, PageHeader, PageHeading, ProfileHeader, TREND_DIRECTION,
    PeriodRangeSelector, QuickFilters, SCROLL_MARGIN_BELOW_APP_BAR, SEGMENTED_CONTROL_SX, ScrollableRow, SecretField, SectionCard, SegmentedControl,
    StatusChip, TableToggle, Tag, scrollableRow, useAppBarHeightPublisher,
} from '@/ui/index.js';

// ─── campos sueltos: la vista de cada campo, sin librería de formularios ────
// (conectados a formik en /forms y a react-hook-form en /react-hook-form; la fecha en /date-pickers)
export {default as CatalogInput} from '@/inputs/CatalogInput.jsx';
export {default as ColorInput} from '@/inputs/ColorInput.jsx';
export {default as FieldFrame} from '@/inputs/FieldFrame.jsx';
export {FORM_ROW_CLASS, FormRow, default as FormSection} from '@/inputs/FormSection.jsx';
export {default as NumberInput} from '@/inputs/NumberInput.jsx';
export {default as SelectInput} from '@/inputs/SelectInput.jsx';
export {default as WizardLayout} from '@/inputs/WizardLayout.jsx';
export {default as TextInput} from '@/inputs/TextInput.jsx';
export {HEX_COLOR, MIN_CONTRAST, contrastOnWhite, readableVariantOf} from '@/inputs/colorContrast.js';
export {cleanNumberText, completeDecimals, groupThousands} from '@/inputs/numberText.js';
export {translateValidationMessage} from '@/forms/validationMessages.js';

// ─── diccionarios de valores del API ─────────────────────────────────────────
export {dictionaryEntryOf, labelOf, lookup, shortLabelOf} from '@/dictionaries/dictionaries.js';

// ─── formatos, fechas, errores del servidor y utilidades ─────────────────────
export {
    dayOfPlainDate, formatCurrency, formatDate, formatDateTime, formatFileSize, formatList, formatMonthName, formatMonthShortName, formatNumber,
    formatPercent, formatTime, formatWeekdayShortName, formattersOf,
} from '@/formatting.js';
export {useFormatters} from '@/toolkit/useFormatters.js';
export {parseInstant, parsePlainDate} from '@/dates.js';
export {fieldErrorsOf, problemMessage, problemTitle} from '@/problems.js';
export {newIdentifier} from '@/identifiers.js';
export {XLSX_CONTENT_TYPE, fileNameFromContentDisposition, isCompleteZip, saveBlob} from '@/files.js';
export {REDIRECT_PARAM, readRedirectParam, safeInternalPath, withRedirect} from '@/navigation.js';
export {recallListUrl, rememberListUrl, useRememberListUrl} from '@/lastListUrl.js';
export {currentHistoryIndex, forgetPageName, pageNameAt, rememberPageName, useNavigationTrail, usePageName} from '@/navigationTrail.js';
export {periodRangeIsValid, rangeEndAfterStartChange, rangeEndOptionsOf} from '@/periodRanges.js';
export {addLogSink, createLogger, setLogLevel} from '@/observability/logger.js';
export {isNewBuildPublished, reportPublishedBuild, useNewBuildPublished} from '@/observability/publishedBuild.js';
export {BUILD_WATCH_ACTION, buildWatchActionOf, publishedBuildIdOf} from '@/observability/buildWatch.js';
export {usePublishedBuildWatch} from '@/observability/usePublishedBuildWatch.js';

// ─── la petición de la casa: el cliente del servidor, sus errores y la recarga por una versión publicada ──
export {API_ERROR_STATUS, ApiError} from '@/api/ApiError.js';
export {API_RESPONSE_PARSE, apiErrorOf, apiUrlOf, createApiClient} from '@/api/createApiClient.js';
export {isStaleChunkError, recoverFromStaleChunk} from '@/api/staleChunks.js';

// ─── seguridad de la cuenta: códigos de recuperación, sesiones abiertas y bitácora (los formularios van en /forms) ──
export {ACCOUNT_EVENT_KIND, default as ActivityLog} from '@/security/ActivityLog.jsx';
export {default as RecoveryCodesDialog} from '@/security/RecoveryCodesDialog.jsx';
export {default as SessionsCard} from '@/security/SessionsCard.jsx';

// ─── bandeja tipo correo: las carpetas, la lista y la lectura ──
export {default as InboxLayout} from '@/inbox/InboxLayout.jsx';
export {default as MessageList} from '@/inbox/MessageList.jsx';
export {default as MessageView} from '@/inbox/MessageView.jsx';
export {inboxDateOf} from '@/inbox/inboxDates.js';

// ─── instalar la app (PWA): la invitación, los pasos por equipo y la entrada del menú de la cuenta ──
export {INSTALL_VARIANT, detectPlatform, parseIOSMajor, resolveInstallVariant} from '@/pwa/installInstructions.js';
export {useInstallPrompt} from '@/pwa/useInstallPrompt.js';
export {default as InstallInstructionsDialog, variantHasInstructions} from '@/pwa/InstallInstructionsDialog.jsx';
export {default as InstallPromptBanner} from '@/pwa/InstallPromptBanner.jsx';
export {default as InstallAppSetting} from '@/pwa/InstallAppSetting.jsx';
