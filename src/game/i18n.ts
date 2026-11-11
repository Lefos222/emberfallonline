import { useSyncExternalStore } from "react";
import { CONTENT } from "./content-i18n";
import { UI_TEXT } from "./ui-i18n";

/**
 * The game's language: English, Greek or Polish, picked by hand by the player.
 *
 * The chosen language lives on the device (localStorage), like the music settings, and
 * applies to every screen that asks for its text through `useT()` / `t()`.
 *
 * The dictionary is keyed by the English source phrase, so any string can be translated
 * by adding one row to `TRANSLATIONS`; anything not translated yet simply stays English
 * instead of showing a placeholder key. `{name}` marks a value passed in `vars`.
 */

export type Lang = "en" | "el" | "pl";

export const LANGUAGES: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "el", label: "Ελληνικά" },
  { id: "pl", label: "Polski" },
];

const STORAGE_KEY = "emberfall.lang";

const isLang = (v: unknown): v is Lang => v === "en" || v === "el" || v === "pl";

function readLang(): Lang {
  if (typeof localStorage === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLang(saved) ? saved : "en";
  } catch {
    return "en";
  }
}

let lang: Lang = readLang();
const listeners = new Set<() => void>();

function applyDocumentLang(l: Lang) {
  if (typeof document !== "undefined") document.documentElement.lang = l;
}
applyDocumentLang(lang);

export function getLang(): Lang {
  return lang;
}

/** Pick the language by hand; the choice is remembered for the next visit. */
export function setLang(next: Lang) {
  if (!isLang(next) || next === lang) return;
  lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Private mode: the language simply lasts for this visit. */
  }
  applyDocumentLang(next);
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-renders the calling component whenever the player changes language. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "en" as Lang);
}

/** The exact translation of a phrase, or undefined when the dictionary has no row for it. */
function exact(phrase: string, forLang: Lang): string | undefined {
  if (forLang === "en") return phrase;
  const row = TRANSLATIONS[phrase] ?? UI_TEXT[phrase] ?? CONTENT[phrase];
  if (!row) return undefined;
  return forLang === "el" ? row[0] : row[1];
}

function lookup(phrase: string, forLang: Lang): string {
  return exact(phrase, forLang) ?? phrase;
}

function fill(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

/** Translate one phrase in the current language (for code outside a component). */
export function t(phrase: string, vars?: Record<string, string | number>): string {
  return fill(lookup(phrase, lang), vars);
}

/**
 * The same translator as `t()`, under a second name. A few screens loop with `(t) => …` or hold a
 * local `t`, which would shadow the function; those files import `tr` instead.
 */
export const tr = t;

/** The hook components use: `const t = useT();` then `t("Sign in")`. */
export function useT() {
  const current = useLang();
  return (phrase: string, vars?: Record<string, string | number>) =>
    fill(lookup(phrase, current), vars);
}

/**
 * Translate a composed name — "Bloodforged Plate of Ruin", "Chipped Ruby", "Gold Wolf Lv3" —
 * by matching its word groups against the dictionary, longest group first. Words with no row
 * stay exactly as they are, so proper nouns and numbers survive untouched.
 */
/** Title requirements and quest lines carry a number: translate the sentence around it. */
const NAME_TEMPLATES: [RegExp, string][] = [
  [/^Clear ([\d.,]+) [Cc]ampaign stages$/, "Clear {n} Campaign stages"],
  [/^Clear ([\d.,]+) Endless Conquest floors$/, "Clear {n} Endless Conquest floors"],
  [/^Win ([\d.,]+) battles$/, "Win {n} battles"],
  [/^Win ([\d.,]+) arena fights$/, "Win {n} arena fights"],
  [/^Reach level ([\d.,]+)$/, "Reach level {n}"],
  [/^Reach Ascension ([\d.,]+)$/, "Reach Ascension {n}"],
  [/^Defeat ([\d.,]+) bosses$/, "Defeat {n} bosses"],
  [/^Defeat ([\d.,]+) monsters$/, "Defeat {n} monsters"],
  [/^Craft ([\d.,]+) items at the Forge$/, "Craft {n} items at the Forge"],
  [/^Own ([\d.,]+) Astrals$/, "Own {n} Astrals"],
];

export function translateName(text: string, forLang: Lang): string {
  if (forLang === "en" || !text) return text;
  const whole = exact(text, forLang);
  if (whole !== undefined) return whole;
  for (const [pattern, key] of NAME_TEMPLATES) {
    const match = pattern.exec(text);
    if (match) return fill(lookup(key, forLang), { n: match[1]! });
  }
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length;) {
    let hit: string | undefined;
    let used = 1;
    for (let n = Math.min(5, words.length - i); n >= 1; n--) {
      const found = exact(words.slice(i, i + n).join(" "), forLang);
      if (found !== undefined) {
        hit = found;
        used = n;
        break;
      }
    }
    if (hit !== undefined) {
      out.push(hit);
      i += used;
      continue;
    }
    const lv = /^Lv(\d+)$/.exec(words[i]!);
    if (lv) out.push(fill(lookup("Lv {n}", forLang), { n: lv[1]! }));
    else out.push(words[i]!);
    i += 1;
  }
  return out.join(" ");
}

