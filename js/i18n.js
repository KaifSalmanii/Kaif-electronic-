// Language support: English, Hindi (Devanagari) and Hinglish (Hindi in Roman script).
export const LANGS = ['en', 'hi', 'hinglish'];
const LOCALE = { en: 'en-IN', hi: 'hi-IN', hinglish: 'en-IN' };

const D = {
  appName: { en: 'Kaif Dashboard', hi: 'काइफ़ डैशबोर्ड', hinglish: 'Kaif Dashboard' },
  'net.online': { en: 'Online', hi: 'ऑनलाइन', hinglish: 'Online' },
  'net.offline': { en: 'Offline mode', hi: 'ऑफ़लाइन मोड', hinglish: 'Offline mode' },

  'nav.home': { en: 'Home', hi: 'होम', hinglish: 'Home' },
  'nav.money': { en: 'Money', hi: 'पैसे', hinglish: 'Paisa' },
  'nav.reminders': { en: 'Reminders', hi: 'रिमाइंडर', hinglish: 'Reminder' },
  'nav.tasks': { en: 'Tasks', hi: 'कार्य', hinglish: 'Tasks' },
  'nav.chat': { en: 'Chat', hi: 'चैट', hinglish: 'Chat' },
  'nav.settings': { en: 'Settings', hi: 'सेटिंग्स', hinglish: 'Settings' },

  'home.greeting': { en: 'Welcome back 👋', hi: 'आपका स्वागत है 👋', hinglish: 'Welcome back 👋' },
  'home.balance': { en: 'Total balance', hi: 'कुल शेष राशि', hinglish: 'Total balance' },
  'home.month': { en: 'This month', hi: 'इस महीने', hinglish: 'Is mahine' },
  'home.income': { en: 'Income', hi: 'आय', hinglish: 'Income' },
  'home.expense': { en: 'Expense', hi: 'खर्च', hinglish: 'Kharcha' },
  'home.next': { en: 'Next reminder', hi: 'अगला रिमाइंडर', hinglish: 'Agla reminder' },
  'home.pending': { en: 'Pending tasks', hi: 'बाकी कार्य', hinglish: 'Pending tasks' },
  'home.quick': { en: 'Quick actions', hi: 'त्वरित कार्य', hinglish: 'Quick actions' },
  'home.addExpense': { en: '+ Expense', hi: '+ खर्च', hinglish: '+ Kharcha' },
  'home.addIncome': { en: '+ Income', hi: '+ आय', hinglish: '+ Income' },
  'home.addReminder': { en: '+ Reminder', hi: '+ रिमाइंडर', hinglish: '+ Reminder' },
  'home.chat': { en: 'WhatsApp chat', hi: 'व्हाट्सऐप चैट', hinglish: 'WhatsApp chat' },
  'home.none': { en: 'Nothing scheduled', hi: 'कुछ तय नहीं', hinglish: 'Kuch scheduled nahi' },

  'common.amount': { en: 'Amount', hi: 'राशि', hinglish: 'Rakam' },
  'common.note': { en: 'Note (optional)', hi: 'नोट (वैकल्पिक)', hinglish: 'Note (optional)' },
  'common.empty': { en: 'Nothing here yet', hi: 'यहाँ अभी कुछ नहीं है', hinglish: 'Yahan abhi kuch nahi hai' },
  'common.invalid': { en: 'Please enter valid values', hi: 'सही जानकारी भरें', hinglish: 'Sahi value daalo' },

  'money.title': { en: 'Income & Expenses', hi: 'आय और खर्च', hinglish: 'Income aur Kharcha' },
  'money.income': { en: 'Income', hi: 'आय', hinglish: 'Income' },
  'money.expense': { en: 'Expense', hi: 'खर्च', hinglish: 'Kharcha' },
  'money.add': { en: 'Add entry', hi: 'एंट्री जोड़ें', hinglish: 'Entry add karo' },
  'money.list': { en: 'Entries', hi: 'एंट्रियाँ', hinglish: 'Entries' },
  'money.chartMonthly': { en: 'Last 6 months', hi: 'पिछले 6 महीने', hinglish: 'Pichle 6 mahine' },
  'money.chartCategory': { en: 'Expense by category', hi: 'श्रेणी अनुसार खर्च', hinglish: 'Category ke hisaab se kharcha' },
  'money.noData': { en: 'No expense this month', hi: 'इस महीने कोई खर्च नहीं', hinglish: 'Is mahine koi kharcha nahi' },
  'money.saved': { en: 'Entry saved', hi: 'एंट्री सेव हो गई', hinglish: 'Entry save ho gayi' },
  'money.deleted': { en: 'Entry deleted', hi: 'एंट्री हटा दी गई', hinglish: 'Entry delete ho gayi' },

  'cat.food': { en: 'Food', hi: 'भोजन', hinglish: 'Khana' },
  'cat.travel': { en: 'Travel', hi: 'यात्रा', hinglish: 'Travel' },
  'cat.bills': { en: 'Bills', hi: 'बिल', hinglish: 'Bills' },
  'cat.shopping': { en: 'Shopping', hi: 'खरीदारी', hinglish: 'Shopping' },
  'cat.health': { en: 'Health', hi: 'स्वास्थ्य', hinglish: 'Health' },
  'cat.salary': { en: 'Salary', hi: 'वेतन', hinglish: 'Salary' },
  'cat.business': { en: 'Business', hi: 'व्यापार', hinglish: 'Business' },
  'cat.other': { en: 'Other', hi: 'अन्य', hinglish: 'Other' },

  'rem.title': { en: 'Reminders', hi: 'रिमाइंडर', hinglish: 'Reminders' },
  'rem.titleLabel': { en: 'What to remember?', hi: 'किस बात की याद दिलानी है?', hinglish: 'Kis cheez ka reminder chahiye?' },
  'rem.add': { en: 'Add', hi: 'जोड़ें', hinglish: 'Add' },
  'rem.upcoming': { en: 'Upcoming', hi: 'आने वाले', hinglish: 'Upcoming' },
  'rem.due': { en: 'Due now', hi: 'अभी बाकी', hinglish: 'Abhi due hai' },
  'rem.markDone': { en: 'Mark done', hi: 'पूरा हुआ', hinglish: 'Done mark karo' },
  'rem.notifyOn': { en: 'Notifications are ON', hi: 'नोटिफिकेशन चालू हैं', hinglish: 'Notifications ON hain' },
  'rem.notifyDenied': { en: 'Notifications blocked in browser settings', hi: 'ब्राउज़र सेटिंग्स में नोटिफिकेशन बंद हैं', hinglish: 'Browser settings me notifications block hain' },
  'rem.saved': { en: 'Reminder saved ✓', hi: 'रिमाइंडर सेव हो गया ✓', hinglish: 'Reminder save ho gaya ✓' },
  'rem.notifyAsk': { en: 'Allow notifications to get alerts on your phone', hi: 'फ़ोन पर अलर्ट के लिए नोटिफिकेशन अनुमति दें', hinglish: 'Phone par alert ke liye notifications allow karo' },

  'task.title': { en: 'Tasks', hi: 'कार्य', hinglish: 'Tasks' },
  'task.placeholder': { en: 'New task…', hi: 'नया कार्य…', hinglish: 'Naya task…' },
  'task.add': { en: 'Add', hi: 'जोड़ें', hinglish: 'Add' },
  'task.list': { en: 'All tasks', hi: 'सभी कार्य', hinglish: 'Saare tasks' },
  'task.left': { en: 'left', hi: 'बाकी', hinglish: 'baaki' },

  'chat.title': { en: 'WhatsApp chat', hi: 'व्हाट्सऐप चैट', hinglish: 'WhatsApp chat' },
  'chat.desc': { en: 'Enter a mobile number to open a direct WhatsApp chat.', hi: 'सीधी व्हाट्सऐप चैट के लिए मोबाइल नंबर डालें।', hinglish: 'Mobile number daalo aur seedha WhatsApp chat khul jayegi.' },
  'chat.phone': { en: 'Mobile number', hi: 'मोबाइल नंबर', hinglish: 'Mobile number' },
  'chat.msg': { en: 'Message (optional)', hi: 'संदेश (वैकल्पिक)', hinglish: 'Message (optional)' },
  'chat.msgDefault': { en: 'Hi!', hi: 'नमस्ते!', hinglish: 'Hi!' },
  'chat.open': { en: 'Open WhatsApp chat', hi: 'व्हाट्सऐप चैट खोलें', hinglish: 'WhatsApp chat kholo' },
  'chat.call': { en: 'Call', hi: 'कॉल', hinglish: 'Call' },
  'chat.invalid': { en: 'Enter a valid mobile number', hi: 'सही मोबाइल नंबर डालें', hinglish: 'Sahi mobile number daalo' },
  'chat.recent': { en: 'Recent chats', hi: 'हाल की चैट', hinglish: 'Recent chats' },
  'chat.preview': { en: 'Will open chat with', hi: 'इस नंबर पर चैट खुलेगी', hinglish: 'Is number par chat khulegi' },

  'set.title': { en: 'Settings', hi: 'सेटिंग्स', hinglish: 'Settings' },
  'set.general': { en: 'General', hi: 'सामान्य', hinglish: 'General' },
  'set.language': { en: 'Language', hi: 'भाषा', hinglish: 'Language' },
  'set.theme': { en: 'Theme', hi: 'थीम', hinglish: 'Theme' },
  'set.themeDark': { en: 'Dark', hi: 'डार्क', hinglish: 'Dark' },
  'set.themeLight': { en: 'Light', hi: 'लाइट', hinglish: 'Light' },
  'set.fullscreen': { en: 'Full screen', hi: 'फ़ुल स्क्रीन', hinglish: 'Full screen' },
  'set.open': { en: 'Open', hi: 'खोलें', hinglish: 'Open' },
  'set.exit': { en: 'Exit', hi: 'बाहर', hinglish: 'Exit' },
  'set.fsUnsupported': { en: 'Full screen not supported here', hi: 'इस ब्राउज़र में फ़ुल स्क्रीन नहीं', hinglish: 'Is browser me full screen support nahi' },
  'set.notify': { en: 'Reminder notifications', hi: 'रिमाइंडर नोटिफिकेशन', hinglish: 'Reminder notifications' },
  'set.enable': { en: 'Enable', hi: 'चालू करें', hinglish: 'Enable' },
  'set.install': { en: 'Install app', hi: 'ऐप इंस्टॉल करें', hinglish: 'App install karo' },
  'set.installBtn': { en: 'Install', hi: 'इंस्टॉल', hinglish: 'Install' },
  'set.installHint': { en: 'Install on your phone/PC. Works offline like a real app.', hi: 'फ़ोन/PC पर इंस्टॉल करें। ऑफ़लाइन भी चलेगा।', hinglish: 'Phone/PC par install karo. Offline bhi real app ki tarah chalega.' },
  'set.installIos': { en: 'iPhone: Share → "Add to Home Screen"', hi: 'iPhone: Share → "Add to Home Screen"', hinglish: 'iPhone: Share → "Add to Home Screen"' },
  'set.installed': { en: 'App installed ✅', hi: 'ऐप इंस्टॉल हो गया ✅', hinglish: 'App install ho gaya ✅' },
  'set.sync': { en: 'Cloud sync (Supabase)', hi: 'क्लाउड सिंक (Supabase)', hinglish: 'Cloud sync (Supabase)' },
  'set.syncHint': { en: 'Same sync code on all your devices = same data. Works offline; syncs when online.', hi: 'सभी डिवाइस पर एक ही सिंक कोड = एक ही डेटा। ऑफ़लाइन भी चलेगा, ऑनलाइन होने पर सिंक होगा।', hinglish: 'Sab devices par same sync code = same data. Offline bhi chalega, online aane par sync hoga.' },
  'set.syncCode': { en: 'Sync code (keep it secret)', hi: 'सिंक कोड (गुप्त रखें)', hinglish: 'Sync code (secret rakho)' },
  'set.save': { en: 'Save', hi: 'सेव करें', hinglish: 'Save' },
  'set.syncNow': { en: 'Sync now', hi: 'अभी सिंक करें', hinglish: 'Abhi sync karo' },
  'set.syncOff': { en: 'Supabase not configured (add env vars)', hi: 'Supabase सेट नहीं है (env vars डालें)', hinglish: 'Supabase set nahi hai (env vars daalo)' },
  'set.syncNoCode': { en: 'Enter a sync code to sync', hi: 'सिंक के लिए कोड डालें', hinglish: 'Sync ke liye code daalo' },
  'set.syncReady': { en: 'Ready to sync', hi: 'सिंक के लिए तैयार', hinglish: 'Sync ke liye ready' },
  'set.synced': { en: 'Synced', hi: 'सिंक हो गया', hinglish: 'Sync ho gaya' },
  'set.syncErr': { en: 'Sync failed — data is safe on this device', hi: 'सिंक विफल — डेटा इस डिवाइस पर सुरक्षित है', hinglish: 'Sync fail hua — data device par safe hai' },
  'set.syncSaved': { en: 'Sync code saved', hi: 'सिंक कोड सेव हो गया', hinglish: 'Sync code save ho gaya' },
  'set.data': { en: 'Data', hi: 'डेटा', hinglish: 'Data' },
  'set.export': { en: 'Export backup', hi: 'बैकअप निर्यात', hinglish: 'Backup export' },
  'set.import': { en: 'Import backup', hi: 'बैकअप आयात', hinglish: 'Backup import' },
  'set.importDone': { en: 'Backup imported', hi: 'बैकअप आयात हो गया', hinglish: 'Backup import ho gaya' },
  'set.importErr': { en: 'Invalid backup file', hi: 'गलत बैकअप फ़ाइल', hinglish: 'Galat backup file hai' },
  'set.clear': { en: 'Clear all', hi: 'सब हटाएँ', hinglish: 'Sab delete karo' },
  'set.clearConfirm': { en: 'Delete all entries, reminders and tasks?', hi: 'सारी एंट्री, रिमाइंडर और कार्य हटाएँ?', hinglish: 'Saari entries, reminders aur tasks delete karun?' },
  'set.offlineReady': { en: 'This app works offline too.', hi: 'यह ऐप ऑफ़लाइन भी चलता है।', hinglish: 'Ye app offline bhi chalti hai.' },
};

let lang = localStorage.getItem('kf.lang');
if (!LANGS.includes(lang)) lang = 'hinglish';

export const getLang = () => lang;
export const localeFor = (l = lang) => LOCALE[l] || 'en-IN';

export function t(key, vars) {
  const e = D[key];
  let s = e ? (e[lang] || e.en) : key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}

export function applyI18n(root = document) {
  document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.title = t('appName');
}

export function setLang(l) {
  if (!LANGS.includes(l)) return;
  lang = l;
  localStorage.setItem('kf.lang', l);
  applyI18n();
}
