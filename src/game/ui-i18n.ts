import type { ContentRow } from "./content-i18n";

/**
 * Greek and Polish for the wording drawn inside the castle's screens.
 *
 * `i18n.ts` keeps the shared interface dictionary (buttons, window titles, the sign-in gate);
 * this file carries the sentences and labels each panel draws itself. Rows are keyed by the
 * English source phrase, exactly like `TRANSLATIONS` and `CONTENT`, so a phrase that is not
 * here yet simply stays English instead of showing a placeholder.
 */
export const UI_TEXT: Record<string, ContentRow> = {
  "+1 XP Scroll": ["+1 Πάπυρος XP", "+1 Zwój XP"],
  "Buff lit for 24 hours": ["Η ενίσχυση άναψε για 24 ώρες", "Wzmocnienie aktywne na 24 godziny"],
  "Contribution points": ["Πόντοι συνεισφοράς", "Punkty wkładu"],
  "Every 100 gold donated earns 1 contribution point.": ["Κάθε 100 χρυσά δωρεάς δίνουν 1 πόντο συνεισφοράς.", "Każde 100 przekazanego złota daje 1 punkt wkładu."],
  "Funds": ["Ταμείο", "Fundusze"],
  "Guild Bank": ["Τράπεζα Συντεχνίας", "Bank Gildii"],
  "Guild Buffs": ["Ενισχύσεις Συντεχνίας", "Wzmocnienia Gildii"],
  "Leaders and officers light buffs from the bank. Each lasts 24 hours for every member.": ["Αρχηγοί και αξιωματικοί ανάβουν ενισχύσεις από την τράπεζα. Η καθεμία διαρκεί 24 ώρες για όλα τα μέλη.", "Przywódcy i oficerowie aktywują wzmocnienia z banku. Każde trwa 24 godziny dla wszystkich członków."],
  "Member Ranks": ["Βαθμοί Μελών", "Rangi Członków"],
  "Once a day": ["Μία φορά τη μέρα", "Raz dziennie"],
  "Read XP Scroll": ["Διάβασε Πάπυρο XP", "Przeczytaj Zwój XP"],
  "Read one XP Scroll": ["Διάβασε έναν Πάπυρο XP", "Przeczytaj jeden Zwój XP"],
  "Roll the Guild Dice": ["Ρίξε το Ζάρι της Συντεχνίας", "Rzuć Kością Gildii"],
  "Rolled today": ["Ρίχτηκε σήμερα", "Rzucono dziś"],
  "Your Rank": ["Ο Βαθμός σου", "Twoja Ranga"],
  "contribution": ["συνεισφορά", "wkładu"],
  "lifetime": ["συνολικά", "łącznie"],
  "more": ["ακόμη", "więcej"],
  "Buffs · shop · dice": ["Ενισχύσεις · κατάστημα · ζάρι", "Wzmocnienia · sklep · kość"],
  "Recruit": ["Νεοσύλλεκτος", "Rekrut"],
  "Sworn": ["Ορκισμένος", "Zaprzysiężony"],
  "Veteran": ["Βετεράνος", "Weteran"],
  "Champion": ["Πρωταθλητής", "Czempion"],
  "Legend": ["Θρύλος", "Legenda"],
  "War Banner": ["Πολεμικό Λάβαρο", "Sztandar Wojenny"],
  "+5% attack for every member": ["+5% επίθεση για κάθε μέλος", "+5% ataku dla każdego członka"],
  "Bulwark Hymn": ["Ύμνος του Προμαχώνα", "Hymn Bastionu"],
  "+5% health for every member": ["+5% ζωή για κάθε μέλος", "+5% zdrowia dla każdego członka"],
  "Iron Oath": ["Σιδερένιος Όρκος", "Żelazna Przysięga"],
  "+5% defence for every member": ["+5% άμυνα για κάθε μέλος", "+5% obrony dla każdego członka"],
  "Hunter's Mark": ["Σημάδι του Κυνηγού", "Znak Łowcy"],
  "+3% critical chance for every member": ["+3% πιθανότητα κριτικού για κάθε μέλος", "+3% szansy na trafienie krytyczne dla każdego członka"],
  "Stables": ["Στάβλοι", "Stajnie"],
  "Mounts shorten every blitz": ["Τα άλογα μικραίνουν κάθε blitz", "Wierzchowce skracają każdy blitz"],
  "Riding now": ["Ιππεύεις τώρα", "Teraz dosiadasz"],
  "blitz time": ["χρόνου blitz", "czasu blitzu"],
  "no mount": ["κανένα άλογο", "brak wierzchowca"],
  "Dismount": ["Κατέβα", "Zsiądź"],
  "Ride": ["Ίππευσε", "Dosiądź"],
  "Rune Altar": ["Βωμός Ρούνων", "Ołtarz Run"],
  "Carve runes with crystals for permanent power": ["Σκάλισε ρούνους με κρυστάλλους για μόνιμη δύναμη", "Rzeźbij runy kryształami dla stałej mocy"],
  "Fully carved": ["Πλήρως σκαλισμένος", "W pełni wyrzeźbiona"],
  "Carve": ["Σκάλισε", "Rzeźbij"],
  "Crystals drop from boss challenges, the Wheel of Fortune and the VIP Black Market.": ["Οι κρύσταλλοι πέφτουν από αρχηγούς, τον Τροχό της Τύχης και τη VIP Μαύρη Αγορά.", "Kryształy wypadają z bossów, Koła Fortuny i Czarnego Rynku VIP."],
  "Show the odds": ["Δείξε τις πιθανότητες", "Pokaż szanse"],
  "Lucky stock! An Epic piece and a Sun Crystal are on the shelf this time.": ["Τυχερό απόθεμα! Ένα Επικό αντικείμενο και ένας Κρύσταλλος Ήλιου είναι στο ράφι αυτή τη φορά.", "Szczęśliwa dostawa! Tym razem na półce jest Epicki przedmiot i Kryształ Słońca."],
  "Fate Stones": ["Πέτρες Μοίρας", "Kamienie Losu"],
  "Jackpot": ["Τζακπότ", "Pula"],
  "Mega Jackpot": ["Μέγα Τζακπότ", "Mega pula"],
  "Prizes: gold, XP, ore and essence, hide and bloom, Frost Crystals, Starshards, Enchantment Stones and Armor Fragments. The six ★ slices are the big prizes and land only": ["Έπαθλα: χρυσός, XP, μετάλλευμα και ουσία, δέρματα και άνθη, Κρύσταλλοι Πάγου, Αστρόθραυστα, Πέτρες Γοητείας και Θραύσματα Πανοπλίας. Οι έξι φέτες ★ είναι τα μεγάλα έπαθλα και πέφτουν μόνο στο", "Nagrody: złoto, XP, ruda i esencja, skóry i kwiaty, Kryształy Mrozu, Gwiezdne Odłamki, Kamienie Zaczarowania i Fragmenty Zbroi. Sześć pól ★ to wielkie nagrody i razem trafiają się tylko w"],
  "of spins together.": ["των περιστροφών συνολικά.", "obrotów."],
  "Rare prize!": ["Σπάνιο έπαθλο!", "Rzadka nagroda!"],
  "So close to the": ["Τόσο κοντά στο", "Tak blisko do"],
  "Ore & Essence": ["Μετάλλευμα & Ουσία", "Ruda i Esencja"],
  "Void Crystals": ["Κρύσταλλοι Κενού", "Kryształy Pustki"],
  "Frost Crystals": ["Κρύσταλλοι Πάγου", "Kryształy Mrozu"],
  "Hide & Bloom": ["Δέρμα & Άνθος", "Skóra i Kwiat"],
  "Enchantment Stones": ["Πέτρες Γοητείας", "Kamienie Zaczarowania"],
  "Armor Fragments": ["Θραύσματα Πανοπλίας", "Fragmenty Zbroi"],
  "Fragment Cache": ["Θησαυρός Θραυσμάτων", "Skrzynia Fragmentów"],
  "Gold (3,000 + 400 per level)": ["Χρυσός (3.000 + 400 ανά επίπεδο)", "Złoto (3000 + 400 za poziom)"],
  "XP (200 + 120 per level)": ["XP (200 + 120 ανά επίπεδο)", "PD (200 + 120 za poziom)"],
  "3 Void Crystals": ["3 Κρύσταλλοι Κενού", "3 Kryształy Pustki"],
  "40 Ember Ore and 10 Soul Essence": ["40 Μετάλλευμα Άνθρακα και 10 Ουσία Ψυχής", "40 Rudy Żaru i 10 Esencji Duszy"],
  "Jackpot gold (25,000 + 2,500 per level)": ["Χρυσός τζακπότ (25.000 + 2.500 ανά επίπεδο)", "Złota pula (25 000 + 2500 za poziom)"],
  "4 Frost Crystals": ["4 Κρύσταλλοι Πάγου", "4 Kryształy Mrozu"],
  "3 Starshards": ["3 Αστρόθραυστα", "3 Gwiezdne odłamki"],
  "3 Fate Stones": ["3 Πέτρες της Μοίρας", "3 Kamienie Przeznaczenia"],
  "30 Beast Hide and 20 Emberbloom": ["30 Δέρμα Θηρίου και 20 Ανθόφλογα", "30 Skór Bestii i 20 Żarokwiatów"],
  "1,000 Diamonds and a mountain of gold": ["1.000 Διαμάντια και ένα βουνό χρυσού", "1000 Diamentów i góra złota"],
  "2 Enchantment Stones": ["2 Πέτρες Γοητείας", "2 Kamienie Zaczarowania"],
  "1 Sun Crystal": ["1 Κρύσταλλος Ήλιου", "1 Kryształ Słońca"],
  "10 Armor Fragments": ["10 Θραύσματα Πανοπλίας", "10 Fragmentów Zbroi"],
  "30 Armor Fragments": ["30 Θραύσματα Πανοπλίας", "30 Fragmentów Zbroi"],
  "Wheel of Fortune": ["Τροχός της Τύχης", "Koło Fortuny"],
  "100 Diamonds per spin": ["100 Διαμάντια ανά γύρισμα", "100 Diamentów za obrót"],
  "Spinning…": ["Γυρίζει…", "Kręci się…"],
  "Spin · 100 Diamonds": ["Γύρισε · 100 Διαμάντια", "Zakręć · 100 Diamentów"],
  "Black Market": ["Μαύρη Αγορά", "Czarny Rynek"],
  "Only VIP members may trade in the shadows. Activate VIP in the Premium Shop.": ["Μόνο τα μέλη VIP εμπορεύονται στις σκιές. Ενεργοποίησε VIP στο Premium Κατάστημα.", "Tylko członkowie VIP handlują w cieniu. Aktywuj VIP w Sklepie Premium."],
  "Already sold": ["Έχει πουληθεί", "Już sprzedane"],
  "Not enough gold": ["Δεν έχεις αρκετό χρυσό", "Za mało złota"],
  "Slightly better wares for VIP members — restocks every six hours.": ["Λίγο καλύτερα εμπορεύματα για μέλη VIP — ανανεώνονται κάθε έξι ώρες.", "Nieco lepsze towary dla VIP — odnawiane co sześć godzin."],
  "Sold": ["Πουλήθηκε", "Sprzedane"],
  "Mounts": ["Άλογα", "Wierzchowce"],
  "Runes": ["Ρούνοι", "Runy"],
  "Stables — faster blitzes": ["Στάβλοι — γρηγορότερα blitz", "Stajnie — szybsze blitzy"],
  "Frost Crystal": ["Κρύσταλλος Πάγου", "Kryształ Mrozu"],
  "Void Crystal": ["Κρύσταλλος Κενού", "Kryształ Pustki"],
  "Sun Crystal": ["Κρύσταλλος Ήλιου", "Kryształ Słońca"],
  "Combat stats": ["Στατιστικά μάχης", "Statystyki bojowe"],
  "Defense": ["Άμυνα", "Obrona"],
  "Crit": ["Κρίσιμο", "Kryt."],
  "Only VIP members can buy from the Black Market.": ["Μόνο τα μέλη VIP μπορούν να αγοράσουν από τη Μαύρη Αγορά.", "Tylko członkowie VIP mogą kupować na Czarnym Rynku."],
  "Anyone can browse — only VIP members can buy. Activate VIP in the Premium Shop.": ["Όλοι μπορούν να δουν — μόνο τα μέλη VIP αγοράζουν. Ενεργοποίησε VIP στο Premium Κατάστημα.", "Każdy może oglądać — kupować mogą tylko członkowie VIP. Aktywuj VIP w Sklepie Premium."],
  "Vaultkeeper": ["Θησαυροφύλακας", "Skarbnik"],
  "Page": ["Σελίδα", "Strona"],
  "Store gear for the whole guild. Any member can take an item out when their bag has room.": ["Αποθήκευσε εξοπλισμό για όλη τη συντεχνία. Κάθε μέλος μπορεί να πάρει αντικείμενο όταν έχει χώρο στον σάκο.", "Przechowuj ekwipunek dla całej gildii. Każdy członek może zabrać przedmiot, gdy ma miejsce w torbie."],
  "Stored by": ["Αποθηκεύτηκε από", "Złożone przez"],
  "Take to bag": ["Στον σάκο", "Do torby"],
  "Deposit from your bag": ["Κατάθεση από τον σάκο σου", "Złóż z torby"],
  "Store": ["Αποθήκευσε", "Złóż"],
  "Something went wrong": ["Κάτι πήγε στραβά", "Coś poszło nie tak"],
  "Join a guild first": ["Μπες πρώτα σε συντεχνία", "Najpierw dołącz do gildii"],
  "The guild vault is full": ["Το θησαυροφυλάκιο της συντεχνίας είναι γεμάτο", "Skarbiec gildii jest pełny"],
  "Your bag is full": ["Ο σάκος σου είναι γεμάτος", "Twoja torba jest pełna"],
  "VIP level": ["Επίπεδο VIP", "Poziom VIP"],
  "Amount": ["Ποσότητα", "Ilość"],
  "Crafting guide": ["Οδηγός κατασκευής", "Poradnik rzemiosła"],
  "How to craft armour": ["Πώς φτιάχνεις πανοπλία", "Jak wykuć zbroję"],
  "Win battles, elites and Dungeon Gate boss challenges to gather materials.": ["Νίκα μάχες, επίλεκτους και προκλήσεις αφεντικών της Πύλης Μπουντρουμιών για να μαζέψεις υλικά.", "Wygrywaj bitwy, elity i wyzwania bossów Bramy Lochów, by zbierać materiały."],
  "Standard recipes: pick an armour slot, then forge a recipe your level allows.": ["Βασικές συνταγές: διάλεξε θέση πανοπλίας και σφυρηλάτησε μια συνταγή που επιτρέπει το επίπεδό σου.", "Zwykłe receptury: wybierz miejsce zbroi i wykuj recepturę dostępną na twoim poziomie."],
  "Synthesis: forge each of the eight pieces of a set, then wear them to change your look.": ["Σύνθεση: σφυρηλάτησε τα οκτώ κομμάτια ενός σετ και φόρεσέ τα για να αλλάξεις εμφάνιση.", "Synteza: wykuj osiem części zestawu i załóż je, by zmienić wygląd."],
  "The newest sets need materials that drop only from Dungeon Gate boss challenges.": ["Τα νεότερα σετ θέλουν υλικά που πέφτουν μόνο από προκλήσεις αφεντικών της Πύλης Μπουντρουμιών.", "Najnowsze zestawy wymagają materiałów, które wypadają tylko z wyzwań bossów Bramy Lochów."],
  "Where materials drop": ["Πού πέφτουν τα υλικά", "Gdzie wypadają materiały"],
  "Forge armour tiers": ["Βαθμίδες πανοπλίας σφυρηλάτησης", "Poziomy zbroi z kuźni"],
  "Synthesis sets (whole set)": ["Σετ σύνθεσης (ολόκληρο σετ)", "Zestawy syntezy (cały zestaw)"],
  "Dragon Scale": ["Λέπι Δράκου", "Smocza Łuska"],
  "Abyssal Shard": ["Θραύσμα Αβύσσου", "Odłamek Otchłani"],
  "Titan Heart": ["Καρδιά Τιτάνα", "Serce Tytana"],
  "A smouldering scale torn from a dungeon tyrant. Needed for Synthesis Set X.": ["Φλεγόμενο λέπι από τύραννο μπουντρουμιού. Απαιτείται για το Σετ Σύνθεσης X.", "Tląca się łuska wyrwana tyranowi lochu. Potrzebna do Zestawu Syntezy X."],
  "Obsidian cracked with void light. Needed for Synthesis Set XI.": ["Οψιανός ραγισμένος με φως του κενού. Απαιτείται για το Σετ Σύνθεσης XI.", "Obsydian popękany światłem pustki. Potrzebny do Zestawu Syntezy XI."],
  "The radiant heart of a fallen titan. Needed for Synthesis Set XII.": ["Η λαμπερή καρδιά ενός πεσμένου τιτάνα. Απαιτείται για το Σετ Σύνθεσης XII.", "Promienne serce poległego tytana. Potrzebne do Zestawu Syntezy XII."],
  "Dungeon Gate boss challenges only": ["Μόνο προκλήσεις αφεντικών της Πύλης Μπουντρουμιών", "Tylko wyzwania bossów Bramy Lochów"],
  "Dungeon Gate boss challenges, rank 3 and deeper only": ["Μόνο προκλήσεις αφεντικών της Πύλης Μπουντρουμιών, βαθμίδα 3 και πάνω", "Tylko wyzwania bossów Bramy Lochów, ranga 3 i wyżej"],
  "Dungeon Gate boss challenges, rank 5 and deeper only (rare)": ["Μόνο προκλήσεις αφεντικών της Πύλης Μπουντρουμιών, βαθμίδα 5 και πάνω (σπάνιο)", "Tylko wyzwania bossów Bramy Lochów, ranga 5 i wyżej (rzadko)"],
  "Done": ["Έγινε", "Gotowe"],
  "Gender Swap Card": ["Κάρτα Αλλαγής Φύλου", "Karta Zmiany Płci"],
  "Switches your hero between male and female. Level, gear and progress stay exactly as they are.": ["Αλλάζει τον ήρωά σου από άνδρα σε γυναίκα ή αντίστροφα. Επίπεδο, εξοπλισμός και πρόοδος μένουν ακριβώς ίδια.", "Zmienia płeć twojego bohatera. Poziom, ekwipunek i postępy pozostają bez zmian."],
  "Name Change Card": ["Κάρτα Αλλαγής Ονόματος", "Karta Zmiany Imienia"],
  "Gives your hero a new name: 3-16 letters, numbers, spaces, _ or -.": ["Δίνει νέο όνομα στον ήρωά σου: 3-16 γράμματα, αριθμοί, κενά, _ ή -.", "Nadaje bohaterowi nowe imię: 3-16 liter, cyfr, spacji, _ lub -."],
  "New name": ["Νέο όνομα", "Nowe imię"],
  "Extra duel": ["Επιπλέον μονομαχία", "Dodatkowy pojedynek"],
  "Restock now": ["Ανανέωση τώρα", "Odnów teraz"],
  "Use card": ["Χρήση κάρτας", "Użyj karty"],
  "Cards": ["Κάρτες", "Karty"],
  "places of interest stand on one bounded realm — mines, ore dungeons, world bosses, rival castles, ruins, sealed vaults and painted wonders. Drag to travel, scroll or pinch the buttons to zoom, take the day's bounties, and plant your own castle anywhere on it. Banners are shared: every hero the realm holds can raise one.":
    [
      "σημεία ενδιαφέροντος απλώνονται σε ένα ενιαίο βασίλειο — ορυχεία, μπουντρούμια μεταλλεύματος, αφεντικά του κόσμου, αντίπαλα κάστρα, ερείπια, σφραγισμένα θησαυροφυλάκια και ζωγραφισμένα θαύματα. Σύρε για να ταξιδέψεις, κύλισε ή τσούλησε τα κουμπιά για μεγέθυνση, πάρε τις ημερήσιες επικήρυξεις και φύτεψε το δικό σου κάστρο οπουδήποτε πάνω του. Τα λάβαρα είναι κοινά: κάθε ήρωας του βασιλείου μπορεί να υψώσει ένα.",
      "punkty zainteresowania stoją na jednym ograniczonym świecie — kopalnie, lochy rudy, bossowie świata, rywale zamki, ruiny, zapieczętowane skarbce i malowane cuda. Przeciągnij, by podróżować, przewiń lub uszczypnij przyciski, by przybliżyć, odbierz dzienne nagrody i posadź własny zamek gdziekolwiek na nim. Sztandary są wspólne: każdy bohater świata może wznieść swój.",
    ],
  "Seeds for the fields by the Campaign Gate. Gold Seeds grow gold; XP, Emberbloom and Moonroot Seeds grow Farm XP, which raises the Farm Level and tills one more plot each time. Seeds unlock as the Farm grows and keep in your pouch until planted.":
    [
      "Σπόροι για τα χωράφια δίπλα στην Πύλη Εκστρατείας. Οι Χρυσοί Σπόροι δίνουν χρυσό· οι Σπόροι XP, Ανθρακόνθους και Ματορίζας δίνουν XP Αγροκτήματος, που ανεβάζει το Επίπεδο Αγροκτήματος και οργώνει ένα ακόμη χωράφι κάθε φορά. Οι σπόροι ξεκλειδώνουν καθώς μεγαλώνει το Αγρόκτημα και μένουν στο πουγγί σου μέχρι να φυτευτούν.",
      "Nasiona na pola przy Wrotach kampanii. Złote nasiona dają złoto; nasiona PD, Żarokwiatu i Krwawokorzenia dają PD Farmy, co podnosi Poziom Farmy i za każdym razem orze jedno pole więcej. Nasiona odblokowują się w miarę rozwoju Farmy i czekają w sakwie, aż je zasiejesz.",
    ],
  "It is not a permanent unlock and never renews by itself. Members get two VIP-only daily activities, two VIP-only world events, a richer daily board, faster blitzes, more gold from every payout and a discount on every Diamond price below.":
    [
      "Δεν είναι μόνιμο ξεκλείδωμα και δεν ανανεώνεται ποτέ μόνο του. Τα μέλη έχουν δύο ημερήσιες δραστηριότητες μόνο για VIP, δύο γεγονότα κόσμου μόνο για VIP, πλουσιότερο ημερήσιο πίνακα, ταχύτερα blitz, περισσότερο χρυσό από κάθε πληρωμή και έκπτωση σε κάθε τιμή Διαμαντιών παρακάτω.",
      "To nie jest stałe odblokowanie i nigdy nie odnawia się samo. Członkowie dostają dwie dzienne aktywności tylko dla VIP, dwa wydarzenia świata tylko dla VIP, bogatszą tablicę dzienną, szybsze blitze, więcej złota z każdej wypłaty i zniżkę na każdą cenę Diamentów poniżej.",
    ],
  "Materials come from the same grind the castle already runs: battles and bosses for ore, hide, essence and cores, elites and dungeons for sigils and crystals, and refining spare drops at the Forge. No synthesis piece can be bought.":
    [
      "Τα υλικά έρχονται από το ίδιο κυνήγι που κάνει ήδη το κάστρο: μάχες και αφεντικά για μετάλλευμα, δέρμα, ουσία και πυρήνες, ελίτ και μπουντρούμια για σφραγίδες και κρυστάλλους, και εκλέπτυνση περιττών ευρημάτων στο Σιδηρουργείο. Κανένα κομμάτι σύνθεσης δεν αγοράζεται.",
      "Materiały pochodzą z tego samego grindingu, który zamek już prowadzi: walki i bossowie dają rudę, skórę, esencję i rdzenie, elity i lochy — pieczęcie i kryształy, a oczyszczanie zbędnych zdobyczy w Kuźni dopełnia resztę. Żadnego elementu syntezy nie można kupić.",
    ],
  "Real-money packs are paid through Stripe's secure checkout. The server verifies the payment and credits the exact pack before it appears in your wallet — closing the tab early is checked again the next time you open this shop.":
    [
      "Τα πακέτα με πραγματικά χρήματα πληρώνονται μέσω της ασφαλούς ολοκλήρωσης αγοράς της Stripe. Ο server επαληθεύει την πληρωμή και πιστώνει το ακριβές πακέτο πριν εμφανιστεί στο πορτοφόλι σου — αν κλείσεις νωρίς την καρτέλα, ελέγχεται ξανά την επόμενη φορά που ανοίγεις αυτό το κατάστημα.",
      "Pakiety za prawdziwe pieniądze są opłacane przez bezpieczną kasę Stripe. Serwer weryfikuje płatność i księguje dokładnie ten pakiet, zanim pojawi się w portfelu — wcześniejsze zamknięcie karty jest sprawdzane ponownie przy następnym otwarciu tego sklepu.",
    ],
  "Permanent upgrades for every combat stat, trained separately: each rank banks its bonus for good, costs more than the last, and the deeper ranks need the barracks itself upgraded. Gold scaling caps at rank 5.":
    [
      "Μόνιμες αναβαθμίσεις για κάθε στατιστικό μάχης, με ξεχωριστή εκπαίδευση: κάθε βαθμίδα κρατά το μπόνους της για πάντα, κοστίζει περισσότερο από την προηγούμενη, και οι βαθύτερες βαθμίδες απαιτούν αναβάθμιση του ίδιου του στρατώνα. Η κλιμάκωση χρυσού σταματά στη βαθμίδα 5.",
      "Stałe ulepszenia każdej statystyki bojowej, trenowane osobno: każdy stopień zachowuje bonus na zawsze, kosztuje więcej od poprzedniego, a głębsze stopnie wymagają ulepszenia samych koszar. Skalowanie złota zatrzymuje się na stopniu 5.",
    ],
  "Every won battle banks Battle Essence. Spend it here for permanent stat growth — the cost rises each level, so the deep levels are a long grind that keeps daily play worthwhile. Bosses pay extra essence.":
    [
      "Κάθε κερδισμένη μάχη συγκεντρώνει Μαχική Ουσία. Ξόδεψέ την εδώ για μόνιμη ανάπτυξη στατιστικών — το κόστος ανεβαίνει σε κάθε επίπεδο, οπότε τα βαθιά επίπεδα είναι μακρύ κυνήγι που κρατά το καθημερινό παιχνίδι άξιο. Τα αφεντικά πληρώνουν επιπλέον ουσία.",
      "Każda wygrana walka gromadzi Esencję Walki. Wydaj ją tutaj na stały wzrost statystyk — koszt rośnie z każdym poziomem, więc głębokie poziomy to długi grind, który czyni codzienną grę wartą zachodu. Bossowie płacą dodatkową esencję.",
    ],
  "Every battle you win pays Renown, and Renown buys permanent upgrades for the hero alone — no gold and no barracks level involved. Losses pay nothing, so the training grows with your fighting.":
    [
      "Κάθε μάχη που κερδίζεις δίνει Φήμη, και η Φήμη αγοράζει μόνιμες αναβαθμίσεις μόνο για τον ήρωα — χωρίς χρυσό και χωρίς επίπεδο στρατώνα. Οι ήττες δεν πληρώνουν τίποτα, οπότε η εκπαίδευση μεγαλώνει μαζί με τις μάχες σου.",
      "Każda wygrana walka daje Słowę, a Sława kupuje stałe ulepszenia tylko dla bohatera — bez złota i bez poziomu koszar. Porażki nie płacą nic, więc trening rośnie wraz z twoją walką.",
    ],
  "% under the old stalls. Potions land straight in your pouch; the HUD pouch beside the stamina bar drinks them. (Battle Scrolls are priced by the game server and are the one exception.)":
    [
      "% κάτω από τους παλιούς πάγκους. Τα φίλτρα πέφτουν κατευθείαν στο πουγγί σου· το πουγγί του HUD δίπλα στη μπάρα αντοχής τα πίνει. (Οι Πάπυροι Μάχης τιμολογούνται από τον server του παιχνιδιού και είναι η μόνη εξαίρεση.)",
      "% taniej niż przy starych straganach. Mikstury trafiają prosto do sakwy; sakwa w HUD obok paska wytrzymałości je wypija. (Zwoje bitewne wycenia serwer gry i to jedyny wyjątek.)",
    ],
  "The barracks' deepest drills: every rank banks five points of an attribute for good and costs Void Crystals, earned from level-ups and from every boss you defeat. Ranks never run out.":
    [
      "Οι βαθύτερες ασκήσεις του στρατώνα: κάθε βαθμίδα κρατά πέντε πόντους ενός χαρακτηριστικού για πάντα και κοστίζει Κρυστάλλους Κενού, που κερδίζονται από αναβάθμιση επιπέδου και από κάθε αφεντικό που νικάς. Οι βαθμίδες δεν τελειώνουν ποτέ.",
      "Najgłębsze ćwiczenia koszar: każdy stopień zachowuje na stałe pięć punktów cechy i kosztuje Kryształy pustki, zdobywane za awanse poziomu i za każdego pokonanego bossa. Stopnie nigdy się nie kończą.",
    ],
  "Trades settle instantly and are recorded on the server — gold and goods move atomically, and a sold listing can never be sold twice. Cancelling returns the goods to your bag or pouch.":
    [
      "Οι συναλλαγές ολοκληρώνονται αμέσως και καταγράφονται στον server — χρυσός και αγαθά κινούνται αδιαίρετα και μια πουλημένη αγγελία δεν μπορεί ποτέ να πουληθεί δύο φορές. Η ακύρωση επιστρέφει τα αγαθά στην τσάντα ή στο πουγγί σου.",
      "Transakcje rozliczają się natychmiast i są zapisywane na serwerze — złoto i towary przemieszczają się atomowo, a sprzedana oferta nigdy nie może zostać sprzedana dwa razy. Anulowanie zwraca towary do plecaka lub sakwy.",
    ],
  "A key bought today doubles every reward the Conquest Gate pays until Greek midnight: double gold and double Conquest Tokens from every floor you clear and from every conquest blitz.":
    [
      "Ένα κλειδί που αγοράστηκε σήμερα διπλασιάζει κάθε ανταμοιβή της Πύλης Κατάκτησης μέχρι τα ελληνικα μεσάνυχτα: διπλό χρυσό και διπλά Μάρκα Κατάκτησης από κάθε όροφο που καθαρίζεις και από κάθε blitz κατάκτησης.",
      "Klucz kupiony dziś podwaja każdą nagrodę Wrót podboju do greckiej północy: podwójne złoto i podwójne Znaki Podboju z każdego oczyszczonego piętra i z każdego blitza podboju.",
    ],
  "60 enemy designs · 44 boss designs. Seven bosses use cropped head portraits. Unknown entries unlock only through recorded encounters; old saves are not given invented kills.":
    [
      "60 σχέδια εχθρών · 44 σχέδια αφεντικών. Επτά αφεντικά χρησιμοποιούν κομμένα πορτρέτα κεφαλής. Άγνωστες καταχωρήσεις ξεκλειδώνουν μόνο με καταγεγραμμένες συναντήσεις· τα παλιά saves δεν παίρνουν εφευρημένες νίκες.",
      "60 projektów wrogów · 44 projekty bossów. Siedmiu bossów używa przyciętych portretów głowy. Nieznane wpisy odblokowują się tylko przez zapisane spotkania; stare zapisy nie dostają wymyślonych zabójstw.",
    ],
  "The vaultkeeper buys surplus materials from your bag and pays in guild coins. Rates are a fraction of shop prices, so this is a way to clear clutter — not to turn a profit.":
    [
      "Ο θησαυροφύλακας αγοράζει πλεονάζοντα υλικά από την τσάντα σου και πληρώνει σε νομίσματα συντεχνίας. Οι τιμές είναι ένα κλάσμα των τιμών του καταστήματος, οπότε αυτός είναι τρόπος να ξεφορτωθείς αχρείαστα — όχι να βγάλεις κέρδος.",
      "Skarbnik kupuje nadwyżki materiałów z plecaka i płaci monetami gildii. Stawki to ułamek cen sklepowych, więc to sposób na pozbycie się nadmiaru — nie na zarobek.",
    ],
  "Eight gem families, twelve levels each — the chart values are the stats a socketed gem grants. Forge with materials, buy with Conquest Tokens at the Conquest Gate, or fuse":
    [
      "Οκτώ οικογένειες πετραδιών, δώδεκα επίπεδα η καθεμία — οι τιμές του πίνακα είναι τα στατιστικά που δίνει ένα τοποθετημένο πετράδι. Κατασκεύασε με υλικά, αγόρασε με Μάρκα Κατάκτησης στην Πύλη Κατάκτησης ή ένωσε",
      "Osiem rodzin klejnotów, po dwanaście poziomów — wartości w tabeli to statystyki, jakie daje oprawiony klejnot. Wykuwaj z materiałów, kupuj za Znaki Podboju we Wrotach podboju lub łącz",
    ],
  "Recovered pieces are ordinary gear: enhance them, socket gems and wear them. Rank I recovers the armour, II the weapons and rings, III the talisman and the mythic pieces.":
    [
      "Τα κομμάτια που ανακτάς είναι συνηθισμένος εξοπλισμός: βελτίωσέ τα, τοποθέτησε πετράδια και φόρεσέ τα. Ο βαθμός I ανακτά την πανοπλία, ο II τα όπλα και τα δαχτυλίδια, ο III το φυλαχτό και τα μυθικά κομμάτια.",
      "Odzyskane elementy to zwykły ekwipunek: ulepszaj je, oprawiaj klejnoty i noś. Stopień I odzyskuje zbroję, II broń i pierścienie, III amulet oraz elementy mityczne.",
    ],
  "VIP is a separate membership — it does not include Diamond or gold packs. Buying a higher tier while a membership is active keeps the higher tier and adds another month.":
    [
      "Το VIP είναι ξεχωριστή συνδρομή — δεν περιλαμβάνει πακέτα Διαμαντιών ή χρυσού. Αν αγοράσεις υψηλότερη βαθμίδα όσο η συνδρομή είναι ενεργή, κρατάς την υψηλότερη και προσθέτεις άλλον έναν μήνα.",
      "VIP to osobne członkostwo — nie zawiera pakietów Diamentów ani złota. Kupno wyższego poziomu przy aktywnym członkostwie zachowuje wyższy poziom i dodaje kolejny miesiąc.",
    ],
  "Gold Seeds pay gold, XP Seeds pay Farm XP, Emberbloom pays a little of both and the slow Moonroot pays a big share of Farm XP. Higher tiers unlock as the Farm grows.":
    [
      "Οι Χρυσοί Σπόροι δίνουν χρυσό, οι Σπόροι XP δίνουν XP Αγροκτήματος, το Ανθρακόνθος δίνει λίγο από τα δύο και η αργή Ματορίζα δίνει μεγάλο μερίδιο XP Αγροκτήματος. Υψηλότερες βαθμίδες ξεκλειδώνουν καθώς μεγαλώνει το Αγρόκτημα.",
      "Złote nasiona dają złoto, nasiona PD dają PD Farmy, Żarokwiat daje po trochu obu, a wolne Krwawokorzenie daje dużą część PD Farmy. Wyższe poziomy odblokowują się wraz z rozwojem Farmy.",
    ],
  "Materials are the same ones battles, raids and gathering award. Missing a few Armour Fragments for a piece? The Forge's recipe rows now sell exactly the shortfall.":
    [
      "Τα υλικά είναι τα ίδια που δίνουν μάχες, επιδρομές και συλλογή. Σου λείπουν λίγα Θραύσματα Πανοπλίας για ένα κομμάτι; Οι σειρές συνταγών του Σιδηρουργείου πουλούν πλέον ακριβώς το έλλειμμα.",
      "Materiały to te same, które dają walki, rajdy i zbieractwo. Brakuje kilku Odłamków Zbroi na element? Wiersze przepisów w Kuźni sprzedają teraz dokładnie tyle, ile brakuje.",
    ],
  "Gold keeps filling while you fight, farm or are away from the castle. Collecting is always free and never costs anything — the cart simply starts filling again.":
    [
      "Ο χρυσός γεμίζει συνέχεια όσο μάχεσαι, καλλιεργείς ή λείπεις από το κάστρο. Η συλλογή είναι πάντα δωρεάν και δεν κοστίζει ποτέ τίποτα — το καρότσι απλώς αρχίζει να γεμίζει ξανά.",
      "Złoto wciąż się gromadzi, gdy walczysz, uprawiasz ziemię lub jesteś poza zamkiem. Odbiór jest zawsze darmowy i nigdy nic nie kosztuje — wózek po prostu znów zaczyna się wypełniać.",
    ],
  "Ember Fall runs on Greek time — every window opens on the same Greek hour for every player, no matter what your own device clock says. Times below are shown in":
    [
      "Το Ember Fall λειτουργεί με ελληνική ώρα — κάθε παράθυρο ανοίγει την ίδια ελληνική ώρα για κάθε παίκτη, ό,τι κι αν λέει το ρολόι της συσκευής σου. Οι ώρες παρακάτω εμφανίζονται σε",
      "Ember Fall działa na greckim czasie — każde okno otwiera się o tej samej greckiej godzinie dla każdego gracza, niezależnie od zegara twojego urządzenia. Poniższe godziny są pokazane w",
    ],
  "Fallen foes sometimes leave Soul Shards. Infuse them here for permanent stat bonuses that never reset — every rank is a small step toward a much stronger hero.":
    [
      "Οι πεσμένοι εχθροί αφήνουν μερικές φορές Θραύσματα Ψυχής. Ενσωμάτωσέ τα εδώ για μόνιμα μπόνους στατιστικών που δεν μηδενίζονται ποτέ — κάθε βαθμίδα είναι ένα μικρό βήμα προς έναν πολύ δυνατότερο ήρωα.",
      "Pokonani wrogowie czasem zostawiają Odłamki Duszy. Wtop je tutaj, by zyskać stałe bonusy do statystyk, które nigdy nie znikają — każdy stopień to mały krok do znacznie silniejszego bohatera.",
    ],
  "Stones taken to the Forge enchant gear instead of gold — each grade adds 10% success. Two stones of one grade plus gold forge the next grade up at the Forge.":
    [
      "Οι πέτρες που πηγαίνουν στο Σιδηρουργείο γοητεύουν εξοπλισμό αντί για χρυσό — κάθε βαθμίδα προσθέτει 10% επιτυχία. Δύο πέτρες ίδιας βαθμίδας μαζί με χρυσό σφυρηλατούν την επόμενη βαθμίδα στο Σιδηρουργείο.",
      "Kamienie zaniesione do Kuźni zaczarowują ekwipunek zamiast złota — każdy stopień dodaje 10% szansy. Dwa kamienie tego samego stopnia plus złoto wykuwają w Kuźni kolejny stopień.",
    ],
  "Permanent training beside the attributes: every rank is bought with gold, costs more than the last, and the deeper drills need the barracks itself upgraded.":
    [
      "Μόνιμη εκπαίδευση δίπλα στα χαρακτηριστικά: κάθε βαθμίδα αγοράζεται με χρυσό, κοστίζει περισσότερο από την προηγούμενη, και οι βαθύτερες ασκήσεις απαιτούν αναβάθμιση του ίδιου του στρατώνα.",
      "Stały trening obok cech: każdy stopień kupuje się za złoto, kosztuje więcej od poprzedniego, a głębsze ćwiczenia wymagają ulepszenia samych koszar.",
    ],
  "Pick a bracket, then the guild you want to fight. Their leader or officer can accept or decline; an accepted war runs for 24 hours and pays both sides.":
    [
      "Διάλεξε κατηγορία και μετά τη συντεχνία που θέλεις να πολεμήσεις. Ο αρχηγός ή ο αξιωματικός τους μπορεί να δεχτεί ή να αρνηθεί· ένας αποδεκτός πόλεμος διαρκεί 24 ώρες και πληρώνει και τις δύο πλευρές.",
      "Wybierz kategorię, a potem gildię, z którą chcesz walczyć. Ich przywódca lub oficer może przyjąć albo odrzucić; przyjęta wojna trwa 24 godziny i płaci obu stronom.",
    ],
  "Every relic on these shelves was paid for by the skill tower. Climb the ranks and the next heirloom wakes on its own, adding its bonus to every fight.":
    [
      "Κάθε κειμήλιο σε αυτά τα ράφια πληρώθηκε από τον πύργο δεξιοτήτων. Ανέβα βαθμίδες και το επόμενο κειμήλιο ξυπνά μόνο του, προσθέτοντας το μπόνους του σε κάθε μάχη.",
      "Każda relikwia na tych półkach została opłacona przez wieżę umiejętności. Wspinaj się po stopniach, a następna pamiątka budzi się sama, dodając swój bonus do każdej walki.",
    ],
  "A permanent stat track beyond the campaign: each level grants +1% to attack, defense and health, fed by Battle Essence from every battle you win.":
    [
      "Μόνιμη πορεία στατιστικών πέρα από την εκστρατεία: κάθε επίπεδο δίνει +1% σε επίθεση, άμυνα και υγεία, τροφοδοτούμενο από Μαχική Ουσία από κάθε μάχη που κερδίζεις.",
      "Stała ścieżka statystyk poza kampanią: każdy poziom daje +1% do ataku, obrony i zdrowia, zasilana Esencją Walki z każdej wygranej walki.",
    ],
  "Gold is still earned from battles, quests and raids. These packs are a shortcut — they never unlock anything that cannot be earned by playing.":
    [
      "Ο χρυσός κερδίζεται και από μάχες, αποστολές και επιδρομές. Αυτά τα πακέτα είναι συντόμευση — δεν ξεκλειδώνουν ποτέ κάτι που δεν κερδίζεται παίζοντας.",
      "Złoto nadal zdobywa się w walkach, zadaniach i rajdach. Te pakiety to skrót — nigdy nie odblokowują niczego, czego nie da się zdobyć grając.",
    ],
  "is worn right now. Salvaging it will unequip and permanently destroy it, returning its materials and socketed gems. This cannot be undone.":
    [
      "φοριέται αυτή τη στιγμή. Η διάλυσή του θα το αφαιρέσει και θα το καταστρέψει οριστικά, επιστρέφοντας τα υλικά του και τα τοποθετημένα πετράδια. Αυτό δεν αναιρείται.",
      "jest teraz noszony. Rozbiór zdejmie go i zniszczy na zawsze, zwracając jego materiały i oprawione klejnoty. Tego nie można cofnąć.",
    ],
  "Only heroes with a public profile appear here. Requests are answered in the Requests tab — friends you both asked for connect instantly.":
    [
      "Εμφανίζονται μόνο ήρωες με δημόσιο προφίλ. Τα αιτήματα απαντώνται στην καρτέλα Αιτήματα — φίλοι που ζητήσατε και οι δύο συνδέονται αμέσως.",
      "Pojawiają się tu tylko bohaterowie z publicznym profilem. Na prośby odpowiada się w karcie Prośby — znajomi, których poprosiliście oboje, łączą się natychmiast.",
    ],
  "Uncommon or better gear is born with sockets (Epic: 2, Mythic: 3), and the Gem Workshop cuts extra holes into any piece — up to four.":
    [
      "Ο εξοπλισμός Ασυνήθιστος και πάνω γεννιέται με υποδοχές (Επικό: 2, Μυθικό: 3), και το Εργαστήριο Πετραδιών ανοίγει επιπλέον τρύπες σε κάθε κομμάτι — έως τέσσερις.",
      "Ekwipunek Niezwykły i lepszy rodzi się z gniazdami (Epicki: 2, Mityczny: 3), a Warsztat klejnotów wycina dodatkowe otwory w każdym elemencie — do czterech.",
    ],
  "· both painted gear updates are kept side by side. Pick an era, a rarity and any icon. Synthesis sets keep their own separate sheet.":
    [
      "· και οι δύο ζωγραφισμένες ενημερώσεις εξοπλισμού διατηρούνται δίπλα-δίπλα. Διάλεξε εποχή, σπανιότητα και οποιοδήποτε εικονίδιο. Τα σετ Σύνθεσης κρατούν το δικό τους ξεχωριστό φύλλο.",
      "· obie malowane aktualizacje ekwipunku są trzymane obok siebie. Wybierz erę, rzadkość i dowolną ikonę. Zestawy syntezy mają własny osobny arkusz.",
    ],
  "The only source of the Emberforged, Starweave and Verdant collections. Every win recovers a piece, and each piece levels with you —":
    [
      "Η μόνη πηγή των συλλογών Ανθρακοσφυρηλασίας, Αστροϋφανσίας και Πράσινης Βλάστησης. Κάθε νίκη ανακτά ένα κομμάτι και κάθε κομμάτι ανεβαίνει μαζί σου —",
      "Jedyne źródło kolekcji Wykucia w Żarze, Gwiezdnego Splotu i Zieleni. Każde zwycięstwo odzyskuje element, a każdy element rośnie razem z tobą —",
    ],
  "% off. The catalogue is deliberately modest gear — useful while you are starting out, never a match for the Forge or a boss drop.":
    [
      "% έκπτωση. Ο κατάλογος είναι σκόπιμα μέτριος εξοπλισμός — χρήσιμος στις αρχές, ποτέ αντάξιος του Σιδηρουργείου ή ενός ευρήματος αφεντικού.",
      "% taniej. Katalog to celowo skromny ekwipunek — przydatny na początku, nigdy równy Kuźni czy zdobyczy z bossa.",
    ],
  "Every paid purchase goes through Stripe and is verified on the server; every Diamond spend is priced and debited by the server.":
    [
      "Κάθε πληρωμένη αγορά περνά από τη Stripe και επαληθεύεται στον server· κάθε δαπάνη Διαμαντιών τιμολογείται και χρεώνεται από τον server.",
      "Każdy płatny zakup przechodzi przez Stripe i jest weryfikowany na serwerze; każde wydanie Diamentów jest wyceniane i pobierane przez serwer.",
    ],
  "Ask the war tactician about this exact fight — it reads both sides' stats and tells you what to watch for before you spend the":
    [
      "Ρώτησε τον τακτικό πολέμου για αυτή ακριβώς τη μάχη — διαβάζει τα στατιστικά και των δύο πλευρών και σου λέει τι να προσέξεις πριν ξοδέψεις την",
      "Zapytaj taktyka wojennego o tę konkretną walkę — czyta statystyki obu stron i mówi, na co uważać, zanim wydasz",
    ],
  "% less gold. Bigger batches, instructor grades and the drill yard unlock as it levels up — the building has no final level.":
    [
      "% λιγότερο χρυσό. Μεγαλύτερες παρτίδες, βαθμίδες εκπαιδευτή και η αυλή ασκήσεων ξεκλειδώνουν καθώς ανεβαίνει — το κτίριο δεν έχει τελικό επίπεδο.",
      "% mniej złota. Większe partie, stopnie instruktora i dziedziniec ćwiczeń odblokowują się wraz z poziomami — budynek nie ma poziomu końcowego.",
    ],
  "more to go. Keep clearing the Campaign Gate, then come back for boss difficulties, elite hunts and the weekly objective.":
    [
      "ακόμη. Συνέχισε να καθαρίζεις την Πύλη Εκστρατείας και μετά γύρνα για δυσκολίες αφεντικών, κυνήγι ελίτ και τον εβδομαδιαίο στόχο.",
      "do zdobycia. Oczyszczaj dalej Wrota kampanii, a potem wróć po poziomy trudności bossów, polowania na elity i cel tygodnia.",
    ],
  "Contribute gold to earn guild coins (1 gold = 1 guild coin). Spend them in the shop, the vault and the skill tower.":
    [
      "Συνεισφέρεις χρυσό για να κερδίσεις νομίσματα συντεχνίας (1 χρυσός = 1 νόμισμα συντεχνίας). Ξόδεψέ τα στο κατάστημα, στο θησαυροφυλάκιο και στον πύργο δεξιοτήτων.",
      "Wpłać złoto, by zdobyć monety gildii (1 złoto = 1 moneta gildii). Wydaj je w sklepie, skarbcu i wieży umiejętności.",
    ],
  "% to a Forge refinement and is spent whether the metal holds or not — one stone per step, more as the gear climbs.":
    [
      "% σε μια βελτίωση του Σιδηρουργείου και ξοδεύεται είτε κρατήσει το μέταλλο είτε όχι — μία πέτρα ανά βήμα, περισσότερες όσο ανεβαίνει ο εξοπλισμός.",
      "% do ulepszenia w Kuźni i zużywa się niezależnie od tego, czy metal wytrzyma — jeden kamień na krok, więcej wraz z poziomem ekwipunku.",
    ],
  "; 20 min (50 deep), no battles until it lands, 25 Diamonds to finish now. Shares the Conquest Gate's allowance.":
    [
      "· 20 λεπτά (50 βάθος), καμία μάχη μέχρι να ολοκληρωθεί, 25 Διαμάντια για ολοκλήρωση τώρα. Μοιράζεται το επίδομα της Πύλης Κατάκτησης.",
      "; 20 min (50 głęboko), brak walk do końca, 25 Diamentów za natychmiastowe zakończenie. Dzieli limit Wrót podboju.",
    ],
  "forged overall. The appearance follows the highest set you actually wear, and it is saved with your character.":
    [
      "σφυρηλατημένα συνολικά. Η εμφάνιση ακολουθεί το υψηλότερο σετ που φοράς πραγματικά και αποθηκεύεται με τον χαρακτήρα σου.",
      "wykutych łącznie. Wygląd idzie za najwyższym zestawem, który naprawdę nosisz, i jest zapisywany z twoim bohaterem.",
    ],
  "An elite scaled to your level — the best repeatable source of Soul Essence, with a high chance of Rare+ gear.":
    [
      "Μια ελίτ προσαρμοσμένη στο επίπεδό σου — η καλύτερη επαναλαμβανόμενη πηγή Ουσίας Ψυχής, με υψηλή πιθανότητα εξοπλισμού Σπάνιου+.",
      "Elita dopasowana do twojego poziomu — najlepsze powtarzalne źródło Esencji Duszy, z wysoką szansą na ekwipunek Rzadki+.",
    ],
  "Pick a worn or bagged item on the left to enhance it, check the gems inside it, or salvage it for materials.":
    [
      "Διάλεξε ένα φορεμένο ή στην τσάντα αντικείμενο στα αριστερά για να το βελτιώσεις, να δεις τα πετράδια του ή να το διαλύσεις για υλικά.",
      "Wybierz noszony lub schowany w plecaku przedmiot po lewej, by go ulepszyć, sprawdzić jego klejnoty lub rozebrać na materiały.",
    ],
  "Tap any bag or worn item and it opens on the spot — compare, equip, unequip or sell without scrolling down.":
    [
      "Πάτησε οποιοδήποτε αντικείμενο της τσάντας ή φορεμένο και ανοίγει επί τόπου — σύγκρινε, φόρεσε, βγάλε ή πούλησε χωρίς κύλιση.",
      "Dotknij dowolnego przedmiotu z plecaka lub noszonego, a otworzy się na miejscu — porównaj, załóż, zdejmij lub sprzedaj bez przewijania.",
    ],
  "gold, and both prices climb with each rank — so there is always another step, and it always costs more.":
    [
      "χρυσό, και οι δύο τιμές ανεβαίνουν με κάθε βαθμίδα — έτσι υπάρχει πάντα ένα ακόμη βήμα, και πάντα κοστίζει περισσότερο.",
      "złota, a obie ceny rosną z każdym stopniem — więc zawsze jest kolejny krok i zawsze kosztuje więcej.",
    ],
  "Chests also drop from won battles and the free reward chest, so this is never the only way to get one.":
    [
      "Τα μπαούλα πέφτουν και από κερδισμένες μάχες και από το δωρεάν μπαούλο ανταμοιβής, οπότε αυτός δεν είναι ποτέ ο μόνος τρόπος να πάρεις ένα.",
      "Skrzynie wypadają też z wygranych walk i z darmowej skrzyni nagród, więc to nigdy nie jest jedyny sposób, by ją zdobyć.",
    ],
  "The farm beneath the blood moon — a fenced field of sixteen plots, the barn and the great red Bloodoak":
    [
      "Το αγρόκτημα κάτω από το ματωμένο φεγγάρι — ένα περιφραγμένο χωράφι με δεκαέξι τεμάχια, ο αχυρώνας και η μεγάλη κόκκινη Ματοβελανιδιά",
      "Farma pod krwawym księżycem — ogrodzone pole z szesnastoma działkami, stodoła i wielki czerwony Krwawodąb",
    ],
  "Crates of forge materials from held-out sites — the steadiest way to feed the Forge while you level.":
    [
      "Κιβώτια υλικών σιδηρουργείου από απόμερες τοποθεσίες — ο πιο σταθερός τρόπος να τροφοδοτείς το Σιδηρουργείο όσο ανεβαίνεις.",
      "Skrzynie materiałów kuźni z odległych miejsc — najstabilniejszy sposób karmienia Kuźni podczas zdobywania poziomów.",
    ],
  "finished on this board — rewards scale with your level, and a new set opens the moment you level up.":
    [
      "ολοκληρωμένα σε αυτόν τον πίνακα — οι ανταμοιβές κλιμακώνονται με το επίπεδό σου και ένα νέο σετ ανοίγει μόλις ανέβεις επίπεδο.",
      "ukończone na tej tablicy — nagrody rosną z twoim poziomem, a nowy zestaw otwiera się w chwili awansu.",
    ],
  "No seeds in the pouch. Buy some from the Farm tab of the Shop, or plant straight into an empty plot.":
    [
      "Δεν έχεις σπόρους στο πουγγί. Αγόρασε από την καρτέλα Αγρόκτημα του Καταστήματος ή φύτεψε απευθείας σε ένα κενό τεμάχιο.",
      "Brak nasion w sakwie. Kup je w karcie Farma w Sklepie albo zasiej prosto na pustej działce.",
    ],
  "No items yet. The reward board, the Conquest Gate and the four-hourly reward chest fill this vault.":
    [
      "Δεν υπάρχουν αντικείμενα ακόμη. Ο πίνακας ανταμοιβών, η Πύλη Κατάκτησης και το μπαούλο ανταμοιβής κάθε τέσσερις ώρες γεμίζουν αυτό το θησαυροφυλάκιο.",
      "Brak przedmiotów. Tablica nagród, Wrota podboju i skrzynia nagród co cztery godziny zapełniają ten skarbiec.",
    ],
  "Guild courtyard with a merchant pavilion, crystal training tower, war room and grand headquarters":
    [
      "Αυλή συντεχνίας με παβιλιόν εμπόρου, πύργο εκπαίδευσης με κρυστάλλους, αίθουσα πολέμου και μεγάλο αρχηγείο",
      "Dziedziniec gildii z pawilonem kupca, kryształową wieżą treningową, salą wojenną i wielką kwaterą",
    ],
  "Choose a specialization to unlock its tier 3+ abilities — you can change it later with a reset.":
    [
      "Διάλεξε ειδίκευση για να ξεκλειδώσεις τις ικανότητές της από βαθμίδα 3 και πάνω — μπορείς να την αλλάξεις αργότερα με επαναφορά.",
      "Wybierz specjalizację, by odblokować jej zdolności od 3. stopnia — możesz ją później zmienić przez reset.",
    ],
  "Declare war in a 5v5 – 100v100 bracket · the other guild accepts or declines · every hero gets":
    [
      "Κήρυξε πόλεμο σε κατηγορία 5v5 – 100v100 · η άλλη συντεχνία δέχεται ή αρνείται · κάθε ήρωας παίρνει",
      "Wypowiedz wojnę w kategorii 5v5 – 100v100 · druga gildia przyjmuje lub odrzuca · każdy bohater dostaje",
    ],
  "Portrait, frame and biography appear on your public profile, in the arena and on the rankings.":
    [
      "Το πορτρέτο, το πλαίσιο και η βιογραφία εμφανίζονται στο δημόσιο προφίλ σου, στην αρένα και στις κατατάξεις.",
      "Portret, ramka i biografia pojawiają się w twoim publicznym profilu, na arenie i w rankingach.",
    ],
  "Click an open slot to seat an Astral beside your hero. Click a seated Astral to send it back.":
    [
      "Πάτησε ένα ελεύθερο σημείο για να τοποθετήσεις ένα Αστρικό δίπλα στον ήρωά σου. Πάτησε ένα τοποθετημένο για να το επιστρέψεις.",
      "Kliknij wolne miejsce, by umieścić Astrala obok bohatera. Kliknij umieszczonego, by go odesłać.",
    ],
  "A crate of forge materials — ore, essence, starshards, fragments, sigils and boss cores — in":
    [
      "Ένα κιβώτιο υλικών σιδηρουργείου — μετάλλευμα, ουσία, αστρόθραυστα, θραύσματα, σφραγίδες και πυρήνες αφεντικών — σε",
      "Skrzynia materiałów kuźni — ruda, esencja, gwiezdne odłamki, fragmenty, pieczęcie i rdzenie bossów — w",
    ],
  "Earn 1 point per level, plus a bonus every 5 levels — quests and achievements can add more.":
    [
      "Κέρδισε 1 πόντο ανά επίπεδο, συν μπόνους κάθε 5 επίπεδα — αποστολές και επιτεύγματα προσθέτουν κι άλλους.",
      "Zdobywasz 1 punkt za poziom plus bonus co 5 poziomów — zadania i osiągnięcia dodają więcej.",
    ],
  "Nothing to forge yet — stones drop from won battles and are sold in the Auction House shop.":
    [
      "Τίποτα για σφυρηλάτηση ακόμη — οι πέτρες πέφτουν από κερδισμένες μάχες και πωλούνται στο κατάστημα του Οίκου Δημοπρασιών.",
      "Nie ma jeszcze czego wykuwać — kamienie wypadają z wygranych walk i są sprzedawane w sklepie Domu aukcyjnego.",
    ],
  "Your banner is not planted yet. Plant it anywhere in the realm — or on an abandoned castle.":
    [
      "Το λάβαρό σου δεν έχει υψωθεί. Ύψωσέ το οπουδήποτε στο βασίλειο — ή σε ένα εγκαταλελειμμένο κάστρο.",
      "Twój sztandar nie jest jeszcze wbity. Wbij go gdziekolwiek w świecie — albo na opuszczonym zamku.",
    ],
  ", win or lose. Fate Stones drop from rare battles and are sold in the Auction House shop.":
    [
      "· νίκη ή ήττα. Οι Πέτρες Πεπρωμένου πέφτουν από σπάνιες μάχες και πωλούνται στο κατάστημα του Οίκου Δημοπρασιών.",
      ", niezależnie od wyniku. Kamienie Losu wypadają z rzadkich walk i są sprzedawane w sklepie Domu aukcyjnego.",
    ],
  "Equip 2+ pieces from the same family (e.g. two \"Bloodforged\" items) to activate bonuses.":
    [
      "Φόρεσε 2+ κομμάτια της ίδιας οικογένειας (π.χ. δύο αντικείμενα «Σφυρηλατημένου Αίματος») για να ενεργοποιήσεις μπόνους.",
      "Załóż 2+ elementy tej samej rodziny (np. dwa przedmioty „Krwawego Kucia”), by aktywować bonusy.",
    ],
  "No stones yet — battle wins drop them, and the Auction House shop sells all nine grades.":
    [
      "Δεν έχεις πέτρες — οι νίκες σε μάχες τις ρίχνουν και το κατάστημα του Οίκου Δημοπρασιών πουλάει και τις εννέα βαθμίδες.",
      "Brak kamieni — wygrane walki je dają, a sklep Domu aukcyjnego sprzedaje wszystkie dziewięć stopni.",
    ],
  "Fight your class's relic ranks for the Emberforged, Starweave and Verdant collections.":
    [
      "Πολέμησε τις βαθμίδες κειμηλίων της κλάσης σου για τις συλλογές Ανθρακοσφυρηλασίας, Αστροϋφανσίας και Πράσινης Βλάστησης.",
      "Walcz w stopniach relikwii swojej klasy o kolekcje Wykucia w Żarze, Gwiezdnego Splotu i Zieleni.",
    ],
  "The forge shows exactly what a gem grants and what it costs before you spend anything.":
    [
      "Το σιδηρουργείο δείχνει ακριβώς τι δίνει ένα πετράδι και πόσο κοστίζει πριν ξοδέψεις οτιδήποτε.",
      "Kuźnia pokazuje dokładnie, co daje klejnot i ile kosztuje, zanim cokolwiek wydasz.",
    ],
  "Buy more at the Auction House's shop, or find Stamina Potions as a rare dungeon drop.":
    [
      "Αγόρασε περισσότερα στο κατάστημα του Οίκου Δημοπρασιών ή βρες Φίλτρα Αντοχής ως σπάνιο εύρημα μπουντρουμιού.",
      "Kup więcej w sklepie Domu aukcyjnego lub znajdź Mikstury Wytrzymałości jako rzadką zdobycz z lochów.",
    ],
  "Earn Insight from level-ups, victories, quests & achievements. Ranks are permanent.":
    [
      "Κέρδισε Διόραση από αναβαθμίσεις επιπέδου, νίκες, αποστολές και επιτεύγματα. Οι βαθμίδες είναι μόνιμες.",
      "Zdobywaj Wgląd za awanse, zwycięstwa, zadania i osiągnięcia. Stopnie są stałe.",
    ],
  "Sockets are cut and filled at the Gem Workshop — every piece of gear can hold up to":
    [
      "Οι υποδοχές ανοίγονται και γεμίζουν στο Εργαστήριο Πετραδιών — κάθε κομμάτι εξοπλισμού χωρά έως",
      "Gniazda wycina się i wypełnia w Warsztacie klejnotów — każdy element ekwipunku mieści do",
    ],
  "Tap a piece to work on it. A gold badge on an icon counts the gems socketed in it.":
    [
      "Πάτησε ένα κομμάτι για να το επεξεργαστείς. Ένα χρυσό σήμα στο εικονίδιο μετρά τα τοποθετημένα πετράδια.",
      "Dotknij elementu, by nad nim pracować. Złota plakietka na ikonie liczy oprawione w nim klejnoty.",
    ],
  "Higher tiers are earned by cutting and fusing the lower ones at the Gem Workshop.":
    [
      "Οι υψηλότερες βαθμίδες κερδίζονται κόβοντας και ενώνοντας τις χαμηλότερες στο Εργαστήριο Πετραδιών.",
      "Wyższe poziomy zdobywa się, szlifując i łącząc niższe w Warsztacie klejnotów.",
    ],
  "Your bag is empty. Worn gear stays equipped — move a piece to the bag to sell it.":
    [
      "Η τσάντα σου είναι άδεια. Ο φορεμένος εξοπλισμός μένει φορεμένος — μετακίνησε ένα κομμάτι στην τσάντα για να το πουλήσεις.",
      "Twój plecak jest pusty. Noszony ekwipunek zostaje założony — przenieś element do plecaka, by go sprzedać.",
    ],
  "Every member, strongest first. Power is what the hero last reported to the hall.":
    [
      "Κάθε μέλος, από τον δυνατότερο. Η Δύναμη είναι ότι δήλωσε τελευταία ο ήρωας στην αίθουσα.",
      "Każdy członek, od najsilniejszego. Moc to wartość, jaką bohater ostatnio zgłosił do sali.",
    ],
  "runs a day at full stamina · every run spends its stamina on entry, win or lose.":
    [
      "διαδρομές την ημέρα με πλήρη αντοχή · κάθε διαδρομή ξοδεύει την αντοχή της στην είσοδο, νίκη ή ήττα.",
      "wejść dziennie przy pełnej wytrzymałości · każde wejście zużywa wytrzymałość przy starcie, niezależnie od wyniku.",
    ],
  "The miners never sleep: every hour this level banks gold, in or out of the game.":
    [
      "Οι μεταλλωρύχοι δεν κοιμούνται: κάθε ώρα αυτό το επίπεδο συγκεντρώνει χρυσό, εντός ή εκτός παιχνιδιού.",
      "Górnicy nie śpią: co godzinę ten poziom gromadzi złoto, w grze i poza nią.",
    ],
  "General shows player messages only; event announcements appear under World.":
    [
      "Το Γενικά δείχνει μόνο μηνύματα παικτών· οι ανακοινώσεις γεγονότων εμφανίζονται στο Κόσμος.",
      "Ogólny pokazuje tylko wiadomości graczy; ogłoszenia wydarzeń są w zakładce Świat.",
    ],
  "No Astrals yet — Starshards drop from battles and bosses. Summon one above.":
    [
      "Δεν έχεις Αστρικά — τα Αστρόθραυστα πέφτουν από μάχες και αφεντικά. Κάλεσε ένα παραπάνω.",
      "Brak Astrali — Gwiezdne odłamki wypadają z walk i bossów. Przywołaj jednego powyżej.",
    ],
  "Pays gold only. The chance shrinks as the piece climbs, and gold stops at +":
    [
      "Πληρώνει μόνο χρυσό. Η πιθανότητα μικραίνει όσο ανεβαίνει το κομμάτι και ο χρυσός σταματά στο +",
      "Płaci tylko złotem. Szansa maleje wraz z poziomem elementu, a złoto kończy się na +",
    ],
  "Something went wrong on our end. You can try refreshing or head back home.":
    [
      "Κάτι πήγε στραβά από τη μεριά μας. Δοκίμασε ανανέωση ή επέστρεψε στην αρχική.",
      "Coś poszło nie tak po naszej stronie. Odśwież stronę lub wróć do domu.",
    ],
  "Prefer to craft? Gems are also forged from materials in the Gem Workshop.":
    [
      "Προτιμάς να κατασκευάσεις; Τα πετράδια σφυρηλατούνται και από υλικά στο Εργαστήριο Πετραδιών.",
      "Wolisz wytwarzać? Klejnoty można też wykuć z materiałów w Warsztacie klejnotów.",
    ],
  "pieces recovered. The first recovery of each piece also banks 1 Insight.":
    [
      "κομμάτια ανακτήθηκαν. Η πρώτη ανάκτηση κάθε κομματιού δίνει και 1 Διόραση.",
      "elementów odzyskanych. Pierwsze odzyskanie każdego elementu daje też 1 Wgląd.",
    ],
  "1 message per second · max 5 per 15 seconds. Muted senders cannot chat.":
    [
      "1 μήνυμα ανά δευτερόλεπτο · έως 5 ανά 15 δευτερόλεπτα. Όσοι είναι σε σίγαση δεν μπορούν να μιλήσουν.",
      "1 wiadomość na sekundę · maks. 5 na 15 sekund. Wyciszeni nie mogą pisać.",
    ],
  "attacks and a won attack scores a point · most points in 24 hours wins.":
    [
      "επιθέσεις και κάθε κερδισμένη επίθεση δίνει πόντο · όποιος έχει τους περισσότερους σε 24 ώρες κερδίζει.",
      "ataki, a wygrany atak daje punkt · wygrywa ten, kto ma więcej punktów w 24 godziny.",
    ],
  "No gems yet. Forge one from materials, or buy one with Conquest Tokens.":
    [
      "Δεν έχεις πετράδια. Κατασκεύασε ένα από υλικά ή αγόρασε με Μάρκα Κατάκτησης.",
      "Brak klejnotów. Wykuj jeden z materiałów lub kup za Znaki Podboju.",
    ],
  "This piece has no sockets — Uncommon and better gear is born with them.":
    [
      "Αυτό το κομμάτι δεν έχει υποδοχές — ο εξοπλισμός Ασυνήθιστος και πάνω γεννιέται με αυτές.",
      "Ten element nie ma gniazd — ekwipunek Niezwykły i lepszy rodzi się z nimi.",
    ],
  "at 80 — so every level is a session's work and none of them is a wall.":
    [
      "στο 80 — έτσι κάθε επίπεδο είναι δουλειά μιας συνεδρίας και κανένα δεν είναι τοίχος.",
      "na 80 — każdy poziom to praca jednej sesji i żaden nie jest ścianą.",
    ],
  "Gems from your pouch, or a piece of equipment straight from your bag.":
    [
      "Πετράδια από το πουγγί σου ή ένα κομμάτι εξοπλισμού απευθείας από την τσάντα σου.",
      "Klejnoty z sakwy albo element ekwipunku prosto z plecaka.",
    ],
  "hours. It is stored in your Armory vault — open it whenever you like.":
    [
      "ώρες. Αποθηκεύεται στο θησαυροφυλάκιο του Οπλοστασίου — άνοιξέ το όποτε θέλεις.",
      "godzin. Jest przechowywana w skarbcu Zbrojowni — otwórz go, kiedy chcesz.",
    ],
  "Soul Shards — chance drops from battles, spent on permanent infusions":
    [
      "Θραύσματα Ψυχής — πέφτουν τυχαία από μάχες, ξοδεύονται σε μόνιμες ενσωματώσεις",
      "Odłamki Duszy — wypadają losowo z walk, wydawane na stałe wtopienia",
    ],
  "XP a fight at your own level pays before scrolls and catch-up bonuses":
    [
      "XP που δίνει μια μάχη στο επίπεδό σου πριν από παπύρους και μπόνους κάλυψης",
      "PD, które daje walka na twoim poziomie, przed zwojami i bonusami doganiania",
    ],
  "Each extra hole costs more than the last; every piece can hold up to":
    [
      "Κάθε επιπλέον τρύπα κοστίζει περισσότερο από την προηγούμενη· κάθε κομμάτι χωρά έως",
      "Każdy kolejny otwór kosztuje więcej; każdy element mieści do",
    ],
  "Each level widens the shaft: more gold every hour and a bigger cart.":
    ["Κάθε επίπεδο φαρδαίνει το φρέαρ: περισσότερος χρυσός την ώρα και μεγαλύτερο καρότσι.", "Każdy poziom poszerza szyb: więcej złota na godzinę i większy wózek."],
  "No stamina left — drink a potion from the HUD or wait for the reset.":
    ["Δεν έχει μείνει αντοχή — πιες ένα φίλτρο από το HUD ή περίμενε την επαναφορά.", "Brak wytrzymałości — wypij miksturę z HUD lub poczekaj na reset."],
  "A won attack scores 1 point · both teams are paid when the war ends":
    ["Μια κερδισμένη επίθεση δίνει 1 πόντο · και οι δύο ομάδες πληρώνονται όταν τελειώσει ο πόλεμος", "Wygrany atak daje 1 punkt · obie drużyny dostają zapłatę po zakończeniu wojny"],
  "You have no gems in your pouch yet. Forge one from materials first.":
    ["Δεν έχεις ακόμη πετράδια στο πουγγί σου. Κατασκεύασε πρώτα ένα από υλικά.", "Nie masz jeszcze klejnotów w sakwie. Najpierw wykuj jeden z materiałów."],
  "Every Astral you own is already seated. Unseat one or summon more.":
    ["Κάθε Αστρικό που έχεις είναι ήδη τοποθετημένο. Βγάλε ένα ή κάλεσε περισσότερα.", "Każdy twój Astral jest już umieszczony. Usuń jednego lub przywołaj więcej."],
  "stone or better — the deeper the enchantment, the rarer the stone.":
    ["πέτρα ή καλύτερη — όσο βαθύτερη η γοητεία, τόσο σπανιότερη η πέτρα.", "kamień lub lepszy — im głębsze zaczarowanie, tym rzadszy kamień."],
  "This building isn't playable yet — it's coming in a future update.":
    ["Αυτό το κτίριο δεν είναι ακόμη παίξιμο — έρχεται σε μελλοντική ενημέρωση.", "Ten budynek nie jest jeszcze grywalny — pojawi się w przyszłej aktualizacji."],
  "VIP members only — one-month memberships are in the Premium Shop.":
    ["Μόνο για μέλη VIP — οι συνδρομές ενός μήνα είναι στο Κατάστημα Premium.", "Tylko dla członków VIP — członkostwa jednomiesięczne są w Sklepie Premium."],
  "Selling gear works from the Auction tab, straight from your bag.":
    ["Η πώληση εξοπλισμού γίνεται από την καρτέλα Δημοπρασίες, απευθείας από την τσάντα σου.", "Sprzedaż ekwipunku działa z karty Aukcje, prosto z plecaka."],
  "Ordinary armour and weapons, open to every player — every piece":
    ["Συνηθισμένη πανοπλία και όπλα, ανοιχτά σε κάθε παίκτη — κάθε κομμάτι", "Zwykłe zbroje i broń, dostępne dla każdego gracza — każdy element"],
  "Spare materials from battles refine into the ones recipes need.":
    ["Τα περιττά υλικά από μάχες εκλεπτύνονται σε αυτά που χρειάζονται οι συνταγές.", "Zbędne materiały z walk oczyszczają się w te potrzebne do przepisów."],
  "Your newest creation appears here, compared with what you wear.":
    ["Η νεότερη δημιουργία σου εμφανίζεται εδώ, συγκρινόμενη με ό,τι φοράς.", "Twoje najnowsze dzieło pojawia się tutaj, porównane z tym, co nosisz."],
  "Two stones of one grade plus gold forge one of the next grade.":
    ["Δύο πέτρες ίδιας βαθμίδας συν χρυσός σφυρηλατούν μία της επόμενης.", "Dwa kamienie jednego stopnia plus złoto wykuwają jeden wyższego stopnia."],
  "Any gem family, any level — bought with Conquest Tokens only.":
    ["Οποιαδήποτε οικογένεια πετραδιών, οποιοδήποτε επίπεδο — αγοράζεται μόνο με Μάρκα Κατάκτησης.", "Dowolna rodzina klejnotów, dowolny poziom — tylko za Znaki Podboju."],
  "No Renown banked yet — win a fight at any gate and come back.":
    ["Δεν έχεις συγκεντρώσει Φήμη — κέρδισε μια μάχη σε οποιαδήποτε πύλη και γύρνα.", "Brak zgromadzonej Sławy — wygraj walkę przy dowolnych wrotach i wróć."],
  "Three bounties rotate every UTC day with the raid allowances.":
    ["Τρεις επικήρυξεις εναλλάσσονται κάθε ημέρα UTC μαζί με τα όρια επιδρομών.", "Trzy nagrody obracają się każdego dnia UTC wraz z limitami rajdów."],
  "A painted wonder of the realm — no raid here, only the view.":
    ["Ένα ζωγραφισμένο θαύμα του βασιλείου — καμία επιδρομή εδώ, μόνο η θέα.", "Malowany cud świata — żadnego rajdu, tylko widok."],
  "Floors pay tokens; blitzing a cleared floor pays them again.":
    ["Οι όροφοι πληρώνουν μάρκα· το blitz σε καθαρισμένο όροφο τα ξαναπληρώνει.", "Piętra płacą znaki; blitz na oczyszczonym piętrze płaci je ponownie."],
  "Gold while you are away — collect the cart whenever you like":
    ["Χρυσός όσο λείπεις — μάζεψε το καρότσι όποτε θέλεις", "Złoto pod twoją nieobecność — odbierz wózek, kiedy chcesz"],
  "The page you're looking for doesn't exist or has been moved.":
    ["Η σελίδα που ψάχνεις δεν υπάρχει ή μετακινήθηκε.", "Strona, której szukasz, nie istnieje lub została przeniesiona."],
  "Buy materials and enchantment stones with your guild coins.":
    ["Αγόρασε υλικά και πέτρες γοητείας με τα νομίσματα συντεχνίας σου.", "Kupuj materiały i kamienie zaczarowania za monety gildii."],
  "% of the time, so a bad roll still keeps one in the pouch.":
    ["% των φορών, οπότε μια κακή ζαριά κρατά ένα στο πουγγί.", "% przypadków, więc nieudany rzut i tak zostawia jeden w sakwie."],
  "without fighting: their gold, 30% XP. Your record is stage":
    ["χωρίς μάχη: τον χρυσό τους, 30% XP. Το ρεκόρ σου είναι στάδιο", "bez walki: ich złoto, 30% PD. Twój rekord to etap"],
  "Diamonds, monthly VIP, gold, stones, materials and chests":
    ["Διαμάντια, μηνιαίο VIP, χρυσός, πέτρες, υλικά και μπαούλα", "Diamenty, miesięczny VIP, złoto, kamienie, materiały i skrzynie"],
  "Every Astral you hold. Upgrades cost gold and never stop.":
    ["Κάθε Αστρικό που κατέχεις. Οι αναβαθμίσεις κοστίζουν χρυσό και δεν σταματούν ποτέ.", "Każdy posiadany Astral. Ulepszenia kosztują złoto i nigdy się nie kończą."],
  "Everything is sold — the next shipment lands on the hour.":
    ["Όλα πουλήθηκαν — η επόμενη παρτίδα φτάνει στην ώρα.", "Wszystko sprzedane — następna dostawa pojawi się o pełnej godzinie."],
  "Feed a duplicate of this species into it for a free level":
    ["Τάισε ένα διπλότυπο αυτού του είδους για δωρεάν επίπεδο", "Nakarm go duplikatem tego gatunku, by dostać darmowy poziom"],
  "The guild hall could not be opened. Refresh to try again.":
    ["Η αίθουσα συντεχνίας δεν άνοιξε. Ανανέωσε για να δοκιμάσεις ξανά.", "Nie udało się otworzyć sali gildii. Odśwież i spróbuj ponownie."],
  "XP stays in the Campaign Gate — a blitz never levels you.":
    ["Το XP μένει στην Πύλη Εκστρατείας — ένα blitz δεν σε ανεβάζει επίπεδο.", "PD zostają we Wrotach kampanii — blitz nigdy nie daje poziomu."],
  "Chests open here · gems are socketed at the Gem Workshop":
    ["Τα μπαούλα ανοίγουν εδώ · τα πετράδια τοποθετούνται στο Εργαστήριο Πετραδιών", "Skrzynie otwierają się tutaj · klejnoty oprawia się w Warsztacie klejnotów"],
  "Double gold and tokens at the Conquest Gate for the day":
    ["Διπλός χρυσός και μάρκα στην Πύλη Κατάκτησης για σήμερα", "Podwójne złoto i znaki we Wrotach podboju na dziś"],
  "In your pack — double gold and tokens at the gate today":
    ["Στο σακίδιό σου — διπλός χρυσός και μάρκα στην πύλη σήμερα", "W plecaku — podwójne złoto i znaki przy wrotach dziś"],
  "Join a guild at the Guild Hall to talk with your guild.":
    ["Μπες σε συντεχνία στην Αίθουσα Συντεχνίας για να μιλήσεις μαζί της.", "Dołącz do gildii w Sali Gildii, by z nią rozmawiać."],
  "Sow seeds, harvest the fields and raise your Farm Level":
    ["Σπείρε σπόρους, θέρισε τα χωράφια και ανέβασε το Επίπεδο Αγροκτήματος", "Siej nasiona, zbieraj plony i podnoś Poziom Farmy"],
  "Stamina Potions left today. Restocks at Greek midnight.":
    ["Φίλτρα Αντοχής έμειναν για σήμερα. Ανανεώνονται τα ελληνικά μεσάνυχτα.", "Mikstur Wytrzymałości zostało na dziś. Odnowienie o greckiej północy."],
  "The Auction tab is where players trade with each other.":
    ["Η καρτέλα Δημοπρασίες είναι όπου οι παίκτες συναλλάσσονται μεταξύ τους.", "Karta Aukcje to miejsce, gdzie gracze handlują ze sobą."],
  "Today's Conquest Key doubles every reward the gate pays":
    ["Το σημερινό Κλειδί Κατάκτησης διπλασιάζει κάθε ανταμοιβή της πύλης", "Dzisiejszy Klucz Podboju podwaja każdą nagrodę wrót"],
  "challenge bosses this week · resets Monday 00:00 UTC.":
    ["προκλήσεις αφεντικών αυτή την εβδομάδα · επαναφορά Δευτέρα 00:00 UTC.", "wyzwania bossów w tym tygodniu · reset w poniedziałek 00:00 UTC."],
  "Eight pieces, roughly three weeks of steady grinding.":
    ["Οκτώ κομμάτια, περίπου τρεις εβδομάδες σταθερού παιχνιδιού.", "Osiem elementów, około trzech tygodni stałego grindingu."],
  "stamina, win or lose. Deeper sites open as you level.":
    ["αντοχή, νίκη ή ήττα. Βαθύτερες τοποθεσίες ανοίγουν καθώς ανεβαίνεις.", "wytrzymałości, niezależnie od wyniku. Głębsze miejsca otwierają się z poziomem."],
  "The enemy guild has no fighters on this war's roster.":
    ["Η εχθρική συντεχνία δεν έχει μαχητές στη σύνθεση αυτού του πολέμου.", "Wroga gildia nie ma wojowników w składzie tej wojny."],
  "The full seed catalogue lives in the Shop's Farm tab.":
    ["Ο πλήρης κατάλογος σπόρων βρίσκεται στην καρτέλα Αγρόκτημα του Καταστήματος.", "Pełny katalog nasion jest w karcie Farma w Sklepie."],
  "The seal is broken — this vault stands empty for you.":
    ["Η σφραγίδα έσπασε — αυτό το θησαυροφυλάκιο είναι άδειο για σένα.", "Pieczęć złamana — ten skarbiec stoi dla ciebie pusty."],
  "when it lands. No battle can start until it finishes.":
    ["όταν ολοκληρωθεί. Καμία μάχη δεν ξεκινά πριν τελειώσει.", "gdy się zakończy. Żadna walka nie zacznie się przed końcem."],
  "Clear a floor in the gate above to unlock the blitz.":
    ["Καθάρισε έναν όροφο στην πύλη παραπάνω για να ξεκλειδώσεις το blitz.", "Oczyść piętro we wrotach powyżej, by odblokować blitz."],
  "Slow down a moment — five messages every 15 seconds.":
    ["Πιο αργά — πέντε μηνύματα κάθε 15 δευτερόλεπτα.", "Zwolnij — pięć wiadomości na 15 sekund."],
  "Battle Essence — earned from battles after level 20":
    ["Μαχική Ουσία — κερδίζεται από μάχες μετά το επίπεδο 20", "Esencja Walki — zdobywana w walkach po poziomie 20"],
  "You own no gems yet — cut some at the Gem Workshop.":
    ["Δεν έχεις πετράδια — κόψε μερικά στο Εργαστήριο Πετραδιών.", "Nie masz klejnotów — oszlifuj je w Warsztacie klejnotów."],
  "Every title grants permanent buffs while equipped.":
    ["Κάθε τίτλος δίνει μόνιμα μπόνους όσο είναι εξοπλισμένος.", "Każdy tytuł daje stałe bonusy, gdy jest założony."],
  "One gift each Greek day, in order — next up is day":
    ["Ένα δώρο κάθε ελληνική ημέρα, με σειρά — επόμενη είναι η ημέρα", "Jeden prezent każdego greckiego dnia, po kolei — następny to dzień"],
  "The tower has no top. Every rank costs guild coins":
    ["Ο πύργος δεν έχει κορυφή. Κάθε βαθμίδα κοστίζει νομίσματα συντεχνίας", "Wieża nie ma szczytu. Każdy stopień kosztuje monety gildii"],
  "claimed · every one pays gold, XP and materials ·":
    ["διεκδικήθηκαν · κάθε μία δίνει χρυσό, XP και υλικά ·", "odebrane · każda daje złoto, PD i materiały ·"],
  "No listings yet. Be the first to sell something.":
    ["Δεν υπάρχουν αγγελίες. Γίνε ο πρώτος που θα πουλήσει κάτι.", "Brak ofert. Bądź pierwszy, kto coś sprzeda."],
  "Only the leader or an officer can declare a war.":
    ["Μόνο ο αρχηγός ή ένας αξιωματικός μπορεί να κηρύξει πόλεμο.", "Tylko przywódca lub oficer może wypowiedzieć wojnę."],
  "Open crafting recipes · Standard & Synthesis":
    ["Ανοιχτές συνταγές κατασκευής · Βασικές & Σύνθεση", "Otwarte przepisy rzemiosła · Standardowe i Synteza"],
  "Public profile (visible in arena & rankings)":
    ["Δημόσιο προφίλ (ορατό στην αρένα και στις κατατάξεις)", "Publiczny profil (widoczny na arenie i w rankingach)"],
  "item(s) waiting — free bag space to claim them.":
    ["αντικείμενα περιμένουν — ελευθέρωσε χώρο στην τσάντα για να τα πάρεις.", "przedmiotów czeka — zwolnij miejsce w plecaku, by je odebrać."],
  ". Keep clearing the Campaign Gate to level up.":
    ["Συνέχισε να καθαρίζεις την Πύλη Εκστρατείας για να ανεβείς επίπεδο.", "Oczyszczaj dalej Wrota kampanii, by zdobywać poziomy."],
  "added to your vault — open it from the Armory.":
    ["προστέθηκαν στο θησαυροφυλάκιό σου — άνοιξέ το από το Οπλοστάσιο.", "dodano do skarbca — otwórz go ze Zbrojowni."],
  "Tap anywhere in the realm to raise your banner":
    ["Πάτησε οπουδήποτε στο βασίλειο για να υψώσεις το λάβαρό σου", "Dotknij gdziekolwiek w świecie, by wznieść sztandar"],
  "Forge every pair you hold into the next grade":
    ["Σφυρηλάτησε κάθε ζευγάρι που έχεις στην επόμενη βαθμίδα", "Wykuj każdą posiadaną parę w kolejny stopień"],
  "How this fight compares to your battle rating":
    ["Πώς συγκρίνεται αυτή η μάχη με τη βαθμολογία μάχης σου", "Jak ta walka wypada wobec twojej oceny bojowej"],
  "min · 25 Diamonds finish it now · pays no XP":
    ["λεπτά · 25 Διαμάντια το τελειώνουν τώρα · δεν δίνει XP", "min · 25 Diamentów kończy teraz · bez PD"],
  "Default appearance — no synthesis gear worn":
    ["Προεπιλεγμένη εμφάνιση — δεν φοριέται εξοπλισμός σύνθεσης", "Domyślny wygląd — brak założonego ekwipunku syntezy"],
  "No battles yet — head to the Campaign Gate.":
    ["Καμία μάχη ακόμη — πήγαινε στην Πύλη Εκστρατείας.", "Brak walk — udaj się do Wrót kampanii."],
  "· +1% attack, defense & health per level ·":
    ["· +1% επίθεση, άμυνα & υγεία ανά επίπεδο ·", "· +1% ataku, obrony i zdrowia za poziom ·"],
  "A stone that fails an enchantment survives":
    ["Μια πέτρα που αποτυγχάνει σε γοητεία επιβιώνει", "Kamień, który nie zaczaruje, przetrwa"],
  "No recorded creatures match these filters.":
    ["Κανένα καταγεγραμμένο πλάσμα δεν ταιριάζει με αυτά τα φίλτρα.", "Żadne zapisane stworzenie nie pasuje do tych filtrów."],
  "Not enough gold for the next level — raise":
    ["Δεν φτάνει ο χρυσός για το επόμενο επίπεδο — αύξησε", "Za mało złota na kolejny poziom — podnieś"],
  "tower ranks among your own deeds · founded":
    ["βαθμίδες πύργου στις δικές σου πράξεις · ιδρύθηκε", "stopnie wieży wśród własnych czynów · założona"],
  "Endless Conquest opens at character level":
    ["Η Ατελείωτη Κατάκτηση ανοίγει στο επίπεδο χαρακτήρα", "Niekończący się podbój otwiera się na poziomie postaci"],
  "Messages must be 200 characters or fewer.":
    ["Τα μηνύματα πρέπει να είναι έως 200 χαρακτήρες.", "Wiadomości mogą mieć maks. 200 znaków."],
  "Renown — earned from every battle you win":
    ["Φήμη — κερδίζεται από κάθε μάχη που κερδίζεις", "Sława — zdobywana za każdą wygraną walkę"],
  "Attack any of them — each win is a point":
    ["Επίθεση σε οποιονδήποτε — κάθε νίκη είναι πόντος", "Atakuj każdego z nich — każda wygrana to punkt"],
  "Every level brings its own three quests.":
    ["Κάθε επίπεδο φέρνει τις δικές του τρεις αποστολές.", "Każdy poziom przynosi własne trzy zadania."],
  "— deeper steps need Enchantment Stones.":
    ["— τα βαθύτερα βήματα χρειάζονται Πέτρες Γοητείας.", "— głębsze kroki wymagają Kamieni Zaczarowania."],
  ". Only cut stones are sold — no armour.":
    [". Πωλούνται μόνο κομμένες πέτρες — όχι πανοπλία.", ". Sprzedawane są tylko oszlifowane kamienie — nie zbroje."],
  "· paid in Void Crystals · no rank limit":
    ["· πληρώνεται σε Κρυστάλλους Κενού · χωρίς όριο βαθμίδων", "· płatne Kryształami pustki · bez limitu stopni"],
  "Fate Stones refine gear instead of gold":
    ["Οι Πέτρες Πεπρωμένου βελτιώνουν εξοπλισμό αντί για χρυσό", "Kamienie Losu ulepszają ekwipunek zamiast złota"],
  "Guild chat opens once you join a guild.":
    ["Η συνομιλία συντεχνίας ανοίγει μόλις μπεις σε συντεχνία.", "Czat gildii otwiera się po dołączeniu do gildii."],
  "· the board refills at Greek midnight.":
    ["· ο πίνακας ανανεώνεται τα ελληνικά μεσάνυχτα.", "· tablica odnawia się o greckiej północy."],
  "% off every Diamond price in this tab.":
    ["% έκπτωση σε κάθε τιμή Διαμαντιών σε αυτή την καρτέλα.", "% zniżki na każdą cenę Diamentów w tej karcie."],
  "Find heroes to send your first request":
    ["Βρες ήρωες για να στείλεις το πρώτο σου αίτημα", "Znajdź bohaterów, by wysłać pierwszą prośbę"],
  "Game goods for gold, every one of them":
    ["Αγαθά παιχνιδιού για χρυσό, όλα τους", "Towary do gry za złoto, każdy z nich"],
  "Realm ladder · every hero in the arena":
    ["Κλίμακα βασιλείου · κάθε ήρωας στην αρένα", "Drabinka świata · każdy bohater na arenie"],
  "Conquest Key active — this run pays ×":
    ["Κλειδί Κατάκτησης ενεργό — αυτή η διαδρομή δίνει ×", "Klucz Podboju aktywny — to wejście daje ×"],
  "Conquest Tokens — the gate's own coin":
    ["Μάρκα Κατάκτησης — το νόμισμα της πύλης", "Znaki Podboju — moneta samych wrót"],
  "No other heroes yet — invite friends!":
    ["Δεν υπάρχουν άλλοι ήρωες — κάλεσε φίλους!", "Brak innych bohaterów — zaproś znajomych!"],
  "Select a character to manage friends.":
    ["Διάλεξε χαρακτήρα για να διαχειριστείς φίλους.", "Wybierz postać, by zarządzać znajomymi."],
  "Socket or fuse it at the Gem Workshop":
    ["Τοποθέτησέ το ή ένωσέ το στο Εργαστήριο Πετραδιών", "Opraw go lub połącz w Warsztacie klejnotów"],
  "Charge the great red tree once every":
    ["Φόρτισε το μεγάλο κόκκινο δέντρο μία φορά κάθε", "Ładuj wielkie czerwone drzewo raz na"],
  "Nothing waiting — everyone answered.":
    ["Τίποτα σε αναμονή — όλοι απάντησαν.", "Nic nie czeka — wszyscy odpowiedzieli."],
  "— share it so friends can find you.":
    ["— μοιράσου το ώστε να σε βρίσκουν φίλοι.", "— udostępnij, by znajomi cię znaleźli."],
  "identical gems into the next level.":
    ["πανομοιότυπα πετράδια στο επόμενο επίπεδο.", "identycznych klejnotów w kolejny poziom."],
  "Materials ready — the forge is hot.":
    ["Τα υλικά είναι έτοιμα — το σιδηρουργείο είναι ζεστό.", "Materiały gotowe — kuźnia jest rozgrzana."],
  "strongest members · every hero gets":
    ["δυνατότερα μέλη · κάθε ήρωας παίρνει", "najsilniejsi członkowie · każdy bohater dostaje"],
  ". The first set is forged at level":
    [". Το πρώτο σετ σφυρηλατείται στο επίπεδο", ". Pierwszy zestaw wykuty na poziomie"],
  "A new set every ten levels · level":
    ["Νέο σετ κάθε δέκα επίπεδα · επίπεδο", "Nowy zestaw co dziesięć poziomów · poziom"],
  "Gear codex · every icon & stat":
    ["Κώδικας εξοπλισμού · κάθε εικονίδιο & στατιστικό", "Kodeks ekwipunku · każda ikona i statystyka"],
  "General chat is empty — say hello!":
    ["Η γενική συνομιλία είναι άδεια — πες ένα γεια!", "Czat ogólny jest pusty — przywitaj się!"],
  "One use · doubled conquest rewards":
    ["Μία χρήση · διπλές ανταμοιβές κατάκτησης", "Jedno użycie · podwójne nagrody podboju"],
  "Open Relic Trials from the castle.":
    ["Άνοιξε τις Δοκιμασίες Κειμηλίων από το κάστρο.", "Otwórz Próby relikwii z zamku."],
  "Refines gear at the Forge · held ×":
    ["Βελτιώνει εξοπλισμό στο Σιδηρουργείο · κατέχεις ×", "Ulepsza ekwipunek w Kuźni · posiadane ×"],
  "Search heroes by name (2+ letters)":
    ["Αναζήτηση ηρώων με όνομα (2+ γράμματα)", "Szukaj bohaterów po imieniu (2+ litery)"],
  "Show or hide the painted courtyard":
    ["Εμφάνιση ή απόκρυψη της ζωγραφισμένης αυλής", "Pokaż lub ukryj malowany dziedziniec"],
  "Socketed gems return to your pouch":
    ["Τα τοποθετημένα πετράδια επιστρέφουν στο πουγγί σου", "Oprawione klejnoty wracają do sakwy"],
  "Synthesis opens at character level":
    ["Η Σύνθεση ανοίγει στο επίπεδο χαρακτήρα", "Synteza otwiera się na poziomie postaci"],
  "The catalogue restocks every hour.":
    ["Ο κατάλογος ανανεώνεται κάθε ώρα.", "Katalog uzupełnia się co godzinę."],
  "No other guilds to challenge yet.":
    ["Δεν υπάρχουν άλλες συντεχνίες για πρόκληση.", "Brak innych gildii do wyzwania."],
  "Open Expeditions from the castle.":
    ["Άνοιξε τις Εκστρατείες από το κάστρο.", "Otwórz Wyprawy z zamku."],
  "This piece is equipped right now.":
    ["Αυτό το κομμάτι φοριέται τώρα.", "Ten element jest teraz założony."],
  "× · Found at your current level.":
    ["× · Βρέθηκε στο τρέχον επίπεδό σου.", "× · Znalezione na twoim obecnym poziomie."],
  "Conquest battles cost no stamina":
    ["Οι μάχες κατάκτησης δεν κοστίζουν αντοχή", "Walki podboju nie kosztują wytrzymałości"],
  "Enchantment Stones · nine grades":
    ["Πέτρες Γοητείας · εννέα βαθμίδες", "Kamienie Zaczarowania · dziewięć stopni"],
  "No guilds have been founded yet.":
    ["Δεν έχει ιδρυθεί καμία συντεχνία ακόμη.", "Nie założono jeszcze żadnej gildii."],
  "Server-confirmed for this battle":
    ["Επιβεβαιωμένο από τον server για αυτή τη μάχη", "Potwierdzone przez serwer dla tej walki"],
  "— the full purse is paid on the":
    ["— το πλήρες ποσό πληρώνεται στο", "— pełna sakiewka wypłacana jest w"],
  "· sells whole, sockets included":
    ["· πουλιέται ολόκληρο, με τις υποδοχές του", "· sprzedawane w całości, z gniazdami"],
  "Break the seal · one-time hoard":
    ["Σπάσε τη σφραγίδα · θησαυρός μίας χρήσης", "Złam pieczęć · jednorazowy skarb"],
  "Confirm salvaging equipped gear":
    ["Επιβεβαίωσε τη διάλυση φορεμένου εξοπλισμού", "Potwierdź rozbiór założonego ekwipunku"],
  "Deeper floors pay more tokens (":
    ["Τα βαθύτερα δάπεδα πληρώνουν περισσότερα μάρκα (", "Głębsze piętra płacą więcej znaków ("],
  "gold every day · faster blitzes":
    ["χρυσό κάθε μέρα · ταχύτερα blitz", "złota codziennie · szybsze blitze"],
  "Saved to your Astral collection":
    ["Αποθηκεύτηκε στη συλλογή Αστρικών σου", "Zapisano w kolekcji Astrali"],
  "Waiting for a leader or officer":
    ["Αναμονή για αρχηγό ή αξιωματικό", "Czeka na przywódcę lub oficera"],
  "Adds one more row of bag slots":
    ["Προσθέτει μία ακόμη σειρά θέσεων τσάντας", "Dodaje kolejny rząd slotów plecaka"],
  "complete — every piece forged.":
    ["ολοκληρωμένα — κάθε κομμάτι σφυρηλατημένο.", "ukończone — każdy element wykuty."],
  "No Astrals of this family yet.":
    ["Κανένα Αστρικό αυτής της οικογένειας ακόμη.", "Brak Astrali tej rodziny."],
  "Pick a piece of gear to socket":
    ["Διάλεξε ένα κομμάτι εξοπλισμού για τοποθέτηση", "Wybierz element ekwipunku do oprawy"],
  "· every purchase adds another":
    ["· κάθε αγορά προσθέτει άλλον έναν", "· każdy zakup dodaje kolejny"],
  "· every tenth stage is a boss":
    ["· κάθε δέκατο στάδιο είναι αφεντικό", "· co dziesiąty etap to boss"],
  "Boss challenges open at level":
    ["Οι προκλήσεις αφεντικών ανοίγουν στο επίπεδο", "Wyzwania bossów otwierają się na poziomie"],
  "Complete all daily objectives":
    ["Ολοκλήρωσε όλους τους ημερήσιους στόχους", "Wykonaj wszystkie cele dzienne"],
  "minutes for gold and Farm XP.":
    ["λεπτά για χρυσό και XP Αγροκτήματος.", "minut na złoto i PD Farmy."],
  "Sign in to fight real players":
    ["Συνδέσου για να παλέψεις με πραγματικούς παίκτες", "Zaloguj się, by walczyć z prawdziwymi graczami"],
  "stamina per run, win or lose.":
    ["αντοχή ανά διαδρομή, νίκη ή ήττα.", "wytrzymałości na wejście, niezależnie od wyniku."],
  "The last milestone is reached":
    ["Το τελευταίο ορόσημο επιτεύχθηκε", "Ostatni kamień milowy osiągnięty"],
  "Use Conquest Key · ×2 rewards":
    ["Χρήση Κλειδιού Κατάκτησης · ×2 ανταμοιβές", "Użyj Klucza Podboju · ×2 nagrody"],
  "All boss and elite rewards ×":
    ["Όλες οι ανταμοιβές αφεντικών και ελίτ ×", "Wszystkie nagrody bossów i elit ×"],
  "Coming with your next levels":
    ["Έρχονται με τα επόμενα επίπεδά σου", "Przyjdą z kolejnymi poziomami"],
  "No Diamond transactions yet.":
    ["Καμία συναλλαγή Διαμαντιών ακόμη.", "Brak transakcji Diamentami."],
  "No messages yet - say hello.":
    ["Κανένα μήνυμα ακόμη - πες ένα γεια.", "Brak wiadomości - przywitaj się."],
  "One Fate Stone adds a flat +":
    ["Μία Πέτρα Πεπρωμένου προσθέτει σταθερό +", "Jeden Kamień Losu dodaje stałe +"],
  "· leader or officer answers":
    ["· ο αρχηγός ή αξιωματικός απαντά", "· odpowiada przywódca lub oficer"],
  "Active until Greek midnight":
    ["Ενεργό έως τα ελληνικά μεσάνυχτα", "Aktywne do greckiej północy"],
  "Enchantment Stones required":
    ["Απαιτούνται Πέτρες Γοητείας", "Wymagane Kamienie Zaczarowania"],
  "Where the rating comes from":
    ["Από πού προκύπτει η βαθμολογία", "Skąd bierze się ocena"],
  "— the hero fights it alone":
    ["— ο ήρωας το πολεμά μόνος", "— bohater walczy z nim sam"],
  "Banners planted by players":
    ["Λάβαρα που ύψωσαν παίκτες", "Sztandary wbite przez graczy"],
  "Create guild · 10,000 gold":
    ["Δημιουργία συντεχνίας · 10.000 χρυσός", "Załóż gildię · 10 000 złota"],
  "No item matches that name.":
    ["Κανένα αντικείμενο δεν ταιριάζει με αυτό το όνομα.", "Żaden przedmiot nie pasuje do tej nazwy."],
  "Seen · no recorded defeats":
    ["Ιδωμένο · καμία καταγεγραμμένη ήττα", "Widziane · brak zapisanych zwycięstw"],
  "Type at least two letters.":
    ["Γράψε τουλάχιστον δύο γράμματα.", "Wpisz co najmniej dwie litery."],
  "Your turn — choose a skill":
    ["Η σειρά σου — διάλεξε δεξιότητα", "Twoja kolej — wybierz umiejętność"],
  "Floors never stop scaling":
    ["Οι όροφοι δεν σταματούν να κλιμακώνονται", "Piętra nie przestają skalować"],
  "more tokens for this gem.":
    ["περισσότερα μάρκα για αυτό το πετράδι.", "więcej znaków za ten klejnot."],
  "Refills at Greek midnight":
    ["Ανανεώνεται τα ελληνικά μεσάνυχτα", "Odnowienie o greckiej północy"],
  "Added to your character:":
    ["Προστέθηκε στον χαρακτήρα σου:", "Dodano do twojej postaci:"],
  "Fate Stones · refinement":
    ["Πέτρες Πεπρωμένου · βελτίωση", "Kamienie Losu · ulepszenie"],
  "No public hero matches “":
    ["Κανένας δημόσιος ήρωας δεν ταιριάζει με “", "Żaden publiczny bohater nie pasuje do „"],
  "Opening the guild gates…":
    ["Ανοίγουν οι πύλες της συντεχνίας…", "Otwieranie wrót gildii…"],
  "Salvage equipped gear...":
    ["Διάλυση φορεμένου εξοπλισμού...", "Rozbiór założonego ekwipunku..."],
  "the bill climbs gently —":
    ["ο λογαριασμός ανεβαίνει απαλά —", "rachunek rośnie łagodnie —"],
  "— waiting for an answer":
    ["— αναμονή για απάντηση", "— czeka na odpowiedź"],
  "Every upgrade raises it":
    ["Κάθε αναβάθμιση το ανεβάζει", "Każde ulepszenie je podnosi"],
  "fights each. From level":
    ["μάχες ο καθένας. Από το επίπεδο", "walk każdy. Od poziomu"],
  "No pending invitations.":
    ["Καμία εκκρεμής πρόσκληση.", "Brak oczekujących zaproszeń."],
  "Raid allowances offline":
    ["Όρια επιδρομών εκτός σύνδεσης", "Limity rajdów offline"],
  "when socketed · best on":
    ["όταν τοποθετείται · καλύτερο σε", "po oprawie · najlepsze na"],
  "Achievement categories":
    ["Κατηγορίες επιτευγμάτων", "Kategorie osiągnięć"],
  "at your deepest, floor":
    ["στο βαθύτερό σου, όροφος", "na najgłębszym, piętro"],
  "Auction House sections":
    ["Ενότητες Οίκου Δημοπρασιών", "Sekcje Domu aukcyjnego"],
  "Choose a piece of gear":
    ["Διάλεξε ένα κομμάτι εξοπλισμού", "Wybierz element ekwipunku"],
  "Deepest shaft reached.":
    ["Έφτασες στο βαθύτερο φρέαρ.", "Osiągnięto najgłębszy szyb."],
  "gold an hour and holds":
    ["χρυσό την ώρα και χωρά", "złota na godzinę i mieści"],
  "No guild messages yet.":
    ["Κανένα μήνυμα συντεχνίας ακόμη.", "Brak wiadomości gildii."],
  "No one has spoken yet.":
    ["Κανείς δεν έχει μιλήσει ακόμη.", "Nikt jeszcze nie mówił."],
  "Nothing to collect yet":
    ["Τίποτα για συλλογή ακόμη", "Nic do odebrania"],
  "Refine spare materials":
    ["Εκλέπτυνε περιττά υλικά", "Oczyść zbędne materiały"],
  "Salvage into materials":
    ["Διάλυσε σε υλικά", "Rozbierz na materiały"],
  "Your attacks this war:":
    ["Οι επιθέσεις σου σε αυτόν τον πόλεμο:", "Twoje ataki w tej wojnie:"],
  "Your mailbox is empty.":
    ["Το γραμματοκιβώτιό σου είναι άδειο.", "Twoja skrzynka jest pusta."],
  "— a refinement spends":
    ["— μια βελτίωση ξοδεύει", "— ulepszenie zużywa"],
  "% drop chance (bosses":
    ["% πιθανότητα ευρήματος (αφεντικά", "% szansy na zdobycz (bossowie"],
  "A new plot is tilled.":
    ["Ένα νέο χωράφι οργώθηκε.", "Nowe pole zostało zaorane."],
  "Acknowledge and close":
    ["Επιβεβαίωση και κλείσιμο", "Potwierdź i zamknij"],
  "Battle Rating sources":
    ["Πηγές βαθμολογίας μάχης", "Źródła oceny bojowej"],
  "Conquest Key ×2 today":
    ["Κλειδί Κατάκτησης ×2 σήμερα", "Klucz Podboju ×2 dziś"],
  "Guild message history":
    ["Ιστορικό μηνυμάτων συντεχνίας", "Historia wiadomości gildii"],
  "Insert a gem · socket":
    ["Βάλε πετράδι · υποδοχή", "Włóż klejnot · gniazdo"],
  "Maximum Enlightenment":
    ["Μέγιστη Διαφώτιση", "Maksymalne Oświecenie"],
  "No blitzes left today":
    ["Δεν έμειναν blitz για σήμερα", "Brak blitzów na dziś"],
  "No finished wars yet.":
    ["Κανένας τελειωμένος πόλεμος ακόμη.", "Brak zakończonych wojen."],
  "No incoming requests.":
    ["Κανένα εισερχόμενο αίτημα.", "Brak przychodzących próśb."],
  "Nothing equipped yet.":
    ["Τίποτα δεν είναι φορεμένο ακόμη.", "Nic nie jest jeszcze założone."],
  "One-time Diamond pack":
    ["Πακέτο Διαμαντιών μίας φοράς", "Jednorazowy pakiet Diamentów"],
  "Search heroes by name":
    ["Αναζήτηση ηρώων με όνομα", "Szukaj bohaterów po imieniu"],
  "Seat an Astral · slot":
    ["Τοποθέτησε Αστρικό · θέση", "Umieść Astrala · slot"],
  "Small stones start at":
    ["Οι μικρές πέτρες ξεκινούν στο", "Małe kamienie zaczynają się od"],
  "specialization · Tier":
    ["ειδίκευση · βαθμίδα", "specjalizacja · stopień"],
  "This gear is equipped":
    ["Αυτός ο εξοπλισμός φοριέται", "Ten ekwipunek jest założony"],
  "This page didn't load":
    ["Αυτή η σελίδα δεν φόρτωσε", "Ta strona się nie wczytała"],
  "Unlocks at hero level":
    ["Ξεκλειδώνει στο επίπεδο ήρωα", "Odblokowuje się na poziomie bohatera"],
  "VIP lasts one month (":
    ["Το VIP διαρκεί έναν μήνα (", "VIP trwa jeden miesiąc ("],
  "· asks to be friends":
    ["· ζητά φιλία", "· prosi o znajomość"],
  "% gold & Farm XP":
    ["% χρυσό & XP Αγροκτήματος", "% złota i PD Farmy"],
  "Defeat count unknown":
    ["Αριθμός ηττών άγνωστος", "Liczba pokonań nieznana"],
  "Each side fields its":
    ["Κάθε πλευρά παρατάσσει", "Każda strona wystawia"],
  "Guild Hall buildings":
    ["Κτίρια Αίθουσας Συντεχνίας", "Budynki Sali Gildii"],
  "Material expeditions":
    ["Εκστρατείες υλικών", "Wyprawy po materiały"],
  "No heroes ranked yet":
    ["Κανένας ήρωας στην κατάταξη ακόμη", "Brak bohaterów w rankingu"],
  "No message selected.":
    ["Κανένα μήνυμα επιλεγμένο.", "Nie wybrano wiadomości."],
  "plots are now yours.":
    ["χωράφια είναι πλέον δικά σου.", "działek jest teraz twoich."],
  "Preview class action":
    ["Προεπισκόπηση κίνησης κλάσης", "Podgląd ruchu klasy"],
  "Seeking challengers…":
    ["Αναζήτηση αντιπάλων…", "Szukanie przeciwników…"],
  "Show the whole realm":
    ["Δείξε όλο το βασίλειο", "Pokaż cały świat"],
  "This week's modifier":
    ["Ο τροποποιητής αυτής της εβδομάδας", "Modyfikator tego tygodnia"],
  "30-Day Reward Board":
    ["Πίνακας Ανταμοιβών 30 Ημερών", "Tablica Nagród na 30 Dni"],
  "challenges you to a":
    ["σε προκαλεί σε", "wyzywa cię na"],
  "Claim weekly reward":
    ["Διεκδίκησε εβδομαδιαία ανταμοιβή", "Odbierz nagrodę tygodnia"],
  "Encounter to reveal":
    ["Συνάντηση για αποκάλυψη", "Spotkanie, by ujawnić"],
  "gold / hour · holds":
    ["χρυσός / ώρα · χωρά", "złota / godz. · mieści"],
  "Greek time (server)":
    ["Ελληνική ώρα (server)", "Czas grecki (serwer)"],
  "Hero name to invite":
    ["Όνομα ήρωα για πρόσκληση", "Imię bohatera do zaproszenia"],
  "Loading the ladder…":
    ["Φόρτωση της κατάταξης…", "Wczytywanie drabinki…"],
  "No friend matches “":
    ["Κανένας φίλος δεν ταιριάζει με “", "Żaden znajomy nie pasuje do „"],
  "No stats available.":
    ["Δεν υπάρχουν στατιστικά.", "Brak dostępnych statystyk."],
  "None — all unlocked":
    ["Κανένα — όλα ξεκλειδωμένα", "Brak — wszystko odblokowane"],
  "Replays stages 1 to":
    ["Επαναλαμβάνει στάδια 1 έως", "Powtarza etapy od 1 do"],
  "Select all unlocked":
    ["Επίλεξε όλα τα ξεκλειδωμένα", "Wybierz wszystkie odblokowane"],
  "Unequip and destroy":
    ["Αφαίρεση και καταστροφή", "Zdejmij i zniszcz"],
  "VIP-only activities":
    ["Δραστηριότητες μόνο VIP", "Aktywności tylko VIP"],
  "Accept application":
    ["Αποδοχή αίτησης", "Przyjmij podanie"],
  "battles left today":
    ["μάχες έμειναν σήμερα", "walk zostało na dziś"],
  "Blitz target floor":
    ["Όροφος στόχος blitz", "Docelowe piętro blitza"],
  "Blitz target stage":
    ["Στάδιο στόχος blitz", "Docelowy etap blitza"],
  "Buy a Conquest Key":
    ["Αγόρασε Κλειδί Κατάκτησης", "Kup Klucz Podboju"],
  "Claim login reward":
    ["Διεκδίκησε ανταμοιβή σύνδεσης", "Odbierz nagrodę logowania"],
  "Enchantment stones":
    ["Πέτρες γοητείας", "Kamienie zaczarowania"],
  "Enhancement method":
    ["Μέθοδος βελτίωσης", "Metoda ulepszania"],
  "Gold in your purse":
    ["Χρυσός στο πουγγί σου", "Złoto w sakiewce"],
  "Gold to contribute":
    ["Χρυσός για συνεισφορά", "Złoto do wpłaty"],
  "Guild headquarters":
    ["Αρχηγείο συντεχνίας", "Kwatera gildii"],
  "Message (optional)":
    ["Μήνυμα (προαιρετικό)", "Wiadomość (opcjonalnie)"],
  "Might of the guild":
    ["Ισχύς της συντεχνίας", "Potęga gildii"],
  "Open the gem forge":
    ["Άνοιξε το σιδηρουργείο πετραδιών", "Otwórz kuźnię klejnotów"],
  "Refresh activities":
    ["Ανανέωση δραστηριοτήτων", "Odśwież aktywności"],
  "Reject application":
    ["Απόρριψη αίτησης", "Odrzuć podanie"],
  "Salvage this piece":
    ["Διάλυσε αυτό το κομμάτι", "Rozbierz ten element"],
  "Send guild message":
    ["Στείλε μήνυμα συντεχνίας", "Wyślij wiadomość gildii"],
  "Stamina left today":
    ["Αντοχή που έμεινε σήμερα", "Wytrzymałość na dziś"],
  "Synthesis progress":
    ["Πρόοδος σύνθεσης", "Postęp syntezy"],
  "Today in the realm":
    ["Σήμερα στο βασίλειο", "Dziś w świecie"],
  "Total price (Gold)":
    ["Συνολική τιμή (Χρυσός)", "Cena łączna (Złoto)"],
  "Under construction":
    ["Υπό κατασκευή", "W budowie"],
  "VIP board progress":
    ["Πρόοδος πίνακα VIP", "Postęp tablicy VIP"],
  "VIP cycle progress": ["Πρόοδος κύκλου VIP", "Postęp cyklu VIP"],
  "Waiting for them (": ["Αναμονή για αυτούς (", "Czekanie na nich ("],
  "What this run pays": ["Τι πληρώνει αυτή η διαδρομή", "Co płaci to wejście"],
  "Your bag is empty.": ["Η τσάντα σου είναι άδεια.", "Twój plecak jest pusty."],
  "% shop discount ·": ["% έκπτωση καταστήματος ·", "% zniżki w sklepie ·"],
  "+20% · 10 battles": ["+20% · 10 μάχες", "+20% · 10 walk"],
  "Advanced training": ["Προχωρημένη εκπαίδευση", "Zaawansowany trening"],
  "Barracks sections": ["Ενότητες στρατώνα", "Sekcje koszar"],
  "Blitz depth typed": ["Βάθος blitz που ορίστηκε", "Wprowadzona głębokość blitza"],
  "Blood moon castle": ["Κάστρο του ματωμένου φεγγαριού", "Zamek krwawego księżyca"],
  "Buy with Diamonds": ["Αγορά με Διαμάντια", "Kup za Diamenty"],
  "Claim attachments": ["Διεκδίκηση συνημμένων", "Odbierz załączniki"],
  "Declare a new war": ["Κήρυξε νέο πόλεμο", "Wypowiedz nową wojnę"],
  "drinks left today": ["ποτά έμειναν σήμερα", "napojów zostało na dziś"],
  "Equip best relics": ["Φόρεσε τα καλύτερα κειμήλια", "Załóż najlepsze relikwie"],
  "Equipment to sell": ["Εξοπλισμός προς πώληση", "Ekwipunek do sprzedaży"],
  "Forge another gem": ["Σφυρηλάτησε άλλο πετράδι", "Wykuj kolejny klejnot"],
  "Forge materials ·": ["Υλικά σιδηρουργείου ·", "Materiały kuźni ·"],
  "Guild invitations": ["Προσκλήσεις συντεχνίας", "Zaproszenia do gildii"],
  "Guild Skill Tower": ["Πύργος Δεξιοτήτων Συντεχνίας", "Wieża Umiejętności Gildii"],
  "Incoming requests": ["Εισερχόμενα αιτήματα", "Przychodzące prośby"],
  "more gold needed.": ["χρειάζονται περισσότερα χρυσά.", "potrzeba więcej złota."],
  "Next battle earns": ["Η επόμενη μάχη δίνει", "Następna walka da"],
  "Not recovered yet": ["Δεν ανακτήθηκε ακόμη", "Jeszcze nie odzyskane"],
  "officers & leader": ["αξιωματικοί & αρχηγός", "oficerowie i przywódca"],
  "Open relic trials": ["Άνοιξε δοκιμασίες κειμηλίων", "Otwórz próby relikwii"],
  "Opening checkout…": ["Άνοιγμα ταμείου…", "Otwieranie kasy…"],
  "Pick another spot": ["Διάλεξε άλλο σημείο", "Wybierz inne miejsce"],
  "Plant banner here": ["Ύψωσε λάβαρο εδώ", "Wbij tu sztandar"],
  "Ready to collect.": ["Έτοιμο για συλλογή.", "Gotowe do odbioru."],
  "Refresh guild war": ["Ανανέωση πολέμου συντεχνίας", "Odśwież wojnę gildii"],
  "Seven Lucky Shots": ["Επτά Τυχερά Χτυπήματα", "Siedem Szczęśliwych Strzałów"],
  "Shots unavailable": ["Τα χτυπήματα μη διαθέσιμα", "Strzały niedostępne"],
  "The Conquest Gate": ["Η Πύλη Κατάκτησης", "Wrota podboju"],
  "Upgrade the shaft": ["Αναβάθμισε το φρέαρ", "Ulepsz szyb"],
  "Your applications": ["Οι αιτήσεις σου", "Twoje podania"],
  "Your hero name is": ["Το όνομα του ήρωά σου είναι", "Imię twojego bohatera to"],
  "· seeds up to Lv": ["· σπόροι έως Επ.", "· nasiona do Poz."],
  "(Greek midnight)": ["(ελληνικά μεσάνυχτα)", "(grecka północ)"],
  "% damage per hit": ["% ζημιά ανά χτύπημα", "% obrażeń na cios"],
  "Advance to level": ["Προχώρησε στο επίπεδο", "Awansuj na poziom"],
  "Available guilds": ["Διαθέσιμες συντεχνίες", "Dostępne gildie"],
  "Buy a Fate Stone": ["Αγόρασε Πέτρα Πεπρωμένου", "Kup Kamień Losu"],
  "Change hero pose": ["Αλλαγή πόζας ήρωα", "Zmień pozę bohatera"],
  "Conquest Tokens:": ["Μάρκα Κατάκτησης:", "Znaki Podboju:"],
  "Cut a gem socket": ["Άνοιξε υποδοχή πετραδιού", "Wytnij gniazdo klejnotu"],
  "Dismiss bounties": ["Κλείσε τις επικήρυξεις", "Zamknij nagrody"],
  "Dismiss reminder": ["Κλείσε την υπενθύμιση", "Zamknij przypomnienie"],
  "EmberFall Online": ["EmberFall Online", "EmberFall Online"],
  "Enter expedition": ["Μπες στην εκστρατεία", "Wejdź na wyprawę"],
  "Forge every pair": ["Σφυρηλάτησε κάθε ζευγάρι", "Wykuj każdą parę"],
  "Friends sections": ["Ενότητες φίλων", "Sekcje znajomych"],
  "Gear set bonuses": ["Μπόνους σετ εξοπλισμού", "Bonusy zestawów ekwipunku"],
  "Gold in the cart": ["Χρυσός στο καρότσι", "Złoto w wózku"],
  "Keep it equipped": ["Κράτησέ το φορεμένο", "Zostaw założone"],
  "Move banner here": ["Μετέφερε το λάβαρο εδώ", "Przenieś sztandar tutaj"],
  "Open expeditions": ["Άνοιξε εκστρατείες", "Otwórz wyprawy"],
  "Pending requests": ["Εκκρεμή αιτήματα", "Oczekujące prośby"],
  "per socketed gem": ["ανά τοποθετημένο πετράδι", "za oprawiony klejnot"],
  "Replay animation": ["Επανάληψη κίνησης", "Odtwórz animację"],
  "Search forge bag": ["Αναζήτηση στην τσάντα του σιδηρουργείου", "Szukaj w plecaku kuźni"],
  "Search your bag…": ["Αναζήτηση στην τσάντα σου…", "Szukaj w plecaku…"],
  "stamina per run.": ["αντοχή ανά διαδρομή.", "wytrzymałości na wejście."],
  "this level costs": ["αυτό το επίπεδο κοστίζει", "ten poziom kosztuje"],
  "Tokens per floor": ["Μάρκα ανά όροφο", "Znaki za piętro"],
  "Tokens to spend:": ["Μάρκα για ξόδεμα:", "Znaki do wydania:"],
  "Unknown creature": ["Άγνωστο πλάσμα", "Nieznane stworzenie"],
  "Unlocks at level": ["Ξεκλειδώνει στο επίπεδο", "Odblokowuje się na poziomie"],
  "VIP members only": ["Μόνο για μέλη VIP", "Tylko dla członków VIP"],
  "VIP reward board": ["Πίνακας ανταμοιβών VIP", "Tablica nagród VIP"],
  "VIP Reward Board": ["Πίνακας Ανταμοιβών VIP", "Tablica Nagród VIP"],
  "Weekly objective": ["Εβδομαδιαίος στόχος", "Cel tygodnia"],
  ", win or lose ·": [", νίκη ή ήττα ·", ", niezależnie od wyniku ·"],
  "· item level 30": ["· επίπεδο αντικειμένου 30", "· poziom przedmiotu 30"],
  "· Not found yet": ["· Δεν βρέθηκε ακόμη", "· Jeszcze nie znaleziono"],
  "(set signature)": ["(υπογραφή σετ)", "(sygnatura zestawu)"],
  "+2 Soul Essence": ["+2 Ουσία Ψυχής", "+2 Esencja Duszy"],
  "Ability preview": ["Προεπισκόπηση ικανότητας", "Podgląd zdolności"],
  "Activity period": ["Περίοδος δραστηριότητας", "Okres aktywności"],
  "Astral families": ["Οικογένειες Αστρικών", "Rodziny Astrali"],
  "Barracks drills": ["Ασκήσεις στρατώνα", "Ćwiczenia koszar"],
  "Battle skills ·": ["Δεξιότητες μάχης ·", "Umiejętności bojowe ·"],
  "Blitz running ·": ["Blitz σε εξέλιξη ·", "Blitz trwa ·"],
  "bosses defeated": ["αφεντικά νικήθηκαν", "bossów pokonanych"],
  "Choose a target": ["Διάλεξε στόχο", "Wybierz cel"],
  "Close world map": ["Κλείσιμο χάρτη κόσμου", "Zamknij mapę świata"],
  "Conquest Tokens": ["Μάρκα Κατάκτησης", "Znaki Podboju"],
  "Floors replayed": ["Όροφοι που επαναλήφθηκαν", "Powtórzone piętra"],
  "Forge materials": ["Υλικά σιδηρουργείου", "Materiały kuźni"],
  "Hall of Records": ["Αίθουσα Ρεκόρ", "Sala Zapisów"],
  "in your wallet.": ["στο πορτοφόλι σου.", "w twoim portfelu."],
  "live now · ends": ["ζωντανό τώρα · λήγει", "trwa teraz · kończy się"],
  "No friends yet.": ["Δεν έχεις φίλους ακόμη.", "Brak znajomych."],
  "Not yet cleared": ["Δεν καθαρίστηκε ακόμη", "Jeszcze nie oczyszczone"],
  "Open listings ·": ["Ανοιχτές αγγελίες ·", "Otwarte oferty ·"],
  "Overflow Chest:": ["Μπαούλο υπερχείλισης:", "Skrzynia nadmiaru:"],
  "Plant my banner": ["Ύψωσε το λάβαρό μου", "Wbij mój sztandar"],
  "possible relics": ["πιθανά κειμήλια", "możliwe relikwie"],
  "Ready to forge.": ["Έτοιμο για σφυρηλάτηση.", "Gotowe do wykucia."],
  "Refresh mailbox": ["Ανανέωση γραμματοκιβωτίου", "Odśwież skrzynkę"],
  "Specialization:": ["Ειδίκευση:", "Specjalizacja:"],
  "Species codex ·": ["Κώδικας ειδών ·", "Kodeks gatunków ·"],
  "Tower breakdown": ["Ανάλυση πύργου", "Rozkład wieży"],
  "Unread messages": ["Μη αναγνωσμένα μηνύματα", "Nieprzeczytane wiadomości"],
  ", always crits": [", πάντα κριτικό", ", zawsze kryt"],
  "Applications (": ["Αιτήσεις (", "Podania ("],
  "are available.": ["είναι διαθέσιμα.", "są dostępne."],
  "Barracks level": ["Επίπεδο στρατώνα", "Poziom koszar"],
  "Battle Rating:": ["Βαθμολογία μάχης:", "Ocena bojowa:"],
  "Blitz progress": ["Πρόοδος blitz", "Postęp blitza"],
  "Blitz to stage": ["Blitz έως το στάδιο", "Blitz do etapu"],
  "Board progress": ["Πρόοδος πίνακα", "Postęp tablicy"],
  "bonus Diamonds": ["μπόνους Διαμάντια", "bonusowe Diamenty"],
  "Campaign stage": ["Στάδιο εκστρατείας", "Etap kampanii"],
  "Combined power": ["Συνολική δύναμη", "Łączna moc"],
  "Crafted items:": ["Κατασκευασμένα αντικείμενα:", "Wytworzone przedmioty:"],
  "Cycle progress": ["Πρόοδος κύκλου", "Postęp cyklu"],
  "Dismiss castle": ["Κλείσε το κάστρο", "Zamknij zamek"],
  "Enemy roster ·": ["Σύνθεση εχθρού ·", "Skład wroga ·"],
  "Event progress": ["Πρόοδος γεγονότος", "Postęp wydarzenia"],
  "Farm Level Up!": ["Ανέβηκε το Αγρόκτημα!", "Awans Farmy!"],
  "Filter friends": ["Φίλτρα φίλων", "Filtruj znajomych"],
  "Gem Chest next": ["Επόμενο μπαούλο πετραδιών", "Następna skrzynia klejnotów"],
  "Guild Treasury": ["Ταμείο Συντεχνίας", "Skarbiec Gildii"],
  "In your vault:": ["Στο θησαυροφυλάκιό σου:", "W twoim skarbcu:"],
  "OUT OF STAMINA": ["ΧΩΡΙΣ ΑΝΤΟΧΗ", "BRAK WYTRZYMAŁOŚCI"],
  "Page not found": ["Η σελίδα δεν βρέθηκε", "Nie znaleziono strony"],
  "power · joined": ["δύναμη · μπήκε", "mocy · dołączył"],
  "ready to claim": ["έτοιμο για διεκδίκηση", "gotowe do odbioru"],
  "relics woken ·": ["κειμήλια ξύπνησαν ·", "relikwii obudzonych ·"],
  "Attunement": ["Συντονισμός", "Zestrojenie"],
  "Attune": ["Συντόνισε", "Zestrój"],
  "Fully attuned": ["Πλήρως συντονισμένο", "W pełni zestrojona"],
  "guild coins": ["νομίσματα συντεχνίας", "monety gildii"],
  "Spend guild coins to attune a woken relic: each attunement adds half its bonus again, up to five times.": ["Ξόδεψε νομίσματα συντεχνίας για να συντονίσεις ένα ξυπνημένο κειμήλιο: κάθε συντονισμός προσθέτει ξανά το μισό μπόνους του, έως πέντε φορές.", "Wydaj monety gildii, by zestroić obudzoną relikwię: każde zestrojenie dodaje znów połowę jej premii, do pięciu razy."],
  "Reward claimed": ["Ανταμοιβή διεκδικήθηκε", "Nagroda odebrana"],
  "Spoils claimed": ["Λάφυρα διεκδικήθηκαν", "Łupy odebrane"],
  "Synthesis sets": ["Σετ σύνθεσης", "Zestawy syntezy"],
  "The World Tree": ["Το Παγκόσμιο Δέντρο", "Drzewo Świata"],
  "tier · best on": ["βαθμίδα · καλύτερο σε", "poziom · najlepsze na"],
  "to answer your": ["για να απαντήσει στο", "by odpowiedzieć na twoje"],
  "Total summons:": ["Σύνολο κλητεύσεων:", "Suma przywołań:"],
  "Training batch": ["Παρτίδα εκπαίδευσης", "Partia treningowa"],
  "Training costs": ["Κόστη εκπαίδευσης", "Koszty treningu"],
  "% defense · +": ["% άμυνα · +", "% obrony · +"],
  "All creatures": ["Όλα τα πλάσματα", "Wszystkie stworzenia"],
  "All nine sets": ["Και τα εννέα σετ", "Wszystkie dziewięć zestawów"],
  "at Farm Level": ["στο Επίπεδο Αγροκτήματος", "na Poziomie Farmy"],
  "Available now": ["Διαθέσιμο τώρα", "Dostępne teraz"],
  "Battle Rating": ["Βαθμολογία μάχης", "Ocena bojowa"],
  "Blitzes today": ["Blitz σήμερα", "Blitze dziś"],
  "Buy with card": ["Αγορά με κάρτα", "Kup kartą"],
  "Castle raids:": ["Επιδρομές κάστρων:", "Rajdy na zamki:"],
  "Chat channels": ["Κανάλια συνομιλίας", "Kanały czatu"],
  "Claim rewards": ["Διεκδίκησε ανταμοιβές", "Odbierz nagrody"],
  "Claimed today": ["Διεκδικήθηκε σήμερα", "Odebrano dziś"],
  "Coins on hand": ["Νομίσματα διαθέσιμα", "Monety w zapasie"],
  "days · Total:": ["ημέρες · Σύνολο:", "dni · Razem:"],
  "Deepest floor": ["Βαθύτερος όροφος", "Najgłębsze piętro"],
  "Emberbloom Lv": ["Ανθρακόνθος Επ.", "Żarokwiat Poz."],
  "Enlightenment": ["Διαφώτιση", "Oświecenie"],
  "fights at 20,": ["μάχες στο 20,", "walk przy 20,"],
  "Forge recipes": ["Συνταγές σιδηρουργείου", "Przepisy kuźni"],
  "Found a guild": ["Ίδρυσε συντεχνία", "Załóż gildię"],
  "Fully drilled": ["Πλήρως ασκημένο", "W pełni wyćwiczone"],
  "Fully trained": ["Πλήρως εκπαιδευμένο", "W pełni wyszkolone"],
  "Guild charter": ["Καταστατικό συντεχνίας", "Statut gildii"],
  "Guild message": ["Μήνυμα συντεχνίας", "Wiadomość gildii"],
  "Guild Records": ["Αρχεία Συντεχνίας", "Zapisy Gildii"],
  "Hero training": ["Εκπαίδευση ήρωα", "Trening bohatera"],
  "in your bag ·": ["στην τσάντα σου ·", "w twoim plecaku ·"],
  "Item level 30": ["Επίπεδο αντικειμένου 30", "Poziom przedmiotu 30"],
  "List for sale": ["Βάλε για πώληση", "Wystaw na sprzedaż"],
  "Loading hero…": ["Φόρτωση ήρωα…", "Wczytywanie bohatera…"],
  "MAX LEVEL · +": ["ΜΕΓ. ΕΠΙΠΕΔΟ · +", "MAKS. POZIOM · +"],
  "Next at level": ["Επόμενο στο επίπεδο", "Następne na poziomie"],
  "Plant in plot": ["Φύτεψε στο τεμάχιο", "Zasiej na działce"],
  "Player castle": ["Κάστρο παίκτη", "Zamek gracza"],
  "Raid castle ·": ["Επιδρομή κάστρου ·", "Rajd na zamek ·"],
  "Random Summon": ["Τυχαία Κλήτευση", "Losowe Przywołanie"],
  "ranks trained": ["βαθμίδες εκπαιδευμένες", "stopni wytrenowanych"],
  "Recent fights": ["Πρόσφατες μάχες", "Ostatnie walki"],
  "Refresh arena": ["Ανανέωση αρένας", "Odśwież arenę"],
  "Refresh guild": ["Ανανέωση συντεχνίας", "Odśwież gildię"],
  "repeats every": ["επαναλαμβάνεται κάθε", "powtarza się co"],
  "Running blitz": ["Blitz σε εξέλιξη", "Trwający blitz"],
  "Save password": ["Αποθήκευση κωδικού", "Zapisz hasło"],
  "Search guilds": ["Αναζήτηση συντεχνιών", "Szukaj gildii"],
  "Sell anything": ["Πούλησε οτιδήποτε", "Sprzedaj cokolwiek"],
  "Sent requests": ["Απεσταλμένα αιτήματα", "Wysłane prośby"],
  "Set bonuses ·": ["Μπόνους σετ ·", "Bonusy zestawu ·"],
  "Show times in": ["Εμφάνιση ωρών σε", "Pokaż godziny w"],
  "Skill points:": ["Πόντοι δεξιοτήτων:", "Punkty umiejętności:"],
  "Socketed gear": ["Εξοπλισμός με υποδοχές", "Ekwipunek z gniazdami"],
  "Socketed gems": ["Τοποθετημένα πετράδια", "Oprawione klejnoty"],
  "Species found": ["Είδη που βρέθηκαν", "Znalezione gatunki"],
  "Stat training": ["Εκπαίδευση στατιστικών", "Trening statystyk"],
  "turn cooldown": ["αναμονή γύρου", "odnowienie tury"],
  "Unequip title": ["Αφαίρεση τίτλου", "Zdejmij tytuł"],
  "Upgrade level": ["Αναβάθμιση επιπέδου", "Ulepsz poziom"],
  "Vault · items": ["Θησαυροφυλάκιο · αντικείμενα", "Skarbiec · przedmioty"],
  "War Tactician": ["Τακτικός Πολέμου", "Taktyk Wojenny"],
  "You are level": ["Είσαι επίπεδο", "Jesteś na poziomie"],
  "· item level": ["· επίπεδο αντικειμένου", "· poziom przedmiotu"],
  "% attack · +": ["% επίθεση · +", "% ataku · +"],
  Achievements: ["Επιτεύγματα", "Osiągnięcia"],
  "Active until": ["Ενεργό έως", "Aktywne do"],
  "Add a friend": ["Πρόσθεσε φίλο", "Dodaj znajomego"],
  Announcement: ["Ανακοίνωση", "Ogłoszenie"],
  "Arena rating": ["Βαθμολογία αρένας", "Ocena areny"],
  "ASTRAL VAULT": ["ΑΣΤΡΙΚΟ ΘΗΣΑΥΡΟΦΥΛΑΚΙΟ", "ASTRALNY SKARBIEC"],
  "Basic \u0061ttack": ["Βασική επίθεση", "Podstawowy atak"],
  "Bounty board": ["Πίνακας επικηρύξεων", "Tablica nagród"],
  "Claim reward": ["Διεκδίκησε ανταμοιβή", "Odbierz nagrodę"],
  "Claim spoils": ["Διεκδίκησε λάφυρα", "Odbierz łupy"],
  "Codex rarity": ["Σπανιότητα κώδικα", "Rzadkość kodeksu"],
  "commissions,": ["αποστολές,", "zlecenia,"],
  "Conquest Key": ["Κλειδί Κατάκτησης", "Klucz Podboju"],
  "Cut a socket": ["Άνοιξε υποδοχή", "Wytnij gniazdo"],
  "Dismiss site": ["Κλείσε την τοποθεσία", "Zamknij miejsce"],
  "Empty socket": ["Κενή υποδοχή", "Puste gniazdo"],
  "Finish now ·": ["Ολοκλήρωση τώρα ·", "Zakończ teraz ·"],
  "Get strategy": ["Πάρε στρατηγική", "Weź strategię"],
  "Gold donated": ["Χρυσός που δόθηκε", "Wpłacone złoto"],
  "Gold Seed Lv": ["Χρυσός Σπόρος Επ.", "Złote Nasiono Poz."],
  "Hide preview": ["Απόκρυψη προεπισκόπησης", "Ukryj podgląd"],
  "Insert a gem": ["Βάλε πετράδι", "Włóż klejnot"],
  "Insight/rank": ["Διόραση/βαθμίδα", "Wgląd/stopień"],
  "Login reward": ["Ανταμοιβή σύνδεσης", "Nagroda logowania"],
  "Members only": ["Μόνο για μέλη", "Tylko dla członków"],
  "Nearest ruin": ["Πλησιέστερο ερείπιο", "Najbliższa ruina"],
  "New password": ["Νέος κωδικός", "Nowe hasło"],
  "Plant banner": ["Ύψωσε λάβαρο", "Wbij sztandar"],
  "Reward chest": ["Μπαούλο ανταμοιβής", "Skrzynia nagród"],
  "Reward Chest": ["Μπαούλο Ανταμοιβής", "Skrzynia Nagród"],
  "Save charter": ["Αποθήκευση καταστατικού", "Zapisz statut"],
  "Save profile": ["Αποθήκευση προφίλ", "Zapisz profil"],
  "The Bloodoak": ["Η Ματοβελανιδιά", "Krwawodąb"],
  "The run pays": ["Η διαδρομή πληρώνει", "Wejście płaci"],
  "Title filter": ["Φίλτρο τίτλων", "Filtr tytułów"],
  "Total ranks:": ["Σύνολο βαθμίδων:", "Suma stopni:"],
  Undiscovered: ["Ανεξερεύνητο", "Nieodkryte"],
  "What to sell": ["Τι να πουλήσεις", "Co sprzedać"],
  "· Ascension": ["· Ανάληψη", "· Wzniesienie"],
  "· Recovered": ["· Ανακτημένο", "· Odzyskane"],
  "· resets in": ["· επαναφορά σε", "· reset za"],
  "All enemies": ["Όλοι οι εχθροί", "Wszyscy wrogowie"],
  "Auto battle": ["Αυτόματη μάχη", "Automatyczna walka"],
  "Auto-battle": ["Αυτόματη μάχη", "Automatyczna walka"],
  "Blitz depth": ["Βάθος blitz", "Głębokość blitza"],
  "Claim bonus": ["Διεκδίκησε μπόνους", "Odbierz bonus"],
  "Coins spent": ["Νομίσματα που ξοδεύτηκαν", "Wydane monety"],
  "Confirming…": ["Επιβεβαίωση…", "Potwierdzanie…"],
  "Daily Chest": ["Ημερήσιο Μπαούλο", "Dzienna Skrzynia"],
  "Daily login": ["Ημερήσια σύνδεση", "Dzienne logowanie"],
  Description: ["Περιγραφή", "Opis"],
  Enchantment: ["Γοητεία", "Zaczarowanie"],
  "Equip piece": ["Φόρεσε κομμάτι", "Załóż element"],
  "Find heroes": ["Βρες ήρωες", "Znajdź bohaterów"],
  "Forge a gem": ["Σφυρηλάτησε πετράδι", "Wykuj klejnot"],
  "Forge piece": ["Σφυρηλάτησε κομμάτι", "Wykuj element"],
  "gem · Level": ["πετράδι · Επίπεδο", "klejnot · Poziom"],
  "Gem sockets": ["Υποδοχές πετραδιών", "Gniazda klejnotów"],
  "Gem to sell": ["Πετράδι προς πώληση", "Klejnot do sprzedaży"],
  "Guild level": ["Επίπεδο συντεχνίας", "Poziom gildii"],
  "Guild Vault": ["Θησαυροφυλάκιο Συντεχνίας", "Skarbiec Gildii"],
  "Harvest All": ["Θέρισε Όλα", "Zbierz wszystko"],
  "In progress": ["Σε εξέλιξη", "W toku"],
  "In your bag": ["Στην τσάντα σου", "W twoim plecaku"],
  "Infuse rank": ["Βαθμίδα ενσωμάτωσης", "Stopień wtopienia"],
  "Invite hero": ["Πρόσκαλεσε ήρωα", "Zaproś bohatera"],
  "Leave guild": ["Έξοδος από συντεχνία", "Opuść gildię"],
  "Level curve": ["Καμπύλη επιπέδων", "Krzywa poziomów"],
  "Moonroot Lv": ["Ματορίζα Επ.", "Krwawokorzeń Poz."],
  "Move banner": ["Μετέφερε λάβαρο", "Przenieś sztandar"],
  "Next relic:": ["Επόμενο κειμήλιο:", "Następna relikwia:"],
  "Opens later": ["Ανοίγει αργότερα", "Otwiera się później"],
  "Rarity odds": ["Πιθανότητες σπανιότητας", "Szanse rzadkości"],
  "Reminder on": ["Υπενθύμιση ενεργή", "Przypomnienie włączone"],
  "Remove from": ["Αφαίρεση από", "Usuń z"],
  "Restocks in": ["Ανανέωση σε", "Uzupełnienie za"],
  "Sell common": ["Πούλησε κοινά", "Sprzedaj zwykłe"],
  "Stone grade": ["Βαθμίδα πέτρας", "Stopień kamienia"],
  "Take a shot": ["Κάνε ένα χτύπημα", "Oddaj strzał"],
  "Title buffs": ["Μπόνους τίτλου", "Bonusy tytułu"],
  "tower ranks": ["βαθμίδες πύργου", "stopnie wieży"],
  "Tower ranks": ["Βαθμίδες πύργου", "Stopnie wieży"],
  "War ends in": ["Ο πόλεμος λήγει σε", "Wojna kończy się za"],
  "Your castle": ["Το κάστρο σου", "Twój zamek"],
  "Your ledger": ["Το καθολικό σου", "Twój rejestr"],
  ", cooldown": [", αναμονή", ", odnowienie"],
  "· Bag item": ["· Αντικείμενο τσάντας", "· Przedmiot z plecaka"],
  "· Conquest": ["· Κατάκτηση", "· Podbój"],
  "⚠ CHARGING": ["⚠ ΦΟΡΤΙΣΗ", "⚠ ŁADOWANIE"],
  "6 pieces ·": ["6 κομμάτια ·", "6 elementów ·"],
  "Add friend": ["Πρόσθεσε φίλο", "Dodaj znajomego"],
  "All states": ["Όλες οι καταστάσεις", "Wszystkie stany"],
  "Begin Rank": ["Έναρξη βαθμίδας", "Rozpocznij stopień"],
  "Boss Cores": ["Πυρήνες Αφεντικών", "Rdzenie Bossów"],
  Challenges: ["Προκλήσεις", "Wyzwania"],
  Collection: ["Συλλογή", "Kolekcja"],
  "Combat log": ["Αρχείο μάχης", "Dziennik walki"],
  Contribute: ["Συνεισφορά", "Wpłać"],
  "EMBER FALL": ["EMBER FALL", "EMBER FALL"],
  "Expires in": ["Λήγει σε", "Wygasa za"],
  "Farm Level": ["Επίπεδο Αγροκτήματος", "Poziom Farmy"],
  "Farm plots": ["Τεμάχια αγροκτήματος", "Działki farmy"],
  "Gear codex": ["Κώδικας εξοπλισμού", "Kodeks ekwipunku"],
  "Greek time": ["Ελληνική ώρα", "Czas grecki"],
  "Guild chat": ["Συνομιλία συντεχνίας", "Czat gildii"],
  "Guild name": ["Όνομα συντεχνίας", "Nazwa gildii"],
  "Guild Shop": ["Κατάστημα Συντεχνίας", "Sklep Gildii"],
  "Guild Wars": ["Πόλεμοι Συντεχνιών", "Wojny Gildii"],
  "Incoming (": ["Εισερχόμενα (", "Przychodzące ("],
  "Insert gem": ["Βάλε πετράδι", "Włóż klejnot"],
  "Item level": ["Επίπεδο αντικειμένου", "Poziom przedmiotu"],
  "Join event": ["Μπες στο γεγονός", "Dołącz do wydarzenia"],
  "left today": ["έμειναν σήμερα", "zostało na dziś"],
  "mastery: +": ["κυριαρχία: +", "mistrzostwo: +"],
  "more fight": ["ακόμη μάχη", "kolejna walka"],
  "Next level": ["Επόμενο επίπεδο", "Następny poziom"],
  "Not forged": ["Δεν σφυρηλατήθηκε", "Niewykute"],
  "Online now": ["Σε σύνδεση τώρα", "Teraz online"],
  "Rare+ loot": ["Λάφυρο Σπάνιο+", "Łup Rzadki+"],
  "Requests (": ["Αιτήματα (", "Prośby ("],
  "Reset tree": ["Επαναφορά δέντρου", "Reset drzewka"],
  "resource ·": ["πόρος ·", "surowiec ·"],
  "Search bag": ["Αναζήτηση τσάντας", "Szukaj w plecaku"],
  "Seed pouch": ["Πουγγί σπόρων", "Sakwa nasion"],
  "Soul Forge": ["Σιδηρουργείο Ψυχών", "Kuźnia Dusz"],
  Specialize: ["Εξειδίκευση", "Specjalizuj się"],
  Starshards: ["Αστρόθραυστα", "Gwiezdne odłamki"],
  "this week.": ["αυτή την εβδομάδα.", "w tym tygodniu."],
  "Train rank": ["Εκπαίδευσε βαθμίδα", "Trenuj stopień"],
  "Turn order": ["Σειρά γύρων", "Kolejność tur"],
  "Vault item": ["Αντικείμενο θησαυροφυλακίου", "Przedmiot ze skarbca"],
  "Waiting on": ["Αναμονή για", "Czeka na"],
  "War ledger": ["Καθολικό πολέμου", "Rejestr wojny"],
  "XP a fight": ["XP ανά μάχη", "PD za walkę"],
  "XP Seed Lv": ["Σπόρος XP Επ.", "Nasiono PD Poz."],
  "Your guild": ["Η συντεχνία σου", "Twoja gildia"],
  "· best on": ["· καλύτερο σε", "· najlepsze na"],
  "· Claimed": ["· Διεκδικήθηκε", "· Odebrane"],
  "· up to D": ["· έως D", "· do D"],
  "% MASTERY": ["% ΚΥΡΙΑΡΧΙΑ", "% MISTRZOSTWO"],
  "% success": ["% επιτυχία", "% szansy"],
  "▲ Upgrade": ["▲ Αναβάθμιση", "▲ Ulepszenie"],
  Abilities: ["Ικανότητες", "Zdolności"],
  Ascension: ["Ανάληψη", "Wzniesienie"],
  "Avg level": ["Μέσο επίπεδο", "Średni poziom"],
  "Banked: +": ["Συγκεντρωμένα: +", "Zgromadzone: +"],
  Biography: ["Βιογραφία", "Biografia"],
  "Blitz run": ["Διαδρομή blitz", "Bieg blitza"],
  challenge: ["πρόκληση", "wyzwanie"],
  Challenge: ["Πρόκληση", "Wyzwanie"],
  "Copy name": ["Αντιγραφή ονόματος", "Kopiuj nazwę"],
  "Current (": ["Τρέχον (", "Obecne ("],
  "Deepest (": ["Βαθύτερο (", "Najgłębsze ("],
  "demands a": ["απαιτεί", "wymaga"],
  Discovery: ["Ανακάλυψη", "Odkrycie"],
  "Farm Shop": ["Κατάστημα Αγροκτήματος", "Sklep Farmy"],
  "Friends (": ["Φίλοι (", "Znajomi ("],
  "Gem forge": ["Σιδηρουργείο πετραδιών", "Kuźnia klejnotów"],
  "Gem track": ["Πορεία πετραδιών", "Ścieżka klejnotów"],
  "Levels 1–": ["Επίπεδα 1–", "Poziomy 1–"],
  "Next rank": ["Επόμενη βαθμίδα", "Następny stopień"],
  "Next step": ["Επόμενο βήμα", "Następny krok"],
  "One enemy": ["Ένας εχθρός", "Jeden wróg"],
  "Per rank:": ["Ανά βαθμίδα:", "Za stopień:"],
  "Received:": ["Ελήφθησαν:", "Otrzymano:"],
  Recovered: ["Ανακτήθηκε", "Odzyskane"],
  Refilling: ["Αναπλήρωση", "Uzupełnianie"],
  Reliquary: ["Λειψανοθήκη", "Relikwiarz"],
  "Remind me": ["Υπενθύμισέ μου", "Przypomnij mi"],
  Requested: ["Ζητήθηκε", "Zażądano"],
  "Reset for": ["Επαναφορά για", "Reset za"],
  "rewards ×": ["ανταμοιβές ×", "nagrody ×"],
  "stamina ·": ["αντοχή ·", "wytrzymałość ·"],
  "Thinking…": ["Σκέψη…", "Myślenie…"],
  "Time zone": ["Ζώνη ώρας", "Strefa czasowa"],
  "Try again": ["Δοκίμασε ξανά", "Spróbuj ponownie"],
  "Upgrade ·": ["Αναβάθμιση ·", "Ulepszenie ·"],
  "Upgrade ×": ["Αναβάθμιση ×", "Ulepszenie ×"],
  "War score": ["Σκορ πολέμου", "Wynik wojny"],
  "Worn gear": ["Φορεμένος εξοπλισμός", "Noszone wyposażenie"],
  "Your gems": ["Τα πετράδιά σου", "Twoje klejnoty"],
  "Your rank": ["Η βαθμίδα σου", "Twój stopień"],
  "· CRIT +": ["· ΚΡΙΤ +", "· KRYT +"],
  "· forged": ["· σφυρηλατημένα", "· wykute"],
  "· held ×": ["· κατέχεις ×", "· posiadane ×"],
  "· Key ×2": ["· Κλειδί ×2", "· Klucz ×2"],
  "% health": ["% υγεία", "% zdrowia"],
  "▼ Weaker": ["▼ Ασθενέστερο", "▼ Słabsze"],
  Activate: ["Ενεργοποίηση", "Aktywuj"],
  "Active ·": ["Ενεργό ·", "Aktywne ·"],
  Advanced: ["Προχωρημένο", "Zaawansowane"],
  "Bag item": ["Αντικείμενο τσάντας", "Przedmiot z plecaka"],
  "Banners:": ["Λάβαρα:", "Sztandary:"],
  "Base: 1×": ["Βάση: 1×", "Baza: 1×"],
  Bounties: ["Επικήρυξεις", "Nagrody"],
  campaign: ["εκστρατεία", "kampania"],
  Collapse: ["Σύμπτυξη", "Zwiń"],
  conquest: ["κατάκτηση", "podbój"],
  Continue: ["Συνέχεια", "Kontynuuj"],
  "days ago": ["ημέρες πριν", "dni temu"],
  Defeated: ["Νικήθηκε", "Pokonany"],
  Equipped: ["Φορεμένο", "Założone"],
  frontier: ["σύνορο", "granica"],
  Frontier: ["Σύνορο", "Granica"],
  "Full set": ["Πλήρες σετ", "Pełny zestaw"],
  "Gear era": ["Εποχή εξοπλισμού", "Era ekwipunku"],
  "Hide map": ["Απόκρυψη χάρτη", "Ukryj mapę"],
  "in vault": ["στο θησαυροφυλάκιο", "w skarbcu"],
  "Insight:": ["Διόραση:", "Wgląd:"],
  "Level up": ["Ανέβα επίπεδο", "Awansuj"],
  "min left": ["λεπτά έμειναν", "min pozostało"],
  "min run)": ["λεπτά διαδρομή)", "min bieg)"],
  "None yet": ["Κανένα ακόμη", "Brak"],
  "of 10 in": ["από 10 σε", "z 10 w"],
  "per hour": ["ανά ώρα", "na godzinę"],
  "pieces ·": ["κομμάτια ·", "elementów ·"],
  Portrait: ["Πορτρέτο", "Portret"],
  "Potion ×": ["Φίλτρο ×", "Mikstura ×"],
  Progress: ["Πρόοδος", "Postęp"],
  Quantity: ["Ποσότητα", "Ilość"],
  required: ["απαιτείται", "wymagane"],
  "Run time": ["Χρόνος διαδρομής", "Czas biegu"],
  selected: ["επιλεγμένο", "wybrane"],
  "Sort bag": ["Ταξινόμηση τσάντας", "Sortuj plecak"],
  "Syncing…": ["Συγχρονισμός…", "Synchronizacja…"],
  "The cart": ["Το καρότσι", "Wózek"],
  "to level": ["στο επίπεδο", "do poziomu"],
  "VIP only": ["Μόνο VIP", "Tylko VIP"],
  Wardrobe: ["Γκαρνταρόμπα", "Garderoba"],
  Withdraw: ["Απόσυρση", "Wycofaj"],
  "xp/fight": ["xp/μάχη", "pd/walka"],
  "You have": ["Έχεις", "Masz"],
  "You need": ["Χρειάζεσαι", "Potrzebujesz"],
  "Zoom out": ["Σμίκρυνση", "Oddal"],
  ", stuns": [", ζαλίζει", ", ogłusza"],
  "· DEF +": ["· ΑΜΥΝΑ +", "· OBRONA +"],
  "· level": ["· επίπεδο", "· poziom"],
  "· Level": ["· Επίπεδο", "· Poziom"],
  "/8 worn": ["/8 φορεμένα", "/8 założonych"],
  "+ board": ["+ πίνακας", "+ tablica"],
  "+ Row (": ["+ Σειρά (", "+ Rząd ("],
  Applied: ["Εφαρμόστηκε", "Zastosowano"],
  attacks: ["επιθέσεις", "ataki"],
  "Best on": ["Καλύτερο σε", "Najlepsze na"],
  Blitzes: ["Blitz", "Blitze"],
  Bracket: ["Κατηγορία", "Kategoria"],
  "Buying…": ["Αγορά…", "Kupowanie…"],
  "Choose…": ["Διάλεξε…", "Wybierz…"],
  claimed: ["διεκδικήθηκε", "odebrane"],
  Claimed: ["Διεκδικήθηκε", "Odebrane"],
  cleared: ["καθαρίστηκε", "oczyszczone"],
  Confirm: ["Επιβεβαίωση", "Potwierdź"],
  Decline: ["Άρνηση", "Odrzuć"],
  Deepest: ["Βαθύτερο", "Najgłębsze"],
  dismiss: ["κλείσιμο", "zamknij"],
  "earned.": ["κερδισμένα.", "zdobyte."],
  endless: ["ατελείωτη", "niekończący"],
  Enemies: ["Εχθροί", "Wrogowie"],
  Enhance: ["Βελτίωση", "Ulepsz"],
  essence: ["ουσία", "esencja"],
  Expired: ["Έληξε", "Wygasło"],
  "Farm XP": ["XP Αγροκτήματος", "PD Farmy"],
  "Fire at": ["Πυρ κατά", "Ognia do"],
  Founded: ["Ιδρύθηκε", "Zażona"],
  General: ["Γενικά", "Ogólny"],
  "Go home": ["Πήγαινε στην αρχική", "Wróć do domu"],
  Halfway: ["Στα μισά", "W połowie"],
  "Last 10": ["Τελευταία 10", "Ostatnie 10"],
  members: ["μέλη", "członkowie"],
  Members: ["Μέλη", "Członkowie"],
  "My zone": ["Η ζώνη μου", "Moja strefa"],
  "Next: +": ["Επόμενο: +", "Następne: +"],
  "Plant ·": ["Φύτεψε ·", "Zasiej ·"],
  "pt/rank": ["πόντ/βαθμίδα", "pkt/stopień"],
  Refresh: ["Ανανέωση", "Odśwież"],
  "Reward:": ["Ανταμοιβή:", "Nagroda:"],
  "Search…": ["Αναζήτηση…", "Szukaj…"],
  "spent ·": ["ξοδεύτηκαν ·", "wydane ·"],
  stamina: ["αντοχή", "wytrzymałość"],
  "Streak:": ["Σερί:", "Seria:"],
  Unequip: ["Αφαίρεση", "Zdejmij"],
  Upgrade: ["Αναβάθμιση", "Ulepszenie"],
  Victory: ["Νίκη", "Zwycięstwo"],
  VICTORY: ["ΝΙΚΗ", "ZWYCIĘSTWO"],
  "Zoom in": ["Μεγέθυνση", "Przybliż"],
  "· ends": ["· λήγει", "· kończy się"],
  "· HP +": ["· ΥΓΕΙΑ +", "· ZDROWIE +"],
  "· iLvl": ["· επίπεδο αντ.", "· poz. przedm."],
  "· next": ["· επόμενο", "· następne"],
  "· pays": ["· πληρώνει", "· płaci"],
  "· Stun": ["· Ζάλη", "· Ogłuszenie"],
  "· Tier": ["· Βαθμίδα", "· Poziom"],
  "· Wins": ["· Νίκες", "· Wygrane"],
  "· Worn": ["· Φορεμένο", "· Noszone"],
  "% fate": ["% πεπρωμένο", "% losu"],
  "+ gear": ["+ εξοπλισμός", "+ ekwipunek"],
  "× core": ["× πυρήνας", "× rdzeń"],
  "A free": ["Ένα δωρεάν", "Darmowe"],
  Absorb: ["Απορρόφηση", "Wchłoń"],
  Accept: ["Αποδοχή", "Przyjmij"],
  Active: ["Ενεργό", "Aktywne"],
  "at 50,": ["στο 50,", "przy 50,"],
  battle: ["μάχη", "walka"],
  "Best D": ["Καλύτερο D", "Najlepsze D"],
  Bosses: ["Αφεντικά", "Bossowie"],
  "c each": ["c το καθένα", "c każdy"],
  Chance: ["Πιθανότητα", "Szansa"],
  Chests: ["Μπαούλα", "Skrzynie"],
  Danger: ["Κίνδυνος", "Zagrożenie"],
  "days).": ["ημέρες).", "dni)."],
  DEFEAT: ["ΗΤΤΑ", "PORAŻKA"],
  earned: ["κερδισμένα", "zdobyte"],
  Earned: ["Κερδισμένα", "Zdobyte"],
  Expand: ["Ανάπτυξη", "Rozwiń"],
  fights: ["μάχες", "walki"],
  Forged: ["Σφυρηλατημένο", "Wykute"],
  friend: ["φίλος", "znajomy"],
  "held ·": ["κατέχεις ·", "posiadane ·"],
  "Held ×": ["Κατέχεις ×", "Posiadane ×"],
  "Hunt ·": ["Κυνήγι ·", "Polowanie ·"],
  Insert: ["Τοποθέτηση", "Włóż"],
  "Key ×2": ["Κλειδί ×2", "Klucz ×2"],
  levels: ["επίπεδα", "poziomy"],
  Locked: ["Κλειδωμένο", "Zablokowane"],
  member: ["μέλος", "członek"],
  Newest: ["Νεότερα", "Najnowsze"],
  "Next (": ["Επόμενο (", "Następne ("],
  "Open (": ["Άνοιγμα (", "Otwórz ("],
  points: ["πόντοι", "punkty"],
  potion: ["φίλτρο", "mikstura"],
  "power)": ["δύναμη)", "moc)"],
  Quests: ["Αποστολές", "Zadania"],
  "Rank #": ["Θέση #", "Miejsce #"],
  Rarity: ["Σπανιότητα", "Rzadkość"],
  Rating: ["Βαθμολογία", "Ocena"],
  "rd win": ["η νίκη", "zwycięstwo"],
  Refine: ["Εκλέπτυνση", "Oczyść"],
  Remove: ["Αφαίρεση", "Usuń"],
  Resets: ["Επαναφορές", "Resety"],
  Roster: ["Σύνθεση", "Skład"],
  Seated: ["Τοποθετημένο", "Umieszczony"],
  SEATED: ["ΤΟΠΟΘΕΤΗΜΕΝΟ", "UMIESZCZONY"],
  stones: ["πέτρες", "kamienie"],
  "Title:": ["Τίτλος:", "Tytuł:"],
  Titles: ["Τίτλοι", "Tytuły"],
  tokens: ["μάρκα", "znaki"],
  Unseat: ["Ξετοποθέτηση", "Usuń z miejsca"],
  "worn ·": ["φορεμένο ·", "noszone ·"],
  "· Agi": ["· Ευκ", "· Zwn"],
  "· ATK": ["· ΕΠΙΘ", "· ATAK"],
  "· DEF": ["· ΑΜΥΝ", "· OBR"],
  "· Int": ["· Νοη", "· Int"],
  "· Vit": ["· Ζωή", "· Wit"],
  "(you)": ["(εσύ)", "(ty)"],
  "% dmg": ["% ζημιά", "% obrażeń"],
  Apply: ["Εφαρμογή", "Zastosuj"],
  "ATK +": ["ΕΠΙΘ +", "ATAK +"],
  Blitz: ["Blitz", "Blitz"],
  "Buy ·": ["Αγορά ·", "Kup ·"],
  Claim: ["Διεκδίκηση", "Odbierz"],
  coins: ["νομίσματα", "monety"],
  costs: ["κόστος", "koszt"],
  Equip: ["Φόρεσε", "Załóż"],
  every: ["κάθε", "każdy"],
  fight: ["μάχη", "walka"],
  FIGHT: ["ΜΑΧΗ", "WALKA"],
  floor: ["όροφος", "piętro"],
  Floor: ["Όροφος", "Piętro"],
  Frame: ["Πλαίσιο", "Ramka"],
  "gems.": ["πετράδια.", "klejnoty."],
  "gold.": ["χρυσός.", "złoto."],
  "gold)": ["χρυσός)", "złoto)"],
  Guild: ["Συντεχνία", "Gildia"],
  "Held:": ["Κατέχεις:", "Posiadane:"],
  "held)": ["κατέχεις)", "posiadane)"],
  holes: ["τρύπες", "otwory"],
  Level: ["Επίπεδο", "Poziom"],
  Maxed: ["Μέγιστο", "Maks."],
  "more.": ["περισσότερα.", "więcej."],
  "next:": ["επόμενο:", "następne:"],
  opens: ["ανοίγει", "otwiera się"],
  Owned: ["Κατέχεις", "Posiadane"],
  piece: ["κομμάτι", "element"],
  Plant: ["Φύτεψε", "Zasiej"],
  plots: ["τεμάχια", "działki"],
  power: ["δύναμη", "moc"],
  Price: ["Τιμή", "Cena"],
  ranks: ["βαθμίδες", "stopnie"],
  Realm: ["Βασίλειο", "Świat"],
  Round: ["Γύρος", "Runda"],
  Speed: ["Ταχύτητα", "Szybkość"],
  Spent: ["Ξοδεύτηκαν", "Wydane"],
  Stage: ["Στάδιο", "Etap"],
  Stats: ["Στατιστικά", "Statystyki"],
  stone: ["πέτρα", "kamień"],
  Title: ["Τίτλος", "Tytuł"],
  today: ["σήμερα", "dziś"],
  Today: ["Σήμερα", "Dziś"],
  types: ["τύποι", "typy"],
  Vault: ["Θησαυροφυλάκιο", "Skarbiec"],
  "VIP −": ["VIP −", "VIP −"],
  Woken: ["Ξύπνησαν", "Obudzone"],
  World: ["Κόσμος", "Świat"],
  "· BR": ["· ΒΜ", "· OB"],
  "· Lv": ["· Επ.", "· Poz."],
  "% Lv": ["% Επ.", "% Poz."],
  bill: ["λογαριασμός", "rachunek"],
  cost: ["κόστος", "koszt"],
  days: ["ημέρες", "dni"],
  Draw: ["Ισοπαλία", "Remis"],
  DRAW: ["ΙΣΟΠΑΛΙΑ", "REMIS"],
  Edit: ["Επεξεργασία", "Edytuj"],
  Fate: ["Πεπρωμένο", "Los"],
  From: ["Από", "Od"],
  Fuse: ["Ένωση", "Połącz"],
  gold: ["χρυσός", "złoto"],
  Held: ["Κατέχεις", "Posiadane"],
  item: ["αντικείμενο", "przedmiot"],
  left: ["έμειναν", "zostało"],
  LOSS: ["ΗΤΤΑ", "PORAŻKA"],
  Paid: ["Πληρώθηκε", "Zapłacono"],
  pays: ["πληρώνει", "płaci"],
  Pays: ["Πληρώνει", "Płaci"],
  rank: ["βαθμίδα", "stopień"],
  Rank: ["Βαθμίδα", "Stopień"],
  Seat: ["Τοποθέτηση", "Umieść"],
  Seen: ["Ιδωμένο", "Widziane"],
  Self: ["Εαυτός", "Ja"],
  Sell: ["Πούλησε", "Sprzedaj"],
  Send: ["Αποστολή", "Wyślij"],
  They: ["Αυτοί", "Oni"],
  tier: ["βαθμίδα", "poziom"],
  turn: ["γύρος", "tura"],
  worn: ["φορεμένο", "noszone"],
  "XP ·": ["XP ·", "PD ·"],
  All: ["Όλα", "Wszystko"],
  and: ["και", "i"],
  Bag: ["Τσάντα", "Plecak"],
  Bio: ["Βιογραφία", "Bio"],
  Buy: ["Αγορά", "Kup"],
  Day: ["Ημέρα", "Dzień"],
  Gem: ["Πετράδι", "Klejnot"],
  hit: ["χτύπημα", "cios"],
  Map: ["Χάρτης", "Mapa"],
  min: ["λεπτά", "min"],
  New: ["Νέο", "Nowe"],
  Now: ["Τώρα", "Teraz"],
  per: ["ανά", "za"],
  Set: ["Σετ", "Zestaw"],
  Str: ["Δύναμη", "Siła"],
  Use: ["Χρήση", "Użyj"],
  war: ["πόλεμος", "wojna"],
  WIN: ["ΝΙΚΗ", "WYGRANA"],
  you: ["εσύ", "ty"],
  You: ["Εσύ", "Ty"],
  at: ["στο", "przy"],
  of: ["από", "z"],
  to: ["προς", "do"],
  "% gold &amp; Farm XP": ["% χρυσό & XP Αγροκτήματος", "% złota i PD Farmy"],
  "Gear codex · every icon &amp; stat": ["Κώδικας εξοπλισμού · κάθε εικονίδιο & στατιστικό", "Kodeks ekwipunku · każda ikona i statystyka"],
  "Open crafting recipes · Standard &amp; Synthesis": ["Ανοιχτές συνταγές κατασκευής · Βασικές & Σύνθεση", "Otwarte przepisy rzemiosła · Standardowe i Synteza"],
  "Public profile (visible in arena &amp; rankings)": ["Δημόσιο προφίλ (ορατό στην αρένα & στις κατατάξεις)", "Publiczny profil (widoczny na arenie i w rankingach)"],
  "Requires Enchantment Stones": ["Απαιτούνται Πέτρες Γοητείας", "Wymagane Kamienie Zaczarowania"],
  "— the best grade you hold": ["— η καλύτερη βαθμίδα που έχεις", "— najlepszy posiadany stopień"],
  "Bag full — loot placed in your Overflow Chest (Armory)": ["Η τσάντα γέμισε — το λάφυρο μπήκε στο Μπαούλο Υπερχείλισης (Οπλοστάσιο)", "Plecak pełny — łup trafił do Skrzyni Nadmiaru (Zbrojownia)"],
  "+{n} Renown": ["+{n} Φήμη", "+{n} Sławy"],
  "{name} found — open it in the Armory vault": ["{name} βρέθηκε — άνοιξέ το στο θησαυροφυλάκιο του Οπλοστασίου", "{name} znaleziona — otwórz ją w skarbcu Zbrojowni"],
  "+{n} Void Crystal": ["+{n} Κρύσταλλος Κενού", "+{n} Kryształ Pustki"],
  "+{n} Battle Essence": ["+{n} Μαχική Ουσία", "+{n} Esencja Walki"],
  "+{n} Soul Shards ✦": ["+{n} Θραύσματα Ψυχής ✦", "+{n} Odłamki Duszy ✦"],
  "+{n} Lv {level} Enchantment Stone": ["+{n} Πέτρα Γοητείας Επ. {level}", "+{n} Kamień Zaczarowania Poz. {level}"],
  "+{n} Fate Stones": ["+{n} Πέτρες Πεπρωμένου", "+{n} Kamienie Losu"],
  "+{n} Stamina Potion — +{amount} stamina": ["+{n} Φίλτρο Αντοχής — +{amount} αντοχή", "+{n} Mikstura Wytrzymałości — +{amount} wytrzymałości"],
  MISS: ["ΑΣΤΟΧΙΑ", "PUDŁO"],
  "ABSORB {n}": ["ΑΠΟΡΡΟΦΗΣΗ {n}", "WCHŁONIĘTE {n}"],
  "BLOCK ": ["ΦΡΑΓΗ ", "BLOK "],
  "COUNTER {n}": ["ΑΝΤΙΠΟΙΝΑ {n}", "KONTRAT {n}"],
  "{name} falls!": ["Ο {name} πέφτει!", "{name} pada!"],
  STUNNED: ["ΖΑΛΙΣΜΕΝΟΣ", "OGŁUSZONY"],
  DELAYED: ["ΚΑΘΥΣΤΕΡΗΣΗ", "OPÓŹNIONE"],
  "{name} keeps gathering power…": ["Ο {name} συνεχίζει να συγκεντρώνει δύναμη…", "{name} dalej gromadzi moc…"],
  "{name} channels.": ["Ο {name} καναλίζει.", "{name} kanalizuje."],
  "⚠ {name} prepares CATACLYSM! Guard or stun it!": ["⚠ Ο {name} ετοιμάζει ΚΑΤΑΚΛΥΣΜΟ! Αμύνσου ή ζάλισέ τον!", "⚠ {name} przygotowuje KATAKLIZM! Broń się lub go ogłusz!"],
  "{name} gathers power.": ["Ο {name} συγκεντρώνει δύναμη.", "{name} gromadzi moc."],
  "{name} uses {skill}.": ["Ο {name} χρησιμοποιεί {skill}.", "{name} używa {skill}."],
  "{name} uses {skill} for {n} damage.": ["Ο {name} χρησιμοποιεί {skill} για {n} ζημιά.", "{name} używa {skill} za {n} obrażeń."],
  GUARD: ["ΑΜΥΝΑ", "OSŁONA"],
  BARRIER: ["ΦΡΑΓΜΟΣ", "BARIERA"],
  MARKED: ["ΣΗΜΑΔΕΜΕΝΟΣ", "OZNACZONY"],
  EVASIVE: ["ΕΥΕΛΙΚΤΟΣ", "ZWINNY"],
  SLOWED: ["ΕΠΙΒΡΑΔΥΝΣΗ", "SPOWOLNIONY"],
  BURNING: ["ΚΑΙΓΕΤΑΙ", "PŁONĄCY"],
  WEAKENED: ["ΕΞΑΣΘΕΝΗΜΕΝΟΣ", "OSŁABIONY"],
  COUNTER: ["ΑΝΤΙΠΟΙΝΑ", "KONTRAT"],
  "The farmstead beneath the blood moon — the barn, the windmill, the Hearth and the great red Bloodoak around the fields": ["Το αγρόκτημα κάτω από το ματωμένο φεγγάρι — ο αχυρώνας, ο ανεμόμυλος, η Εστία και η μεγάλη κόκκινη Αιματοβελανιδιά γύρω από τα χωράφια", "Zagroda pod krwawym księżycem — stodoła, wiatrak, Palenisko i wielki czerwony Krwawy Dąb wokół pól"],
  "Gold Seeds pay gold, XP Seeds pay Farm XP, Emberbloom pays a little of both and the slow Moonroot pays a big share of Farm XP. Frostberry, Sunwheat, Bloodvine and Starbloom open at higher Farm Levels.": ["Οι Χρυσοί Σπόροι δίνουν χρυσό, οι Σπόροι XP δίνουν XP Φάρμας, το Φλογάνθι λίγο και από τα δύο και η αργή Σεληνόριζα πολύ XP Φάρμας. Το Παγόμουρο, το Ηλιοσίτι, το Αιματοκλήμα και το Αστράνθι ανοίγουν σε υψηλότερα επίπεδα Φάρμας.", "Złote Nasiona dają złoto, Nasiona XP dają XP Farmy, Żarokwiat trochę obu, a powolny Księżycowy Korzeń dużo XP Farmy. Mroźna Jagoda, Słoneczna Pszenica, Krwawa Winorośl i Gwiezdny Kwiat otwierają się na wyższych poziomach Farmy."],
  "The feast is served — its bonus lasts into your battles.": ["Η γιορτή σερβιρίστηκε — το μπόνους της ισχύει στις μάχες σου.", "Uczta podana — jej premia działa w twoich bitwach."],
  "Farm perks": ["Προνόμια Φάρμας", "Atuty Farmy"],
  "The Hearth": ["Η Εστία", "Palenisko"],
  "The Hearth opens at Farm Level 5. Every harvest banks produce for its feasts.": ["Η Εστία ανοίγει στο Επίπεδο Φάρμας 5. Κάθε συγκομιδή αποθηκεύει σοδειά για τις γιορτές της.", "Palenisko otwiera się na 5 poziomie Farmy. Każde zbiory odkładają plony na uczty."],
  "Cook produce into a feast. Only one feast is active at a time; its bonus joins every battle until it ends.": ["Μαγείρεψε τη σοδειά σε γιορτή. Μόνο μία γιορτή ενεργή κάθε φορά· το μπόνους της ισχύει σε κάθε μάχη μέχρι να λήξει.", "Ugotuj plony na ucztę. Naraz działa tylko jedna uczta; jej premia obowiązuje w każdej bitwie, aż się skończy."],
  "Cook": ["Μαγείρεψε", "Gotuj"],
  "That castle no longer stands": ["Αυτό το κάστρο δεν υπάρχει πια", "Ten zamek już nie stoi"],
  "Castle raid": ["Επιδρομή σε κάστρο", "Najazd na zamek"],
  "The gates fall!": ["Οι πύλες πέφτουν!", "Bramy padają!"],
  "The castle holds. Its lord laughs from the walls.": ["Το κάστρο αντέχει. Ο άρχοντάς του γελά από τα τείχη.", "Zamek się trzyma. Jego pan śmieje się z murów."],
  "Walls": ["Τείχη", "Mury"],
  "Plunder": ["Λάφυρα", "Łup"],
  "Plant your own banner before raiding": ["Στήσε το δικό σου λάβαρο πριν την επιδρομή", "Zatknij własny sztandar przed najazdem"],
  "Rebuilding walls": ["Τα τείχη ξαναχτίζονται", "Odbudowa murów"],
  "Defenders lose nothing — plunder comes from the realm. Each castle can be raided once every 8 hours.": ["Οι αμυνόμενοι δεν χάνουν τίποτα — τα λάφυρα έρχονται από το βασίλειο. Κάθε κάστρο δέχεται επιδρομή μία φορά κάθε 8 ώρες.", "Obrońcy nic nie tracą — łup pochodzi z krainy. Każdy zamek można najechać raz na 8 godzin."],
  "The walls rise higher.": ["Τα τείχη υψώνονται.", "Mury rosną wyżej."],
  "defence": ["άμυνα", "obrony"],
  "Raise walls": ["Ύψωσε τα τείχη", "Podnieś mury"],
  "Raid log": ["Αρχείο επιδρομών", "Dziennik najazdów"],
  "No raids yet.": ["Καμία επιδρομή ακόμα.", "Brak najazdów."],
  "Repelled": ["Αποκρούστηκε", "Odparty"],
  "Breached": ["Παραβιάστηκε", "Przełamany"],
  "Crops grow 5% faster": ["Οι καλλιέργειες μεγαλώνουν 5% πιο γρήγορα", "Uprawy rosną 5% szybciej"],
  "The Hearth opens: cook battle feasts": ["Η Εστία ανοίγει: μαγείρεψε γιορτές μάχης", "Palenisko otwarte: gotuj uczty bitewne"],
  "8% chance of rare materials per harvest": ["8% πιθανότητα για σπάνια υλικά ανά συγκομιδή", "8% szansy na rzadkie materiały przy zbiorach"],
  "Crops grow another 5% faster": ["Οι καλλιέργειες μεγαλώνουν άλλο 5% πιο γρήγορα", "Uprawy rosną o kolejne 5% szybciej"],
  "+10% harvest gold": ["+10% χρυσός συγκομιδής", "+10% złota ze zbiorów"],
  "Every harvest banks 2 produce": ["Κάθε συγκομιδή δίνει 2 σοδειές", "Każde zbiory dają 2 plony"],
  "+7% rare material chance": ["+7% πιθανότητα σπάνιων υλικών", "+7% szansy na rzadkie materiały"],
  "Crops grow another 10% faster": ["Οι καλλιέργειες μεγαλώνουν άλλο 10% πιο γρήγορα", "Uprawy rosną o kolejne 10% szybciej"],
  "Grand feasts: +50% feast strength": ["Μεγάλες γιορτές: +50% δύναμη γιορτής", "Wielkie uczty: +50% siły uczty"],
  "+15% harvest gold": ["+15% χρυσός συγκομιδής", "+15% złota ze zbiorów"],
  "+10% rare material chance": ["+10% πιθανότητα σπάνιων υλικών", "+10% szansy na rzadkie materiały"],
  "Every harvest banks 3 produce": ["Κάθε συγκομιδή δίνει 3 σοδειές", "Każde zbiory dają 3 plony"],
  "Royal feasts last twice as long": ["Οι βασιλικές γιορτές διαρκούν διπλάσια", "Królewskie uczty trwają dwa razy dłużej"],
  "Hunter's Stew": ["Στιφάδο του Κυνηγού", "Gulasz Łowcy"],
  "Moonroot Bread": ["Ψωμί Σεληνόριζας", "Chleb z Księżycowego Korzenia"],
  "Frostberry Tart": ["Τάρτα Παγόμουρου", "Tarta z Mroźnej Jagody"],
  "Sunwheat Roast": ["Ψητό Ηλιοσιταριού", "Pieczeń ze Słonecznej Pszenicy"],
  "Bloodvine Wine": ["Κρασί Αιματοκλήματος", "Wino z Krwawej Winorośli"],
  "Starbloom Banquet": ["Συμπόσιο Αστράνθους", "Bankiet Gwiezdnego Kwiatu"],
  "+10% attack and magic attack": ["+10% επίθεση και μαγική επίθεση", "+10% ataku i ataku magicznego"],
  "+12% health and defence": ["+12% ζωή και άμυνα", "+12% zdrowia i obrony"],
  "+6% crit and +6% dodge": ["+6% κρίσιμο και +6% αποφυγή", "+6% trafienia krytycznego i +6% uniku"],
  "+15% attack, +20% crit damage": ["+15% επίθεση, +20% κρίσιμη ζημιά", "+15% ataku, +20% obrażeń krytycznych"],
  "+18% health, +10% attack": ["+18% ζωή, +10% επίθεση", "+18% zdrowia, +10% ataku"],
  "+15% to every combat stat": ["+15% σε κάθε στατιστικό μάχης", "+15% do każdej statystyki bojowej"],
  "Frostberry": ["Παγόμουρο", "Mroźna Jagoda"],
  "Sunwheat": ["Ηλιοσίτι", "Słoneczna Pszenica"],
  "Bloodvine": ["Αιματοκλήμα", "Krwawa Winorośl"],
  "Starbloom": ["Αστράνθι", "Gwiezdny Kwiat"],
  "Awake": ["Ξύπνιο", "Przebudzony"],
  "Claim last week's reward": ["Πάρε την ανταμοιβή της περασμένης εβδομάδας", "Odbierz nagrodę z zeszłego tygodnia"],
  "Claim raid spoils": ["Πάρε τα λάφυρα της επιδρομής", "Odbierz łupy z rajdu"],
  "Damage board": ["Πίνακας ζημιάς", "Tablica obrażeń"],
  "Donate": ["Δωρεά", "Przekaż"],
  "Donated 10,000 gold to the guild.": ["Δώρισες 10.000 χρυσό στη συντεχνία.", "Przekazano gildii 10 000 złota."],
  "Guild Raid · The Obsidian Behemoth": ["Επιδρομή Συντεχνίας · Ο Οψιδιανός Βεμόθ", "Rajd gildii · Obsydianowy Behemot"],
  "The Obsidian Behemoth": ["Ο Οψιδιανός Βεμόθ", "Obsydianowy Behemot"],
  "Obsidian Behemoth": ["Οψιδιανός Βεμόθ", "Obsydianowy Behemot"],
  "Guilds compete all week: a Guild War win scores 10, a draw 5, a slain raid boss 3 and a finished guild quest 2. Ends in": ["Οι συντεχνίες αγωνίζονται όλη την εβδομάδα: νίκη σε Πόλεμο δίνει 10, ισοπαλία 5, νεκρός αρχηγός επιδρομής 3 και ολοκληρωμένη αποστολή 2. Λήγει σε", "Gildie rywalizują cały tydzień: wygrana wojna daje 10, remis 5, pokonany boss rajdu 3, a ukończone zadanie gildii 2. Koniec za"],
  "No attacks yet this window.": ["Καμία επίθεση ακόμα σε αυτό το παράθυρο.", "Brak ataków w tym oknie."],
  "Rewards for every member": ["Ανταμοιβές για κάθε μέλος", "Nagrody dla każdego członka"],
  "Slain this window!": ["Σκοτώθηκε σε αυτό το παράθυρο!", "Pokonany w tym oknie!"],
  "Sleeping": ["Κοιμάται", "Śpi"],
  "Spoils per member: gold, a Boss Core, Starshards and Soul Essence.": ["Λάφυρα ανά μέλος: χρυσός, ένας Πυρήνας Αρχηγού, Αστρόθραυσμα και Ουσία Ψυχής.", "Łupy na członka: złoto, Rdzeń Bossa, Gwiezdne Odłamki i Esencja Duszy."],
  "The Behemoth staggers!": ["Ο Βεμόθ τρεκλίζει!", "Behemot się chwieje!"],
  "The guild boss is slain! Claim the spoils in the Guild Hall.": ["Ο αρχηγός της συντεχνίας σκοτώθηκε! Πάρε τα λάφυρα στη Λέσχη.", "Boss gildii pokonany! Odbierz łupy w Sali Gildii."],
  "The whole guild works on these together. When a quest is done, every member claims its reward once. They reset each Monday (UTC)": ["Όλη η συντεχνία δουλεύει μαζί. Όταν ολοκληρωθεί μια αποστολή, κάθε μέλος παίρνει την ανταμοιβή μία φορά. Ανανεώνονται κάθε Δευτέρα (UTC)", "Cała gildia pracuje nad nimi razem. Po ukończeniu zadania każdy członek odbiera nagrodę raz. Odnawiają się w każdy poniedziałek (UTC)"],
  "This week's standings": ["Κατάταξη εβδομάδας", "Ranking tego tygodnia"],
  "War Gates": ["Πύλες Πολέμου", "Wrota Wojny"],
  "You were driven back, but your blows still count.": ["Απωθήθηκες, αλλά τα χτυπήματά σου μετράνε.", "Odparto cię, ale twoje ciosy się liczą."],
  "Your attack": ["Η επίθεσή σου", "Twój atak"],
  "Your guild scored no points last week.": ["Η συντεχνία σου δεν πήρε πόντους την περασμένη εβδομάδα.", "Twoja gildia nie zdobyła punktów w zeszłym tygodniu."],
  "Your newest Epic Armour appears here.": ["Η νεότερη Επική Πανοπλία σου εμφανίζεται εδώ.", "Tu pojawi się twoja najnowsza Epicka Zbroja."],
  "closes in": ["κλείνει σε", "zamyka się za"],
  "on a loss": ["σε ήττα", "przy porażce"],
  "on a win": ["σε νίκη", "przy wygranej"],
  "pts": ["πόντοι", "pkt"],
  "raid damage": ["ζημιά επιδρομής", "obrażenia rajdu"],
  "stats": ["στατιστικά", "statystyki"],
  "wakes in": ["ξυπνά σε", "budzi się za"],
  "Boss Raid": ["Επιδρομή Αρχηγού", "Rajd na bossa"],
  "Every 4 hours": ["Κάθε 4 ώρες", "Co 4 godziny"],
  "Weekly Quests": ["Εβδομαδιαίες Αποστολές", "Zadania tygodniowe"],
  "Shared rewards": ["Κοινές ανταμοιβές", "Wspólne nagrody"],
  "Tournament": ["Τουρνουά", "Turniej"],
  "Guild vs guild": ["Συντεχνία εναντίον συντεχνίας", "Gildia kontra gildia"],
  "Guild Events": ["Εκδηλώσεις Συντεχνίας", "Wydarzenia gildii"],
  "Boss raids, weekly quests & tournament": ["Επιδρομές, εβδομαδιαίες αποστολές & τουρνουά", "Rajdy, zadania tygodniowe i turniej"],
  "Epic Armours": ["Επικές Πανοπλίες", "Epickie Zbroje"],
  "Forge": ["Σφυρηλάτησε", "Wykuj"],
  "Epic Armours are forged sets whose every piece carries far higher stats than its rarity. Each set needs its own rare materials, and each of those drops from one place only.": ["Οι Επικές Πανοπλίες είναι σετ με πολύ ισχυρότερα στατιστικά από τη σπανιότητά τους. Κάθε σετ θέλει δικά του σπάνια υλικά, που πέφτουν μόνο από ένα μέρος.", "Epickie Zbroje to wykuwane zestawy o statystykach znacznie wyższych niż ich rzadkość. Każdy zestaw wymaga własnych rzadkich materiałów, a każdy z nich wypada tylko w jednym miejscu."],
  "Wyrmguard": ["Δρακοφρουρός", "Smocza Straż"],
  "Moonwarden": ["Σεληνοφύλακας", "Strażnik Księżyca"],
  "Shadowmantle": ["Σκιόμανδυας", "Płaszcz Cienia"],
  "Phoenixborn": ["Φοινικογέννητος", "Zrodzony z Feniksa"],
  "Bone-plated armour from dungeon wyrms: +50% stats.": ["Πανοπλία από κόκαλα δράκων: +50% στατιστικά.", "Zbroja z kości smoków lochów: +50% statystyk."],
  "Moonsilver mail grown on the farm: +70% stats.": ["Αλυσιδωτή από σεληνάργυρο της φάρμας: +70% στατιστικά.", "Kolczuga z księżycowego srebra z farmy: +70% statystyk."],
  "Relic-warden silk woven into plate: +90% stats.": ["Μετάξι φυλάκων κειμηλίων υφασμένο σε θώρακα: +90% στατιστικά.", "Jedwab strażników reliktów wpleciony w płytę: +90% statystyk."],
  "Armour that burns with undying ash: +120% stats.": ["Πανοπλία που καίει με αθάνατη στάχτη: +120% στατιστικά.", "Zbroja płonąca nieśmiertelnym popiołem: +120% statystyk."],
  "Blood on the Road": ["Αίμα στον Δρόμο", "Krew na Szlaku"],
  "Answer the Horn": ["Απάντησε στο Κέρας", "Odpowiedz na Róg"],
  "Fill the Coffers": ["Γέμισε το Θησαυροφυλάκιο", "Napełnij Skarbiec"],
  "Slayers of Giants": ["Φονιάδες Γιγάντων", "Pogromcy Olbrzymów"],
  "Wyrm Bone": ["Κόκαλο Δράκου", "Smocza Kość"],
  "Moonsilver": ["Σεληνάργυρος", "Księżycowe Srebro"],
  "Shadow Silk": ["Μετάξι Σκιάς", "Jedwab Cienia"],
  "Phoenix Ash": ["Στάχτη Φοίνικα", "Popiół Feniksa"],
  "Wakes every 4 hours (UTC) for 60 minutes. Every member gets 3 attacks; when the guild's damage beats its health, everyone who fought claims the spoils.": ["Ξυπνά κάθε 4 ώρες (UTC) για 60 λεπτά. Κάθε μέλος έχει 3 επιθέσεις· όταν η ζημιά της συντεχνίας ξεπεράσει την υγεία του, όσοι πολέμησαν παίρνουν τα λάφυρα.", "Budzi się co 4 godziny (UTC) na 60 minut. Każdy członek ma 3 ataki; gdy obrażenia gildii przewyższą jego zdrowie, każdy, kto walczył, odbiera łupy."],
  // ---- The Party Spire (SpireGate.tsx) ----
  "Spire": ["Πύργος", "Iglica"],
  "A party climb — three runs a day": ["Αναρρίχηση παρέας — τρεις διαδρομές τη μέρα", "Wspinaczka drużyny — trzy biegi dziennie"],
  "Party climb": ["Αναρρίχηση παρέας", "Wspinaczka drużyny"],
  "Runs left today": ["Διαδρομές που απομένουν σήμερα", "Pozostałe biegi dzisiaj"],
  "Best floor": ["Καλύτερος όροφος", "Najlepsze piętro"],
  "Spire Chests": ["Μπαούλα του Πύργου", "Skrzynie Iglicy"],
  "Open a chest": ["Άνοιξε ένα μπαούλο", "Otwórz skrzynię"],
  "The chest held": ["Το μπαούλο περιείχε", "Skrzynia zawierała"],
  "The chest would not open.": ["Το μπαούλο δεν άνοιξε.", "Skrzynia nie chciała się otworzyć."],
  "nothing at all": ["τίποτα απολύτως", "zupełnie nic"],
  "Party code": ["Κωδικός παρέας", "Kod drużyny"],
  "Copy code": ["Αντιγραφή κωδικού", "Kopiuj kod"],
  "Friends join with this code. One fight is shared by up to four heroes.": ["Οι φίλοι μπαίνουν με αυτόν τον κωδικό. Έως τέσσερις ήρωες μοιράζονται μία μάχη.", "Znajomi dołączają tym kodem. Jedną walkę dzieli do czterech bohaterów."],
  "You joined this party. The party's leader starts the climb.": ["Μπήκες σε αυτή την παρέα. Ο αρχηγός της παρέας ξεκινά την αναρρίχηση.", "Dołączyłeś do tej drużyny. Wspinaczkę zaczyna jej przywódca."],
  "Playing alone — the party channel is closed.": ["Παίζεις μόνος — το κανάλι της παρέας είναι κλειστό.", "Grasz sam — kanał drużyny jest zamknięty."],
  "Party": ["Παρέα", "Drużyna"],
  "Empty seat": ["Κενή θέση", "Wolne miejsce"],
  "Party code to join": ["Κωδικός παρέας για είσοδο", "Kod drużyny do dołączenia"],
  "Join party": ["Μπες στην παρέα", "Dołącz do drużyny"],
  "Joining party {code}…": ["Μπαίνεις στην παρέα {code}…", "Dołączanie do drużyny {code}…"],
  "A party code is five letters.": ["Ο κωδικός παρέας έχει πέντε χαρακτήρες.", "Kod drużyny ma pięć znaków."],
  "The party disbanded.": ["Η παρέα διαλύθηκε.", "Drużyna się rozpadła."],
  "Start the climb": ["Ξεκίνα την αναρρίχηση", "Zacznij wspinaczkę"],
  "No runs left today": ["Δεν μένουν διαδρομές σήμερα", "Brak biegów na dziś"],
  "Waiting for the party leader…": ["Περιμένουμε τον αρχηγό της παρέας…", "Czekamy na przywódcę drużyny…"],
  "The climb could not start.": ["Η αναρρίχηση δεν ξεκίνησε.", "Wspinaczka nie mogła się zacząć."],
  "The Spire could not be reached.": ["Ο Πύργος δεν ήταν προσβάσιμος.", "Nie udało się dotrzeć do Iglicy."],
  "The Spire is already conquered.": ["Ο Πύργος έχει ήδη κατακτηθεί.", "Iglica jest już zdobyta."],
  "Chests won": ["Μπαούλα που κερδήθηκαν", "Zdobyte skrzynie"],
  "Spire Chest won — floor {floor}.": ["Μπαούλο του Πύργου — όροφος {floor}.", "Skrzynia Iglicy — piętro {floor}."],
  "Guard": ["Φρουρά", "Osłona"],
  "The party's climb is already underway — wait for the next one.": ["Η αναρρίχηση της παρέας έχει ήδη ξεκινήσει — περίμενε την επόμενη.", "Wspinaczka drużyny już trwa — poczekaj na następną."],
  "Leave": ["Φύγε", "Wyjdź"],
  "Miss": ["Αστοχία", "Pudło"],
  "Chests won this run": ["Μπαούλα που κέρδισες σε αυτή τη διαδρομή", "Skrzynie zdobyte w tym biegu"],
  "Summit conquered": ["Η κορυφή κατακτήθηκε", "Szczyt zdobyty"],
  "The party fell": ["Η παρέα έπεσε", "Drużyna poległa"],
  // ---- The Spire Gate's dungeons (SpireGate.tsx) ----
  "Spire Gate": ["Πύλη του Πύργου", "Brama Iglicy"],
  "Five dungeons — party climbs, three runs a day": ["Πέντε μπουντρούμια — αναρριχήσεις παρέας, τρεις διαδρομές τη μέρα", "Pięć lochów — wspinaczki drużyny, trzy biegi dziennie"],
  "Dungeons of the Spire Gate": ["Τα μπουντρούμια της Πύλης του Πύργου", "Lochy Bramy Iglicy"],
  "floors": ["όροφοι", "pięter"],
  "Unlocks at level {n}": ["Ανοίγει στο επίπεδο {n}", "Odblokowuje się na poziomie {n}"],
  "Best": ["Καλύτερο", "Najlepsze"],
  "Conquered": ["Κατακτημένο", "Zdobyte"],
  "Copied": ["Αντιγράφηκε", "Skopiowano"],
  // ---- Battles and the guide (Battle.tsx, Game.tsx, GameGuide.tsx) ----
  "Auto-battle stopped — the hero has nothing to cast.": ["Η αυτόματη μάχη σταμάτησε — ο ήρωας δεν έχει τίποτα να ρίξει.", "Automatyczna walka zatrzymana — bohater nie ma czym zaatakować."],
  "Guide": ["Οδηγός", "Poradnik"],
  "How to play, step by step": ["Πώς να παίξεις, βήμα βήμα", "Jak grać, krok po kroku"],
  "New here? Open the guide — it walks you through your first hour, step by step.": ["Νέος εδώ; Άνοιξε τον οδηγό — σε περνά βήμα βήμα από την πρώτη σου ώρα.", "Pierwszy raz? Otwórz poradnik — poprowadzi cię krok po kroku przez pierwszą godzinę."],
  "Dismiss": ["Απόκρυψη", "Ukryj"],
  "Game Guide": ["Οδηγός Παιχνιδιού", "Poradnik Gry"],
  "Everything a new hero needs, step by step": ["Όλα όσα χρειάζεται ένας νέος ήρωας, βήμα βήμα", "Wszystko, czego potrzebuje nowy bohater, krok po kroku"],
  "First steps": ["Πρώτα βήματα", "Pierwsze kroki"],
  "All done — you know the game. The chapters beside this card cover everything else.": ["Όλα έγιναν — ξέρεις το παιχνίδι. Τα κεφάλαια δίπλα σε αυτή την κάρτα καλύπτουν τα υπόλοιπα.", "Wszystko zrobione — znasz grę. Rozdziały obok tej karty opisują resztę."],
  "Finish these and the rest of the game opens up naturally.": ["Ολοκλήρωσέ τα και το υπόλοιπο παιχνίδι ανοίγει μόνο του.", "Zrób je, a reszta gry otworzy się sama."],
  "Guide chapters": ["Κεφάλαια του οδηγού", "Rozdziały poradnika"],
  "Worth knowing:": ["Αξίζει να ξέρεις:", "Warto wiedzieć:"],
  "Every number in this guide comes from the game itself, so it stays true as the game grows.": ["Κάθε νούμερο σε αυτόν τον οδηγό βγαίνει από το ίδιο το παιχνίδι, οπότε μένει σωστό όσο μεγαλώνει.", "Każda liczba w tym poradniku pochodzi z samej gry, więc pozostaje aktualna, gdy gra rośnie."],
  // @@ROWS@@
};
