// Textos del paquete en inglés. Cada proyecto puede cambiar cualquiera con `texts` o `translate` de ToolkitProvider, con
// la misma forma: namespace, llaves anidadas, {{variable}} y plurales _one / _other.
export default Object.freeze({
    "table": {
        "search": {
            "placeholder": "Search within these results…"
        },
        "count": {
            "records_one": "{{total}} record",
            "records_other": "{{total}} records",
            "capped": "more than {{total}} records",
            "cappedTag": "approximate total",
            "cappedTooltip": "There are at least these records and there may be more: add a filter to see them all."
        },
        "empty": {
            "default": "No records",
            "filtered": "No record matches the filters you set.",
            "clearFilters": "Remove filters"
        },
        "chips": {
            "applied_one": "{{count}} filter applied",
            "applied_other": "{{count}} filters applied",
            "clearAll": "Clear all"
        },
        "columnFilter": {
            "tooltip": "Filter (applies to all records, not only this page)",
            "activeTooltip_one": "{{count}} filter on this column",
            "activeTooltip_other": "{{count}} filters on this column",
            "clear": "Clear this column",
            "contains": "Contains"
        },
        "options": {
            "searchPlaceholder": "Search option…",
            "empty": "No values in this result",
            "noMatch": "No option matches “{{text}}”"
        },
        "sort": {
            "tooltip": "Sort by this column",
            "ascending": "ascending order",
            "descending": "descending order",
            "clear": "Remove sorting"
        },
        "selection": {
            "count_one": "{{total}} selected",
            "count_other": "{{total}} selected",
            "allMatching": "All {{total}} matching are selected",
            "allMatchingCapped": "All matching are selected",
            "pageSelected_one": "The only row on this page is selected.",
            "pageSelected_other": "The {{count}} on this page are selected.",
            "selectAllMatching": "Select all {{total}} matching",
            "selectAllMatchingCapped": "Select all matching",
            "onlyThisPage": "Select only this page",
            "clear": "Clear selection",
            "summaryLabel": "The selection",
            "actionsLabel": "Actions for the selected"
        },
        "goToPage": {
            "page": "Page",
            "of_one": "of {{total}}",
            "of_other": "of {{total}}",
            "ariaLabel": "Go to page"
        },
        "quickFilters": {
            "all": "All",
            "countAriaLabel": "{{count}} records"
        },
        "detail": {
            "tooltip": "View details",
            "ariaLabel": "View the details of this record"
        },
        "error": {
            "generic": "We couldn't load the table."
        },
        "dateRange": {
            "label": "Custom",
            "title": "Date range",
            "from": "From",
            "to": "To",
            "fromHelp": "From the start of that day",
            "toHelp": "Until the end of that day",
            "invalid": "“To” can’t be before “From”",
            "summary": "{{from}} – {{to}}",
            "today": "today",
            "clear": "Remove",
            "apply": "Apply"
        },
        "audit": {
            "columns": {
                "occurredAt": "Date and time",
                "event": "What happened",
                "result": "Result",
                "actor": "Who"
            },
            "systemActor": "Automatic process",
            "eventFilterCaption": "Filter by event",
            "count_one": "{{count}} event",
            "count_other": "{{count}} events",
            "empty": "No events recorded yet."
        }
    },
    "common": {
        "actions": {
            "cancel": "Cancel",
            "confirm": "Confirm",
            "retry": "Try again",
            "download": "Download",
            "close": "Close",
            "back": "Back",
            "reload": "Reload the page"
        },
        "status": {
            "loading": "Loading…",
            "noData": "No data"
        },
        "form": {
            "showPassword": "Show password",
            "hidePassword": "Hide password",
            "clear": "Clear the text",
            "selectPlaceholder": "Choose an option",
            "copy": "Copy",
            "copied": "Copied",
            "noOptions": "No option matches",
            "loadingOptions": "Loading options…",
            "pickColor": "Pick the color",
            "colorContrast": "Contrast on white: {{ratio}}:1",
            "colorLowContrast": "With that color the text would be hard to read on white. {{suggestion}} is the same hue, darker.",
            "colorUseSuggestion": "Use {{color}}"
        },
        "selection": {
            "clear": "Clear selection",
            "actionsLabel": "Actions for the selected",
            "summaryLabel": "The selection"
        },
        "wizard": {
            "next": "Next",
            "back": "Back",
            "skip": "Skip this step",
            "optional": "Optional",
            "skipped": "Skipped",
            "stepOf": "Step {{current}} of {{total}}"
        },
        "language": {
            "switchTo": {
                "es": "Switch to Spanish",
                "en": "Switch to English"
            },
            "switchToNamed": "Switch to {{name}}",
            "choose": "Language: {{name}}. Choose another"
        },
        "colorScheme": {
            "label": "Light or dark",
            "switchTo": {
                "light": "Switch to light mode",
                "dark": "Switch to dark mode"
            }
        },
        "toast": {
            "done": "Done",
            "error": "Something went wrong",
            "warning": "Heads up",
            "info": "Notice",
            "working": "Working…"
        },
        "waiting": {
            "title": "One moment",
            "text": "We're processing your request. Don't close this window."
        },
        "newBuild": {
            "message": "A new version of the system is available. Reload the page to use it.",
            "short": "New version available",
            "reload": "Reload"
        },
        "install": {
            "banner": "Install this app on your device to open it faster",
            "action": "Install",
            "howTo": "How to install",
            "dismiss": "Not now",
            "gotIt": "Got it",
            "menuLabel": "Install the app",
            "iosModern": {
                "title": "Install on your iPhone or iPad",
                "step1": "Tap ⋯ (the three dots) next to the address bar.",
                "step2": "Tap “Share”.",
                "step3": "Tap “Add to Home Screen”.",
                "step4": "Keep “Open as Web App” on and tap “Add”."
            },
            "iosClassic": {
                "title": "Install on your iPhone",
                "step1": "Tap the Share button (the square with an up arrow).",
                "step2": "Tap “Add to Home Screen”.",
                "step3": "Tap “Add”."
            },
            "androidFirefox": {
                "title": "Install in Firefox",
                "step1": "Tap the ⋮ menu.",
                "step2": "Tap “Install” or “Add to Home screen”.",
                "step3": "Confirm."
            }
        },
        "upload": {
            "hint": "Drop your file here",
            "hintMultiple": "Drop your files here",
            "choose": "Choose file",
            "chooseMultiple": "Choose files",
            "remove": "Remove {{name}}",
            "invalidTitle": "File not allowed",
            "invalidType": "“{{name}}” is not an allowed type. Accepted: {{accept}}.",
            "tooLarge": "“{{name}}” is larger than {{max}}.",
            "tooLargeShort": "Larger than allowed",
            "totalTooLargeShort": "Together they are larger than allowed",
            "tooManyFiles_one": "You can upload up to {{count}} file.",
            "tooManyFiles_other": "You can upload up to {{count}} files.",
            "maxSizeHint": "Up to {{max}} per file",
            "maxTotalSizeHint": "Up to {{max}} in total",
            "maxFilesHint_one": "Up to {{count}} file",
            "maxFilesHint_other": "Up to {{count}} files",
            "summary_one": "{{count}} file · {{total}}",
            "summary_other": "{{count}} files · {{total}}",
            "summaryOf_one": "{{count}} file · {{total}} of {{max}}",
            "summaryOf_other": "{{count}} files · {{total}} of {{max}}",
            "pond": {
                "loading": "Loading",
                "loadError": "Could not load",
                "waitingForSize": "Waiting for size",
                "sizeNotAvailable": "Size not available",
                "invalidField": "Some files are not valid",
                "processing": "Uploading",
                "processingComplete": "Uploaded",
                "processingAborted": "Upload canceled",
                "processingError": "Could not upload",
                "revertError": "Could not undo",
                "removeError": "Could not remove",
                "tapToCancel": "tap to cancel",
                "tapToRetry": "tap to retry",
                "tapToUndo": "tap to undo",
                "remove": "Remove",
                "abortLoad": "Cancel",
                "retryLoad": "Retry",
                "abortProcessing": "Cancel",
                "undoProcessing": "Undo",
                "retryProcessing": "Retry",
                "processItem": "Upload"
            }
        },
        "download": {
            "formats": {
                "pdf": {
                    "label": "PDF",
                    "hint": "To read, print or archive"
                },
                "xlsx": {
                    "label": "Excel",
                    "hint": "To filter and cross with other data"
                },
                "csv": {
                    "label": "CSV",
                    "hint": "Plain text, to import into another system"
                }
            }
        },
        "downloads": {
            "title": "Downloads",
            "summaryDownloading_one": "Downloading {{count}} file…",
            "summaryDownloading_other": "Downloading {{count}} files…",
            "summaryCompleted_one": "{{count}} download complete",
            "summaryCompleted_other": "{{count}} downloads complete",
            "summaryFailed_one": "{{count}} download could not be completed",
            "summaryFailed_other": "{{count}} downloads could not be completed",
            "collapse": "Minimize",
            "expand": "Show downloads",
            "close": "Close",
            "cancel": "Cancel download",
            "cancelOf": "Cancel the download of {{name}}",
            "completedOf": "{{name}} downloaded",
            "failedOf": "Could not download {{name}}",
            "canceledOf": "The download of {{name}} was canceled",
            "preparing": "Preparing the file…",
            "progressOf": "{{loaded}} of {{total}}",
            "progressLoaded": "{{loaded}} downloaded",
            "failed": "Could not download",
            "canceled": "Canceled"
        },
        "charts": {
            "viewAsTable": "View as table",
            "legend": "What each series is",
            "viewAsChart": "View as chart",
            "less": "Less",
            "more": "More",
            "day": "Day"
        }
    },
    "layout": {
        "skipToContent": "Skip to content",
        "barActions": {
            "more": "More actions"
        },
        "drawer": {
            "open": "Open the menu",
            "ariaLabel": "Main menu",
            "expand": "Expand the side menu",
            "collapse": "Collapse the side menu",
            "more": "More",
            "showTabs": "Show the tabs",
            "editTabs": "Edit the bar",
            "editTabsHint": "Choose up to {{count}} screens for the bottom bar; the rest stay in “More”.",
            "tabInBar": "{{label}} in the bar",
            "resetTabs": "Restore defaults",
            "doneEditing": "Done",
            "scrollDown": "See more of the menu",
            "scrollUp": "See the top of the menu"
        },
        "account": {
            "open": "Open your account menu",
            "myProfile": "My profile"
        },
        "settings": {
            "open": "Settings",
            "language": "Language",
            "colorScheme": "Light or dark",
            "light": "Light",
            "dark": "Dark",
            "system": "Automatic"
        },
        "fontSize": {
            "label": "Text size",
            "normal": "Normal",
            "large": "Large",
            "xLarge": "Extra large"
        },
        "languageName": {
            "es": "Español",
            "en": "English"
        },
        "breadcrumbs": "You are here",
        "signOut": "Sign out",
        "navigating": "Loading the screen"
    },
    "auth": {
        "signIn": {
            "title": "Sign in",
            "subtitle": "Sign in with your email and your password.",
            "email": "Email",
            "password": "Password",
            "remember": "Keep me signed in on this device",
            "submit": "Sign in",
            "forgot": "Forgot your password?"
        },
        "forgotPassword": {
            "title": "Recover your password",
            "subtitle": "Type the email you sign in with and we will send you a link to choose a new password.",
            "email": "Email",
            "submit": "Send the link",
            "sentTitle": "Check your email",
            "sent": "If {{email}} has an account, a link will arrive in a few minutes. If you do not see it, check your spam folder.",
            "backToSignIn": "Back to sign in"
        },
        "changePassword": {
            "title": "Change password",
            "current": "Current password",
            "next": "New password",
            "confirm": "Repeat the new password",
            "submit": "Change password",
            "mismatch": "The two new passwords are not the same.",
            "sameAsCurrent": "The new password must be different from the current one.",
            "notAccepted": "The new password does not meet what is asked below.",
            "done": "Your password changed. Next time, sign in with the new one."
        },
        "passwordRules": {
            "title": "The new password must have",
            "minLength": "At least {{count}} characters",
            "lowercase": "A lowercase letter",
            "uppercase": "An uppercase letter",
            "number": "A number",
            "symbol": "A symbol, for example ! ? # -",
            "met": "done",
            "missing": "missing"
        }
    },
    "access": {
        "permissions": {
            "countOf": "{{count}} of {{total}}",
            "allOf": "All the permissions of {{group}}"
        }
    },
    "metricCard": {
        "trend": {
            "up": "Went up",
            "down": "Went down",
            "flat": "No change"
        }
    },
    "errorPage": {
        "goHome": "Go to the home page",
        "retry": "Try again",
        "reload": "Reload",
        "newVersion": {
            "title": "There is a new version",
            "text": "An update was published while you had the page open. Reload to continue where you were."
        },
        "notFound": {
            "title": "This page does not exist",
            "text": "The address does not match any screen. The link may be incomplete or the page may no longer exist."
        },
        "forbidden": {
            "title": "You do not have permission to see this screen",
            "text": "Your user does not have access to this information. If you think this is a mistake, contact the administrator."
        },
        "serverError": {
            "title": "Something failed on our side",
            "text": "We could not show this screen. Try again in a moment; if the problem continues, contact support."
        }
    },
    "problems": {
        "offline": {
            "title": "No connection",
            "detail": "We couldn't reach the server. Check your connection and try again."
        },
        "unauthenticated": {
            "title": "You need to sign in",
            "detail": "Your session is not valid or has ended. Sign in again to continue."
        },
        "forbidden": {
            "title": "You don't have permission to do this",
            "detail": "Your user doesn't have access to this information or operation. If you think this is a mistake, contact the administrator."
        },
        "notFound": {
            "title": "We couldn't find what you're looking for",
            "detail": "The address or record you requested doesn't exist or is no longer available."
        },
        "conflict": {
            "title": "This can't be done right now",
            "detail": "The record changed or is not in the required state. Refresh the screen and try again."
        },
        "payloadTooLarge": {
            "title": "What you sent is too large",
            "detail": "The file or data exceeds the maximum allowed size."
        },
        "csrfTokenMismatch": {
            "title": "The page needs to be refreshed",
            "detail": "Too much time passed or the page is out of date. Reload it and try again."
        },
        "validation": {
            "title": "The submitted data is not valid",
            "detail": "Check the highlighted fields and try again."
        },
        "tooManyRequests": {
            "title": "Too many attempts in a row",
            "detail": "You made many requests in a short time. Wait a moment and try again."
        },
        "serverError": {
            "title": "We couldn't complete your request",
            "detail": "Something went wrong on our side. Try again in a moment; if it continues, contact support."
        },
        "serviceUnavailable": {
            "title": "The service is unavailable",
            "detail": "The server is not responding right now. Try again in a moment."
        },
        "generic": {
            "title": "We couldn't complete your request",
            "detail": "Something went wrong with your request. If it continues, contact support."
        },
        "gone": {
            "title": "This is no longer available",
            "detail": "The link or record expired or was already used."
        }
    },
    "validation": {
        "default": "The value is not valid.",
        "required": "This field is required.",
        "notType": "The value doesn't have the expected format.",
        "oneOf": "Choose one of the options.",
        "notOneOf": "That value isn't allowed.",
        "email": "Enter a valid email, for example name@company.com.",
        "url": "Enter a valid web address.",
        "uuid": "The identifier is not valid.",
        "stringLength_one": "Enter exactly {{count}} character.",
        "stringLength_other": "Enter exactly {{count}} characters.",
        "stringMin_one": "Enter at least {{count}} character.",
        "stringMin_other": "Enter at least {{count}} characters.",
        "stringMax_one": "Enter at most {{count}} character.",
        "stringMax_other": "Enter at most {{count}} characters.",
        "matches": "The format is not valid.",
        "trim": "Remove the spaces at the beginning and the end.",
        "lowercase": "Write it in lowercase.",
        "uppercase": "Write it in uppercase.",
        "numberMin": "It can't be less than {{min}}.",
        "numberMax": "It can't be greater than {{max}}.",
        "lessThan": "It must be less than {{less}}.",
        "moreThan": "It must be greater than {{more}}.",
        "positive": "It must be a positive number.",
        "negative": "It must be a negative number.",
        "integer": "It must be a whole number.",
        "dateMin": "The date can't be before {{min}}.",
        "dateMax": "The date can't be after {{max}}.",
        "arrayMin_one": "Choose at least {{count}} option.",
        "arrayMin_other": "Choose at least {{count}} options.",
        "arrayMax_one": "Choose at most {{count}} option.",
        "arrayMax_other": "Choose at most {{count}} options.",
        "arrayLength_one": "Choose exactly {{count}} option.",
        "arrayLength_other": "Choose exactly {{count}} options."
    },
    "dictionaries": {
        "unknown": {
            "label": "No status",
            "tooltip": ""
        }
    },
    "security": {
        "passkeys": {
            "cancelled": "No passkey was used. You can try again.",
            "alreadyRegistered": "That passkey is already registered in your account.",
            "wrongDomain": "Passkeys only work at the official address of the system.",
            "failed": "The browser could not use the passkey.",
            "unsupported": "This browser does not support passkeys."
        },
        "twoStep": {
            "title": "Two-step verification",
            "description": "Besides your password, a second step when you sign in. If someone gets your password, they cannot get in without it.",
            "active": "On",
            "activeSince": "Since {{date}}",
            "inactive": "Off",
            "inactiveTooltip": "Your account is only protected by your password.",
            "passkeysTitle": "Passkeys",
            "add": "Add",
            "passkeysEmpty": "The safest way: sign in with the fingerprint, face or PIN of your device.",
            "passkeyUsed": "Last used {{date}}",
            "passkeyCreated": "Created {{date}}",
            "removePasskey": "Remove {{name}}",
            "removePasskeyTooltip": "Remove this passkey",
            "appTitle": "Authenticator app",
            "appActiveSince": "On since {{date}}",
            "appDescription": "A 6-digit code that changes every 30 seconds.",
            "activate": "Turn on",
            "deactivate": "Turn off",
            "codesTitle": "Recovery codes",
            "codesRemaining_one": "You have {{count}} unused code left.",
            "codesRemaining_other": "You have {{count}} unused codes left.",
            "codesNone": "You have no codes left: generate new ones.",
            "regenerate": "Generate new ones",
            "passwordLabel": "Your current password",
            "passwordRequired": "Type your password.",
            "disableTitle": "Turn off the authenticator app?",
            "disableText": "If you do not have a passkey, your account will only be protected by your password and your recovery codes will stop working.",
            "removeTitle": "Remove “{{name}}”?",
            "removeText": "You will no longer be able to sign in with this passkey. Also delete it from your device or password manager.",
            "remove": "Remove",
            "regenerateTitle": "Generate new codes?",
            "regenerateText": "The codes you have now will stop working.",
            "generate": "Generate",
            "passkeyDialogTitle": "Add a passkey",
            "passkeyDialogText": "A passkey uses the fingerprint, face or PIN of this device or of your phone. It cannot be stolen by a fake page and lets you sign in without typing your password.",
            "passkeyName": "Name to recognize it (optional)",
            "passkeyNamePlaceholder": "For example: work MacBook",
            "createPasskey": "Create passkey",
            "totpDialogTitle": "Turn on the authenticator app",
            "totpStep1": "1. Open your app (Google Authenticator, Microsoft Authenticator, 1Password…) and scan this code.",
            "totpQrAlt": "QR code for the authenticator app",
            "totpCantScan": "Cannot scan? Type this key in your app:",
            "totpStep2": "2. Type the 6-digit code the app shows.",
            "codeLabel": "Code",
            "codeRequired": "Type the 6-digit code.",
            "codeFormat": "It is 6 digits, as shown in your app.",
            "passkeyAdded": "Passkey added",
            "passkeyRemoved": "Passkey removed",
            "appActivated": "Authenticator app turned on",
            "appDeactivated": "Authenticator app turned off"
        },
        "recoveryCodes": {
            "title": "Save your recovery codes",
            "warning": "This is the only time you will see them. With one of them you can sign in if you lose your phone or your passkey; each one works only once.",
            "copyAll": "Copy all",
            "download": "Download .txt",
            "saved": "I saved them in a safe place",
            "done": "Done",
            "fileTitle": "{{appName}} · recovery codes",
            "fileAccount": "Account: {{account}}",
            "fileGenerated": "Generated: {{date}}",
            "fileHowTo": "Each code works ONLY once to sign in if you do not have your phone or your passkey.",
            "fileKeepSafe": "Keep them in a safe place (a password manager or printed and locked away).",
            "fileName": "recovery-codes-{{date}}.txt"
        },
        "secondStep": {
            "intro": "Your account has two-step verification. Confirm it is you to finish signing in.",
            "usePasskey": "Use my passkey",
            "or": "or",
            "appCodeLabel": "Code from your authenticator app",
            "appCodeHelp": "Open it (Google Authenticator, Microsoft Authenticator, 1Password…) and type the 6 digits.",
            "recoveryCodeLabel": "Recovery code",
            "recoveryCodeHelp": "One of the codes you saved when you turned on verification. Each one works only once.",
            "recoveryCodeRequired": "Type one of your recovery codes.",
            "recoveryCodeFormat": "They look like ABCDE-FGHJK.",
            "confirm": "Confirm",
            "useRecovery": "I do not have my phone: use a recovery code",
            "useApp": "Use the code from my authenticator app",
            "otherAccount": "Sign in with another account",
            "remainingAttempts_one": "You have {{count}} attempt left.",
            "remainingAttempts_other": "You have {{count}} attempts left."
        },
        "sessions": {
            "title": "My sessions",
            "description": "Where your account is open. If you do not recognize a device, sign out of the others and change your password.",
            "current": "This device",
            "device": "{{browser}} on {{platform}}",
            "otherBrowser": "Another browser",
            "otherPlatform": "another system",
            "since": "Since {{date}}",
            "network": "network {{network}}",
            "onlyThis": "Your session is only open on this device.",
            "closeOthers": "Sign out of the other devices",
            "confirmTitle": "Sign out of the other devices?",
            "confirmText_one": "You will be signed out of {{count}} device. This one stays in, and on the other one you will have to sign in again with your password.",
            "confirmText_other": "You will be signed out of {{count}} devices. This one stays in, and on the others you will have to sign in again with your password.",
            "confirm": "Sign out of the others",
            "closed_one": "Signed out of {{count}} device",
            "closed_other": "Signed out of {{count}} devices",
            "noneClosed": "There were no sessions open on other devices"
        },
        "activity": {
            "title": "Account activity",
            "description": "The latest things that happened with your account. If you see something that was not you, change your password and sign out of the other devices.",
            "empty": "There is no activity yet.",
            "from": "{{device}} · network {{network}}",
            "kinds": {
                "signedIn": "Signed in",
                "signInFailed": "Sign-in attempt with a wrong password",
                "signedOut": "Signed out",
                "passwordChanged": "Changed the password",
                "twoStepEnabled": "Turned on two-step verification",
                "twoStepDisabled": "Turned off two-step verification",
                "passkeyAdded": "Added a passkey",
                "passkeyRemoved": "Removed a passkey",
                "recoveryCodesGenerated": "Generated new recovery codes",
                "recoveryCodeUsed": "Signed in with a recovery code",
                "sessionsClosed": "Signed out of the other devices"
            }
        }
    },
    "calendar": {
        "details": {
            "when": "When",
            "timeRange": "{{date}}, {{start}} to {{end}}",
            "allDay": "{{date}}, all day",
            "location": "Where",
            "meeting": "Online meeting",
            "join": "Join",
            "attendees": "Guests",
            "attendeesCount_one": "{{count}} guest",
            "attendeesCount_other": "{{count}} guests",
            "response": {"accepted": "Going", "declined": "Not going", "pending": "No answer"},
            "reminder": "Reminder",
            "reminderUnit": {
                "atStart": "At start",
                "minutes_one": "{{count}} minute before",
                "minutes_other": "{{count}} minutes before",
                "hours_one": "{{count}} hour before",
                "hours_other": "{{count}} hours before",
                "days_one": "{{count}} day before",
                "days_other": "{{count}} days before"
            },
            "notes": "Notes"
        },
        "previous": "Previous",
        "next": "Next",
        "today": "Today",
        "view": "Calendar view",
        "views": {
            "month": "Month",
            "week": "Week",
            "day": "Day",
            "list": "List"
        }
    },
    "kanban": {
        "dueCompleted": "Was due {{date}}",
        "complete": "Complete “{{title}}”",
        "reopen": "Reopen “{{title}}”",
        "completed": "Completed",
        "collapseColumn": "Collapse “{{column}}”",
        "expandColumn": "Expand “{{column}}”",
        "addCard": "Add a card to {{column}}",
        "addCardPlaceholder": "Card title (Enter to add)",
        "cardActions": "Actions for “{{title}}”",
        "columnActions": "Actions for {{column}}",
        "dueOverdue": "Was due {{date}}",
        "dueToday": "Due today",
        "dueOn": "Due {{date}}",
        "checklist": "{{done}} of {{total}} to-dos done",
        "comments_one": "{{count}} comment",
        "comments_other": "{{count}} comments",
        "attachments_one": "{{count}} attachment",
        "attachments_other": "{{count}} attachments",
        "assignees": "Assigned to: {{names}}",
        "instructions": "To move a card with the keyboard: space to lift it, arrows to move it and space to drop it. Escape leaves it where it was.",
        "lifted": "You lifted “{{title}}”, in {{column}}, position {{position}}.",
        "moving": "Going to {{column}}, position {{position}}.",
        "dropped": "You dropped “{{title}}” in {{column}}, position {{position}}.",
        "cancelled": "“{{title}}” stayed where it was.",
        "overLimit": "Over the limit of {{limit}} cards.",
        "emptyFiltered": "No card here matches the search.",
        "empty": "No cards. Drag one here."
    },
    "inbox": {
        "labels": "Labels",
        "select": "Select “{{subject}}”",
        "messageActions": "Actions for “{{subject}}”",
        "threadCount_one": "{{count}} message in the conversation",
        "threadCount_other": "{{count}} messages in the conversation",
        "cc": "Cc: {{cc}}",
        "openAttachment": "Open {{name}}",
        "expandMessage": "Open the message from {{name}} ({{date}})",
        "listLabel": "Messages",
        "folders": "Folders",
        "empty": "There are no messages here.",
        "noMessageSelected": "Choose a message to read it.",
        "star": "Star",
        "unstar": "Remove star",
        "unread": "Unread",
        "attachments": "Attachments",
        "to": "To: {{to}}",
        "back": "Back",
        "unreadCount_one": "{{count}} unread",
        "unreadCount_other": "{{count}} unread"
    },
    "account": {
        "reset": {
            "title": "Choose a new password",
            "subtitle": "You came here from the link in the email. Choose the password you will sign in with.",
            "done": "You can now sign in with your new password.",
            "goToSignIn": "Go to sign in",
            "missingToken": "This link does not work: its key is missing. Ask for a new one from “Forgot your password?”.",
            "askAgain": "Ask for another link"
        },
        "profile": {
            "tabs": {
                "label": "Parts of your profile",
                "data": "Your details",
                "security": "Security",
                "preferences": "Preferences"
            },
            "data": {
                "title": "Your details",
                "text": "This is how other people see you in the app.",
                "name": "Name",
                "email": "Email",
                "emailHelp": "It is the email you sign in with; to change it, ask whoever manages the app.",
                "phone": "Phone (optional)",
                "phoneInvalid": "Enter digits only (7 to 15), with + at the start if it is from another country.",
                "save": "Save",
                "saved": "Your details were saved."
            },
            "password": {
                "title": "Password",
                "text": "Use a password you do not use on other sites. After changing it, you sign in with the new one next time."
            },
            "preferences": {
                "title": "Appearance",
                "text": "How the app looks for you: text size, language and light or dark are remembered in this browser."
            }
        },
        "demo": {
            "totpCode": "Use the sample code",
            "totpCodeHelp": "Demo only: fills in the code your app would show right now, in case you do not have it at hand.",
            "passkeyNote": "In the demo the passkey is really saved in your keychain (iCloud, Google or your password manager), but this page forgets it when you reload. When you are done trying it, delete it from your keychain too.",
            "securityNote": "Demo server: verification works with your real phone (scan the QR or create a passkey with your fingerprint), but it lives in this tab’s memory: reloading turns it off. Sign out and back in to see the second step.",
            "server": {
                "wrongCredentialsTitle": "You could not sign in",
                "wrongCredentials": "In the demo you sign in with {{email}} and any password.",
                "noSessionTitle": "Your session ended",
                "noSession": "Sign in again.",
                "validationTitle": "Check the data",
                "validationDetail": "Some fields need to be fixed.",
                "passwordRequired": "Enter your password to confirm.",
                "nameRequired": "Enter your name.",
                "wrongCodeTitle": "The code does not match",
                "wrongCode": "Check that it is the code your app shows right now.",
                "expiredTitle": "Time is up",
                "expired": "More than 5 minutes went by: enter your password again.",
                "lockedTitle": "Too many attempts",
                "locked": "For security you need to start again: enter your password again.",
                "defaultPasskeyName": "Passkey {{number}}",
                "profileSaved": "Your details were saved."
            }
        }
    }
});