/** Translate one composed name in the current language (for code outside a component). */
export function tName(text: string): string {
  return translateName(text, lang);
}

/** The hook for names: `const tn = useTName();` then `tn("Chipped Ruby")`. */
export function useTName() {
  const current = useLang();
  return (text: string) => translateName(text, current);
}

const GEAR_PREFIXES = [
  "Worn",
  "Iron",
  "Bloodforged",
  "Moonlit",
  "Dread",
  "Abyssal",
  "Crimson",
  "Soulbound",
  "Eclipse",
  "Ancient",
  "Emberforged",
  "Starweave",
  "Verdant",
];
const GEAR_SUFFIXES = [
  "of Ash",
  "of the Moon",
  "of Ruin",
  "of Kings",
  "of the Void",
  "of Eternity",
];

/**
 * Translate a piece of gear's stored name. Unlike a plain phrase, a gear name is built as
 * "<prefix> <noun> <suffix>", and Greek and Polish put the qualifiers after the noun, so the
 * parts are translated separately and rejoined in that order. Boss drops carry an owner
 * ("Gorefiend's Plate of Ruin"), which is set before the piece it names.
 */
function itemNameIn(name: string, forLang: Lang): string {
  if (forLang === "en" || !name) return name;
  const whole = exact(name, forLang);
  if (whole !== undefined) return whole;
  const owned = /^(.+)'s (.+)$/.exec(name);
  if (owned) return `${itemNameIn(owned[2]!, forLang)} — ${translateName(owned[1]!, forLang)}`;
  let rest = name;
  let prefix = "";
  for (const p of GEAR_PREFIXES) {
    if (rest.startsWith(p + " ")) {
      prefix = p;
      rest = rest.slice(p.length + 1);
      break;
    }
  }
  let suffix = "";
  for (const s of GEAR_SUFFIXES) {
    if (rest.endsWith(" " + s)) {
      suffix = s;
      rest = rest.slice(0, -(s.length + 1));
      break;
    }
  }
  return [
    translateName(rest, forLang),
    prefix ? (exact(prefix, forLang) ?? prefix) : "",
    suffix ? (exact(suffix, forLang) ?? suffix) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Translate a gear name in the current language (for code outside a component). */
export function itemName(name: string): string {
  return itemNameIn(name, lang);
}

/** The hook for gear names: `const gearName = useItemName();` then `gearName(it.name)`. */
export function useItemName() {
  const current = useLang();
  return (name: string) => itemNameIn(name, current);
}

// ---------------------------------------------------------------------------
// Localising the game's content dictionaries
// ---------------------------------------------------------------------------
// Materials, gems, skills, titles and the rest are plain data objects that the whole game reads.
// Turning their text fields into language-aware getters here means every existing `MATS[k].name`
// or `GEMS[t].name` in the UI follows the player's language without a second lookup at each
// site — and a name that has no translation row still reads exactly as it did before.

function defineText<T extends object>(obj: T, field: string, render: (value: string) => string) {
  const raw = (obj as Record<string, unknown>)[field];
  if (typeof raw !== "string") return;
  Object.defineProperty(obj, field, {
    get: () => render(raw),
    enumerable: true,
    configurable: true,
  });
}

/** Make the named fields follow composed names ("Chipped Ruby", "Flamecrown"). */
export function locName<T extends object>(obj: T, fields: readonly string[] = ["name"]): T {
  for (const field of fields) defineText(obj, field, tName);
  return obj;
}

/** Make the named fields follow whole-phrase translations (descriptions, notes, sentences). */
export function locText<T extends object>(obj: T, fields: readonly string[]): T {
  for (const field of fields) defineText(obj, field, (value) => t(value));
  return obj;
}

/** Localise a map of records (or of arrays of records): MATS, GEMS, SKILLS, TITLES and friends. */
export function locAll<T>(
  map: T,
  names: readonly string[] = ["name"],
  texts: readonly string[] = [],
): T {
  for (const value of Object.values(map as Record<string, unknown>)) {
    const rows = Array.isArray(value) ? value : [value];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      if (names.length) locName(row, names);
      if (texts.length) locText(row, texts);
    }
  }
  return map;
}

/** Localise a map of one-word labels (`{ attack: "attack", … }`). */
export function locValues<T extends Record<string, string>>(map: T): T {
  for (const key of Object.keys(map)) defineText(map, key, (value) => t(value));
  return map;
}

/** Localise a list of names (`["Chipped", "Flawed", …]`). */
export function locList<T extends readonly string[]>(list: T): T {
  list.forEach((_, index) => defineText(list as unknown as object, String(index), tName));
  return list;
}

/** English phrase → [Ελληνικά, Polski]. Rows are added as screens are translated. */
const TRANSLATIONS: Record<string, [el: string, pl: string]> = {
  // ---------- Language picker ----------
  Language: ["Γλώσσα", "Język"],
  "Choose your language": ["Διάλεξε γλώσσα", "Wybierz język"],

  // ---------- Sign-in gate ----------
  "Return to your castle": ["Επιστροφή στο κάστρο σου", "Wróć do swojego zamku"],
  "Forge a new legend": ["Σφυρηλάτησε έναν νέο θρύλο", "Wykuj nową legendę"],
  "Reset your password": ["Επαναφορά κωδικού πρόσβασης", "Zresetuj hasło"],
  Email: ["Email", "E-mail"],
  "Password (min 6)": ["Κωδικός (τουλάχιστον 6)", "Hasło (min. 6 znaków)"],
  "Show password": ["Εμφάνιση κωδικού", "Pokaż hasło"],
  "Hide password": ["Απόκρυψη κωδικού", "Ukryj hasło"],
  "Sign in": ["Σύνδεση", "Zaloguj się"],
  "Create account": ["Δημιουργία λογαριασμού", "Załóż konto"],
  "Send reset link": ["Αποστολή συνδέσμου επαναφοράς", "Wyślij link resetujący"],
  or: ["ή", "lub"],
  "Continue with Google": ["Συνέχεια με Google", "Kontynuuj z Google"],
  "Have an account? Sign in": ["Έχεις λογαριασμό; Σύνδεση", "Masz konto? Zaloguj się"],
  "New here? Sign up": ["Νέος εδώ; Εγγραφή", "Pierwszy raz? Zarejestruj się"],
  "Forgot password?": ["Ξέχασες τον κωδικό;", "Nie pamiętasz hasła?"],
  "Back to sign in": ["Πίσω στη σύνδεση", "Powrót do logowania"],
  "Wrong email or password.": ["Λάθος email ή κωδικός.", "Błędny e-mail lub hasło."],
  "Please confirm your email first — check your inbox.": [
    "Επιβεβαίωσε πρώτα το email σου — έλεγξε τα εισερχόμενά σου.",
    "Najpierw potwierdź e-mail — sprawdź skrzynkę.",
  ],
  "Check your email to confirm your account.": [
    "Έλεγξε το email σου για να επιβεβαιώσεις τον λογαριασμό σου.",
    "Sprawdź e-mail, aby potwierdzić konto.",
  ],
  "If that email has an account, a reset link is on its way.": [
    "Αν αυτό το email έχει λογαριασμό, ο σύνδεσμος επαναφοράς είναι καθ' οδόν.",
    "Jeśli ten e-mail ma konto, link do resetu jest w drodze.",
  ],
  "Google sign-in couldn't start right now. Please try again, or use email and password.": [
    "Η σύνδεση με Google δεν ξεκίνησε τώρα. Δοκίμασε ξανά ή χρησιμοποίησε email και κωδικό.",
    "Logowanie Google nie wystartowało. Spróbuj ponownie lub użyj e-maila i hasła.",
  ],
  "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.": [
    "Ο browser σου μπλόκαρε το παράθυρο σύνδεσης. Επίτρεψε τα αναδυόμενα παράθυρα για αυτόν τον ιστότοπο και δοκίμασε ξανά.",
    "Przeglądarka zablokowała okno logowania. Zezwól na wyskakujące okna i spróbuj ponownie.",
  ],
  "Sign-in didn't finish. Please try again.": [
    "Η σύνδεση δεν ολοκληρώθηκε. Δοκίμασε ξανά.",
    "Logowanie nie zostało dokończone. Spróbuj ponownie.",
  ],

  // ---------- Choosing and creating a hero ----------
  "Select Your Hero": ["Διάλεξε τον ήρωά σου", "Wybierz bohatera"],
  "Sign out": ["Αποσύνδεση", "Wyloguj się"],
  "Loading your characters…": ["Φόρτωση των χαρακτήρων σου…", "Wczytywanie bohaterów…"],
  "Couldn't load characters: {error}": [
    "Δεν φορτώθηκαν οι χαρακτήρες: {error}",
    "Nie udało się wczytać bohaterów: {error}",
  ],
  Retry: ["Δοκίμασε ξανά", "Spróbuj ponownie"],
  "Continue as {name}": ["Συνέχεια ως {name}", "Kontynuuj jako {name}"],
  Play: ["Παίξε", "Graj"],
  Delete: ["Διαγραφή", "Usuń"],
  "New character": ["Νέος χαρακτήρας", "Nowy bohater"],
  "Last played {date}": ["Τελευταίο παιχνίδι {date}", "Ostatnio grano {date}"],
  "Delete {name}?": ["Διαγραφή του {name};", "Usunąć {name}?"],
  "This permanently erases this character and all its progress.": [
    "Αυτό διαγράφει οριστικά τον χαρακτήρα και όλη την πρόοδό του.",
    "To trwale usuwa tego bohatera i cały jego postęp.",
  ],
  "Delete forever": ["Οριστική διαγραφή", "Usuń na zawsze"],
  Cancel: ["Άκυρο", "Anuluj"],
  Back: ["Πίσω", "Wstecz"],
  "Enter the castle": ["Μπες στο κάστρο", "Wejdź do zamku"],
  "Change hero poses": ["Αλλαγή πόζας ήρωα", "Zmień pozę bohatera"],
  "Character name (3–18)": ["Όνομα χαρακτήρα (3–18)", "Imię bohatera (3–18)"],
  "Character name": ["Όνομα χαρακτήρα", "Imię bohatera"],
  Next: ["Επόμενο", "Dalej"],
  "Use 3–18 letters, numbers, spaces, - or _": [
    "Χρησιμοποίησε 3–18 γράμματα, αριθμούς, κενά, - ή _",
    "Użyj 3–18 liter, cyfr, spacji, - lub _",
  ],
  "Back to my characters": ["Πίσω στους χαρακτήρες μου", "Wróć do moich bohaterów"],
  Male: ["Άνδρας", "Mężczyzna"],
  Female: ["Γυναίκα", "Kobieta"],
  Knight: ["Ιππότης", "Rycerz"],
  Mage: ["Μάγος", "Mag"],
  Archer: ["Τοξότης", "Łucznik"],
  "Melee · Tank": ["Σώμα με σώμα · Τανκ", "Wręcz · Tank"],
  "Ranged · Spells": ["Από απόσταση · Ξόρκια", "Dystans · Zaklęcia"],
  "Ranged · Crits": ["Από απόσταση · Κριτικά", "Dystans · Krytyki"],
  "Durable frontline fighter. Heavy physical blows, high armor and health.": [
    "Ανθεκτικός μαχητής πρώτης γραμμής. Βαριά χτυπήματα, υψηλή πανοπλία και υγεία.",
    "Wytrzymały wojownik pierwszej linii. Ciężkie ciosy, wysoka zbroja i zdrowie.",
  ],
  "Elemental spellcaster. Devastating magic damage, fragile defenses.": [
    "Μάγος των στοιχείων. Καταστροφική μαγική ζημιά, εύθραυστη άμυνα.",
    "Czarodziej żywiołów. Niszczycielskie obrażenia magii, krucha obrona.",
  ],
  "Agile marksman. High critical chance and dodge, precise arrows.": [
    "Ευκίνητος σκοπευτής. Υψηλό ποσοστό κριτικών και αποφυγής, ακριβή βέλη.",
    "Zwinny strzelec. Wysoka szansa na kryt i unik, precyzyjne strzały.",
  ],
  "Lv {n}": ["Επ. {n}", "Poz. {n}"],
  Asc: ["Ανάληψη", "Wzn."],
  "Select {gender} {class}": ["Επίλεξε {gender} {class}", "Wybierz: {gender} {class}"],
  "Cloud: {state}": ["Cloud: {state}", "Chmura: {state}"],
  "Not signed in": ["Χωρίς σύνδεση", "Nie zalogowano"],
  "Loading…": ["Φόρτωση…", "Wczytywanie…"],
  Saved: ["Αποθηκεύτηκε", "Zapisano"],
  "Saving…": ["Αποθήκευση…", "Zapisywanie…"],
  "Not saved": ["Δεν αποθηκεύτηκε", "Nie zapisano"],

  // ---------- Castle buildings ----------
  "Throne Hall": ["Αίθουσα του Θρόνου", "Sala Tronowa"],
  Armory: ["Οπλοστάσιο", "Zbrojownia"],
  Barracks: ["Στρατώνας", "Koszary"],
  Blacksmith: ["Σιδηρουργός", "Kowal"],
  "Quest Board": ["Πίνακας Αποστολών", "Tablica zadań"],
  "Campaign Gate": ["Πύλη Εκστρατείας", "Wrota kampanii"],
  Farm: ["Αγρόκτημα", "Farma"],
  "Conquest Gate": ["Πύλη Κατάκτησης", "Wrota podboju"],
  Arena: ["Αρένα", "Arena"],
  "Auction House": ["Οίκος Δημοπρασιών", "Dom aukcyjny"],
  "Dungeon Gate": ["Πύλη Μπουντρουμιού", "Wrota lochów"],
  "Magic Tower": ["Πύργος της Μαγείας", "Wieża Magii"],
  "Gem Workshop": ["Εργαστήριο Πετραδιών", "Warsztat klejnotów"],
  "Guild Hall": ["Αίθουσα Συντεχνίας", "Sala Gildii"],
  "Gold Mine": ["Χρυσωρυχείο", "Kopalnia złota"],
  Friends: ["Φίλοι", "Znajomi"],
  "Daily Rewards": ["Ημερήσιες Ανταμοιβές", "Nagrody dzienne"],
  "World Tree": ["Παγκόσμιο Δέντρο", "Drzewo Świata"],
  " · soon": [" · σύντομα", " · wkrótce"],
  "Reward chest ready": ["Το μπαούλο ανταμοιβής είναι έτοιμο", "Skrzynia nagród gotowa"],
  "{count} pending friend requests": [
    "{count} εκκρεμή αιτήματα φιλίας",
    "{count} oczekujących zaproszeń do znajomych",
  ],
  "Tap a building to open it · drag the castle to reach the rest": [
    "Πάτησε ένα κτίριο για να το ανοίξεις · σύρε το κάστρο για τα υπόλοιπα",
    "Dotknij budynku, aby go otworzyć · przeciągnij zamek, by zobaczyć resztę",
  ],
  "Skill tree, stats & progression": [
    "Δέντρο δεξιοτήτων, στατιστικά & πρόοδος",
    "Drzewko umiejętności, statystyki i postęp",
  ],
  "Inventory & equipment": ["Αποθήκη & εξοπλισμός", "Ekwipunek i wyposażenie"],
  "Attribute training": ["Εκπαίδευση χαρακτηριστικών", "Trening cech"],
  "Enhance & salvage gear": ["Βελτίωση & διάλυση εξοπλισμού", "Ulepszanie i rozbiór ekwipunku"],
  "AI-generated quests": ["Αποστολές AI", "Zadania generowane przez AI"],
  "Campaign stages": ["Στάδια εκστρατείας", "Etapy kampanii"],
  "Seeds, crops & the Bloodoak": [
    "Σπόροι, καλλιέργειες & η Ματοβελανιδιά",
    "Nasiona, uprawy i Krwawodąb",
  ],
  "Endless Conquest · Lv 10+": [
    "Ατελείωτη Κατάκτηση · Επ. 10+",
    "Niekończący się podbój · Poz. 10+",
  ],
  "Fight real players": ["Πάλεψε με πραγματικούς παίκτες", "Walcz z prawdziwymi graczami"],
  "Catalogue, shop & player auctions": [
    "Κατάλογος, κατάστημα & δημοπρασίες παικτών",
    "Katalog, sklep i aukcje graczy",
  ],
  "Boss challenges & elites · Lv 20+": [
    "Μάχες αφεντικών & ελίτ · Επ. 20+",
    "Bossowie i elity · Poz. 20+",
  ],
  "Astral vault · infinite upgrades": [
    "Αστρικό θησαυροφυλάκιο · ατελείωτες αναβαθμίσεις",
    "Astralny skarbiec · nieskończone ulepszenia",
  ],
  "Cut, socket & fuse gems": [
    "Κόψιμο, τοποθέτηση & ένωση πετραδιών",
    "Szlifowanie, oprawa i łączenie klejnotów",
  ],
  "Guilds & guild chat": ["Συντεχνίες & συνομιλία συντεχνίας", "Gildie i czat gildii"],
  "Offline gold · collect anytime": [
    "Χρυσός εκτός σύνδεσης · μάζεψέ τον όποτε θέλεις",
    "Złoto offline · odbieraj kiedy chcesz",
  ],
  "Friends & messages": ["Φίλοι & μηνύματα", "Znajomi i wiadomości"],
  "Login rewards & activities": [
    "Ανταμοιβές σύνδεσης & δραστηριότητες",
    "Nagrody za logowanie i aktywności",
  ],
  "Explore the world map · raids & bosses": [
    "Εξερεύνησε τον χάρτη του κόσμου · επιδρομές & αφεντικά",
    "Odkrywaj mapę świata · rajdy i bossowie",
  ],

  // ---------- Shortcuts and rewards bars ----------
  Inventory: ["Αποθήκη", "Ekwipunek"],
  "Bag & equipment": ["Τσάντα & εξοπλισμός", "Plecak i wyposażenie"],
  Forge: ["Σιδηρουργείο", "Kuźnia"],
  Events: ["Γεγονότα", "Wydarzenia"],
  "World event calendar & reminders": [
    "Ημερολόγιο γεγονότων & υπενθυμίσεις",
    "Kalendarz wydarzeń i przypomnienia",
  ],
  Profile: ["Προφίλ", "Profil"],
  "Your hero profile": ["Το προφίλ του ήρωά σου", "Profil twojego bohatera"],
  "30-day reward board": ["Πίνακας ανταμοιβών 30 ημερών", "Tablica nagród na 30 dni"],
  Shortcuts: ["Συντομεύσεις", "Skróty"],
  Rewards: ["Ανταμοιβές", "Nagrody"],
  Mailbox: ["Γραμματοκιβώτιο", "Skrzynka pocztowa"],
  "Lucky Shots": ["Τυχερά Χτυπήματα", "Szczęśliwe strzały"],
  "Battle Scrolls": ["Πάπυροι Μάχης", "Zwoje bitewne"],
  Bestiary: ["Βεστιάριο", "Bestiariusz"],
  "Premium Shop": ["Κατάστημα Premium", "Sklep Premium"],

  // ---------- Player card ----------
  Stamina: ["Αντοχή", "Wytrzymałość"],
  "Currencies and power": ["Νομίσματα και δύναμη", "Waluty i moc"],
  Power: ["Δύναμη", "Moc"],
  Gold: ["Χρυσός", "Złoto"],
  Diamonds: ["Διαμάντια", "Diamenty"],
  "Void Crystals": ["Κρύσταλλοι Κενού", "Kryształy pustki"],
  Music: ["Μουσική", "Muzyka"],
  "Mute music": ["Σίγαση μουσικής", "Wycisz muzykę"],
  "Unmute music": ["Ενεργοποίηση μουσικής", "Włącz muzykę"],
  "Game settings": ["Ρυθμίσεις παιχνιδιού", "Ustawienia gry"],
  "Open your profile": ["Άνοιξε το προφίλ σου", "Otwórz swój profil"],
  "Switch character": ["Αλλαγή χαρακτήρα", "Zmień bohatera"],
  "Potion pouch": ["Πουγγί φίλτρων", "Sakwa mikstur"],

  // ---------- Settings ----------
  Settings: ["Ρυθμίσεις", "Ustawienia"],
  "Music and sound": ["Μουσική και ήχος", "Muzyka i dźwięk"],
  "Music volume": ["Ένταση μουσικής", "Głośność muzyki"],
  Muted: ["Σε σίγαση", "Wyciszone"],
  On: ["Ενεργό", "Włączone"],
  Soundtrack: ["Μουσική υπόκρουση", "Ścieżka dźwiękowa"],
  Default: ["Προεπιλογή", "Domyślne"],
  "Now playing": ["Παίζει τώρα", "Teraz gra"],
  "Play this": ["Παίξε αυτό", "Odtwórz tę"],
  "Original theme": ["Αρχικό θέμα", "Motyw oryginalny"],
  "The Emberfall soundtrack": ["Το soundtrack του Emberfall", "Ścieżka dźwiękowa Emberfall"],
  "Sibling Showdown": ["Αδελφική Αναμέτρηση", "Bratobójczy pojedynek"],
  "The duel score": ["Το θέμα της μονομαχίας", "Muzyka pojedynku"],
  "Sound, music and fight pacing": [
    "Ήχος, μουσική και ρυθμός μάχης",
    "Dźwięk, muzyka i tempo walk",
  ],
  "Fight speed": ["Ταχύτητα μάχης", "Tempo walk"],
  Fast: ["Γρήγορη", "Szybka"],
  Normal: ["Κανονική", "Normalna"],
  "Fast-forward shortens every fight. Remembered on this device; F switches it during a battle.": [
    "Η γρήγορη προώθηση συντομεύει κάθε μάχη. Θυμάται σε αυτή τη συσκευή· το F την αλλάζει μέσα στη μάχη.",
    "Szybkie przewijanie skraca każdą walkę. Zapamiętywane na tym urządzeniu; F przełącza je w walce.",
  ],
  "Fight again": ["Πολέμησε ξανά", "Walcz ponownie"],
  "Enter continues · Esc closes": [
    "Το Enter συνεχίζει · το Esc κλείνει",
    "Enter kontynuuje · Esc zamyka",
  ],
  "Music starts after your first tap on the castle. Your choice and volume are remembered on this device.":
    [
      "Η μουσική ξεκινά με το πρώτο σου άγγιγμα στο κάστρο. Η επιλογή και η ένταση θυμούνται σε αυτή τη συσκευή.",
      "Muzyka startuje po pierwszym dotknięciu zamku. Wybór i głośność są zapamiętywane na tym urządzeniu.",
    ],

  // ---------- Panels: titles ----------
  "Barracks — Attribute Training": [
    "Στρατώνας — Εκπαίδευση χαρακτηριστικών",
    "Koszary — Trening cech",
  ],
  "Blood Arena": ["Αρένα του Αίματος", "Arena Krwi"],
  "World Event Calendar": ["Ημερολόγιο γεγονότων", "Kalendarz wydarzeń"],
  "Forge · Crafting": ["Σιδηρουργείο · Κατασκευή", "Kuźnia · Rzemiosło"],
  "Bestiary & Boss Roster": ["Βεστιάριο & Λίστα αφεντικών", "Bestiariusz i lista bossów"],
  "Hero Profile": ["Προφίλ ήρωα", "Profil bohatera"],
  "Dungeon Gate · Expeditions": ["Πύλη Μπουντρουμιού · Εκστρατείες", "Wrota lochów · Wyprawy"],
  "Relic Trials": ["Δοκιμασίες κειμηλίων", "Próby relikwii"],
  "Daily & Weekly Activities": [
    "Ημερήσιες & εβδομαδιαίες δραστηριότητες",
    "Aktywności dzienne i tygodniowe",
  ],
  "Version 1.00 patch notes": ["Σημειώσεις έκδοσης 1.00", "Zmiany w wersji 1.00"],
  "Rewards and letters from the realm": [
    "Ανταμοιβές και γράμματα από το βασίλειο",
    "Nagrody i listy ze świata",
  ],

  // ---------- Panels: subtitles ----------
  "Bag, equipment and sets": ["Τσάντα, εξοπλισμός και σετ", "Plecak, ekwipunek i zestawy"],
  "Boss challenges, elite hunts, expeditions and relics": [
    "Μάχες αφεντικών, κυνήγι ελίτ, εκστρατείες και κειμήλια",
    "Walki z bossami, polowania na elity, wyprawy i relikwie",
  ],
  "Catalogue · Shop · Farm · Player auctions": [
    "Κατάλογος · Κατάστημα · Αγρόκτημα · Δημοπρασίες παικτών",
    "Katalog · Sklep · Farma · Aukcje graczy",
  ],
  "Challenge any hero on the ladder": [
    "Προκάλεσε οποιονδήποτε ήρωα στην κατάταξη",
    "Rzuć wyzwanie dowolnemu bohaterowi w rankingu",
  ],
  "Cut, socket and fuse gems": [
    "Κόψιμο, τοποθέτηση και ένωση πετραδιών",
    "Szlifowanie, oprawa i łączenie klejnotów",
  ],
  "Daily commissions, reset at midnight": [
    "Καθημερινές αποστολές, ανανέωση τα μεσάνυχτα",
    "Zadania dzienne, reset o północy",
  ],
  "Enhance, socket and salvage your gear": [
    "Βελτίωσε, τοποθέτησε και διέλυσε τον εξοπλισμό σου",
    "Ulepszaj, oprawiaj i rozbieraj ekwipunek",
  ],
  "Every foe you have felled": ["Κάθε εχθρός που έχεις ρίξει", "Każdy pokonany wróg"],
  "Fresh tasks every reset": ["Νέες εργασίες σε κάθε ανανέωση", "Nowe zadania po każdym resecie"],
  "Gear, stats, guild and titles": [
    "Εξοπλισμός, στατιστικά, συντεχνία και τίτλοι",
    "Ekwipunek, statystyki, gildia i tytuły",
  ],
  "Inspect hero": ["Δες τον ήρωα", "Zobacz bohatera"],
  "Ladder, duels and ratings": [
    "Κατάταξη, μονομαχίες και βαθμολογίες",
    "Ranking, pojedynki i oceny",
  ],
  "Materials by the crate": ["Υλικά με το κιβώτιο", "Materiały na wagę"],
  "One board per level, paid in gold and XP": [
    "Ένας πίνακας ανά επίπεδο, με χρυσό και XP",
    "Jedna tablica na poziom, płatna złotem i PD",
  ],
  "One-fight boosts and effects": ["Ενισχύσεις για μία μάχη", "Wzmocnienia na jedną walkę"],
  "Player auctions — trade gear for gold": [
    "Δημοπρασίες παικτών — αντάλλαξε εξοπλισμό για χρυσό",
    "Aukcje graczy — wymieniaj ekwipunek na złoto",
  ],
  "Shape materials into armor": ["Μετάτρεψε υλικά σε πανοπλία", "Przetwarzaj materiały na zbroje"],
  "Skill tree, passives, hero training and achievements": [
    "Δέντρο δεξιοτήτων, παθητικά, εκπαίδευση ήρωα και επιτεύγματα",
    "Drzewko umiejętności, pasywki, trening i osiągnięcia",
  ],
  "Spin for astrals and gems": [
    "Γύρισε για αστρικά και πετράδια",
    "Zakręć po astralne kamienie i klejnoty",
  ],
  "The Astral Vault · every stone unique, every level endless": [
    "Το Αστρικό Θησαυροφυλάκιο · κάθε πέτρα μοναδική, κάθε επίπεδο ατελείωτο",
    "Astralny Skarbiec · każdy kamień wyjątkowy, każdy poziom nieskończony",
  ],
  "Turn gold into permanent stats": [
    "Μετέτρεψε χρυσό σε μόνιμα στατιστικά",
    "Zamień złoto w trwałe statystyki",
  ],
  "Windows that open on the world clock": [
    "Παράθυρα που ανοίγουν με το ρολόι του κόσμου",
    "Okna otwierane według zegara świata",
  ],
  "Your guild, tower and treasury": [
    "Η συντεχνία, ο πύργος και το ταμείο σου",
    "Twoja gildia, wieża i skarbiec",
  ],
  "Your hero, titles, achievements and look": [
    "Ο ήρωάς σου, τίτλοι, επιτεύγματα και εμφάνιση",
    "Twój bohater, tytuły, osiągnięcia i wygląd",
  ],

  // ---------- Anti-cheat ----------
  "Anti-cheat warning": ["Προειδοποίηση κατά της απάτης", "Ostrzeżenie o oszustwie"],
  "Your save was blocked": ["Η αποθήκευσή σου μπλοκαρίστηκε", "Twój zapis został zablokowany"],
  "A backup of the character is kept": [
    "Κρατείται αντίγραφο του χαρακτήρα",
    "Kopia bohatera jest zachowana",
  ],
  "Character deleted": ["Ο χαρακτήρας διαγράφηκε", "Bohater usunięty"],
  "Your character {name} was deleted after repeated blocked saves.": [
    "Ο χαρακτήρας σου {name} διαγράφηκε μετά από επανειλημμένες μπλοκαρισμένες αποθηκεύσεις.",
    "Twój bohater {name} został usunięty po powtarzających się zablokowanych zapisach.",
  ],
  "A full copy is kept on the server, so support can restore the character if this was a mistake. Contact them with your account email.":
    [
      "Ένα πλήρες αντίγραφο φυλάσσεται στον διακομιστή, ώστε η υποστήριξη να μπορεί να επαναφέρει τον χαρακτήρα αν έγινε λάθος. Επικοινώνησε μαζί τους με το email του λογαριασμού σου.",
      "Pełna kopia jest przechowywana na serwerze, więc pomoc techniczna może przywrócić bohatera, jeśli to była pomyłka. Skontaktuj się z nią, podając e-mail konta.",
    ],
  "A save from this account carried a value the game cannot produce. It was rolled back, so nothing was gained.":
    [
      "Μια αποθήκευση από αυτόν τον λογαριασμό περιείχε τιμή που το παιχνίδι δεν μπορεί να παράγει. Ακυρώθηκε, οπότε δεν κερδήθηκε τίποτα.",
      "Zapis z tego konta zawierał wartość, której gra nie może wytworzyć. Został cofnięty, więc nic nie zyskano.",
    ],
  "Blocked: {list}": ["Μπλοκαρίστηκε: {list}", "Zablokowano: {list}"],
  "If it happens again the character is deleted.": [
    "Αν ξαναγίνει, ο χαρακτήρας διαγράφεται.",
    "Jeśli to się powtórzy, bohater zostanie usunięty.",
  ],
  "I understand": ["Καταλαβαίνω", "Rozumiem"],
  "battle rating": ["βαθμολογία μάχης", "ocena walki"],
  gold: ["χρυσός", "złoto"],
  level: ["επίπεδο", "poziom"],
  "arena rating": ["βαθμολογία αρένας", "ocena areny"],
  "server-owned rewards": ["ανταμοιβές διακομιστή", "nagrody serwera"],

  // ---------- Shared controls ----------
  Close: ["Κλείσιμο", "Zamknij"],
};
