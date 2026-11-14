import { useEffect, useState } from "react";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Installs EmberFall as a desktop or phone app where the browser offers it (Chrome, Edge, Android). */
export function InstallAppButton() {
  const [evt, setEvt] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    const on = (e: Event) => { e.preventDefault(); setEvt(e as PromptEvent); };
    const done = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", on);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", on); window.removeEventListener("appinstalled", done); };
  }, []);
  if (installed) return <p className="text-center text-sm text-gold">EmberFall is installed on this device.</p>;
  if (!evt) return <p className="text-center text-sm text-muted-foreground">On a computer, open the site in Chrome or Edge and press the install icon in the address bar.</p>;
  return (
    <button className="btn-gold mx-auto block px-6 py-2" onClick={async () => { await evt.prompt(); await evt.userChoice; setEvt(null); }}>
      Install the EmberFall app
    </button>
  );
}
