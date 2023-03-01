export const INTERVIEW_STATUSES = {
    draft: 'Draft',
    active: 'Active',
    complete: 'Complete'
};

export const INTERVIEW_STATUSES_THEMES = {
    draft: 'yellow',
    active: 'orange',
    complete: 'green'
};

// ISO 639-1 country codes should be used for keys.
export const INTERVIEW_LANGUAGES = {
    ar: 'Arabic',
    en: 'English',
    fr: 'French',
    es: 'Spanish'
};

// https://android.googlesource.com/platform/frameworks/base/+/android-9.0.0_r1/core/res/res/values/locale_config.xml
export const INTERVIEW_LOCALES = [
    {value: 'af-NA', label: 'Afrikaans (Namibia)'},
    {value: 'af-ZA', label: 'Afrikaans (South Africa)'},
    {value: 'agq-CM', label: 'Aghem (Cameroon)'},
    {value: 'ak-GH', label: 'Akan (Ghana)'},
    {value: 'am-ET', label: 'Amharic (Ethiopia)'},
    {value: 'ar-DZ-u-nu-arab', label: 'Arabic (Algeria,Arabic-Indic Digits)'},
    {value: 'ar-DZ', label: 'Arabic (Algeria)'},
    {value: 'ar-BH-u-nu-latn', label: 'Arabic (Bahrain,Western Digits)'},
    {value: 'ar-BH', label: 'Arabic (Bahrain)'},
    {value: 'ar-TD-u-nu-latn', label: 'Arabic (Chad,Western Digits)'},
    {value: 'ar-TD', label: 'Arabic (Chad)'},
    {value: 'ar-KM-u-nu-latn', label: 'Arabic (Comoros,Western Digits)'},
    {value: 'ar-KM', label: 'Arabic (Comoros)'},
    {value: 'ar-DJ-u-nu-latn', label: 'Arabic (Djibouti,Western Digits)'},
    {value: 'ar-DJ', label: 'Arabic (Djibouti)'},
    {value: 'ar-EG-u-nu-latn', label: 'Arabic (Egypt,Western Digits)'},
    {value: 'ar-EG', label: 'Arabic (Egypt)'},
    {value: 'ar-ER-u-nu-latn', label: 'Arabic (Eritrea,Western Digits)'},
    {value: 'ar-ER', label: 'Arabic (Eritrea)'},
    {value: 'ar-IQ-u-nu-latn', label: 'Arabic (Iraq,Western Digits)'},
    {value: 'ar-IQ', label: 'Arabic (Iraq)'},
    {value: 'ar-IL-u-nu-latn', label: 'Arabic (Israel,Western Digits)'},
    {value: 'ar-IL', label: 'Arabic (Israel)'},
    {value: 'ar-JO-u-nu-latn', label: 'Arabic (Jordan,Western Digits)'},
    {value: 'ar-JO', label: 'Arabic (Jordan)'},
    {value: 'ar-KW-u-nu-latn', label: 'Arabic (Kuwait,Western Digits)'},
    {value: 'ar-KW', label: 'Arabic (Kuwait)'},
    {value: 'ar-LB-u-nu-latn', label: 'Arabic (Lebanon,Western Digits)'},
    {value: 'ar-LB', label: 'Arabic (Lebanon)'},
    {value: 'ar-LY-u-nu-arab', label: 'Arabic (Libya,Arabic-Indic Digits)'},
    {value: 'ar-LY', label: 'Arabic (Libya)'},
    {value: 'ar-MR-u-nu-latn', label: 'Arabic (Mauritania,Western Digits)'},
    {value: 'ar-MR', label: 'Arabic (Mauritania)'},
    {value: 'ar-MA-u-nu-arab', label: 'Arabic (Morocco,Arabic-Indic Digits)'},
    {value: 'ar-MA', label: 'Arabic (Morocco)'},
    {value: 'ar-OM-u-nu-latn', label: 'Arabic (Oman,Western Digits)'},
    {value: 'ar-OM', label: 'Arabic (Oman)'},
    {value: 'ar-PS-u-nu-latn', label: 'Arabic (Palestine,Western Digits)'},
    {value: 'ar-PS', label: 'Arabic (Palestine)'},
    {value: 'ar-QA-u-nu-latn', label: 'Arabic (Qatar,Western Digits)'},
    {value: 'ar-QA', label: 'Arabic (Qatar)'},
    {value: 'ar-SA-u-nu-latn', label: 'Arabic (Saudi Arabia,Western Digits)'},
    {value: 'ar-SA', label: 'Arabic (Saudi Arabia)'},
    {value: 'ar-SO-u-nu-latn', label: 'Arabic (Somalia,Western Digits)'},
    {value: 'ar-SO', label: 'Arabic (Somalia)'},
    {value: 'ar-SS-u-nu-latn', label: 'Arabic (South Sudan,Western Digits)'},
    {value: 'ar-SS', label: 'Arabic (South Sudan)'},
    {value: 'ar-SD-u-nu-latn', label: 'Arabic (Sudan,Western Digits)'},
    {value: 'ar-SD', label: 'Arabic (Sudan)'},
    {value: 'ar-SY-u-nu-latn', label: 'Arabic (Syria,Western Digits)'},
    {value: 'ar-SY', label: 'Arabic (Syria)'},
    {value: 'ar-TN-u-nu-arab', label: 'Arabic (Tunisia,Arabic-Indic Digits)'},
    {value: 'ar-TN', label: 'Arabic (Tunisia)'},
    {value: 'ar-AE-u-nu-latn', label: 'Arabic (United Arab Emirates,Western Digits)'},
    {value: 'ar-AE', label: 'Arabic (United Arab Emirates)'},
    {value: 'ar-EH-u-nu-arab', label: 'Arabic (Western Sahara,Arabic-Indic Digits)'},
    {value: 'ar-EH', label: 'Arabic (Western Sahara)'},
    {value: 'ar-YE-u-nu-latn', label: 'Arabic (Yemen,Western Digits)'},
    {value: 'ar-YE', label: 'Arabic (Yemen)'},
    {value: 'as-IN', label: 'Assamese (India)'},
    {value: 'asa-TZ', label: 'Asu (Tanzania)'},
    {value: 'az-Cyrl-AZ', label: 'Azerbaijani (Cyrillic,Azerbaijan)'},
    {value: 'az-Latn-AZ', label: 'Azerbaijani (Latin,Azerbaijan)'},
    {value: 'bas-CM', label: 'Basaa (Cameroon)'},
    {value: 'be-BY', label: 'Belarusian (Belarus)'},
    {value: 'bem-ZM', label: 'Bemba (Zambia)'},
    {value: 'bez-TZ', label: 'Bena (Tanzania)'},
    {value: 'bg-BG', label: 'Bulgarian (Bulgaria)'},
    {value: 'bm-ML', label: 'Bambara (Mali)'},
    {value: 'bn-BD-u-nu-latn', label: 'Bengali (Bangladesh,Western Digits)'},
    {value: 'bn-BD', label: 'Bengali (Bangladesh)'},
    {value: 'bn-IN-u-nu-latn', label: 'Bengali (India,Western Digits)'},
    {value: 'bn-IN', label: 'Bengali (India)'},
    {value: 'bo-CN', label: 'Tibetan (China)'},
    {value: 'bo-IN', label: 'Tibetan (India)'},
    {value: 'br-FR', label: 'Breton (France)'},
    {value: 'brx-IN', label: 'Bodo (India)'},
    {value: 'bs-Cyrl-BA', label: 'Bosnian (Cyrillic,Bosnia & Herzegovina)'},
    {value: 'bs-Latn-BA', label: 'Bosnian (Latin,Bosnia & Herzegovina)'},
    {value: 'ca-AD', label: 'Catalan (Andorra)'},
    {value: 'ca-FR', label: 'Catalan (France)'},
    {value: 'ca-IT', label: 'Catalan (Italy)'},
    {value: 'ca-ES', label: 'Catalan (Spain)'},
    {value: 'ce-RU', label: 'Chechen (Russia)'},
    {value: 'cgg-UG', label: 'Chiga (Uganda)'},
    {value: 'chr-US', label: 'Cherokee (United States)'},
    {value: 'cs-CZ', label: 'Czech (Czechia)'},
    {value: 'cy-GB', label: 'Welsh (United Kingdom)'},
    {value: 'da-DK', label: 'Danish (Denmark)'},
    {value: 'da-GL', label: 'Danish (Greenland)'},
    {value: 'dav-KE', label: 'Taita (Kenya)'},
    {value: 'de-AT', label: 'German (Austria)'},
    {value: 'de-BE', label: 'German (Belgium)'},
    {value: 'de-DE', label: 'German (Germany)'},
    {value: 'de-LI', label: 'German (Liechtenstein)'},
    {value: 'de-LU', label: 'German (Luxembourg)'},
    {value: 'de-CH', label: 'German (Switzerland)'},
    {value: 'dje-NE', label: 'Zarma (Niger)'},
    {value: 'dsb-DE', label: 'Lower Sorbian (Germany)'},
    {value: 'dua-CM', label: 'Duala (Cameroon)'},
    {value: 'dyo-SN', label: 'Jola-Fonyi (Senegal)'},
    {value: 'dz-BT', label: 'Dzongkha (Bhutan)'},
    {value: 'ebu-KE', label: 'Embu (Kenya)'},
    {value: 'ee-GH', label: 'Ewe (Ghana)'},
    {value: 'ee-TG', label: 'Ewe (Togo)'},
    {value: 'el-CY', label: 'Greek (Cyprus)'},
    {value: 'el-GR', label: 'Greek (Greece)'},
    {value: 'en-AS', label: 'English (American Samoa)'},
    {value: 'en-AI', label: 'English (Anguilla)'},
    {value: 'en-AG', label: 'English (Antigua & Barbuda)'},
    {value: 'en-AU', label: 'English (Australia)'},
    {value: 'en-AT', label: 'English (Austria)'},
    {value: 'en-BS', label: 'English (Bahamas)'},
    {value: 'en-BB', label: 'English (Barbados)'},
    {value: 'en-BE', label: 'English (Belgium)'},
    {value: 'en-BZ', label: 'English (Belize)'},
    {value: 'en-BM', label: 'English (Bermuda)'},
    {value: 'en-BW', label: 'English (Botswana)'},
    {value: 'en-IO', label: 'English (British Indian Ocean Territory)'},
    {value: 'en-VG', label: 'English (British Virgin Islands)'},
    {value: 'en-BI', label: 'English (Burundi)'},
    {value: 'en-CM', label: 'English (Cameroon)'},
    {value: 'en-CA', label: 'English (Canada)'},
    {value: 'en-KY', label: 'English (Cayman Islands)'},
    {value: 'en-CX', label: 'English (Christmas Island)'},
    {value: 'en-CC', label: 'English (Cocos (Keeling) Islands)'},
    {value: 'en-CK', label: 'English (Cook Islands)'},
    {value: 'en-CY', label: 'English (Cyprus)'},
    {value: 'en-DK', label: 'English (Denmark)'},
    {value: 'en-DG', label: 'English (Diego Garcia)'},
    {value: 'en-DM', label: 'English (Dominica)'},
    {value: 'en-ER', label: 'English (Eritrea)'},
    {value: 'en-FK', label: 'English (Falkland Islands (Islas Malvinas))'},
    {value: 'en-FJ', label: 'English (Fiji)'},
    {value: 'en-FI', label: 'English (Finland)'},
    {value: 'en-GM', label: 'English (Gambia)'},
    {value: 'en-DE', label: 'English (Germany)'},
    {value: 'en-GH', label: 'English (Ghana)'},
    {value: 'en-GI', label: 'English (Gibraltar)'},
    {value: 'en-GD', label: 'English (Grenada)'},
    {value: 'en-GU', label: 'English (Guam)'},
    {value: 'en-GG', label: 'English (Guernsey)'},
    {value: 'en-GY', label: 'English (Guyana)'},
    {value: 'en-HK', label: 'English (Hong Kong)'},
    {value: 'en-IN', label: 'English (India)'},
    {value: 'en-IE', label: 'English (Ireland)'},
    {value: 'en-IM', label: 'English (Isle of Man)'},
    {value: 'en-IL', label: 'English (Israel)'},
    {value: 'en-JM', label: 'English (Jamaica)'},
    {value: 'en-JE', label: 'English (Jersey)'},
    {value: 'en-KE', label: 'English (Kenya)'},
    {value: 'en-KI', label: 'English (Kiribati)'},
    {value: 'en-LS', label: 'English (Lesotho)'},
    {value: 'en-LR', label: 'English (Liberia)'},
    {value: 'en-MO', label: 'English (Macau)'},
    {value: 'en-MG', label: 'English (Madagascar)'},
    {value: 'en-MW', label: 'English (Malawi)'},
    {value: 'en-MY', label: 'English (Malaysia)'},
    {value: 'en-MT', label: 'English (Malta)'},
    {value: 'en-MH', label: 'English (Marshall Islands)'},
    {value: 'en-MU', label: 'English (Mauritius)'},
    {value: 'en-FM', label: 'English (Micronesia)'},
    {value: 'en-MS', label: 'English (Montserrat)'},
    {value: 'en-NA', label: 'English (Namibia)'},
    {value: 'en-NR', label: 'English (Nauru)'},
    {value: 'en-NL', label: 'English (Netherlands)'},
    {value: 'en-NZ', label: 'English (New Zealand)'},
    {value: 'en-NG', label: 'English (Nigeria)'},
    {value: 'en-NU', label: 'English (Niue)'},
    {value: 'en-NF', label: 'English (Norfolk Island)'},
    {value: 'en-MP', label: 'English (Northern Mariana Islands)'},
    {value: 'en-PK', label: 'English (Pakistan)'},
    {value: 'en-PW', label: 'English (Palau)'},
    {value: 'en-PG', label: 'English (Papua New Guinea)'},
    {value: 'en-PH', label: 'English (Philippines)'},
    {value: 'en-PN', label: 'English (Pitcairn Islands)'},
    {value: 'en-PR', label: 'English (Puerto Rico)'},
    {value: 'en-RW', label: 'English (Rwanda)'},
    {value: 'en-WS', label: 'English (Samoa)'},
    {value: 'en-SC', label: 'English (Seychelles)'},
    {value: 'en-SL', label: 'English (Sierra Leone)'},
    {value: 'en-SG', label: 'English (Singapore)'},
    {value: 'en-SX', label: 'English (Sint Maarten)'},
    {value: 'en-SI', label: 'English (Slovenia)'},
    {value: 'en-SB', label: 'English (Solomon Islands)'},
    {value: 'en-ZA', label: 'English (South Africa)'},
    {value: 'en-SS', label: 'English (South Sudan)'},
    {value: 'en-SH', label: 'English (St. Helena)'},
    {value: 'en-KN', label: 'English (St. Kitts & Nevis)'},
    {value: 'en-LC', label: 'English (St. Lucia)'},
    {value: 'en-VC', label: 'English (St. Vincent & Grenadines)'},
    {value: 'en-SD', label: 'English (Sudan)'},
    {value: 'en-SZ', label: 'English (Swaziland)'},
    {value: 'en-SE', label: 'English (Sweden)'},
    {value: 'en-CH', label: 'English (Switzerland)'},
    {value: 'en-TZ', label: 'English (Tanzania)'},
    {value: 'en-TK', label: 'English (Tokelau)'},
    {value: 'en-TO', label: 'English (Tonga)'},
    {value: 'en-TT', label: 'English (Trinidad & Tobago)'},
    {value: 'en-TC', label: 'English (Turks & Caicos Islands)'},
    {value: 'en-TV', label: 'English (Tuvalu)'},
    {value: 'en-UM', label: 'English (U.S. Outlying Islands)'},
    {value: 'en-VI', label: 'English (U.S. Virgin Islands)'},
    {value: 'en-UG', label: 'English (Uganda)'},
    {value: 'en-GB', label: 'English (United Kingdom)'},
    {value: 'en-US', label: 'English (United States)'},
    {value: 'en-VU', label: 'English (Vanuatu)'},
    {value: 'en-ZM', label: 'English (Zambia)'},
    {value: 'en-ZW', label: 'English (Zimbabwe)'},
    {value: 'es-AR', label: 'Spanish (Argentina)'},
    {value: 'es-BO', label: 'Spanish (Bolivia)'},
    {value: 'es-IC', label: 'Spanish (Canary Islands)'},
    {value: 'es-EA', label: 'Spanish (Ceuta & Melilla)'},
    {value: 'es-CL', label: 'Spanish (Chile)'},
    {value: 'es-CO', label: 'Spanish (Colombia)'},
    {value: 'es-CR', label: 'Spanish (Costa Rica)'},
    {value: 'es-CU', label: 'Spanish (Cuba)'},
    {value: 'es-DO', label: 'Spanish (Dominican Republic)'},
    {value: 'es-EC', label: 'Spanish (Ecuador)'},
    {value: 'es-SV', label: 'Spanish (El Salvador)'},
    {value: 'es-GQ', label: 'Spanish (Equatorial Guinea)'},
    {value: 'es-GT', label: 'Spanish (Guatemala)'},
    {value: 'es-HN', label: 'Spanish (Honduras)'},
    {value: 'es-MX', label: 'Spanish (Mexico)'},
    {value: 'es-NI', label: 'Spanish (Nicaragua)'},
    {value: 'es-PA', label: 'Spanish (Panama)'},
    {value: 'es-PY', label: 'Spanish (Paraguay)'},
    {value: 'es-PE', label: 'Spanish (Peru)'},
    {value: 'es-PH', label: 'Spanish (Philippines)'},
    {value: 'es-PR', label: 'Spanish (Puerto Rico)'},
    {value: 'es-ES', label: 'Spanish (Spain)'},
    {value: 'es-US', label: 'Spanish (United States)'},
    {value: 'es-UY', label: 'Spanish (Uruguay)'},
    {value: 'es-VE', label: 'Spanish (Venezuela)'},
    {value: 'et-EE', label: 'Estonian (Estonia)'},
    {value: 'eu-ES', label: 'Basque (Spain)'},
    {value: 'ewo-CM', label: 'Ewondo (Cameroon)'},
    {value: 'fa-AF-u-nu-latn', label: 'Persian (Afghanistan,Western Digits)'},
    {value: 'fa-AF', label: 'Persian (Afghanistan)'},
    {value: 'fa-IR-u-nu-latn', label: 'Persian (Iran,Western Digits)'},
    {value: 'fa-IR', label: 'Persian (Iran)'},
    {value: 'ff-CM', label: 'Fulah (Cameroon)'},
    {value: 'ff-GN', label: 'Fulah (Guinea)'},
    {value: 'ff-MR', label: 'Fulah (Mauritania)'},
    {value: 'ff-SN', label: 'Fulah (Senegal)'},
    {value: 'fi-FI', label: 'Finnish (Finland)'},
    {value: 'fil-PH', label: 'Filipino (Philippines)'},
    {value: 'fo-DK', label: 'Faroese (Denmark)'},
    {value: 'fo-FO', label: 'Faroese (Faroe Islands)'},
    {value: 'fr-DZ', label: 'French (Algeria)'},
    {value: 'fr-BE', label: 'French (Belgium)'},
    {value: 'fr-BJ', label: 'French (Benin)'},
    {value: 'fr-BF', label: 'French (Burkina Faso)'},
    {value: 'fr-BI', label: 'French (Burundi)'},
    {value: 'fr-CM', label: 'French (Cameroon)'},
    {value: 'fr-CA', label: 'French (Canada)'},
    {value: 'fr-CF', label: 'French (Central African Republic)'},
    {value: 'fr-TD', label: 'French (Chad)'},
    {value: 'fr-KM', label: 'French (Comoros)'},
    {value: 'fr-CD', label: 'French (Congo (DRC))'},
    {value: 'fr-CG', label: 'French (Congo (Republic))'},
    {value: 'fr-CI', label: 'French (Côte d’Ivoire)'},
    {value: 'fr-DJ', label: 'French (Djibouti)'},
    {value: 'fr-GQ', label: 'French (Equatorial Guinea)'},
    {value: 'fr-FR', label: 'French (France)'},
    {value: 'fr-GF', label: 'French (French Guiana)'},
    {value: 'fr-PF', label: 'French (French Polynesia)'},
    {value: 'fr-GA', label: 'French (Gabon)'},
    {value: 'fr-GP', label: 'French (Guadeloupe)'},
    {value: 'fr-GN', label: 'French (Guinea)'},
    {value: 'fr-HT', label: 'French (Haiti)'},
    {value: 'fr-LU', label: 'French (Luxembourg)'},
    {value: 'fr-MG', label: 'French (Madagascar)'},
    {value: 'fr-ML', label: 'French (Mali)'},
    {value: 'fr-MQ', label: 'French (Martinique)'},
    {value: 'fr-MR', label: 'French (Mauritania)'},
    {value: 'fr-MU', label: 'French (Mauritius)'},
    {value: 'fr-YT', label: 'French (Mayotte)'},
    {value: 'fr-MC', label: 'French (Monaco)'},
    {value: 'fr-MA', label: 'French (Morocco)'},
    {value: 'fr-NC', label: 'French (New Caledonia)'},
    {value: 'fr-NE', label: 'French (Niger)'},
    {value: 'fr-RE', label: 'French (Réunion)'},
    {value: 'fr-RW', label: 'French (Rwanda)'},
    {value: 'fr-SN', label: 'French (Senegal)'},
    {value: 'fr-SC', label: 'French (Seychelles)'},
    {value: 'fr-BL', label: 'French (St. Barthélemy)'},
    {value: 'fr-MF', label: 'French (St. Martin)'},
    {value: 'fr-PM', label: 'French (St. Pierre & Miquelon)'},
    {value: 'fr-CH', label: 'French (Switzerland)'},
    {value: 'fr-SY', label: 'French (Syria)'},
    {value: 'fr-TG', label: 'French (Togo)'},
    {value: 'fr-TN', label: 'French (Tunisia)'},
    {value: 'fr-VU', label: 'French (Vanuatu)'},
    {value: 'fr-WF', label: 'French (Wallis & Futuna)'},
    {value: 'fur-IT', label: 'Friulian (Italy)'},
    {value: 'fy-NL', label: 'Western Frisian (Netherlands)'},
    {value: 'ga-IE', label: 'Irish (Ireland)'},
    {value: 'gd-GB', label: 'Scottish Gaelic (United Kingdom)'},
    {value: 'gl-ES', label: 'Galician (Spain)'},
    {value: 'gsw-FR', label: 'Swiss German (France)'},
    {value: 'gsw-LI', label: 'Swiss German (Liechtenstein)'},
    {value: 'gsw-CH', label: 'Swiss German (Switzerland)'},
    {value: 'gu-IN', label: 'Gujarati (India)'},
    {value: 'guz-KE', label: 'Gusii (Kenya)'},
    {value: 'gv-IM', label: 'Manx (Isle of Man)'},
    {value: 'ha-GH', label: 'Hausa (Ghana)'},
    {value: 'ha-NE', label: 'Hausa (Niger)'},
    {value: 'ha-NG', label: 'Hausa (Nigeria)'},
    {value: 'haw-US', label: 'Hawaiian (United States)'},
    {value: 'iw-IL', label: 'Hebrew (Israel)'},
    {value: 'hi-IN', label: 'Hindi (India)'},
    {value: 'hr-BA', label: 'Croatian (Bosnia & Herzegovina)'},
    {value: 'hr-HR', label: 'Croatian (Croatia)'},
    {value: 'hsb-DE', label: 'Upper Sorbian (Germany)'},
    {value: 'hu-HU', label: 'Hungarian (Hungary)'},
    {value: 'hy-AM', label: 'Armenian (Armenia)'},
    {value: 'in-ID', label: 'Indonesian (Indonesia)'},
    {value: 'ig-NG', label: 'Igbo (Nigeria)'},
    {value: 'ii-CN', label: 'Sichuan Yi (China)'},
    {value: 'is-IS', label: 'Icelandic (Iceland)'},
    {value: 'it-IT', label: 'Italian (Italy)'},
    {value: 'it-SM', label: 'Italian (San Marino)'},
    {value: 'it-CH', label: 'Italian (Switzerland)'},
    {value: 'ja-JP', label: 'Japanese (Japan)'},
    {value: 'jgo-CM', label: 'Ngomba (Cameroon)'},
    {value: 'jmc-TZ', label: 'Machame (Tanzania)'},
    {value: 'ka-GE', label: 'Georgian (Georgia)'},
    {value: 'kab-DZ', label: 'Kabyle (Algeria)'},
    {value: 'kam-KE', label: 'Kamba (Kenya)'},
    {value: 'kde-TZ', label: 'Makonde (Tanzania)'},
    {value: 'kea-CV', label: 'Kabuverdianu (Cape Verde)'},
    {value: 'khq-ML', label: 'Koyra Chiini (Mali)'},
    {value: 'ki-KE', label: 'Kikuyu (Kenya)'},
    {value: 'kk-KZ', label: 'Kazakh (Kazakhstan)'},
    {value: 'kkj-CM', label: 'Kako (Cameroon)'},
    {value: 'kl-GL', label: 'Kalaallisut (Greenland)'},
    {value: 'kln-KE', label: 'Kalenjin (Kenya)'},
    {value: 'km-KH', label: 'Khmer (Cambodia)'},
    {value: 'kn-IN', label: 'Kannada (India)'},
    {value: 'ko-KP', label: 'Korean (North Korea)'},
    {value: 'ko-KR', label: 'Korean (South Korea)'},
    {value: 'kok-IN', label: 'Konkani (India)'},
    {value: 'ksb-TZ', label: 'Shambala (Tanzania)'},
    {value: 'ksf-CM', label: 'Bafia (Cameroon)'},
    {value: 'ksh-DE', label: 'Colognian (Germany)'},
    {value: 'kw-GB', label: 'Cornish (United Kingdom)'},
    {value: 'ky-KG', label: 'Kyrgyz (Kyrgyzstan)'},
    {value: 'lag-TZ', label: 'Langi (Tanzania)'},
    {value: 'lb-LU', label: 'Luxembourgish (Luxembourg)'},
    {value: 'lg-UG', label: 'Ganda (Uganda)'},
    {value: 'lkt-US', label: 'Lakota (United States)'},
    {value: 'ln-AO', label: 'Lingala (Angola)'},
    {value: 'ln-CF', label: 'Lingala (Central African Republic)'},
    {value: 'ln-CD', label: 'Lingala (Congo (DRC))'},
    {value: 'ln-CG', label: 'Lingala (Congo (Republic))'},
    {value: 'lo-LA', label: 'Lao (Laos)'},
    {value: 'lt-LT', label: 'Lithuanian (Lithuania)'},
    {value: 'lu-CD', label: 'Luba-Katanga (Congo (DRC))'},
    {value: 'luo-KE', label: 'Luo (Kenya)'},
    {value: 'luy-KE', label: 'Luyia (Kenya)'},
    {value: 'lv-LV', label: 'Latvian (Latvia)'},
    {value: 'mas-KE', label: 'Masai (Kenya)'},
    {value: 'mas-TZ', label: 'Masai (Tanzania)'},
    {value: 'mer-KE', label: 'Meru (Kenya)'},
    {value: 'mfe-MU', label: 'Morisyen (Mauritius)'},
    {value: 'mg-MG', label: 'Malagasy (Madagascar)'},
    {value: 'mgh-MZ', label: 'Makhuwa-Meetto (Mozambique)'},
    {value: 'mgo-CM', label: 'Meta (Cameroon)'},
    {value: 'mk-MK', label: 'Macedonian (Macedonia (FYROM))'},
    {value: 'ml-IN', label: 'Malayalam (India)'},
    {value: 'mn-MN', label: 'Mongolian (Mongolia)'},
    {value: 'mr-IN', label: 'Marathi (India)'},
    {value: 'ms-BN', label: 'Malay (Brunei)'},
    {value: 'ms-MY', label: 'Malay (Malaysia)'},
    {value: 'ms-SG', label: 'Malay (Singapore)'},
    {value: 'mt-MT', label: 'Maltese (Malta)'},
    {value: 'my-MM-u-nu-latn', label: 'Burmese (Myanmar (Burma), Western Digits)'},
    {value: 'my-MM', label: 'Burmese (Myanmar (Burma))'},
    {value: 'mzn-IR', label: 'Mazanderani (Iran)'},
    {value: 'naq-NA', label: 'Nama (Namibia)'},
    {value: 'nb-NO', label: 'Norwegian Bokmål (Norway)'},
    {value: 'nb-SJ', label: 'Norwegian Bokmål (Svalbard & Jan Mayen)'},
    {value: 'nd-ZW', label: 'North Ndebele (Zimbabwe)'},
    {value: 'ne-IN', label: 'Nepali (India)'},
    {value: 'ne-NP', label: 'Nepali (Nepal)'},
    {value: 'nl-AW', label: 'Dutch (Aruba)'},
    {value: 'nl-BE', label: 'Dutch (Belgium)'},
    {value: 'nl-BQ', label: 'Dutch (Caribbean Netherlands)'},
    {value: 'nl-CW', label: 'Dutch (Curaçao)'},
    {value: 'nl-NL', label: 'Dutch (Netherlands)'},
    {value: 'nl-SX', label: 'Dutch (Sint Maarten)'},
    {value: 'nl-SR', label: 'Dutch (Suriname)'},
    {value: 'nn-NO', label: 'Norwegian Nynorsk (Norway)'},
    {value: 'nnh-CM', label: 'Ngiemboon (Cameroon)'},
    {value: 'nus-SS', label: 'Nuer (South Sudan)'},
    {value: 'nyn-UG', label: 'Nyankole (Uganda)'},
    {value: 'om-ET', label: 'Oromo (Ethiopia)'},
    {value: 'om-KE', label: 'Oromo (Kenya)'},
    {value: 'or-IN', label: 'Oriya (India)'},
    {value: 'os-GE', label: 'Ossetic (Georgia)'},
    {value: 'os-RU', label: 'Ossetic (Russia)'},
    {value: 'pa-Arab-PK', label: 'Punjabi (Arabic,Pakistan)'},
    {value: 'pa-Guru-IN', label: 'Punjabi (Gurmukhi,India)'},
    {value: 'pl-PL', label: 'Polish (Poland)'},
    {value: 'ps-AF', label: 'Pashto (Afghanistan)'},
    {value: 'pt-AO', label: 'Portuguese (Angola)'},
    {value: 'pt-BR', label: 'Portuguese (Brazil)'},
    {value: 'pt-CV', label: 'Portuguese (Cape Verde)'},
    {value: 'pt-GW', label: 'Portuguese (Guinea-Bissau)'},
    {value: 'pt-MO', label: 'Portuguese (Macau)'},
    {value: 'pt-MZ', label: 'Portuguese (Mozambique)'},
    {value: 'pt-PT', label: 'Portuguese (Portugal)'},
    {value: 'pt-ST', label: 'Portuguese (São Tomé & Príncipe)'},
    {value: 'pt-TL', label: 'Portuguese (Timor-Leste)'},
    {value: 'qu-BO', label: 'Quechua (Bolivia)'},
    {value: 'qu-EC', label: 'Quechua (Ecuador)'},
    {value: 'qu-PE', label: 'Quechua (Peru)'},
    {value: 'rm-CH', label: 'Romansh (Switzerland)'},
    {value: 'rn-BI', label: 'Rundi (Burundi)'},
    {value: 'ro-MD', label: 'Romanian (Moldova)'},
    {value: 'ro-RO', label: 'Romanian (Romania)'},
    {value: 'rof-TZ', label: 'Rombo (Tanzania)'},
    {value: 'ru-BY', label: 'Russian (Belarus)'},
    {value: 'ru-KZ', label: 'Russian (Kazakhstan)'},
    {value: 'ru-KG', label: 'Russian (Kyrgyzstan)'},
    {value: 'ru-MD', label: 'Russian (Moldova)'},
    {value: 'ru-RU', label: 'Russian (Russia)'},
    {value: 'ru-UA', label: 'Russian (Ukraine)'},
    {value: 'rw-RW', label: 'Kinyarwanda (Rwanda)'},
    {value: 'rwk-TZ', label: 'Rwa (Tanzania)'},
    {value: 'sah-RU', label: 'Sakha (Russia)'},
    {value: 'saq-KE', label: 'Samburu (Kenya)'},
    {value: 'sbp-TZ', label: 'Sangu (Tanzania)'},
    {value: 'se-FI', label: 'Northern Sami (Finland)'},
    {value: 'se-NO', label: 'Northern Sami (Norway)'},
    {value: 'se-SE', label: 'Northern Sami (Sweden)'},
    {value: 'seh-MZ', label: 'Sena (Mozambique)'},
    {value: 'ses-ML', label: 'Koyraboro Senni (Mali)'},
    {value: 'sg-CF', label: 'Sango (Central African Republic)'},
    {value: 'si-LK', label: 'Sinhala (Sri Lanka)'},
    {value: 'sk-SK', label: 'Slovak (Slovakia)'},
    {value: 'sl-SI', label: 'Slovenian (Slovenia)'},
    {value: 'smn-FI', label: 'Inari Sami (Finland)'},
    {value: 'sn-ZW', label: 'Shona (Zimbabwe)'},
    {value: 'so-DJ', label: 'Somali (Djibouti)'},
    {value: 'so-ET', label: 'Somali (Ethiopia)'},
    {value: 'so-KE', label: 'Somali (Kenya)'},
    {value: 'so-SO', label: 'Somali (Somalia)'},
    {value: 'sq-AL', label: 'Albanian (Albania)'},
    {value: 'sq-XK', label: 'Albanian (Kosovo)'},
    {value: 'sq-MK', label: 'Albanian (Macedonia (FYROM))'},
    {value: 'sr-Cyrl-BA', label: 'Serbian (Cyrillic,Bosnia & Herzegovina)'},
    {value: 'sr-Cyrl-XK', label: 'Serbian (Cyrillic,Kosovo)'},
    {value: 'sr-Cyrl-ME', label: 'Serbian (Cyrillic,Montenegro)'},
    {value: 'sr-Cyrl-RS', label: 'Serbian (Cyrillic,Serbia)'},
    {value: 'sr-Latn-BA', label: 'Serbian (Latin,Bosnia & Herzegovina)'},
    {value: 'sr-Latn-XK', label: 'Serbian (Latin,Kosovo)'},
    {value: 'sr-Latn-ME', label: 'Serbian (Latin,Montenegro)'},
    {value: 'sr-Latn-RS', label: 'Serbian (Latin,Serbia)'},
    {value: 'sv-AX', label: 'Swedish (Åland Islands)'},
    {value: 'sv-FI', label: 'Swedish (Finland)'},
    {value: 'sv-SE', label: 'Swedish (Sweden)'},
    {value: 'sw-CD', label: 'Swahili (Congo (DRC))'},
    {value: 'sw-KE', label: 'Swahili (Kenya)'},
    {value: 'sw-TZ', label: 'Swahili (Tanzania)'},
    {value: 'sw-UG', label: 'Swahili (Uganda)'},
    {value: 'ta-IN', label: 'Tamil (India)'},
    {value: 'ta-MY', label: 'Tamil (Malaysia)'},
    {value: 'ta-SG', label: 'Tamil (Singapore)'},
    {value: 'ta-LK', label: 'Tamil (Sri Lanka)'},
    {value: 'te-IN', label: 'Telugu (India)'},
    {value: 'teo-KE', label: 'Teso (Kenya)'},
    {value: 'teo-UG', label: 'Teso (Uganda)'},
    {value: 'th-TH', label: 'Thai (Thailand)'},
    {value: 'to-TO', label: 'Tongan (Tonga)'},
    {value: 'tr-CY', label: 'Turkish (Cyprus)'},
    {value: 'tr-TR', label: 'Turkish (Turkey)'},
    {value: 'twq-NE', label: 'Tasawaq (Niger)'},
    {value: 'tzm-MA', label: 'Central Atlas Tamazight (Morocco)'},
    {value: 'ug-CN', label: 'Uyghur (China)'},
    {value: 'uk-UA', label: 'Ukrainian (Ukraine)'},
    {value: 'ur-IN-u-nu-latn', label: 'Urdu (India,Western Digits)'},
    {value: 'ur-IN', label: 'Urdu (India)'},
    {value: 'ur-PK-u-nu-arabext', label: 'Urdu (Pakistan,Extended Arabic-Indic Digits)'},
    {value: 'ur-PK', label: 'Urdu (Pakistan)'},
    {value: 'uz-Arab-AF', label: 'Uzbek (Arabic,Afghanistan)'},
    {value: 'uz-Cyrl-UZ', label: 'Uzbek (Cyrillic,Uzbekistan)'},
    {value: 'uz-Latn-UZ', label: 'Uzbek (Latin,Uzbekistan)'},
    {value: 'vi-VN', label: 'Vietnamese (Vietnam)'},
    {value: 'vun-TZ', label: 'Vunjo (Tanzania)'},
    {value: 'wae-CH', label: 'Walser (Switzerland)'},
    {value: 'xog-UG', label: 'Soga (Uganda)'},
    {value: 'yav-CM', label: 'Yangben (Cameroon)'},
    {value: 'yo-BJ', label: 'Yoruba (Benin)'},
    {value: 'yo-NG', label: 'Yoruba (Nigeria)'},
    {value: 'yue-HK', label: 'Cantonese (Hong Kong)'},
    {value: 'zgh-MA', label: 'Standard Moroccan Tamazight (Morocco)'},
    {value: 'zh-Hans-CN', label: 'Chinese (Simplified Han,China)'},
    {value: 'zh-Hans-HK', label: 'Chinese (Simplified Han,Hong Kong)'},
    {value: 'zh-Hans-MO', label: 'Chinese (Simplified Han,Macau)'},
    {value: 'zh-Hans-SG', label: 'Chinese (Simplified Han,Singapore)'},
    {value: 'zh-Hant-HK', label: 'Chinese (Traditional Han,Hong Kong)'},
    {value: 'zh-Hant-MO', label: 'Chinese (Traditional Han,Macau)'},
    {value: 'zh-Hant-TW', label: 'Chinese (Traditional Han,Taiwan)'},
    {value: 'zu-ZA', label: 'Zulu (South Africa)'}
];